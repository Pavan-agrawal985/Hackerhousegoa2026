"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  previewSrc: string | null;
  onFile: (file: File) => void;
  busy?: boolean;
}

export function UploadZone({ previewSrc, onFile, busy }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={`group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed transition
        ${dragOver ? "border-goa-teal bg-goa-teal/10" : "border-goa-teal/40 bg-goa-ocean/10 hover:border-goa-teal/70 hover:bg-goa-teal/5"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previewSrc ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="Uploaded photo preview"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="relative z-10 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur">
            Tap to change photo
          </div>
        </>
      ) : (
        <>
          <div className="animate-float-slow text-4xl">🏖️</div>
          <span className="text-sm font-semibold text-goa-sand">
            {busy ? "Working on it…" : "Tap or drop your photo here"}
          </span>
          <small className="text-xs text-goa-sand/50">
            JPG, PNG, HEIC (iPhone) — any shape works
          </small>
        </>
      )}
    </div>
  );
}
