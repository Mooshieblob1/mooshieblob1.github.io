<template>
  <canvas ref="canvasRef" class="gravity-grid" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { followerPos } from "../stores/cursor";

// Particle field — a full-bleed lattice of small dots. The cursor-follower
// ring lifts the lattice as a Gaussian "dome" underneath it; dots slide
// outward along the dome's slope, then ease back home. Adapted from
// https://github.com/mchaker/gpugarden-site (GravityGrid.tsx), re-themed
// to the site's yellows and kept faint so it sits quietly behind content.

interface Particle {
  hx: number;
  hy: number;
  x: number;
  y: number;
  col: string;
  rad: number;
}

const canvasRef = ref<HTMLCanvasElement | null>(null);

const SP = 34;
const SIGMA = 155;
const LIFT = 15;
const EASE = 0.1;
const BASE_ALPHA = 0.08;
const NEAR_ALPHA = 0.25;
const TARGET_DT = 1000 / 60;

let ctx: CanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let parts: Particle[] = [];
let frameId = 0;
let lastTime = 0;

function build() {
  parts = [];
  const cols = Math.ceil(width / SP) + 1;
  const rows = Math.ceil(height / SP) + 1;
  const ox = (width - (cols - 1) * SP) / 2;
  const oy = (height - (rows - 1) * SP) / 2;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const hx = ox + i * SP;
      const hy = oy + j * SP;
      const r = Math.random();
      parts.push({
        hx,
        hy,
        x: hx,
        y: hy,
        col: r < 0.05 ? "255,255,255" : r < 0.5 ? "251,194,27" : "255,204,0",
        rad: 1 + Math.random() * 1.2,
      });
    }
  }
}

function draw(staticFrame: boolean, dt = 1) {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  const lerpFactor = 1 - Math.pow(1 - EASE, dt);
  for (const p of parts) {
    let near = 0;
    if (!staticFrame) {
      const dx = p.hx - followerPos.x;
      const dy = p.hy - followerPos.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const x = d / SIGMA;
      const g = Math.exp((-x * x) / 2);
      near = g;
      // Peak of x * exp(-x²/2) is at x = 1, value 1/√e ≈ 0.60653 — normalize
      // so the maximum outward push is exactly LIFT pixels.
      const disp = (LIFT * x * g) / 0.60653;
      const tx = p.hx + (dx / d) * disp;
      const ty = p.hy + (dy / d) * disp;
      p.x += (tx - p.x) * lerpFactor;
      p.y += (ty - p.y) * lerpFactor;
    }
    const a = BASE_ALPHA + near * NEAR_ALPHA;
    ctx.fillStyle = `rgba(${p.col},${a.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.rad + near * 0.9, 0, 6.2832);
    ctx.fill();
  }
}

function resize() {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  build();
  draw(true);
}

function frame(now: number) {
  if (!lastTime) lastTime = now;
  const rawDt = now - lastTime;
  lastTime = now;
  const dt = Math.min(rawDt, TARGET_DT * 4) / TARGET_DT;
  draw(false, dt);
  frameId = requestAnimationFrame(frame);
}

function onVisibilityChange() {
  if (!document.hidden) lastTime = 0;
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.addEventListener("resize", resize);
  resize();

  if (!reduceMotion) {
    document.addEventListener("visibilitychange", onVisibilityChange);
    frameId = requestAnimationFrame(frame);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", resize);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  if (frameId) cancelAnimationFrame(frameId);
  ctx = null;
});
</script>

<style scoped>
.gravity-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -2;
}
</style>
