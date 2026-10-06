import * as THREE from "three";

export type ScreenSpec = { client: string; accent: string; label: string; index: number };

/**
 * Draws a project UI screen onto a 2D canvas and wraps it in a Three.js
 * CanvasTexture — "screenshots" generated at runtime from data (client name,
 * brand accent, screen label). Same visual language as <ScreenMock>.
 * Replace with real screenshots via TextureLoader when the client supplies them.
 *
 * Sizes are powers of two-ish and ≤ 1024px (texture budget rule).
 */
export function createScreenTexture(spec: ScreenSpec, kind: "phone" | "laptop"): THREE.CanvasTexture {
  const w = kind === "phone" ? 512 : 1024;
  const h = kind === "phone" ? 1024 : 640;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const font = getComputedStyle(document.body).fontFamily || "sans-serif";
  const pad = w * 0.06;
  const v = spec.index % 3;

  // Background + subtle accent wash
  ctx.fillStyle = "#0c0c0c";
  ctx.fillRect(0, 0, w, h);
  const wash = ctx.createRadialGradient(w * 0.8, 0, 0, w * 0.8, 0, w);
  wash.addColorStop(0, hexAlpha(spec.accent, 0.25));
  wash.addColorStop(1, "transparent");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);

  // Nav bar
  const navY = kind === "phone" ? h * 0.06 : h * 0.07;
  ctx.fillStyle = "#f5f5f4";
  ctx.font = `600 ${w * 0.035}px ${font}`;
  ctx.textBaseline = "middle";
  ctx.fillText(spec.client, pad, navY);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  roundRect(ctx, w - pad - w * 0.12, navY - h * 0.008, w * 0.12, h * 0.016, 6);

  // Hero card in the brand accent
  const heroY = navY + h * 0.06;
  const heroH = kind === "phone" ? h * 0.26 : h * 0.36;
  const grad = ctx.createLinearGradient(pad, heroY, w - pad, heroY + heroH);
  grad.addColorStop(0, spec.accent);
  grad.addColorStop(1, hexAlpha(spec.accent, v === 1 ? 0.1 : 0.25));
  ctx.fillStyle = grad;
  roundRect(ctx, pad, heroY, w - pad * 2, heroH, 24);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${w * (kind === "phone" ? 0.07 : 0.045)}px ${font}`;
  ctx.fillText(spec.label, pad * 1.6, heroY + heroH * 0.32);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  roundRect(ctx, pad * 1.6, heroY + heroH * 0.52, (w - pad * 4) * 0.6, h * 0.014, 6);
  roundRect(ctx, pad * 1.6, heroY + heroH * 0.62, (w - pad * 4) * 0.4, h * 0.014, 6);
  ctx.fillStyle = "#0c0c0c";
  roundRect(ctx, pad * 1.6, heroY + heroH * 0.74, w * 0.2, h * 0.04, 40);

  // Content: list rows (phone / variant 2) or a card grid (laptop)
  const top = heroY + heroH + h * 0.04;
  if (kind === "phone" || v === 2) {
    const rowH = h * 0.085;
    for (let i = 0; i < 5 && top + i * (rowH + 14) + rowH < h - pad; i++) {
      const y = top + i * (rowH + 14);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      roundRect(ctx, pad, y, w - pad * 2, rowH, 18);
      ctx.fillStyle = hexAlpha(spec.accent, 0.8);
      ctx.beginPath();
      ctx.arc(pad + rowH / 2, y + rowH / 2, rowH * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      roundRect(ctx, pad + rowH, y + rowH * 0.42, (w - pad * 2) * (0.6 - (i % 3) * 0.1), rowH * 0.16, 6);
    }
  } else {
    const cols = 3;
    const gap = w * 0.02;
    const cw = (w - pad * 2 - gap * (cols - 1)) / cols;
    const ch = h - top - pad;
    for (let i = 0; i < cols; i++) {
      const x = pad + i * (cw + gap);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      roundRect(ctx, x, top, cw, ch, 18);
      ctx.fillStyle = hexAlpha(spec.accent, 0.3);
      roundRect(ctx, x + 14, top + 14, cw - 28, ch * 0.55, 12);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      roundRect(ctx, x + 14, top + ch * 0.72, cw * 0.6, h * 0.016, 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; // canvas pixels are sRGB
  texture.anisotropy = 4;
  return texture;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

/** "#rrggbb" + alpha → "rgba(r,g,b,a)". */
function hexAlpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
