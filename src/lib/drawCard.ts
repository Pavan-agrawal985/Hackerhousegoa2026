/**
 * Isomorphic HH Goa 2026 Builder ID Card renderer.
 *
 * Draws identically whether given a browser CanvasRenderingContext2D
 * (instant client preview) or a @napi-rs/canvas SKRSContext2D
 * (server-side render used to produce the durable share image / OG asset).
 *
 * Keeping ONE drawing routine guarantees the downloaded PNG and the
 * X share-link preview are pixel-identical.
 */

export const CARD_W = 1080;
export const CARD_H = 1620;

export interface CardFields {
  name: string;
  stack: string;
  title: string;
}

// Minimal structural typing so this file has zero hard dependency on either
// lib.dom's CanvasRenderingContext2D or @napi-rs/canvas's types.
export interface Ctx2D {
  canvas: { width: number; height: number };
  save(): void;
  restore(): void;
  beginPath(): void;
  closePath(): void;
  clip(): void;
  fill(): void;
  stroke(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, r: number, s: number, e: number, ccw?: boolean): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  bezierCurveTo(
    cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number
  ): void;
  roundRect?: (x: number, y: number, w: number, h: number, r: number | number[]) => void;
  drawImage(image: unknown, ...args: number[]): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  fillText(text: string, x: number, y: number): void;
  measureText(text: string): { width: number; actualBoundingBoxAscent?: number; actualBoundingBoxDescent?: number };
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradientLike;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradientLike;
  fillStyle: string | CanvasGradientLike;
  strokeStyle: string | CanvasGradientLike;
  lineWidth: number;
  font: string;
  textAlign: string;
  textBaseline?: string;
  globalAlpha: number;
  shadowColor?: string;
  shadowBlur?: number;
  letterSpacing?: string;
}

interface CanvasGradientLike {
  addColorStop(offset: number, color: string): void;
}

export interface DrawableImage {
  width: number;
  height: number;
}

function rrect(ctx: Ctx2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

function imgCover(
  ctx: Ctx2D,
  img: DrawableImage,
  dx: number, dy: number, dw: number, dh: number
) {
  const ir = img.width / img.height;
  const dr = dw / dh;
  let sx: number, sy: number, sw: number, sh: number;
  if (ir > dr) {
    sh = img.height;
    sw = sh * dr;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / dr;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawPalm(ctx: Ctx2D, x: number, y: number, scale: number, flip: boolean) {
  ctx.save();
  // translate via transform not available in our minimal iface — emulate with manual math
  const T = (px: number, py: number): [number, number] => {
    const fx = flip ? -px : px;
    return [x + fx * scale, y + py * scale];
  };
  ctx.beginPath();
  const [mx, my] = T(0, 0);
  ctx.moveTo(mx, my);
  const c1 = T(8, -35), c2 = T(-6, -65), e1 = T(3, -110);
  ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], e1[0], e1[1]);
  ctx.lineWidth = 8 * scale;
  ctx.strokeStyle = "rgba(60,30,5,0.55)";
  ctx.stroke();

  const fronds: [number, number, number, number, number, number][] = [
    [-8, -108, -58, -138, -92, -124],
    [-8, -108, -48, -152, -18, -162],
    [-8, -108, 20, -152, 52, -144],
    [-8, -108, 52, -126, 74, -110],
    [-8, -108, -32, -110, -54, -94],
  ];
  ctx.lineWidth = 4 * scale;
  fronds.forEach(([ax, ay, bx, by, ex, ey]) => {
    const A = T(ax, ay), B = T(bx, by), E = T(ex, ey);
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.quadraticCurveTo(B[0], B[1], E[0], E[1]);
    ctx.strokeStyle = "rgba(15,110,50,0.6)";
    ctx.stroke();
  });
  ctx.restore();
}

function drawWaves(ctx: Ctx2D, W: number, y: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 4; i++) {
    const yy = y + i * 28;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    for (let x = 0; x <= W; x += 100) {
      ctx.quadraticCurveTo(x + 50, yy - 18, x + 100, yy);
    }
    ctx.strokeStyle = `rgba(20,184,166,${0.55 - i * 0.1})`;
    ctx.lineWidth = 3.2 - i * 0.5;
    ctx.stroke();
  }
  ctx.restore();
}

// Small font-independent vector icons. Emoji glyphs render as blank "tofu"
// boxes on many headless server environments (no emoji font installed),
// so anything drawn into the canvas uses hand-drawn vector marks instead —
// guarantees the client preview and the server-rendered share image always
// look identical, on any machine.
function iconStar(ctx: Ctx2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i;
    const ox = Math.cos(a) * r, oy = Math.sin(a) * r;
    const mx = Math.cos(a + Math.PI / 4) * r * 0.32, my = Math.sin(a + Math.PI / 4) * r * 0.32;
    if (i === 0) ctx.moveTo(cx + ox, cy + oy);
    else ctx.lineTo(cx + ox, cy + oy);
    ctx.lineTo(cx + mx, cy + my);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function iconPin(ctx: Ctx2D, cx: number, cy: number, s: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.15, s * 0.55, Math.PI * 0.1, Math.PI * 0.9, true);
  ctx.lineTo(cx, cy + s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.15, s * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(5,20,28,0.9)";
  ctx.fill();
  ctx.restore();
}

function iconTicket(ctx: Ctx2D, cx: number, cy: number, s: number, color: string) {
  ctx.save();
  const w = s * 1.2, h = s * 0.72;
  const x = cx - w / 2, y = cy - h / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  rrect(ctx, x, y, w, h, s * 0.14);
  ctx.fill();
  // perforation dots stand in for the classic ticket notch, without
  // relying on composite-op support across canvas implementations.
  const dotX = x + w * 0.62;
  ctx.fillStyle = "rgba(5,20,28,0.5)";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(dotX, y + h * (0.2 + i * 0.3), s * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function iconCalendar(ctx: Ctx2D, cx: number, cy: number, s: number, color: string) {
  ctx.save();
  const w = s * 1.05, h = s * 0.95;
  const x = cx - w / 2, y = cy - h / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  rrect(ctx, x, y, w, h, s * 0.14);
  ctx.fill();
  ctx.fillStyle = "rgba(5,20,28,0.85)";
  ctx.fillRect(x, y, w, h * 0.28);
  ctx.fillStyle = color;
  ctx.beginPath();
  rrect(ctx, x + s * 0.12, y - s * 0.06, s * 0.1, s * 0.22, s * 0.05);
  ctx.fill();
  ctx.beginPath();
  rrect(ctx, x + w - s * 0.22, y - s * 0.06, s * 0.1, s * 0.22, s * 0.05);
  ctx.fill();
  ctx.restore();
}

function fitText(
  ctx: Ctx2D, text: string, maxW: number, maxSize: number, minSize: number,
  weight: string, family: string
) {
  let fs = maxSize;
  ctx.font = `${weight} ${fs}px ${family}`;
  while (ctx.measureText(text).width > maxW && fs > minSize) {
    fs -= 1;
    ctx.font = `${weight} ${fs}px ${family}`;
  }
  return fs;
}

const FAMILY = '"Space Grotesk", "Segoe UI", -apple-system, Arial, sans-serif';

export function drawIdCard(ctx: Ctx2D, img: DrawableImage, fields: CardFields) {
  const W = CARD_W;
  const H = CARD_H;

  const name = (fields.name || "Your Name").trim() || "Your Name";
  const stack = (fields.stack || "Fullstack · Builder").trim() || "Fullstack · Builder";
  const title = (fields.title || "The Wave Rider").trim() || "The Wave Rider";

  // ---- BACKGROUND: sunset sky -> ocean ----
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1c0805");
  bg.addColorStop(0.12, "#6b2008");
  bg.addColorStop(0.28, "#d4581a");
  bg.addColorStop(0.44, "#e8893a");
  bg.addColorStop(0.56, "#1a7fa3");
  bg.addColorStop(0.72, "#0b5c82");
  bg.addColorStop(0.88, "#063d58");
  bg.addColorStop(1, "#021820");
  ctx.save();
  ctx.beginPath();
  rrect(ctx, 0, 0, W, H, 44);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();

  // ---- SUN ----
  const sunX = W * 0.66, sunY = H * 0.315;
  const sunR = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 180);
  sunR.addColorStop(0, "rgba(255,235,120,1)");
  sunR.addColorStop(0.25, "rgba(255,185,60,0.7)");
  sunR.addColorStop(0.6, "rgba(255,110,30,0.25)");
  sunR.addColorStop(1, "rgba(255,80,0,0)");
  ctx.fillStyle = sunR;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, 82, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,240,130,0.9)";
  ctx.fill();
  ctx.restore();

  // ---- HORIZON LINE ----
  ctx.save();
  ctx.globalAlpha = 0.28;
  const hg = ctx.createLinearGradient(0, 0, W, 0);
  hg.addColorStop(0, "transparent");
  hg.addColorStop(0.5, "#fff");
  hg.addColorStop(1, "transparent");
  ctx.fillStyle = hg;
  ctx.fillRect(0, H * 0.5, W, 3);
  ctx.restore();

  // ---- OCEAN WAVES ----
  drawWaves(ctx, W, H * 0.6, 0.55);
  drawWaves(ctx, W, H * 0.72, 0.38);

  // ---- SAND ----
  const sand = ctx.createLinearGradient(0, H * 0.82, 0, H);
  sand.addColorStop(0, "rgba(190,140,55,0)");
  sand.addColorStop(1, "rgba(160,115,40,0.38)");
  ctx.fillStyle = sand;
  ctx.fillRect(0, H * 0.82, W, H);

  // ---- PALM TREES ----
  drawPalm(ctx, 86, H + 22, 2.0, false);
  drawPalm(ctx, W - 68, H + 22, 1.8, true);

  // ---- TOP HEADER BAND ----
  const headerH = 116;
  ctx.save();
  ctx.beginPath();
  rrect(ctx, 0, 0, W, headerH, 44);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fill();
  ctx.restore();

  const topLine = ctx.createLinearGradient(0, 0, W, 0);
  topLine.addColorStop(0, "transparent");
  topLine.addColorStop(0.2, "#ff6b35");
  topLine.addColorStop(0.5, "#f7931e");
  topLine.addColorStop(0.8, "#14b8a6");
  topLine.addColorStop(1, "transparent");
  ctx.strokeStyle = topLine;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(44, headerH);
  ctx.lineTo(W - 44, headerH);
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = `800 24px ${FAMILY}`;
  ctx.letterSpacing = "5px";
  const headline = "HACKER HOUSE GOA 2026";
  const headlineW = ctx.measureText(headline).width;
  ctx.fillText(headline, W / 2, 58);
  ctx.letterSpacing = "0px";
  iconStar(ctx, W / 2 - headlineW / 2 - 26, 51, 8, "#f7d26e");
  iconStar(ctx, W / 2 + headlineW / 2 + 26, 51, 8, "#f7d26e");
  ctx.font = `600 19px ${FAMILY}`;
  ctx.fillStyle = "rgba(255,220,150,0.75)";
  ctx.letterSpacing = "3px";
  ctx.fillText("BUILDER ID CARD", W / 2, 92);
  ctx.letterSpacing = "0px";

  // ---- PHOTO ----
  const PHOTO_SIZE = 500;
  const photoX = (W - PHOTO_SIZE) / 2;
  const photoY = headerH + 66;

  const glow = ctx.createRadialGradient(
    photoX + PHOTO_SIZE / 2, photoY + PHOTO_SIZE / 2, PHOTO_SIZE * 0.3,
    photoX + PHOTO_SIZE / 2, photoY + PHOTO_SIZE / 2, PHOTO_SIZE * 0.75
  );
  glow.addColorStop(0, "rgba(255,107,53,0)");
  glow.addColorStop(1, "rgba(255,107,53,0.45)");
  ctx.fillStyle = glow;
  ctx.fillRect(photoX - 54, photoY - 54, PHOTO_SIZE + 108, PHOTO_SIZE + 108);

  ctx.save();
  ctx.beginPath();
  rrect(ctx, photoX, photoY, PHOTO_SIZE, PHOTO_SIZE, 36);
  ctx.clip();
  imgCover(ctx, img, photoX, photoY, PHOTO_SIZE, PHOTO_SIZE);
  ctx.restore();

  const pb = ctx.createLinearGradient(photoX, photoY, photoX + PHOTO_SIZE, photoY + PHOTO_SIZE);
  pb.addColorStop(0, "#ff6b35");
  pb.addColorStop(0.5, "#f7d26e");
  pb.addColorStop(1, "#14b8a6");
  ctx.save();
  ctx.beginPath();
  rrect(ctx, photoX, photoY, PHOTO_SIZE, PHOTO_SIZE, 36);
  ctx.lineWidth = 8;
  ctx.strokeStyle = pb;
  ctx.stroke();
  ctx.restore();

  // ---- CONTENT BELOW PHOTO ----
  const PAD = 80;
  let ty = photoY + PHOTO_SIZE + 58;
  const maxW = W - PAD * 2;

  // Title line — measure its descent so the name below never collides
  // with it, regardless of how the host font reports its metrics.
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(253,233,194,0.8)";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 10;
  ctx.font = `italic 600 26px ${FAMILY}`;
  ctx.fillText(title, W / 2, ty);
  const tMetrics = ctx.measureText(title);
  const tDescent = tMetrics.actualBoundingBoxDescent || 8;
  ty += tDescent + 24;

  // Name — pick the final font size first, measure its ascent, THEN place
  // the baseline far enough down that the glyph tops clear the title line.
  ctx.fillStyle = "#ffffff";
  ctx.shadowBlur = 20;
  fitText(ctx, name, maxW, 100, 48, "800", FAMILY);
  const nMetrics = ctx.measureText(name);
  const nAscent = nMetrics.actualBoundingBoxAscent || 74;
  const nDescent = nMetrics.actualBoundingBoxDescent || 18;
  ty += nAscent + 12;
  ctx.fillText(name, W / 2, ty);
  ty += nDescent + 34;

  ctx.fillStyle = "rgba(253,233,194,0.92)";
  ctx.shadowBlur = 10;
  fitText(ctx, stack, maxW, 34, 22, "600", FAMILY);
  ctx.fillText(stack, W / 2, ty);
  ty += 52;

  ctx.shadowBlur = 0;

  ty += 16;
  const divGrad = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  divGrad.addColorStop(0, "transparent");
  divGrad.addColorStop(0.2, "rgba(255,255,255,0.25)");
  divGrad.addColorStop(0.8, "rgba(255,255,255,0.25)");
  divGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD, ty);
  ctx.lineTo(W - PAD, ty);
  ctx.stroke();
  ty += 42;

  const stats: {
    icon: (ctx: Ctx2D, cx: number, cy: number) => void;
    label: string;
    value: string;
  }[] = [
    { icon: (c, x, y) => iconTicket(c, x, y, 30, "#f7d26e"), label: "EVENT", value: "Hacker House" },
    { icon: (c, x, y) => iconPin(c, x, y, 34, "#ff6b35"), label: "LOCATION", value: "Goa, India" },
    { icon: (c, x, y) => iconCalendar(c, x, y, 30, "#5ee6d0"), label: "YEAR", value: "2026" },
  ];
  const colW = maxW / stats.length;
  stats.forEach((s, i) => {
    const cx = PAD + i * colW + colW / 2;
    ctx.textAlign = "center";
    s.icon(ctx, cx, ty);
    ctx.fillStyle = "rgba(253,233,194,0.5)";
    ctx.font = `700 16px ${FAMILY}`;
    ctx.letterSpacing = "2px";
    ctx.fillText(s.label, cx, ty + 32);
    ctx.letterSpacing = "0px";
    ctx.fillStyle = "#fff";
    ctx.font = `700 27px ${FAMILY}`;
    ctx.fillText(s.value, cx, ty + 64);
  });
  ty += 100;

  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD, ty);
  ctx.lineTo(W - PAD, ty);
  ctx.stroke();
  ty += 36;

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(253,233,194,0.55)";
  ctx.font = `700 23px ${FAMILY}`;
  ctx.fillText("#FrameInGoa · #HackerHouse · #HHGoa2026", W / 2, ty + 24);

  const botGrad = ctx.createLinearGradient(0, 0, W, 0);
  botGrad.addColorStop(0, "#ff6b35");
  botGrad.addColorStop(0.5, "#f7d26e");
  botGrad.addColorStop(1, "#14b8a6");
  ctx.save();
  ctx.beginPath();
  rrect(ctx, 0, H - 18, W, 18, 44);
  ctx.fillStyle = botGrad;
  ctx.fill();
  ctx.restore();
}
