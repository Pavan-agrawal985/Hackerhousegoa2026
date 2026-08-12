"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { UploadZone } from "@/components/UploadZone";
import { FieldsForm } from "@/components/FieldsForm";
import { CardPreview } from "@/components/CardPreview";
import { loadImageFile } from "@/lib/loadImageFile";
import { randomBuilderTitle } from "@/lib/builderTitles";
import type { CardFields } from "@/lib/drawCard";

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<CardFields>({
    name: "",
    stack: "",
    title: randomBuilderTitle(),
  });

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const { image: img, uploadFile: normalized } = await loadImageFile(file);
      setImage(img);
      setUploadFile(normalized);
      setPreviewSrc(img.src);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load that photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 right-[20%] h-96 w-96 rounded-full bg-goa-sunset1/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[10%] h-96 w-96 rounded-full bg-goa-teal/10 blur-3xl" />
      </div>

      {/* Left Column - Form Fields (Fixed Width) */}
      <aside className="relative z-10 flex w-[320px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-white/10 bg-black/20 p-6 backdrop-blur-sm">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-goa-sunset1 to-goa-sunset2 px-3 py-1 shadow-lg w-fit">
            <Logo className="h-4 w-4" />
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-white">
              HH GOA 2026
            </span>
          </div>
          <h1 className="text-xl font-bold leading-tight text-white">
            Builder Card
          </h1>
          <p className="text-xs text-goa-sand/60">Create your personalized ID</p>
        </header>

        {/* Upload */}
        <div className="w-full">
          <UploadZone previewSrc={previewSrc} onFile={handleFile} busy={busy} />
          {error && <p className="mt-2 text-xs text-goa-coral">{error}</p>}
        </div>

        {/* Fields */}
        <div className="w-full flex-1">
          <FieldsForm fields={fields} onChange={setFields} />
        </div>

        {/* Footer */}
        <footer className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3 text-[10px] text-goa-sand/30">
          <span>#FrameInGoa</span>
          <span>Oct 28-31, 2026 · Goa</span>
        </footer>
      </aside>

      {/* Middle Column - Card Preview ONLY */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden bg-black/5 p-6">
        <CardPreview image={image} fields={fields} uploadFile={uploadFile} showControlsInSidebar={true} />
      </div>

      {/* Right Column - Controls ONLY (sliders and buttons) */}
      <aside className="relative z-10 flex w-[320px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-l border-white/10 bg-black/20 p-6 backdrop-blur-sm">
        {image ? (
          <>
            <h2 className="text-base font-bold text-white">Adjust & Share</h2>
            
            {/* Controls will be injected here via React Portal from CardPreview */}
            <div id="controls-sidebar" className="flex flex-1 flex-col gap-4">
              {/* Controls are injected here via React Portal */}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-3 text-4xl opacity-30">🎴</div>
              <p className="text-xs text-goa-sand/40">
                Upload a photo to start
              </p>
            </div>
          </div>
        )}
      </aside>
    </main>
  );
}
