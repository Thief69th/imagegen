"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Can I upload multiple images at once?",
    a: "Yes! Most tools on imagegen.online support bulk upload. Simply select multiple files using Ctrl+Click (Windows) or Cmd+Click (Mac), or drag a selection of images directly into the upload area. The Multi Image Compressor supports batches of 100+ images.",
  },
  {
    q: "What image formats are supported?",
    a: "We support all major image formats including JPG/JPEG, PNG, WEBP, GIF, TIFF, HEIC (iPhone), BMP, and SVG. Conversion tools let you switch between formats. If your format isn't listed, contact us and we'll prioritise adding it.",
  },
  {
    q: "What is the maximum image upload size?",
    a: "For browser-based processing, there's no hard server limit — it depends on your device's memory. Most modern devices handle images up to 20MB per file. For server-side tools (where available), we support files up to 50MB.",
  },
  {
    q: "Are my images stored on your servers?",
    a: "No. For browser-based tools, all processing happens entirely in your browser using the Canvas API and WebAssembly — your images never leave your device. For any server-side processing, images are deleted immediately after the task completes. We have a strict zero-retention policy.",
  },
  {
    q: "Do I need to create an account?",
    a: "No account is required. All 50+ tools are completely free to use without any sign-up. Just visit imagegen.online, select your tool, and start processing your images immediately.",
  },
  {
    q: "Does imagegen.online work on mobile?",
    a: "Yes, completely. imagegen.online is built mobile-first with a fully responsive layout. All tools work on iOS Safari, Chrome for Android, and any modern mobile browser. Touch-based drag-and-drop is also supported.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full max-w-screen-xl mx-auto px-4 py-16 border-t-2 border-black">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-1">FAQ</p>
        <h2
          className="font-mono font-bold text-2xl md:text-3xl tracking-tight"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Frequently Asked Questions
        </h2>
      </div>

      <div className="flex flex-col gap-0 border-2 border-black rounded-xl overflow-hidden">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`border-b-2 border-black last:border-b-0`}>
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-black/[0.03] transition-colors"
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span
                  className="font-mono font-bold text-sm tracking-tight"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {faq.q}
                </span>
                <span
                  className={`flex-shrink-0 w-7 h-7 border-2 border-black flex items-center justify-center font-mono text-sm transition-transform ${isOpen ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-6 pb-5 text-sm leading-relaxed text-black/60">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
