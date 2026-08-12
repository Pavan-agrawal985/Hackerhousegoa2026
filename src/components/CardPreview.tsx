"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CARD_H, CARD_W, drawIdCard, type CardFields, type Ctx2D, type PhotoAdjustments } from "@/lib/drawCard";

interface Props {
  image: HTMLImageElement | null;
  fields: CardFields;
  uploadFile: File | null;
  showControlsInSidebar?: boolean;
}

type ShareState = "idle" | "preparing" | "ready" | "error";

export function CardPreview({ image, fields, uploadFile, showControlsInSidebar = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [shareError, setShareError] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>({
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
  });
  const [sidebarTarget, setSidebarTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (showControlsInSidebar) {
      // Keep checking until we find the target element
      const findTarget = () => {
        const target = document.getElementById("controls-sidebar");
        if (target) {
          setSidebarTarget(target);
        } else {
          // If not found, try again on next frame
          requestAnimationFrame(findTarget);
        }
      };
      findTarget();
    } else {
      setSidebarTarget(null);
    }
  }, [showControlsInSidebar]);

  // Instant client-side render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawIdCard(ctx as unknown as Ctx2D, image, fields, adjustments);
  }, [image, fields, adjustments]);

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

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    const safeName = (fields.name || "builder").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `hh-goa-2026-${safeName}-card.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas || !uploadFile) return;
    
    setShareState("preparing");
    setShareError(null);
    
    try {
      // Convert canvas to blob for native share
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to create image"));
        }, "image/png");
      });
      
      // Try native Web Share API ONLY on mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile && navigator.share && navigator.canShare) {
        const file = new File([blob], "hh-goa-2026-card.png", { type: "image/png" });
        const shareData = {
          title: "HH Goa 2026 Builder Card",
          text: `Just created my HH Goa 2026 Builder Card! 🌴🌊

See you at the beach!

#FrameInGoa #HackerHouse #HHGoa2026

📍 Goa, India | Oct 28-31, 2026

Create yours: ${window.location.origin}`,
          files: [file]
        };
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setShareState("ready");
          return;
        }
      }
      
      // Desktop: Download the card and open X with generator link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (fields.name || "builder").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      a.download = `hh-goa-2026-${safeName}-card.png`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
      
      // Create tweet text with only generator link
      const tweetText = `Just created my HH Goa 2026 Builder Card! 🌴🌊

Create yours: https://hackerhousegoa2026-six.vercel.app/

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

  const controls = (
    <div className="flex flex-col gap-6">
      {/* Photo adjustment controls */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white">Adjust Photo</h3>
        
        {/* Zoom slider */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs text-goa-sand/70">
            <span>🔍 Zoom</span>
            <span className="text-white">{adjustments.zoom.toFixed(1)}x</span>
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
            <span className="text-white">{adjustments.offsetX}</span>
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
            <span className="text-white">{adjustments.offsetY}</span>
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

        <button
          onClick={() => setAdjustments({ zoom: 1.0, offsetX: 0, offsetY: 0 })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          Reset to Default
        </button>
      </div>

      <div className="h-px bg-white/10"></div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleDownload}
          className="w-full rounded-xl bg-gradient-to-r from-goa-sunset1 to-goa-sunset2 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/30 transition hover:shadow-xl active:scale-95"
        >
          ⬇ Download Card
        </button>
        <button
          onClick={handleShare}
          disabled={shareState === "preparing"}
          className="w-full rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10 active:scale-95 disabled:opacity-60"
        >
          {shareState === "preparing" ? "Preparing…" : "𝕏 Post to X"}
        </button>
      </div>

      {shareState === "error" && (
        <p className="text-center text-xs text-goa-coral">{shareError}</p>
      )}
      {shareState === "ready" && (
        <p className="text-center text-xs text-goa-teal">✓ Card downloaded! Draft is ready to post.</p>
      )}
    </div>
  );

  return (
    <>
      {/* Card Preview - Only the canvas */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10">
        <canvas 
          ref={canvasRef} 
          className="block h-auto max-h-[95vh] w-auto max-w-full"
          style={{ aspectRatio: `${CARD_W}/${CARD_H}` }}
        />
      </div>

      {/* Controls - Only render via portal when sidebar mode is active */}
      {showControlsInSidebar && sidebarTarget && createPortal(controls, sidebarTarget)}
      
      {/* Controls - Inline when not in sidebar mode */}
      {!showControlsInSidebar && (
        <div className="mt-6 w-full max-w-md">{controls}</div>
      )}
    </>
  );
}
