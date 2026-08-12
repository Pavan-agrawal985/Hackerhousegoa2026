"use client";

import { useEffect, useRef, useState } from "react";
import { CARD_H, CARD_W, drawIdCard, type CardFields, type Ctx2D, type PhotoAdjustments } from "@/lib/drawCard";

interface Props {
  image: HTMLImageElement | null;
  fields: CardFields;
  uploadFile: File | null;
}

type ShareState = "idle" | "preparing" | "ready" | "error";

export function CardPreview({ image, fields, uploadFile }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [shareError, setShareError] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>({
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
  });

  // Instant client-side render — this is what makes it feel "a few seconds,
  // not a loading screen": no network round trip needed just to preview.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawIdCard(ctx as unknown as Ctx2D, image, fields, adjustments);
  }, [image, fields, adjustments]);

  if (!image) return null;

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    const safeName = (fields.name || "builder").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `hh-goa-2026-${safeName || "builder"}-card.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setShareState("preparing");
    setShareError(null);
    
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to create image"));
        }, "image/png");
      });
      
      // Download image automatically
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (fields.name || "builder").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      a.download = `hh-goa-2026-${safeName}-card.png`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
      
      // Create tweet text with card downloaded message
      const tweetText = `Just created my HH Goa 2026 Builder Card! 🌴🌊

See you at the beach! 

#FrameInGoa #HackerHouse #HHGoa2026

📍 Goa, India | Oct 28-31, 2026`;
      
      // Open X/Twitter with pre-filled text
      const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(tweetIntent, "_blank", "noopener,noreferrer");
      
      setShareState("ready");
    } catch (err) {
      setShareState("error");
      setShareError(err instanceof Error ? err.message : "Couldn't prepare the share.");
    }
  }

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center backdrop-blur">
        <div className="text-4xl opacity-50">🎴</div>
        <p className="text-sm text-goa-sand/40">
          Upload a photo to see your card preview
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full max-w-2xl flex-col items-center gap-6">
      {/* Card Preview - scaled to fit */}
      <div className="w-full max-w-md overflow-hidden rounded-3xl shadow-2xl shadow-black/60 ring-1 ring-white/10">
        <canvas ref={canvasRef} className="block w-full" />
      </div>

      {/* Photo adjustment controls - compact */}
      <div className="w-full max-w-md space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <h3 className="text-xs font-bold text-white">Adjust Photo</h3>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Zoom slider */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-[10px] text-goa-sand/70">
              <span>🔍 Zoom</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={adjustments.zoom}
              onChange={(e) => setAdjustments(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
              className="w-full accent-goa-sunset1"
            />
            <span className="text-[10px] text-goa-sand/50">{adjustments.zoom.toFixed(1)}x</span>
          </div>

          {/* Horizontal position */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-[10px] text-goa-sand/70">
              <span>↔️ Horiz</span>
            </label>
            <input
              type="range"
              min="-150"
              max="150"
              step="5"
              value={adjustments.offsetX}
              onChange={(e) => setAdjustments(prev => ({ ...prev, offsetX: parseInt(e.target.value) }))}
              className="w-full accent-goa-teal"
            />
            <span className="text-[10px] text-goa-sand/50">{adjustments.offsetX}</span>
          </div>

          {/* Vertical position */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-[10px] text-goa-sand/70">
              <span>↕️ Vert</span>
            </label>
            <input
              type="range"
              min="-150"
              max="150"
              step="5"
              value={adjustments.offsetY}
              onChange={(e) => setAdjustments(prev => ({ ...prev, offsetY: parseInt(e.target.value) }))}
              className="w-full accent-goa-teal"
            />
            <span className="text-[10px] text-goa-sand/50">{adjustments.offsetY}</span>
          </div>
        </div>

        <button
          onClick={() => setAdjustments({ zoom: 1.0, offsetX: 0, offsetY: 0 })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          Reset
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex w-full max-w-md gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 rounded-full bg-gradient-to-r from-goa-sunset1 to-goa-sunset2 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/30 transition active:scale-95"
        >
          ⬇ Download
        </button>
        <button
          onClick={handleShare}
          disabled={shareState === "preparing"}
          className="flex-1 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10 active:scale-95 disabled:opacity-60"
        >
          {shareState === "preparing" ? "Preparing…" : "𝕏 Post to X"}
        </button>
      </div>

      {shareState === "error" && (
        <p className="text-center text-xs text-goa-coral">{shareError}</p>
      )}
      {shareState === "ready" && (
        <p className="text-center text-xs text-goa-teal">✓ Image downloaded! X opened - just attach your card and post!</p>
      )}
    </div>
  );
}
