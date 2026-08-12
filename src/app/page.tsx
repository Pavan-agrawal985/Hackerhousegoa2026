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

      {/* Left Panel - Controls */}
      <div className="relative z-10 flex w-full max-w-lg flex-col gap-6 overflow-y-auto p-8 lg:p-12">
        {/* Header */}
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-goa-sunset1 to-goa-sunset2 px-4 py-1.5 shadow-lg shadow-orange-900/30 w-fit">
            <Logo className="h-5 w-5" />
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-white">
              HH GOA 2026
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-goa-sand via-goa-sunset2 to-goa-teal">
            Builder ID Card
          </h1>
          <p className="text-sm text-goa-sand/60">
            Create your personalized card in seconds
          </p>
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
        <footer className="mt-auto flex flex-col gap-1 text-[11px] text-goa-sand/30">
          <span>#FrameInGoa · #HackerHouse · #HHGoa2026</span>
          <span>28–31 Oct 2026 · Goa, India</span>
        </footer>
      </div>

      {/* Right Panel - Card Preview */}
      <div className="relative z-10 hidden flex-1 items-center justify-center overflow-y-auto bg-gradient-to-br from-black/20 to-black/5 p-8 backdrop-blur-sm lg:flex">
        <div className="flex h-full w-full items-center justify-center">
          <CardPreview image={image} fields={fields} uploadFile={uploadFile} />
        </div>
      </div>

      {/* Mobile: Show preview below on small screens */}
      <div className="relative z-10 flex w-full items-center justify-center p-8 lg:hidden">
        <CardPreview image={image} fields={fields} uploadFile={uploadFile} />
      </div>
    </main>
  );
}
