<template>
  <!-- Behind girl & logo -->
  <canvas ref="backCanvasRef" class="rain-canvas rain-back"></canvas>
  <!-- In front of everything -->
  <canvas ref="frontCanvasRef" class="rain-canvas rain-front"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const backCanvasRef = ref<HTMLCanvasElement>();
const frontCanvasRef = ref<HTMLCanvasElement>();

// --- Types ---
interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
  back: boolean; // true = behind elements
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
}

// --- Config ---
const FRONT_COUNT = 90;
const BACK_COUNT = 40;
const DROP_COUNT = FRONT_COUNT + BACK_COUNT;
const MAX_PARTICLES = 300;
const CIRCLE_RADIUS = 20; // matches CursorFollower's 40px / 2
const DEFLECT_RADIUS = 60; // outer influence zone beyond the circle edge
const SPLASH_TOLERANCE = 3; // how close to the edge before splashing
const BACK_OPACITY = 0.35; // dimmer for depth

// --- State ---
let drops: Drop[] = [];
let particles: Particle[] = [];
let width = 0;
let height = 0;
let ctxFront: CanvasRenderingContext2D | null = null;
let ctxBack: CanvasRenderingContext2D | null = null;
let frameId = 0;
let lastTime = 0;
const TARGET_FPS = 60;
const TARGET_DT = 1000 / TARGET_FPS;

// Cursor tracking (same 0.15 easing as CursorFollower)
let mouseX = -200;
let mouseY = -200;
let cursorX = -200;
let cursorY = -200;
let mouseActive = false;

// Collision targets
let logoRect: DOMRect | null = null;
let girlRect: DOMRect | null = null;
let girlMask: Uint8Array | null = null;
let girlMaskW = 0;
let girlMaskH = 0;
let logoMask: Uint8Array | null = null;
let logoMaskW = 0;
let logoMaskH = 0;

// Pre-rendered gradient strips for efficient raindrop drawing
let gradientFront: HTMLCanvasElement;
let gradientBack: HTMLCanvasElement;

function makeGradientStrip(alpha: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(1, `rgba(255,255,255,${alpha})`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 1, 64);
  return c;
}

// --- Factory helpers ---
function makeDrop(scatter = false, back?: boolean): Drop {
  const isBack = back ?? false;
  return {
    x: Math.random() * width,
    y: scatter ? -(Math.random() * height) : -(Math.random() * 20),
    speed: isBack ? 4 + Math.random() * 6 : 6 + Math.random() * 10,
    length: isBack ? 8 + Math.random() * 12 : 10 + Math.random() * 20,
    back: isBack,
  };
}

function addSplash(x: number, y: number, dirX: number, dirY: number, count: number) {
  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    const spread = (Math.random() - 0.5) * 2;
    const spd = 1 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: dirX * spd + spread,
      vy: dirY * spd - Math.random() * 2,
      life: 1,
      decay: 1 / (15 + Math.random() * 20),
      size: 1 + Math.random(),
    });
  }
}

function splashOnSurface(x: number, y: number, count: number) {
  addSplash(x, y, 0, -1, count);
}

// --- Alpha-mask collision helpers ---
function isMaskSolid(
  mask: Uint8Array, mw: number, mh: number,
  rect: DOMRect, sx: number, sy: number,
): boolean {
  const ix = Math.floor(((sx - rect.left) / rect.width) * mw);
  const iy = Math.floor(((sy - rect.top) / rect.height) * mh);
  if (ix < 0 || ix >= mw || iy < 0 || iy >= mh) return false;
  return mask[iy * mw + ix] > 128;
}

function isGirlSolid(sx: number, sy: number): boolean {
  if (!girlMask || !girlRect) return false;
  return isMaskSolid(girlMask, girlMaskW, girlMaskH, girlRect, sx, sy);
}

function isLogoSolid(sx: number, sy: number): boolean {
  if (!logoMask || !logoRect) return false;
  return isMaskSolid(logoMask, logoMaskW, logoMaskH, logoRect, sx, sy);
}

function buildAlphaMask(el: HTMLImageElement, scale: number) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(el.naturalWidth * scale);
  c.height = Math.ceil(el.naturalHeight * scale);
  const cx = c.getContext('2d', { willReadFrequently: true });
  if (!cx) return null;
  cx.drawImage(el, 0, 0, c.width, c.height);
  const data = cx.getImageData(0, 0, c.width, c.height);
  const mask = new Uint8Array(c.width * c.height);
  for (let i = 0; i < mask.length; i++) {
    mask[i] = data.data[i * 4 + 3];
  }
  return { mask, w: c.width, h: c.height };
}

function buildGirlMask() {
  const el = document.getElementById('bg_girl') as HTMLImageElement | null;
  if (!el || !el.naturalWidth) return;
  try {
    const result = buildAlphaMask(el, 0.2);
    if (result) { girlMask = result.mask; girlMaskW = result.w; girlMaskH = result.h; }
  } catch {
    girlMask = null;
  }
}

function buildLogoMask() {
  const el = document.getElementById('main-logo') as HTMLImageElement | null;
  if (!el || !el.naturalWidth) return;
  try {
    const result = buildAlphaMask(el, 0.3);
    if (result) { logoMask = result.mask; logoMaskW = result.w; logoMaskH = result.h; }
  } catch {
    logoMask = null;
  }
}

// --- Element rect tracking ---
function updateRects() {
  const logo = document.getElementById('main-logo');
  logoRect = logo && logo.offsetParent !== null ? logo.getBoundingClientRect() : null;
  const girl = document.getElementById('bg_girl');
  girlRect = girl ? girl.getBoundingClientRect() : null;
}

// --- Canvas sizing ---
function sizeCanvas(canvas: HTMLCanvasElement, c: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  if (backCanvasRef.value && ctxBack) sizeCanvas(backCanvasRef.value, ctxBack);
  if (frontCanvasRef.value && ctxFront) sizeCanvas(frontCanvasRef.value, ctxFront);
  updateRects();
}

// --- Main animation loop ---
function frame(now: number) {
  if (!ctxFront || !ctxBack) return;

  // Delta-time: normalize so movement is consistent regardless of FPS
  if (!lastTime) lastTime = now;
  const rawDt = now - lastTime;
  lastTime = now;
  // Clamp dt to avoid huge jumps after tab-away (cap at ~4 frames)
  const dt = Math.min(rawDt, TARGET_DT * 4) / TARGET_DT;

  ctxFront.clearRect(0, 0, width, height);
  ctxBack.clearRect(0, 0, width, height);

  // Smooth cursor tracking (dt-scaled lerp)
  if (mouseActive) {
    const lerpFactor = 1 - Math.pow(1 - 0.15, dt);
    cursorX += (mouseX - cursorX) * lerpFactor;
    cursorY += (mouseY - cursorY) * lerpFactor;
  }

  // --- Update drops ---
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    let deflected = false;

    // Front drops interact with cursor, girl, and logo
    if (!d.back) {
      // Cursor circle deflection — rain interacts with the yellow ring edge
      if (mouseActive) {
        const dx = d.x - cursorX;
        const dy = d.y + d.length * 0.5 - cursorY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const outerZone = CIRCLE_RADIUS + DEFLECT_RADIUS;

        if (dist < outerZone && dist > 0) {
          // Distance from the circle edge (negative = inside circle)
          const edgeDist = dist - CIRCLE_RADIUS;

          if (edgeDist <= SPLASH_TOLERANCE) {
            // Hit the circle edge — splash outward from ring surface
            const nx = dx / dist;
            const ny = dy / dist;
            const splashX = cursorX + nx * CIRCLE_RADIUS;
            const splashY = cursorY + ny * CIRCLE_RADIUS;
            addSplash(splashX, splashY, nx, ny, 3);
            drops[i] = makeDrop(false, false);
            continue;
          }

          // Approaching the ring — deflect away from the circle edge
          const strength = Math.pow(1 - edgeDist / DEFLECT_RADIUS, 2);
          d.x += (dx / dist) * strength * 5 * dt;
          d.y += d.speed * (1 - strength * 0.6) * dt;
          deflected = true;
        }
      }

      if (!deflected) {
        d.y += d.speed * dt;
      }

      // Raingirl collision (pixel-accurate via alpha mask)
      if (girlRect) {
        const tip = d.y + d.length;
        if (
          tip >= girlRect.top &&
          tip <= girlRect.bottom &&
          d.x >= girlRect.left &&
          d.x <= girlRect.right
        ) {
          if (girlMask ? isGirlSolid(d.x, tip) : false) {
            splashOnSurface(d.x, tip, 2);
            drops[i] = makeDrop(false, false);
            continue;
          }
        }
      }

      // Logo collision (pixel-accurate via alpha mask)
      if (logoRect) {
        const tip = d.y + d.length;
        if (
          tip >= logoRect.top &&
          tip <= logoRect.bottom &&
          d.x >= logoRect.left &&
          d.x <= logoRect.right
        ) {
          if (logoMask ? isLogoSolid(d.x, tip) : false) {
            splashOnSurface(d.x, tip, 3);
            drops[i] = makeDrop(false, false);
            continue;
          }
        }
      }
    } else {
      // Back drops just fall straight — no collisions
      d.y += d.speed * dt;
    }

    // Off-screen recycling
    if (d.y > height) {
      drops[i] = makeDrop(false, d.back);
    }
  }

  // --- Update particles (always drawn on front layer) ---
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 0.15 * dt;
    p.life -= p.decay * dt;
    if (p.life <= 0) {
      particles[i] = particles[particles.length - 1];
      particles.pop();
    }
  }

  // --- Draw back-layer drops ---
  for (const d of drops) {
    if (!d.back) continue;
    ctxBack.drawImage(gradientBack, 0, 0, 1, 64, Math.round(d.x), d.y, 1, d.length);
  }

  // --- Draw front-layer drops ---
  for (const d of drops) {
    if (d.back) continue;
    ctxFront.drawImage(gradientFront, 0, 0, 1, 64, Math.round(d.x), d.y, 1, d.length);
  }

  // --- Draw splash particles (front layer) ---
  for (const p of particles) {
    ctxFront.globalAlpha = Math.max(0, p.life) * 0.8;
    ctxFront.fillStyle = 'rgba(200,220,255,1)';
    ctxFront.beginPath();
    ctxFront.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctxFront.fill();
  }
  ctxFront.globalAlpha = 1;

  frameId = requestAnimationFrame(frame);
}

// Reset lastTime when visibility changes to avoid dt spike on tab-back
function onVisibilityChange() {
  if (!document.hidden) lastTime = 0;
}

// --- Event handlers ---
function onMouseMove(e: MouseEvent) {
  if (!mouseActive) {
    cursorX = e.clientX;
    cursorY = e.clientY;
    mouseActive = true;
  }
  mouseX = e.clientX;
  mouseY = e.clientY;
}

function onMouseLeave() {
  mouseActive = false;
  mouseX = -200;
  mouseY = -200;
  cursorX = -200;
  cursorY = -200;
}

let rectTimer: number;

onMounted(() => {
  const fCanvas = frontCanvasRef.value;
  const bCanvas = backCanvasRef.value;
  if (!fCanvas || !bCanvas) return;
  const fc = fCanvas.getContext('2d');
  const bc = bCanvas.getContext('2d');
  if (!fc || !bc) return;
  ctxFront = fc;
  ctxBack = bc;

  // Pre-render gradient strips — front is brighter, back is dimmer for depth
  gradientFront = makeGradientStrip(0.6);
  gradientBack = makeGradientStrip(BACK_OPACITY);

  // Reset state (in case of View Transition re-mount)
  drops = [];
  particles = [];

  resize();
  for (let i = 0; i < FRONT_COUNT; i++) drops.push(makeDrop(true, false));
  for (let i = 0; i < BACK_COUNT; i++) drops.push(makeDrop(true, true));

  // Build alpha masks from images for pixel-accurate collision
  const girl = document.getElementById('bg_girl') as HTMLImageElement | null;
  if (girl) {
    if (girl.complete && girl.naturalWidth) buildGirlMask();
    else girl.addEventListener('load', buildGirlMask, { once: true });
  }
  const logo = document.getElementById('main-logo') as HTMLImageElement | null;
  if (logo) {
    if (logo.complete && logo.naturalWidth) buildLogoMask();
    else logo.addEventListener('load', buildLogoMask, { once: true });
  }

  updateRects();
  rectTimer = window.setInterval(updateRects, 500);
  window.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('resize', resize);
  lastTime = 0;
  frameId = requestAnimationFrame(frame);
});

onUnmounted(() => {
  cancelAnimationFrame(frameId);
  clearInterval(rectTimer);
  window.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseleave', onMouseLeave);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('resize', resize);
  drops = [];
  particles = [];
  ctxFront = null;
  ctxBack = null;
});
</script>

<style scoped>
.rain-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

/* Behind the girl (z-index 0) and logo (z-index 10) */
.rain-back {
  z-index: -1;
}

/* In front of everything */
.rain-front {
  z-index: 1000;
}
</style>
