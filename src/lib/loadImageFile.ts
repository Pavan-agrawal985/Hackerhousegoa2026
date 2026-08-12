"use client";

const HEIC_TYPES = ["image/heic", "image/heif"];

function looksLikeHeic(file: File): boolean {
  if (HEIC_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

/**
 * Converts (if needed) and loads an uploaded photo into an <img> element,
 * ready to be drawn into a <canvas>. Handles iPhone HEIC/HEIF by
 * transcoding to JPEG in-browser first (browsers can't decode HEIC
 * natively), and returns a ready-to-upload File alongside the image so the
 * same normalized photo can be sent to the backend for the share render.
 */
export async function loadImageFile(
  file: File
): Promise<{ image: HTMLImageElement; uploadFile: File }> {
  let workingFile = file;

  if (looksLikeHeic(file)) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    workingFile = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      { type: "image/jpeg" }
    );
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(workingFile);
  });

  return { image, uploadFile: workingFile };
}
