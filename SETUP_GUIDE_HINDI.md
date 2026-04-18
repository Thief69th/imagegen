# imagegen.online — SEO Dynamic Pages Setup Guide
# (Step-by-Step Hindi Guide)

============================================================
## STEP 1: Files Copy Karo Apne Project Mein
============================================================

Apne imagegen Next.js project mein yeh files add karo:

1. `lib/tools-data.js` → apne project ke `/lib/` folder mein copy karo
2. `app/tools/[slug]/page.jsx` → apne project mein `/app/tools/[slug]/` folder banao, wahan copy karo
3. `app/sitemap.js` → apne `/app/` folder mein copy karo
4. `app/robots.js` → apne `/app/` folder mein copy karo

Final structure aisa dikhega:
```
your-project/
├── app/
│   ├── page.jsx          (existing homepage)
│   ├── sitemap.js        (NEW - add karo)
│   ├── robots.js         (NEW - add karo)
│   └── tools/
│       └── [slug]/
│           └── page.jsx  (NEW - add karo)
├── lib/
│   └── tools-data.js     (NEW - add karo)
```

============================================================
## STEP 2: Apna Tool Component Connect Karo
============================================================

`app/tools/[slug]/page.jsx` mein `ToolRenderer` function hai.
Yahan apna existing tool component add karo.

### Option A — Agar ek bada component hai (easiest):
```jsx
// Apne existing component ko import karo
import { YourMainToolComponent } from "@/components/YourMainTool";

function ToolRenderer({ slug }) {
  // Slug pass karo, component khud handle kare
  return <YourMainToolComponent activeTool={slug} />;
}
```

### Option B — Agar alag-alag components hain:
```jsx
import CompressImage from "@/components/tools/CompressImage";
import PngToJpg from "@/components/tools/PngToJpg";
// ... baaki imports

const toolComponents = {
  "compress-image-online": CompressImage,
  "png-to-jpg-converter": PngToJpg,
  // ... sab tools add karo
};

function ToolRenderer({ slug }) {
  const Component = toolComponents[slug];
  return Component ? <Component /> : <div>Tool not found</div>;
}
```

============================================================
## STEP 3: Homepage Links Update Karo
============================================================

Apne existing homepage (app/page.jsx) mein har tool card pe
link add karo `/tools/[slug]` pe:

```jsx
// PEHLE (no link):
<div className="tool-card" onClick={() => openTool("compress")}>
  Compress Image
</div>

// BAAD MEIN (SEO link):
import Link from "next/link";

<Link href="/tools/compress-image-online" className="tool-card">
  Compress Image
</Link>
```

tools-data.js mein se har tool ka slug dekho aur match karo.

============================================================
## STEP 4: next.config.js Check Karo
============================================================

Ensure karo ki next.config.js mein koi conflict nahi hai:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export use karte ho toh yeh add karo:
  // output: 'export',  ← agar Vercel pe dynamic routing chahiye toh REMOVE karo
};

module.exports = nextConfig;
```

⚠️ IMPORTANT: Agar `output: 'export'` hai toh dynamic routing kaam nahi karega.
Vercel pe deploy karte ho toh `output: 'export'` hata do — Vercel
automatically SSG handle karta hai.

============================================================
## STEP 5: Deploy Karo
============================================================

```bash
# Local test karo pehle:
npm run build

# Build successful hone ke baad:
git add .
git commit -m "feat: add SEO tool pages with dynamic routing"
git push

# Vercel automatically deploy karega
```

Build mein 82+ pages generate honge — yeh normal hai!

============================================================
## STEP 6: Google Search Console Mein Submit Karo
============================================================

1. search.google.com/search-console pe jao
2. imagegen.online verify karo (agar nahi kiya)
3. Sitemaps section mein jao
4. `https://imagegen.online/sitemap.xml` submit karo
5. Google 82 pages index karega — 2-4 weeks mein results dikhne lagenge

============================================================
## STEP 7: CSS Styling (Optional)
============================================================

tool page ke liye basic CSS — apni existing styles ke saath merge karo:

```css
/* Tool page styles */
.tool-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.breadcrumb {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-bottom: 1.5rem;
}

.breadcrumb a {
  color: inherit;
  text-decoration: none;
}

.tool-hero h1 {
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  margin-bottom: 1rem;
  font-weight: 700;
}

.tool-description {
  opacity: 0.8;
  margin-bottom: 2rem;
  font-size: 1.05rem;
}

.how-to-section, .faq-section, .related-tools {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.how-to-section h2, .faq-section h2, .related-tools h2 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.steps-list {
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.faq-item summary {
  cursor: pointer;
  padding: 0.75rem 0;
  font-weight: 600;
}

.faq-item p {
  padding: 0.5rem 0 1rem;
  opacity: 0.8;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.related-tool-card {
  display: block;
  padding: 1rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s;
}

.related-tool-card:hover {
  border-color: #B4FF57;
}

.related-tool-card h3 {
  font-size: 0.95rem;
  margin: 0.25rem 0;
}

.related-tool-card p {
  font-size: 0.8rem;
  opacity: 0.6;
}

.back-link {
  margin-top: 2rem;
}

.back-link a {
  color: #B4FF57;
  text-decoration: none;
}
```

============================================================
## Expected Results
============================================================

Is setup ke baad:
- 82 individual tool pages create honge
- Har page ka unique URL: imagegen.online/tools/[tool-name]
- Har page ka unique title + meta description
- Sitemap automatically generate hoga
- Google 82 pages index karega
- Long-tail keywords pe ranking milne lagegi

Timeline:
- Week 1-2: Google pages discover karega
- Week 3-4: Crawling + indexing start
- Month 2-3: Pehle rankings dikhne lagenge
- Month 4-6: Significant traffic increase

============================================================
## Agar Koi Problem Aaye
============================================================

Problem 1: "Cannot find module @/lib/tools-data"
Solution: Check karo ki `jsconfig.json` ya `tsconfig.json` mein
`@` alias configured hai:
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```

Problem 2: Build mein 82 pages nahi bante
Solution: `generateStaticParams()` function check karo — woh
tools-data.js se sab slugs return karta hai.

Problem 3: Existing tools kaam nahi kar rahe
Solution: ToolRenderer function mein apna tool component
properly import karo (Step 2 dekho).
