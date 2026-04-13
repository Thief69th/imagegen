import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://imagegen.online";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "imagegen.online — Free Image Tools Online | Compress, Resize, Convert",
    template: "%s | imagegen.online",
  },
  description:
    "Free online image tools — compress images, resize photos, convert JPG PNG WEBP, crop, watermark, remove background, and more. 50+ tools. No sign-up. No data stored.",
  keywords: [
    "image compressor online free",
    "resize image online",
    "convert image online",
    "jpg to png converter",
    "png to jpg",
    "jpg to webp",
    "crop image online",
    "compress image online",
    "image resizer",
    "remove background online free",
    "online image editor free",
    "bulk image compressor",
    "reduce image size",
    "image converter online free",
    "watermark image online",
    "heic to jpg converter",
    "webp to jpg",
    "collage maker online free",
    "split image online",
    "merge images online",
  ],
  authors: [{ name: "OJU", url: BASE_URL }],
  creator: "OJU",
  publisher: "imagegen.online",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "imagegen.online",
    title: "imagegen.online — 50+ Free Online Image Tools",
    description:
      "Compress, resize, convert, crop, watermark images and more — all free, no sign-up, nothing stored. 50+ tools running in your browser.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "imagegen.online — Free Online Image Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@imagegenonline",
    creator: "@ojuexam",
    title: "imagegen.online — 50+ Free Online Image Tools",
    description:
      "Compress, resize, convert, crop, watermark images — all free. No sign-up. Nothing stored.",
    images: [`${BASE_URL}/og-image.png`],
  },
  category: "technology",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "imagegen.online",
      description: "Free online image tools — compress, resize, convert, edit, and more.",
      publisher: {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "OJU",
        url: BASE_URL,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/#tools?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/#webpage`,
      url: BASE_URL,
      name: "Free Online Image Tools — Compress, Resize, Convert Images",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      about: { "@id": `${BASE_URL}/#organization` },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
        ],
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "imagegen.online Image Tools",
      applicationCategory: "PhotoAndVideoApp",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "50+ free online image processing tools including compressor, resizer, format converter, crop, watermark, and AI background removal.",
      url: BASE_URL,
      featureList: [
        "Image Compressor",
        "Bulk Image Compressor",
        "Image Resizer",
        "JPG to PNG Converter",
        "PNG to WEBP Converter",
        "AI Background Remover",
        "Photo Collage Maker",
        "Image Watermark Tool",
        "Image Crop Tool",
        "Image Rotate and Flip",
        "Grayscale Converter",
        "Image Border Generator",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Are all the image tools completely free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — all 50+ tools on imagegen.online are completely free to use with no sign-up, no subscription, and no watermarks on output files.",
          },
        },
        {
          "@type": "Question",
          name: "Are my images uploaded to a server?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. All image processing happens entirely in your browser using the Canvas API and WebAssembly. Your images never leave your device and nothing is stored on any server.",
          },
        },
        {
          "@type": "Question",
          name: "What image formats are supported?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "imagegen.online supports JPG/JPEG, PNG, WEBP, GIF, TIFF, HEIC, and BMP formats. Format conversion tools let you switch between any supported format.",
          },
        },
        {
          "@type": "Question",
          name: "Can I compress multiple images at once?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — the Bulk Image Compressor and Batch Image Resize tools allow you to upload and process dozens or hundreds of images simultaneously. Download all results as a ZIP file.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="canonical" href={BASE_URL} />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
