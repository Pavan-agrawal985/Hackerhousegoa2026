"use client";

import { useEffect, useRef, useState } from "react";
import { CARD_H, CARD_W, drawIdCard, type CardFields, type Ctx2D } from "@/lib/drawCard";

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

  // Instant client-side render — this is what makes it feel "a few seconds,
  // not a loading screen": no network round trip needed just to preview.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawIdCard(ctx as unknown as Ctx2D, image, fields);
  }, [image, fields]);

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
    if (!uploadFile) return;
    setShareState("preparing");
    setShareError(null);
    try {
      const form = new FormData();
      form.append("photo", uploadFile);
      form.append("name", fields.name);
      form.append("stack", fields.stack);
      form.append("title", fields.title);

      const res = await fetch("/api/card", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      const shareUrl = `${window.location.origin}/s/${data.id}`;
      const tweetText = encodeURIComponent(
        "Just got my HH Goa 2026 Builder Card 🌴🌊 See you on the beach! #FrameInGoa #HackerHouse #HHGoa2026"
      );
      const tweetIntent = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(
        shareUrl
      )}`;
      setShareState("ready");
      window.open(tweetIntent, "_blank", "noopener,noreferrer");
    } catch (err) {
      setShareState("error");
      setShareError(err instanceof Error ? err.message : "Couldn't prepare the share link.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl shadow-black/60 ring-1 ring-white/10">
        <canvas ref={canvasRef} className="block w-full" />
      </div>

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
        <p className="text-xs text-goa-teal">Share link opened in a new tab ✓</p>
      )}
    </div>
  );
}
