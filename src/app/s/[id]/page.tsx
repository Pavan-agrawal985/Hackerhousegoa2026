import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { loadCard } from "@/lib/cardStore";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

async function getOrigin() {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const origin = await getOrigin();
  const imageUrl = `${origin}/api/card/${id}`;
  const title = "I just built my HH Goa 2026 Builder ID 🌴";
  const description =
    "Generated with the HH Goa 2026 Builder ID Card tool. #FrameInGoa #HackerHouse #HHGoa2026";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1080, height: 1620 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const png = await loadCard(id);
  if (!png) notFound();

  const origin = await getOrigin();
  const imageUrl = `${origin}/api/card/${id}`;
  const tweetText = encodeURIComponent(
    "Just got my HH Goa 2026 Builder Card 🌴🌊 See you on the beach! #FrameInGoa #HackerHouse #HHGoa2026"
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(
    `${origin}/s/${id}`
  )}`;

  return (
    <main className="min-h-screen bg-goa-deep flex flex-col items-center justify-center gap-6 p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="HH Goa 2026 Builder ID Card"
        className="w-full max-w-sm rounded-3xl shadow-2xl shadow-black/60 ring-1 ring-white/10"
      />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white px-6 py-3 text-sm font-bold text-goa-deep transition hover:bg-goa-sand"
        >
          𝕏 Share to X
        </a>
        <a
          href={imageUrl}
          download="hh-goa-2026-builder-card.png"
          className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
        >
          ⬇ Download
        </a>
        <Link
          href="/"
          className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
        >
          Make your own →
        </Link>
      </div>
    </main>
  );
}
