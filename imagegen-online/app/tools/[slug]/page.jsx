// app/tools/[slug]/page.jsx
// Har tool ka individual SEO page

import { toolsData, getToolBySlug, getRelatedTools } from "@/lib/tools-data";
import { notFound } from "next/navigation";
import Link from "next/link";

// ✅ SEO: Static paths generate karo build time pe
export async function generateStaticParams() {
  return toolsData.map((tool) => ({
    slug: tool.slug,
  }));
}

// ✅ SEO: Har page ka unique meta title + description
export async function generateMetadata({ params }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) return { title: "Tool Not Found" };

  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords.join(", "),
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: `https://imagegen.online/tools/${tool.slug}`,
      siteName: "imagegen.online",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
    alternates: {
      canonical: `https://imagegen.online/tools/${tool.slug}`,
    },
  };
}

// ✅ Tool Page Component
export default function ToolPage({ params }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const relatedTools = getRelatedTools(params.slug);

  // ✅ JSON-LD Structured Data (Google rich results ke liye)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.shortTitle,
    description: tool.description,
    url: `https://imagegen.online/tools/${tool.slug}`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="tool-page">
        {/* Breadcrumb — SEO ke liye important */}
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link href="/">Home</Link>
          <span> › </span>
          <Link href={`/#${tool.category.toLowerCase()}`}>{tool.category}</Link>
          <span> › </span>
          <span>{tool.shortTitle}</span>
        </nav>

        {/* Main Tool Section */}
        <section className="tool-hero">
          {/* ✅ H1 — Har page pe unique hona MUST hai */}
          <h1>{tool.title}</h1>
          <p className="tool-description">{tool.description}</p>

          {/* 
            ⚠️ IMPORTANT: Yahan apna actual tool component render karo
            Apne existing tool components ko yahan import aur use karo
            
            Example:
            import { CompressImageTool } from "@/components/tools/CompressImageTool";
            <CompressImageTool />
            
            Ya ek generic ToolRenderer bana sakte ho jo slug ke basis pe
            sahi component render kare
          */}
          <div id="tool-container" className="tool-container">
            {/* TODO: Apna existing tool UI yahan render karo */}
            <ToolRenderer slug={params.slug} />
          </div>
        </section>

        {/* How To Section — SEO + User Help */}
        {tool.howTo && tool.howTo.length > 0 && (
          <section className="how-to-section">
            <h2>How to Use {tool.shortTitle}</h2>
            <ol className="steps-list">
              {tool.howTo.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {/* FAQ Section — Google Featured Snippets ke liye */}
        {tool.faqs && tool.faqs.length > 0 && (
          <section className="faq-section">
            <h2>Frequently Asked Questions</h2>
            {/* FAQ JSON-LD */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: tool.faqs.map((faq) => ({
                    "@type": "Question",
                    name: faq.q,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: faq.a,
                    },
                  })),
                }),
              }}
            />
            <div className="faq-list">
              {tool.faqs.map((faq, i) => (
                <details key={i} className="faq-item">
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related Tools — Internal Linking (SEO ke liye bahut important) */}
        {relatedTools.length > 0 && (
          <section className="related-tools">
            <h2>Related Tools</h2>
            <div className="related-grid">
              {relatedTools.map((related) => (
                <Link
                  key={related.slug}
                  href={`/tools/${related.slug}`}
                  className="related-tool-card"
                >
                  <span className="related-category">{related.category}</span>
                  <h3>{related.shortTitle}</h3>
                  <p>{related.description.slice(0, 80)}...</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to all tools */}
        <div className="back-link">
          <Link href="/#tools">← All 82 Free Image Tools</Link>
        </div>
      </div>
    </>
  );
}

// ============================================
// ToolRenderer Component
// Slug ke basis pe sahi tool render karta hai
// ============================================
function ToolRenderer({ slug }) {
  // 
  // OPTION 1: Agar tumhare existing tools already separate components hain
  // toh yahan import karke use karo:
  //
  // const toolComponents = {
  //   "compress-image-online": CompressImageTool,
  //   "png-to-jpg-converter": PngToJpgTool,
  //   ... etc
  // };
  // const Component = toolComponents[slug];
  // return Component ? <Component /> : <p>Tool loading...</p>;
  //
  //
  // OPTION 2: Agar sab tools ek single component mein hain (current situation)
  // toh ek prop pass karo jo tool identify kare:
  //
  return (
    <div className="tool-placeholder">
      {/* 
        Yahan tumhara existing tool embed hoga.
        Sabse simple approach: ek iframe ya 
        existing component ko slug prop de do.
        
        Ya simply:
        <YourExistingToolComponent activeTool={slug} />
      */}
      <p style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
        Tool loading... (Apna existing component yahan add karo)
      </p>
    </div>
  );
}
