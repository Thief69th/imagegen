# imagegen.online

**50+ Free Online Image Tools** — from OJU

> Compress, resize, convert, crop, watermark and more. All in-browser. Zero data stored.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel
- **Fonts**: Space Mono + DM Sans (Google Fonts)

---

## Project Structure

```
imagegen-online/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page (state: activeTool)
│   └── globals.css         # Global styles + CSS variables
├── components/
│   ├── Header.tsx          # Sticky nav with mobile hamburger
│   ├── HeroSection.tsx     # Hero with stats
│   ├── ActiveToolArea.tsx  # Dynamic tool container (lazy loaded)
│   ├── ToolsGrid.tsx       # 50-tool grid with category filter + search
│   ├── FeaturesSection.tsx # Why Choose Us — 6 features
│   ├── FAQSection.tsx      # Accordion FAQ — 6 questions
│   ├── Footer.tsx          # Footer with links
│   └── tools/
│       ├── MultiImageCompressor.tsx  # Fully functional default tool
│       └── PlaceholderTool.tsx       # Coming Soon shell for other tools
├── lib/
│   └── tools.ts            # All 50 tool definitions (id, name, desc, category)
├── vercel.json             # Vercel deployment config
└── next.config.mjs
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option 1 — Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2 — GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Framework: **Next.js** (auto-detected)
5. Click **Deploy**

Set custom domain: `imagegen.online` in Vercel dashboard → Settings → Domains

---

## Adding Real Tool Logic

Each tool lives in `components/tools/`. To implement a real tool:

1. Create `components/tools/ImageResizer.tsx`
2. Add the tool ID check in `ActiveToolArea.tsx`:
   ```tsx
   activeTool === "image-resizer" ? <ImageResizer /> : ...
   ```
3. Use the Canvas API, `browser-image-compression`, or a server-side API route

### Recommended Libraries
| Purpose | Library |
|---|---|
| Compression | `browser-image-compression` |
| Conversion | `canvas` API + `toBlob()` |
| Background Removal | `@imgly/background-removal` |
| Collage / Merge | `fabric.js` |
| HEIC Conversion | `heic2any` |

---

## Tool Categories (50 tools across 7 categories)

| Category | Count |
|---|---|
| Compress | 6 |
| Resize | 9 |
| Edit | 11 |
| Effects | 7 |
| Watermark | 3 |
| Convert | 11 |
| Combine | 3 |

---

## Design System

- **Background**: `#ffffff`
- **Text**: `#000000`  
- **Borders**: `2px solid black`
- **Buttons**: Black bg, white text → hover invert
- **Font Display**: Space Mono (monospace)
- **Font Body**: DM Sans
- **No gradients. No colours. Pure brutalist minimal.**

---

## License

© 2026 imagegen.online — from OJU
