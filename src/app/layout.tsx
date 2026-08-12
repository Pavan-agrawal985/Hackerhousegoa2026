import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "HH Goa 2026 — Builder ID Card Generator",
  description:
    "Upload your photo, get an instant branded HH Goa 2026 Builder ID card. Download it or share straight to X. #FrameInGoa",
  openGraph: {
    title: "HH Goa 2026 — Builder ID Card Generator",
    description:
      "Upload your photo, get an instant branded HH Goa 2026 Builder ID card. Download it or share straight to X.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 — Builder ID Card Generator",
    description:
      "Upload your photo, get an instant branded HH Goa 2026 Builder ID card. Download it or share straight to X.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
