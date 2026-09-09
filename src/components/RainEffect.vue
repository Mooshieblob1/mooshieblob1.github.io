<template>
  <canvas ref="backCanvas" class="rain-canvas rain-back" aria-hidden="true"></canvas>
  <canvas ref="frontCanvas" class="rain-canvas rain-front" aria-hidden="true"></canvas>
  <button type="button" class="rain-toggle" @click="toggleRain">
    <svg v-if="!paused" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" /></svg>
    <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5Z" /></svg>
    {{ paused ? 'Resume rain' : 'Pause rain' }}
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { firstSurfaceHit } from '../lib/rain-collision.mjs';

const props = withDefaults(defineProps<{ sceneId?: string }>(), { sceneId: 'rain-scene' });
const backCanvas = ref<HTMLCanvasElement | null>(null);
const frontCanvas = ref<HTMLCanvasElement | null>(null);
const paused = ref(false);
interface Drop { x: number; y: number; speed: number; length: number; back: boolean }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; decay: number; size: number }
interface Target { element: HTMLImageElement; mask: Uint8Array; maskWidth: number; maskHeight: number; left: number; top: number; width: number; height: number }
let scene: HTMLElement | null = null;
let back: CanvasRenderingContext2D | null = null;
let front: CanvasRenderingContext2D | null = null;
let backStrip: HTMLCanvasElement;
let frontStrip: HTMLCanvasElement;
let width = 0, height = 0, frameId = 0, lastTime = 0;
let alive = false, inView = true;
let drops: Drop[] = [], particles: Particle[] = [], targets: Target[] = [];
let resizeObserver: ResizeObserver | null = null;
let visibilityObserver: IntersectionObserver | null = null;
let reducedMotion: MediaQueryList | null = null;
let pointerQuery: MediaQueryList | null = null;
let pointerActive = false;
let mouseX = -200, mouseY = -200, cursorX = -200, cursorY = -200;
const imageListeners: Array<{ element: HTMLImageElement; listener: () => void }> = [];
const FRAME_MS = 1000 / 60;
const CURSOR_RADIUS = 18;

function makeStrip(alpha: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 1; canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 64);
  gradient.addColorStop(0, 'rgba(176,207,244,0)');
  gradient.addColorStop(1, `rgba(196,220,255,${alpha})`);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1, 64);
  return canvas;
}
function makeDrop(backLayer: boolean, scatter = false): Drop {
  return { x: Math.random() * width, y: scatter ? -Math.random() * height : -20 - Math.random() * 100,
    speed: backLayer ? 5 + Math.random() * 4 : 8 + Math.random() * 6,
    length: backLayer ? 10 + Math.random() * 12 : 15 + Math.random() * 18, back: backLayer };
}
function splash(x: number, y: number, count = 3) {
  for (let i = 0; i < count && particles.length < 240; i++) particles.push({
    x, y, vx: (Math.random() - .5) * 4.5, vy: -1.5 - Math.random() * 2.5,
    life: 1, decay: 1 / (18 + Math.random() * 16), size: .8 + Math.random() * .9,
  });
}
function measureTargets() {
  if (!scene) return;
  const bounds = scene.getBoundingClientRect();
  for (const target of targets) {
    const rect = target.element.getBoundingClientRect();
    target.left = rect.left - bounds.left;
    target.top = rect.top - bounds.top;
    target.width = rect.width; target.height = rect.height;
  }
}
function buildMask(element: HTMLImageElement) {
  if (!alive || !element.naturalWidth || targets.some(target => target.element === element)) return;
  try {
    const scale = Math.min(1, 512 / Math.max(element.naturalWidth, element.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(element.naturalWidth * scale);
    canvas.height = Math.ceil(element.naturalHeight * scale);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const mask = new Uint8Array(canvas.width * canvas.height);
    for (let i = 0; i < mask.length; i++) mask[i] = pixels[i * 4 + 3];
    targets.push({ element, mask, maskWidth: canvas.width, maskHeight: canvas.height, left: 0, top: 0, width: 0, height: 0 });
    measureTargets();
  } catch { /* The artwork remains visible if a browser cannot read its pixels. */ }
}
function resize() {
  if (!scene || !front || !back) return;
  const rect = scene.getBoundingClientRect();
  const nextWidth = rect.width, nextHeight = rect.height;
  if (nextWidth !== width || nextHeight !== height) {
    width = nextWidth; height = nextHeight; pointerActive = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const [canvas, ctx] of [[backCanvas.value, back], [frontCanvas.value, front]] as const) {
      if (!canvas) continue;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    // Density scales with the composition, rather than the physical screen resolution.
    const frontCount = Math.max(28, Math.min(110, Math.round(width / 12)));
    drops = Array.from({ length: frontCount }, () => makeDrop(false, true))
      .concat(Array.from({ length: Math.round(frontCount * .45) }, () => makeDrop(true, true)));
    particles = [];
  }
  measureTargets();
}
function frame(now: number) {
  if (!front || !back || paused.value || !alive || !inView || document.hidden) { frameId = 0; return; }
  const dt = Math.min(lastTime ? (now - lastTime) / FRAME_MS : 1, 2.5);
  lastTime = now;
  front.clearRect(0, 0, width, height); back.clearRect(0, 0, width, height);
  if (pointerActive) {
    const easing = 1 - Math.pow(.85, dt);
    cursorX += (mouseX - cursorX) * easing; cursorY += (mouseY - cursorY) * easing;
  }
  for (let i = 0; i < drops.length; i++) {
    const drop = drops[i];
    const fromX = drop.x, fromTip = drop.y + drop.length;
    let speed = drop.speed;
    if (!drop.back && pointerActive) {
      const dx = drop.x - cursorX, dy = fromTip - cursorY;
      const distance = Math.hypot(dx, dy);
      if (distance < CURSOR_RADIUS + 3) { splash(drop.x, fromTip, 2); drops[i] = makeDrop(false); continue; }
      if (distance < CURSOR_RADIUS + 50 && distance > 0) {
        const strength = Math.pow(1 - (distance - CURSOR_RADIUS) / 50, 2);
        drop.x += dx / distance * strength * 4 * dt;
        speed *= 1 - strength * .5;
      }
    }
    drop.y += speed * dt;
    if (!drop.back) {
      const hit = firstSurfaceHit(targets, fromX, fromTip, drop.x, drop.y + drop.length);
      if (hit) { splash(hit.x, hit.y); drops[i] = makeDrop(false); continue; }
      if (drop.y + drop.length >= height - 14) {
        if (Math.random() < .45) splash(drop.x, height - 14, 2);
        drops[i] = makeDrop(false); continue;
      }
    }
    if (drop.y > height || drop.x < 0 || drop.x > width) { drops[i] = makeDrop(drop.back); continue; }
    (drop.back ? back : front).drawImage(drop.back ? backStrip : frontStrip, 0, 0, 1, 64, Math.round(drop.x), drop.y, 1, drop.length);
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.x += particle.vx * dt; particle.y += particle.vy * dt;
    particle.vy += .15 * dt; particle.life -= particle.decay * dt;
    if (particle.life <= 0) { particles.splice(i, 1); continue; }
    front.globalAlpha = particle.life * .75;
    front.fillStyle = '#c4dcff'; front.beginPath();
    front.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); front.fill();
  }
  front.globalAlpha = 1;
  if (pointerActive) {
    front.strokeStyle = '#ffd23e66'; front.lineWidth = 1;
    front.beginPath(); front.arc(cursorX, cursorY, CURSOR_RADIUS, 0, Math.PI * 2); front.stroke();
  }
  frameId = requestAnimationFrame(frame);
}
function syncAnimation() {
  cancelAnimationFrame(frameId); frameId = 0; lastTime = 0;
  if (alive && !paused.value && inView && !document.hidden) frameId = requestAnimationFrame(frame);
  if (paused.value) { front?.clearRect(0, 0, width, height); back?.clearRect(0, 0, width, height); }
}
function toggleRain() { paused.value = !paused.value; syncAnimation(); }
function onMotionChange() { paused.value = !!reducedMotion?.matches; syncAnimation(); }
function clearPointer() { pointerActive = false; }
function onPointer(event: PointerEvent) {
  if (!scene || event.pointerType !== 'mouse' || !pointerQuery?.matches) return;
  const rect = scene.getBoundingClientRect();
  mouseX = event.clientX - rect.left; mouseY = event.clientY - rect.top;
  if (!pointerActive) { cursorX = mouseX; cursorY = mouseY; pointerActive = true; }
}
onMounted(() => {
  scene = document.getElementById(props.sceneId);
  front = frontCanvas.value?.getContext('2d') || null;
  back = backCanvas.value?.getContext('2d') || null;
  if (!scene || !front || !back) return;
  alive = true;
  frontStrip = makeStrip(.6); backStrip = makeStrip(.25);
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  paused.value = reducedMotion.matches;
  for (const image of scene.querySelectorAll<HTMLImageElement>('[data-rain-target]')) {
    if (image.complete && image.naturalWidth) buildMask(image);
    else {
      const listener = () => buildMask(image);
      image.addEventListener('load', listener, { once: true });
      imageListeners.push({ element: image, listener });
    }
  }
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(scene);
  scene.querySelectorAll('[data-rain-target]').forEach(element => resizeObserver!.observe(element));
  visibilityObserver = new IntersectionObserver(entries => {
    inView = entries[0]?.isIntersecting ?? false; syncAnimation();
  });
  visibilityObserver.observe(scene);
  scene.addEventListener('pointermove', onPointer);
  scene.addEventListener('pointerleave', clearPointer);
  // Scrolling moves the scene under a stationary mouse; don't leave an invisible obstruction.
  window.addEventListener('scroll', clearPointer, { passive: true });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', syncAnimation);
  reducedMotion.addEventListener('change', onMotionChange);
  resize(); syncAnimation();
});
onUnmounted(() => {
  alive = false; cancelAnimationFrame(frameId);
  resizeObserver?.disconnect(); visibilityObserver?.disconnect();
  scene?.removeEventListener('pointermove', onPointer);
  scene?.removeEventListener('pointerleave', clearPointer);
  window.removeEventListener('scroll', clearPointer);
  window.removeEventListener('resize', resize);
  document.removeEventListener('visibilitychange', syncAnimation);
  reducedMotion?.removeEventListener('change', onMotionChange);
  imageListeners.forEach(({ element, listener }) => element.removeEventListener('load', listener));
  drops = []; particles = []; targets = []; front = null; back = null;
});
</script>

<style scoped>
.rain-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.rain-back { z-index: 1; }
.rain-front { z-index: 4; }
.rain-toggle { position: absolute; right: max(24px, calc((100% - 1224px) / 2)); bottom: 24px; z-index: 6; display: inline-flex; gap: 9px; align-items: center; padding: 8px 12px; border: 1px solid #61789866; border-radius: 6px; background: #0a1021d9; color: #b7c6db; font-size: .8125rem; line-height: 1.4; cursor: pointer; }
.rain-toggle:hover { color: var(--yellow); border-color: #ffd23e80; }
.rain-toggle svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 1.6; fill: none; stroke-linecap: round; stroke-linejoin: round; }
@media(max-width: 600px) { .rain-toggle { right: 20px; bottom: 18px; } }
</style>
