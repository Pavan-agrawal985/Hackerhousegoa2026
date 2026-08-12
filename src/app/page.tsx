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
    <main className="relative flex h-screen w-full overflow-hidden bg-gradient-to-br from-goa-sunset1/5 via-transparent to-goa-teal/5">
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute -top-24 right-[20%] h-96 w-96 rounded-full bg-goa-sunset1/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[10%] h-96 w-96 rounded-full bg-goa-teal/10 blur-3xl" />

      {/* Left Column - Form Fields */}
      <div className="relative z-10 flex w-80 flex-col gap-6 overflow-y-auto border-r border-white/10 bg-black/10 p-6 backdrop-blur-sm">
        {/* Header */}
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-goa-sunset1 to-goa-sunset2 px-4 py-1.5 shadow-lg shadow-orange-900/30 w-fit">
            <Logo className="h-4 w-4" />
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-white">
              HH GOA 2026
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-goa-sand via-goa-sunset2 to-goa-teal">
            Builder Card
          </h1>
        </header>

        {/* Upload */}
        <div className="w-full">
          <UploadZone previewSrc={previewSrc} onFile={handleFile} busy={busy} />
          {error && <p className="mt-2 text-xs text-goa-coral">{error}</p>}
        </div>

        {/* Fields */}
        <div className="w-full">
          <FieldsForm fields={fields} onChange={setFields} />
        </div>

        {/* Footer */}
        <footer className="mt-auto flex flex-col gap-1 text-[10px] text-goa-sand/30">
          <span>#FrameInGoa</span>
          <span>Oct 28-31, 2026</span>
        </footer>
      </div>

      {/* Middle Column - Card Preview */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto p-8">
        <div className="flex h-full w-full items-center justify-center">
          <CardPreview image={image} fields={fields} uploadFile={uploadFile} showControlsInSidebar={true} />
        </div>
      </div>

      {/* Right Column - Controls */}
      <div className="relative z-10 flex w-80 flex-col gap-6 overflow-y-auto border-l border-white/10 bg-black/10 p-6 backdrop-blur-sm">
        {image ? (
          <>
            <h2 className="text-lg font-bold text-white">Adjust & Share</h2>
            
            {/* This will be filled by CardPreview component */}
            <div id="controls-sidebar"></div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-4xl opacity-30 mb-4">🎴</div>
              <p className="text-sm text-goa-sand/40">
                Upload a photo to start
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
