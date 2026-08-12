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
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pb-24 pt-10 sm:pt-14">
      {/* decorative ambient glows */}
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-goa-sunset1/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-[-10%] h-72 w-72 rounded-full bg-goa-teal/15 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">
        {/* Header */}
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-goa-sunset1 to-goa-sunset2 px-4 py-1.5 shadow-lg shadow-orange-900/30">
            <Logo className="h-5 w-5" />
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-white">
              HH GOA 2026
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-goa-sand via-goa-sunset2 to-goa-teal">
            Builder ID Card
          </h1>
          <p className="text-sm text-goa-sand/60">
            Upload your photo, fill your details, download and share — one pass, no login.
          </p>
        </header>

        {/* Upload */}
        <div className="w-full">
          <UploadZone previewSrc={previewSrc} onFile={handleFile} busy={busy} />
          {error && <p className="mt-2 text-center text-xs text-goa-coral">{error}</p>}
        </div>

        {/* Fields */}
        <div className="w-full">
          <FieldsForm fields={fields} onChange={setFields} />
        </div>

        {/* Preview + actions */}
        <CardPreview image={image} fields={fields} uploadFile={uploadFile} />

        {!image && (
          <p className="text-center text-xs text-goa-sand/40">
            Your card appears instantly here the moment you upload a photo.
          </p>
        )}

        <footer className="mt-6 flex flex-col items-center gap-1 text-center text-[11px] text-goa-sand/30">
          <span>#FrameInGoa · #HackerHouse · #HHGoa2026</span>
          <span>28–31 Oct 2026 · Goa, India</span>
        </footer>
      </div>
    </main>
  );
}
