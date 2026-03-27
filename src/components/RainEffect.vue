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
const DEFLECT_RADIUS = 80;
const SPLASH_RADIUS = 24;
const BACK_OPACITY = 0.35; // dimmer for depth

// --- State ---
let drops: Drop[] = [];
let particles: Particle[] = [];
let width = 0;
let height = 0;
let ctxFront: CanvasRenderingContext2D | null = null;
let ctxBack: CanvasRenderingContext2D | null = null;
let frameId = 0;

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

function splashFromCursor(x: number, y: number, count: number) {
  const dx = x - cursorX;
  const dy = y - cursorY;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  addSplash(x, y, dx / d, dy / d, count);
}

// --- Raingirl alpha-mask collision ---
function isGirlSolid(sx: number, sy: number): boolean {
  if (!girlMask || !girlRect) return false;
  const ix = Math.floor(((sx - girlRect.left) / girlRect.width) * girlMaskW);
  const iy = Math.floor(((sy - girlRect.top) / girlRect.height) * girlMaskH);
  if (ix < 0 || ix >= girlMaskW || iy < 0 || iy >= girlMaskH) return false;
  return girlMask[iy * girlMaskW + ix] > 128;
}

function buildGirlMask() {
  const el = document.getElementById('bg_girl') as HTMLImageElement | null;
  if (!el || !el.naturalWidth) return;
  try {
    const c = document.createElement('canvas');
    const s = 0.2;
    c.width = Math.ceil(el.naturalWidth * s);
    c.height = Math.ceil(el.naturalHeight * s);
    const cx = c.getContext('2d', { willReadFrequently: true });
    if (!cx) return;
    cx.drawImage(el, 0, 0, c.width, c.height);
    const data = cx.getImageData(0, 0, c.width, c.height);
    girlMaskW = c.width;
    girlMaskH = c.height;
    girlMask = new Uint8Array(c.width * c.height);
    for (let i = 0; i < girlMask.length; i++) {
      girlMask[i] = data.data[i * 4 + 3];
    }
  } catch {
    girlMask = null;
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
function frame() {
  if (!ctxFront || !ctxBack) return;
  ctxFront.clearRect(0, 0, width, height);
  ctxBack.clearRect(0, 0, width, height);

  // Smooth cursor tracking
  if (mouseActive) {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
  }

  // --- Update drops ---
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    let deflected = false;

    // Front drops interact with cursor, girl, and logo
    if (!d.back) {
      // Cursor deflection
      if (mouseActive) {
        const dx = d.x - cursorX;
        const dy = d.y + d.length * 0.5 - cursorY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < DEFLECT_RADIUS && dist > 0) {
          const strength = Math.pow(1 - dist / DEFLECT_RADIUS, 2);
          d.x += (dx / dist) * strength * 5;
          d.y += d.speed * (1 - strength * 0.6);
          deflected = true;

          if (dist < SPLASH_RADIUS) {
            splashFromCursor(d.x, d.y + d.length, 3);
            drops[i] = makeDrop(false, false);
            continue;
          }
        }
      }

      if (!deflected) {
        d.y += d.speed;
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

      // Logo collision (bounding box, top edge)
      if (logoRect) {
        const tip = d.y + d.length;
        if (
          d.x >= logoRect.left &&
          d.x <= logoRect.right &&
          tip >= logoRect.top &&
          tip <= logoRect.top + d.speed + 2
        ) {
          splashOnSurface(d.x, logoRect.top, 3);
          drops[i] = makeDrop(false, false);
          continue;
        }
      }
    } else {
      // Back drops just fall straight — no collisions
      d.y += d.speed;
    }

    // Off-screen recycling
    if (d.y > height) {
      drops[i] = makeDrop(false, d.back);
    }
  }

  // --- Update particles (always drawn on front layer) ---
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life -= p.decay;
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

  // Build alpha mask from raingirl image for pixel-accurate collision
  const girl = document.getElementById('bg_girl') as HTMLImageElement | null;
  if (girl) {
    if (girl.complete && girl.naturalWidth) buildGirlMask();
    else girl.addEventListener('load', buildGirlMask, { once: true });
  }

  updateRects();
  rectTimer = window.setInterval(updateRects, 500);
  window.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('resize', resize);
  frameId = requestAnimationFrame(frame);
});

onUnmounted(() => {
  cancelAnimationFrame(frameId);
  clearInterval(rectTimer);
  window.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseleave', onMouseLeave);
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
