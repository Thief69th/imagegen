import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "imagegen.online — Free Image Tools from OJU",
  description:
    "50+ free online image tools — compress, resize, convert, crop, watermark, and more. Fast, secure, no sign-up required.",
  keywords:
    "image compressor, image resizer, image converter, jpg to png, png to webp, bulk image resize, online image tools",
  openGraph: {
    title: "imagegen.online — Free Image Tools from OJU",
    description: "50+ free online image tools. No sign-up. No storage.",
    url: "https://imagegen.online",
    siteName: "imagegen.online",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "imagegen.online — Free Image Tools",
    description: "50+ free online image tools from OJU.",
  },
  metadataBase: new URL("https://imagegen.online"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
