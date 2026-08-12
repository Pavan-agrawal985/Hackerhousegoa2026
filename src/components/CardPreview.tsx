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
      
      // Create tweet text
      const tweetText = `Just got my HH Goa 2026 Builder Card 🌴🌊 See you on the beach! #FrameInGoa #HackerHouse #HHGoa2026`;
      
      // Try native share API first (works on mobile)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "hh-goa-card.png", { type: "image/png" });
        const shareData = { text: tweetText, files: [file] };
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setShareState("ready");
          return;
        }
      }
      
      // Fallback: Open X/Twitter with text only
      const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(tweetIntent, "_blank", "noopener,noreferrer");
      setShareState("ready");
      
      // Download image automatically so user can attach it manually
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (fields.name || "builder").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      a.download = `hh-goa-2026-${safeName}-card.png`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setShareState("error");
      setShareError(err instanceof Error ? err.message : "Couldn't prepare the share.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl shadow-black/60 ring-1 ring-white/10">
        <canvas ref={canvasRef} className="block w-full" />
      </div>

      {/* Photo adjustment controls */}
      {image && (
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <h3 className="text-sm font-bold text-white">Adjust Photo</h3>
          
          {/* Zoom slider */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs text-goa-sand/70">
              <span>🔍 Zoom</span>
              <span>{adjustments.zoom.toFixed(1)}x</span>
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
          </div>

          {/* Horizontal position */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs text-goa-sand/70">
              <span>↔️ Horizontal</span>
              <span>{adjustments.offsetX}</span>
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
          </div>

          {/* Vertical position */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs text-goa-sand/70">
              <span>↕️ Vertical</span>
              <span>{adjustments.offsetY}</span>
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
          </div>

          {/* Reset button */}
          <button
            onClick={() => setAdjustments({ zoom: 1.0, offsetX: 0, offsetY: 0 })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Reset to Default
          </button>
        </div>
      )}

      <div className="flex w-full max-w-sm flex-wrap items-center justify-center gap-3">
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
          {shareState === "preparing" ? "Preparing…" : "𝕏 Share to X"}
        </button>
      </div>

      {shareState === "error" && (
        <p className="text-xs text-goa-coral">{shareError}</p>
      )}
      {shareState === "ready" && (
        <p className="text-xs text-goa-teal">X opened with your message. Image downloaded - attach it to your post! ✓</p>
      )}
    </div>
  );
}
