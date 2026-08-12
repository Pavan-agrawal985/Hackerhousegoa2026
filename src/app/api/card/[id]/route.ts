import { NextRequest, NextResponse } from "next/server";
import { loadCard } from "@/lib/cardStore";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Basic id shape guard (uuid v4)
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const png = await loadCard(id);
  if (!png) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
