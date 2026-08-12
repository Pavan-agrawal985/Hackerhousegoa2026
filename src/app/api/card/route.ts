import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { CARD_H, CARD_W, drawIdCard, type Ctx2D } from "@/lib/drawCard";
import { saveCard } from "@/lib/cardStore";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12MB safety cap

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const photo = form.get("photo");
    const name = String(form.get("name") ?? "");
    const stack = String(form.get("stack") ?? "");
    const title = String(form.get("title") ?? "");

    if (!(photo instanceof File)) {
      return NextResponse.json({ error: "Missing photo file." }, { status: 400 });
    }
    if (photo.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Photo too large." }, { status: 413 });
    }

    const arrayBuf = await photo.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuf);

    const img = await loadImage(inputBuffer);

    const canvas = createCanvas(CARD_W, CARD_H);
    const ctx = canvas.getContext("2d");

    drawIdCard(ctx as unknown as Ctx2D, img, { name, stack, title });

    const pngBuffer = canvas.toBuffer("image/png");
    const id = randomUUID();
    await saveCard(id, pngBuffer);

    return NextResponse.json({ id, url: `/api/card/${id}` });
  } catch (err) {
    console.error("Card render failed:", err);
    return NextResponse.json(
      { error: "Couldn't generate the card. Try a different photo." },
      { status: 500 }
    );
  }
}
