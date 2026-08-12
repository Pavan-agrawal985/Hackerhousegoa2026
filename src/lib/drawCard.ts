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

export const CARD_W = 1200;
export const CARD_H = 1800;

export interface CardFields {
  name: string;
  stack: string;
  title: string;
}

export interface PhotoAdjustments {
  zoom: number;
  offsetX: number;
  offsetY: number;
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
  shadowOffsetY?: number;
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

export function drawIdCard(ctx: Ctx2D, img: DrawableImage, fields: CardFields, adjustments?: PhotoAdjustments) {
  const W = CARD_W;
  const H = CARD_H;

  const name = (fields.name || "Your Name").trim() || "Your Name";
  const stack = (fields.stack || "Fullstack · Builder").trim() || "Fullstack · Builder";
  const title = (fields.title || "The Wave Rider").trim() || "The Wave Rider";
  
  // Default adjustments
  const zoom = adjustments?.zoom ?? 1.0;
  const userOffsetX = adjustments?.offsetX ?? 0;
  const userOffsetY = adjustments?.offsetY ?? 0;

  // ---- TROPICAL GOA BEACH BACKGROUND ----
  // Ocean gradient - darker green at top to lighter at bottom
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  oceanGrad.addColorStop(0, "#0d5e4a");
  oceanGrad.addColorStop(0.5, "#168b6b");
  oceanGrad.addColorStop(1, "#20a378");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Sandy beach at bottom
  const sandGrad = ctx.createLinearGradient(0, H * 0.55, 0, H);
  sandGrad.addColorStop(0, "#f5f3ed");
  sandGrad.addColorStop(0.3, "#f0ebe0");
  sandGrad.addColorStop(1, "#e8e3d5");
  ctx.fillStyle = sandGrad;
  ctx.fillRect(0, H * 0.55, W, H * 0.45);

  // Sun rays
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 6;
  const sunX = W * 0.5, sunY = H * 0.22;
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16;
    ctx.beginPath();
    ctx.moveTo(sunX + Math.cos(angle) * 80, sunY + Math.sin(angle) * 80);
    ctx.lineTo(sunX + Math.cos(angle) * 140, sunY + Math.sin(angle) * 140);
    ctx.stroke();
  }
  ctx.restore();

  // Big yellow sun
  ctx.save();
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(sunX, sunY, 85, 0, Math.PI * 2);
  ctx.fill();
  
  // Sun glow
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#ffe44d";
  ctx.beginPath();
  ctx.arc(sunX, sunY, 105, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sun reflection on water
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#ffd700";
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(W / 2 - 40 + Math.random() * 80, sunY + 100 + i * 35, 60 - i * 6, 15);
  }
  ctx.restore();

  // Ocean waves
  ctx.save();
  ctx.strokeStyle = "#0a4d3c";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  for (let row = 0; row < 8; row++) {
    const y = H * 0.28 + row * 40;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 80) {
      if (x === 0) ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 20, y - 6, x + 40, y);
      ctx.quadraticCurveTo(x + 60, y + 6, x + 80, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Beach umbrellas
  function drawUmbrella(x: number, y: number, color1: string, color2: string) {
    ctx.save();
    // Pole
    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 50);
    ctx.stroke();
    
    // Umbrella top
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI, true);
    ctx.fill();
    
    // Stripes
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x - 25, y - 20);
    ctx.lineTo(x - 5, y - 30);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + 15, y);
    ctx.lineTo(x + 25, y - 20);
    ctx.lineTo(x + 5, y - 30);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawUmbrella(180, H * 0.54, "#ffd700", "#ffed4e");
  drawUmbrella(W - 180, H * 0.54, "#ffd700", "#ffed4e");

  // Palm trees - more detailed
  function drawDetailedPalm(x: number, y: number, scale: number, flip: boolean) {
    ctx.save();
    // Trunk
    ctx.strokeStyle = "#8b6f47";
    ctx.lineWidth = 12 * scale;
    ctx.beginPath();
    const bendX = x + (flip ? -15 : 15) * scale;
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(bendX, y - 60 * scale, x, y - 120 * scale);
    ctx.stroke();
    
    // Palm fronds
    const palmTop = y - 120 * scale;
    ctx.strokeStyle = "#1a7a5e";
    ctx.lineWidth = 8 * scale;
    const fronds = [
      { angle: -60, len: 80 },
      { angle: -30, len: 90 },
      { angle: 0, len: 95 },
      { angle: 30, len: 90 },
      { angle: 60, len: 80 },
    ];
    
    fronds.forEach(f => {
      const rad = (f.angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(x, palmTop);
      ctx.lineTo(x + Math.sin(rad) * f.len * scale, palmTop - Math.cos(rad) * f.len * scale);
      ctx.stroke();
    });
    ctx.restore();
  }

  drawDetailedPalm(120, H * 0.55, 1.5, false);
  drawDetailedPalm(W - 120, H * 0.55, 1.5, true);
  drawDetailedPalm(280, H * 0.56, 1.2, false);
  drawDetailedPalm(W - 280, H * 0.56, 1.2, true);

  // Decorative side borders with gradient
  const borderGrad = ctx.createLinearGradient(0, 0, 0, H);
  borderGrad.addColorStop(0, "#ff6b35");
  borderGrad.addColorStop(0.3, "#f7931e");
  borderGrad.addColorStop(0.6, "#fbbf24");
  borderGrad.addColorStop(1, "#14b8a6");
  
  ctx.fillStyle = borderGrad;
  ctx.fillRect(0, 0, 20, H);
  ctx.fillRect(W - 20, 0, 20, H);

  // Decorative top accent
  ctx.fillStyle = "#0d5e4a";
  ctx.fillRect(20, 0, W - 40, 8);

  // ---- TOP HEADER ----
  const headerH = 180;
  
  // "GOA INDIA" stamp top left
  ctx.save();
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  rrect(ctx, 60, 40, 160, 70, 8);
  ctx.fill();
  ctx.strokeStyle = "#ff6b35";
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.fillStyle = "#ff6b35";
  ctx.textAlign = "center";
  ctx.font = `800 20px ${FAMILY}`;
  ctx.letterSpacing = "2px";
  ctx.fillText("GOA", 140, 70);
  ctx.fillStyle = "#fbbf24";
  ctx.font = `700 16px ${FAMILY}`;
  ctx.fillText("INDIA", 140, 94);
  ctx.letterSpacing = "0px";
  ctx.restore();

  // "HH GOA 2026" badge top right
  ctx.save();
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  rrect(ctx, W - 220, 40, 160, 70, 8);
  ctx.fill();
  ctx.strokeStyle = "#14b8a6";
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.fillStyle = "#14b8a6";
  ctx.textAlign = "center";
  ctx.font = `800 22px ${FAMILY}`;
  ctx.fillText("HH GOA", W - 140, 72);
  ctx.fillStyle = "#fbbf24";
  ctx.font = `700 20px ${FAMILY}`;
  ctx.fillText("2026", W - 140, 98);
  ctx.restore();

  // Main title
  ctx.textAlign = "center";
  ctx.font = `900 56px ${FAMILY}`;
  ctx.fillStyle = "#1f2937";
  ctx.letterSpacing = "4px";
  ctx.fillText("HACKER", W / 2 - 160, 82);
  
  // Hindi "गोवा" accent
  ctx.fillStyle = "#ff6b35";
  ctx.font = `700 36px ${FAMILY}`;
  ctx.fillText("गोवा", W / 2 + 10, 68);
  
  ctx.fillStyle = "#1f2937";
  ctx.font = `900 56px ${FAMILY}`;
  ctx.fillText("HOUSE", W / 2 + 160, 82);
  ctx.letterSpacing = "0px";

  ctx.font = `700 24px ${FAMILY}`;
  ctx.fillStyle = "#ff6b35";
  ctx.letterSpacing = "8px";
  ctx.fillText("BUILD · SHIP · REPEAT", W / 2, 130);
  ctx.letterSpacing = "0px";

  // ---- PHOTO SECTION ----
  const PHOTO_SIZE = 550;
  const photoX = (W - PHOTO_SIZE) / 2;
  const photoY = headerH + 70;

  // Photo frame with solid border and shadow
  ctx.save();
  // Shadow for depth
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  
  // White background for photo
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(photoX + PHOTO_SIZE / 2, photoY + PHOTO_SIZE / 2, PHOTO_SIZE / 2 + 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  ctx.save();
  // Circular photo clip
  ctx.beginPath();
  ctx.arc(photoX + PHOTO_SIZE / 2, photoY + PHOTO_SIZE / 2, PHOTO_SIZE / 2, 0, Math.PI * 2);
  ctx.clip();
  
  // Draw photo with user adjustments
  const centerX = photoX + PHOTO_SIZE / 2;
  const centerY = photoY + PHOTO_SIZE / 2;
  const radius = PHOTO_SIZE / 2;
  
  // Calculate cover dimensions with zoom
  const imgAspect = img.width / img.height;
  let drawW, drawH;
  
  if (imgAspect > 1) {
    // Landscape - use height
    drawH = radius * 2 * zoom;
    drawW = drawH * imgAspect;
  } else {
    // Portrait - use width  
    drawW = radius * 2 * zoom;
    drawH = drawW / imgAspect;
  }
  
  // Apply user offsets
  const offsetX = centerX - drawW / 2 + userOffsetX;
  const offsetY = centerY - drawH / 2 + userOffsetY;
  
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  ctx.restore();

  // Colorful border around photo with gradient
  const photoGrad = ctx.createLinearGradient(photoX, photoY, photoX + PHOTO_SIZE, photoY + PHOTO_SIZE);
  photoGrad.addColorStop(0, "#ff6b35");
  photoGrad.addColorStop(0.5, "#ffd700");
  photoGrad.addColorStop(1, "#14b8a6");
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoX + PHOTO_SIZE / 2, photoY + PHOTO_SIZE / 2, PHOTO_SIZE / 2 + 18, 0, Math.PI * 2);
  ctx.lineWidth = 14;
  ctx.strokeStyle = photoGrad;
  ctx.stroke();
  ctx.restore();

  // ---- NAME SECTION ----
  let ty = photoY + PHOTO_SIZE + 80;

  // Name background card
  const nameCardY = ty - 50;
  const nameCardH = 260;
  
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.1)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  rrect(ctx, 80, nameCardY, W - 160, nameCardH, 20);
  ctx.fill();
  ctx.restore();

  // Decorative line at top of name card
  ctx.fillStyle = photoGrad;
  ctx.fillRect(100, nameCardY + 10, W - 200, 6);

  // Name
  ctx.textAlign = "center";
  ctx.fillStyle = "#1f2937";
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  fitText(ctx, name, W - 200, 72, 42, "900", FAMILY);
  ctx.fillText(name, W / 2, ty + 20);

  // Role badge
  ctx.save();
  const roleGrad = ctx.createLinearGradient(0, ty + 50, W, ty + 50);
  roleGrad.addColorStop(0, "#ff6b35");
  roleGrad.addColorStop(1, "#f7931e");
  ctx.fillStyle = roleGrad;
  ctx.beginPath();
  rrect(ctx, 200, ty + 55, W - 400, 52, 26);
  ctx.fill();
  
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 26px ${FAMILY}`;
  fitText(ctx, stack, W - 440, 26, 18, "800", FAMILY);
  ctx.fillText(stack, W / 2, ty + 88);
  ctx.restore();

  // Title
  ctx.fillStyle = "#6b7280";
  ctx.font = `italic 600 24px ${FAMILY}`;
  ctx.fillText(title, W / 2, ty + 150);

  // ---- INFO GRID ----
  ty = nameCardY + nameCardH + 60;
  
  const infoBoxes = [
    { 
      icon: (c: Ctx2D, x: number, y: number) => iconStar(c, x, y, 18, "#fbbf24"),
      label: "BUILDER CLASS",
      value: "TERMINAL\nWIZARD",
      color: "#10b981"
    },
    { 
      icon: (c: Ctx2D, x: number, y: number) => iconTicket(c, x, y, 40, "#ff6b35"),
      label: "BEACH BAG",
      value: "COCONUT\nVS CODE",
      color: "#3b82f6"
    },
    { 
      icon: (c: Ctx2D, x: number, y: number) => iconPin(c, x, y, 42, "#14b8a6"),
      label: "CURRENTLY SHIPPING",
      value: "BUILDING\nTHE FUTURE",
      color: "#8b5cf6"
    }
  ];

  const boxW = 300;
  const boxH = 210;
  const boxGap = 60;
  const totalBoxW = (boxW * 3) + (boxGap * 2);
  const startX = (W - totalBoxW) / 2;

  infoBoxes.forEach((box, i) => {
    const bx = startX + i * (boxW + boxGap);
    
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    rrect(ctx, bx, ty, boxW, boxH, 20);
    ctx.fill();
    ctx.restore();
    
    // Icon
    box.icon(ctx, bx + boxW / 2, ty + 55);
    
    // Label
    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.font = `700 15px ${FAMILY}`;
    ctx.letterSpacing = "2px";
    ctx.fillText(box.label, bx + boxW / 2, ty + 110);
    ctx.letterSpacing = "0px";
    
    // Value
    ctx.fillStyle = box.color;
    ctx.font = `900 26px ${FAMILY}`;
    const lines = box.value.split("\n");
    lines.forEach((line, li) => {
      ctx.fillText(line, bx + boxW / 2, ty + 148 + li * 32);
    });
  });

  // ---- FOOTER ----
  ty = ty + boxH + 50;
  
  ctx.textAlign = "center";
  ctx.fillStyle = "#0d5e4a";
  ctx.font = `900 24px ${FAMILY}`;
  ctx.letterSpacing = "4px";
  ctx.fillText("#FRAMEINGOA", W / 2, ty + 30);
  ctx.letterSpacing = "0px";

  // Date badge at bottom
  ctx.save();
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  rrect(ctx, W / 2 - 200, ty + 60, 400, 60, 30);
  ctx.fill();
  
  ctx.textAlign = "center";
  ctx.fillStyle = "#fbbf24";
  ctx.font = `700 15px ${FAMILY}`;
  ctx.fillText("OCT", W / 2 - 60, ty + 87);
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 32px ${FAMILY}`;
  ctx.fillText("28-31", W / 2 + 30, ty + 95);
  ctx.fillStyle = "#14b8a6";
  ctx.font = `700 15px ${FAMILY}`;
  ctx.fillText("2026", W / 2 + 120, ty + 87);
  ctx.restore();

  // Bottom decorative line
  ctx.fillStyle = borderGrad;
  ctx.fillRect(24, H - 8, W - 48, 8);
}
