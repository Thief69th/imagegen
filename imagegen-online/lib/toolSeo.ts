export interface ToolSeo {
  h2: string;               // SEO-optimised heading (target keyword)
  tagline: string;          // 1-line benefit statement
  description: string;      // 2-3 sentence rich description for SEO
  keywords: string[];       // target keywords for this tool
  faqs?: { q: string; a: string }[];
  related?: string[];       // tool IDs
}

export const TOOL_SEO: Record<string, ToolSeo> = {

  // ── COMPRESS ──────────────────────────────────────────────────────────────
  "image-compressor": {
    h2: "Image Compressor Online Free — Reduce Image Size Without Losing Quality",
    tagline: "Compress JPG, PNG & WEBP images instantly in your browser.",
    description:
      "Reduce image file size by up to 80% without visible quality loss. Our free online image compressor works directly in your browser — no uploads, no server, nothing stored. Perfect for speeding up websites, reducing page load time, and saving storage space.",
    keywords: ["image compressor online free", "compress image", "reduce image size", "image size reducer"],
    faqs: [
      {
        q: "How much can I compress an image without losing quality?",
        a: "Using our Medium quality preset (75%), most JPEG images can be reduced by 50–70% with no visible difference. PNG files with transparency are compressed losslessly. For social media use, 60–70% quality is usually ideal.",
      },
      {
        q: "Is image compression reversible?",
        a: "JPEG/WEBP compression is lossy and not reversible — always keep your original file. PNG compression is lossless, so the original data is fully preserved. We recommend keeping originals and only distributing compressed versions.",
      },
      {
        q: "What image formats does this compressor support?",
        a: "We support JPG/JPEG, PNG, WEBP, GIF, and TIFF. PNG files are compressed losslessly to preserve transparency. JPG and WEBP use quality-based compression that you control with the quality slider.",
      },
    ],
    related: ["bulk-image-compressor", "compress-for-web", "compress-for-email", "reduce-image-size"],
  },

  "bulk-image-compressor": {
    h2: "Bulk Image Compressor — Compress Multiple Images at Once Online",
    tagline: "Compress 100+ images simultaneously — download as a ZIP file.",
    description:
      "Process entire batches of images in one click. Upload multiple JPG, PNG, or WEBP files, apply compression settings once, and download all compressed images as a ZIP. Ideal for e-commerce product photos, portfolio images, and blog media optimisation.",
    keywords: ["bulk image compressor", "compress multiple images", "batch image compression", "compress images online free"],
    faqs: [
      {
        q: "How many images can I compress at once?",
        a: "There is no hard limit — it depends on your device's available memory. Most modern devices handle 50–100 images per batch easily. For very large batches (500+), we recommend processing in groups of 100.",
      },
      {
        q: "Can I set different compression for each image?",
        a: "Currently the same quality setting applies to the entire batch. You can adjust the Quality slider (1–100%) or choose Low/Medium/High preset before processing. Individual download buttons let you pick specific files.",
      },
    ],
    related: ["image-compressor", "compress-for-web", "batch-image-resize", "reduce-image-size"],
  },

  "compress-for-web": {
    h2: "Compress Images for Website — Optimise Images for Faster Page Load",
    tagline: "Make your website load faster with web-optimised images.",
    description:
      "Slow websites lose visitors — 53% of users abandon a page that takes more than 3 seconds to load. Our web compression preset targets the ideal balance of quality and file size for HTTP delivery, helping you achieve better Core Web Vitals scores and improved SEO rankings.",
    keywords: ["compress image for web", "optimize images for website", "web image compression", "reduce image size for website"],
    related: ["image-compressor", "compress-for-social", "jpg-to-webp", "png-to-webp"],
  },

  "compress-for-email": {
    h2: "Compress Images for Email Attachments — Reduce File Size for Sending",
    tagline: "Keep images under email attachment limits without visible quality loss.",
    description:
      "Most email providers limit attachments to 10–25MB. Our email compression preset reduces image file sizes to under 200KB — small enough for any inbox but still clear enough to look professional. Perfect for newsletters, client presentations, and photo sharing.",
    keywords: ["compress image for email", "reduce image size for email", "email attachment image", "shrink image for email"],
    related: ["image-compressor", "compress-for-web", "resize-whatsapp", "reduce-image-size"],
  },

  "compress-for-social": {
    h2: "Compress Images for Social Media — Optimise for Instagram, Facebook & Twitter",
    tagline: "Upload-ready images for every social platform.",
    description:
      "Social media platforms re-compress uploaded images, often introducing artefacts. Pre-compressing your images gives you full control over quality. Use this tool before posting to Instagram, Facebook, Twitter/X, LinkedIn, or Pinterest for cleaner, sharper results.",
    keywords: ["compress image for social media", "instagram image compression", "facebook image size", "social media image optimizer"],
    related: ["resize-instagram", "resize-facebook", "compress-for-web", "image-compressor"],
  },

  "reduce-image-size": {
    h2: "Reduce Image File Size Online Free — Shrink Images Without Quality Loss",
    tagline: "Make images smaller without making them look worse.",
    description:
      "Reduce the file size of any image in seconds. Our smart compression analyses each image and applies the optimal settings automatically. Works for product photos, profile pictures, wallpapers, and any image that needs to be smaller without looking blurry or pixelated.",
    keywords: ["reduce image size", "reduce image file size", "shrink image", "make image smaller online"],
    related: ["image-compressor", "bulk-image-compressor", "compress-for-web", "change-resolution"],
  },

  // ── RESIZE ────────────────────────────────────────────────────────────────
  "image-resizer": {
    h2: "Image Resizer Online Free — Resize Images to Any Dimension",
    tagline: "Resize any image to exact pixel dimensions instantly.",
    description:
      "Resize images to exact pixel dimensions while maintaining aspect ratio or stretching to fit. Perfect for creating profile pictures, web banners, print-ready files, and thumbnails. Supports JPG, PNG, WEBP, and GIF — no software installation needed.",
    keywords: ["image resizer online free", "resize image", "resize photo online", "change image dimensions"],
    faqs: [
      {
        q: "Does resizing an image reduce quality?",
        a: "Enlarging an image (upscaling) can reduce sharpness because new pixels are interpolated. Shrinking (downscaling) generally preserves quality well. For the sharpest results, always start from the highest resolution original you have.",
      },
      {
        q: "What does 'Maintain Aspect Ratio' mean?",
        a: "Aspect ratio is the proportional relationship between width and height (e.g. 16:9 or 4:3). When enabled, changing the width automatically adjusts the height to prevent the image from appearing squished or stretched.",
      },
      {
        q: "Can I resize multiple images at once?",
        a: "Yes — use our Batch Image Resize tool to resize hundreds of images simultaneously to the same target dimensions. You can also use social-platform presets like 'Resize for Instagram' for common standard sizes.",
      },
    ],
    related: ["batch-image-resize", "create-thumbnail", "resize-instagram", "change-resolution"],
  },

  "batch-image-resize": {
    h2: "Batch Image Resize Online — Resize Multiple Photos at Once",
    tagline: "Resize hundreds of images to the same dimensions in one go.",
    description:
      "Upload multiple images and resize them all to the same width and height in a single click. Great for product photo standardisation, blog image formatting, and preparing image galleries. Download all resized images as a ZIP file.",
    keywords: ["batch image resize", "resize multiple images", "bulk resize images online", "batch photo resize"],
    related: ["image-resizer", "bulk-image-compressor", "create-thumbnail", "batch-convert"],
  },

  "create-thumbnail": {
    h2: "Create Thumbnail Online Free — Generate Image Thumbnails Instantly",
    tagline: "Generate perfectly sized thumbnails for websites, videos, and apps.",
    description:
      "Create thumbnails for YouTube videos, blog posts, e-commerce products, and app icons. Set your exact target size and our tool scales and crops your image intelligently. Download crisp, optimised thumbnails ready for immediate use.",
    keywords: ["create thumbnail online", "image thumbnail generator", "thumbnail maker online", "make thumbnail"],
    related: ["image-resizer", "resize-instagram", "image-crop", "compress-for-web"],
  },

  "resize-instagram": {
    h2: "Resize Image for Instagram Online — Perfect 1080×1080 Square & Story Sizes",
    tagline: "Get pixel-perfect Instagram dimensions every time.",
    description:
      "Instagram crops or rejects images that aren't the right size. Our tool automatically resizes your photos to 1080×1080 (square post), 1080×1920 (Stories/Reels), or 1080×566 (landscape) — the exact dimensions Instagram recommends for maximum quality.",
    keywords: ["resize image for instagram", "instagram image size", "instagram photo size", "instagram post size pixels"],
    faqs: [
      {
        q: "What is the best image size for Instagram posts?",
        a: "Instagram recommends 1080×1080 pixels for square posts, 1080×1350 for portrait, and 1080×566 for landscape. Stories and Reels should be 1080×1920 pixels. Our preset handles all these sizes automatically.",
      },
    ],
    related: ["resize-facebook", "resize-whatsapp", "compress-for-social", "image-crop"],
  },

  "resize-whatsapp": {
    h2: "Resize Image for WhatsApp — Optimise Photos for WhatsApp Sharing",
    tagline: "Share high-quality photos on WhatsApp without compression artefacts.",
    description:
      "WhatsApp automatically compresses images before sending, often reducing quality. Pre-resize your images to 1600×900 pixels at 72 DPI before sending, so WhatsApp's own compression has less impact. Your recipients see cleaner, sharper images.",
    keywords: ["resize image for whatsapp", "whatsapp image size", "whatsapp photo size", "compress photo for whatsapp"],
    related: ["resize-instagram", "resize-facebook", "compress-for-social", "reduce-image-size"],
  },

  "resize-facebook": {
    h2: "Resize Image for Facebook — Correct Sizes for Posts, Covers & Ads",
    tagline: "Upload Facebook-ready images without cropping surprises.",
    description:
      "Facebook has specific image dimensions for each placement: 1200×630 for link previews, 820×312 for covers, 1080×1080 for feed posts. Our preset automatically resizes to the Facebook-recommended 1200×630 size for best display across devices.",
    keywords: ["resize image for facebook", "facebook image size", "facebook post image dimensions", "facebook cover photo size"],
    related: ["resize-instagram", "compress-for-social", "image-crop", "image-resizer"],
  },

  "resize-website": {
    h2: "Resize Image for Website — Optimise Images for Web Display",
    tagline: "Get web-ready images that load fast and look sharp.",
    description:
      "Images that are too large slow down your website and hurt SEO. Our web resize preset scales images to 1920×1080 — a standard full-width breakpoint — then applies light compression for fast loading without visible quality loss.",
    keywords: ["resize image for website", "web image size", "optimize image dimensions web", "website image dimensions"],
    related: ["compress-for-web", "change-resolution", "jpg-to-webp", "image-resizer"],
  },

  "change-dpi": {
    h2: "Change Image DPI Online — Convert 72 DPI to 300 DPI for Print",
    tagline: "Adjust image DPI for print, web, or professional publishing.",
    description:
      "DPI (dots per inch) determines print sharpness — 72 DPI for screens, 300 DPI for professional print. Change your image's DPI metadata for correct output in Word documents, InDesign layouts, printing services, and photo books.",
    keywords: ["change image dpi online", "convert 72 dpi to 300 dpi", "change dpi of image", "image dpi converter"],
    related: ["change-resolution", "image-resizer", "compress-for-web"],
  },

  "change-resolution": {
    h2: "Change Image Resolution Online — Upscale or Downscale Photo Resolution",
    tagline: "Change pixel resolution for any output requirement.",
    description:
      "Quickly adjust the pixel dimensions of any image for screens, print, or social media. Whether you need to downscale a large RAW photo for web or upscale a small image for display, our resolution tool handles the maths automatically.",
    keywords: ["change image resolution online", "image resolution changer", "increase image resolution", "downscale image resolution"],
    related: ["image-resizer", "change-dpi", "reduce-image-size"],
  },

  // ── EDIT ──────────────────────────────────────────────────────────────────
  "image-crop": {
    h2: "Crop Image Online Free — Cut and Trim Photos to Any Size",
    tagline: "Crop images to any aspect ratio or exact pixel size.",
    description:
      "Remove unwanted edges, focus on a subject, or cut an image to a specific ratio. Enter exact crop coordinates (X, Y, width, height) for pixel-perfect trimming. Works with all major image formats — no software installation required.",
    keywords: ["crop image online free", "image cropper", "crop photo online", "cut image online"],
    related: ["image-resizer", "resize-instagram", "square-maker", "circle-maker"],
  },

  "image-rotate": {
    h2: "Rotate Image Online Free — Turn Photos 90°, 180° or Any Angle",
    tagline: "Fix crooked photos or create artistic rotations instantly.",
    description:
      "Rotate any image by preset angles (90°, 180°, 270°) or enter a custom angle with the slider. The canvas automatically resizes to prevent clipping. Correcting portrait/landscape orientation for uploads has never been simpler.",
    keywords: ["rotate image online free", "rotate photo online", "turn image 90 degrees", "flip image orientation"],
    related: ["image-flip", "image-crop", "image-resizer"],
  },

  "image-flip": {
    h2: "Flip Image Online Free — Mirror Photos Horizontally or Vertically",
    tagline: "Create mirror images or fix selfie orientation in one click.",
    description:
      "Flip images horizontally (left-right mirror) or vertically (upside-down). Useful for correcting selfie camera mirroring, creating symmetrical designs, or producing creative reflection effects without any design software.",
    keywords: ["flip image online", "mirror image online", "flip photo horizontally", "flip image vertically"],
    related: ["image-mirror", "image-rotate", "image-crop"],
  },

  "image-mirror": {
    h2: "Mirror Image Online — Create Perfect Horizontal & Vertical Reflections",
    tagline: "Generate symmetrical mirror reflections from any photo.",
    description:
      "Create stunning symmetrical images by mirroring your photo. Apply horizontal mirror (left-right), vertical mirror (top-bottom), or both axes simultaneously. Popular for creating mandala-style art, logo explorations, and architectural visualisations.",
    keywords: ["mirror image online", "flip image horizontally online", "create mirror reflection", "symmetrical image"],
    related: ["image-flip", "image-rotate", "color-invert"],
  },

  "image-blur": {
    h2: "Blur Image Online Free — Add Gaussian Blur Effect to Photos",
    tagline: "Blur backgrounds, hide sensitive details, or create artistic depth.",
    description:
      "Apply Gaussian blur with a simple strength slider. Use light blur to create a dreamy soft-focus effect, strong blur to anonymise faces or license plates, or medium blur to create a background separation effect for portrait photos.",
    keywords: ["blur image online free", "gaussian blur online", "blur photo background", "blur effect image"],
    related: ["background-blur", "image-sharpen", "noise-reduction"],
  },

  "image-sharpen": {
    h2: "Sharpen Image Online Free — Enhance Photo Clarity and Definition",
    tagline: "Make blurry photos crisp and clear without Photoshop.",
    description:
      "Apply unsharp masking to enhance edge definition and overall photo clarity. Adjust sharpening strength from subtle (1–2) for light correction to strong (4–5) for significantly blurry images. Works excellently on scanned documents, product photos, and landscapes.",
    keywords: ["sharpen image online free", "image sharpening online", "enhance photo clarity", "unblur image online"],
    related: ["image-blur", "noise-reduction", "edge-enhance", "contrast-adjust"],
  },

  "image-brightness": {
    h2: "Adjust Image Brightness Online — Make Photos Lighter or Darker",
    tagline: "Fix under or over-exposed photos in seconds.",
    description:
      "Correct poorly lit photos by adjusting brightness levels. Use the 0–200% slider — 100% is unchanged, below darkens, above lightens. Combine with contrast and saturation adjustments for professional photo correction results.",
    keywords: ["adjust image brightness online", "brighten photo online", "image brightness adjuster", "lighten image online free"],
    related: ["contrast-adjust", "saturation-adjust", "image-sharpen"],
  },

  "contrast-adjust": {
    h2: "Adjust Image Contrast Online — Improve Photo Depth and Clarity",
    tagline: "Make colours pop and improve visual depth with contrast control.",
    description:
      "Adjust the contrast of any photo to make it look more vivid and professional. Increase contrast to make dark areas darker and bright areas brighter — giving images more visual punch. Reduce contrast for a softer, faded aesthetic.",
    keywords: ["adjust image contrast online", "increase contrast photo", "image contrast editor", "photo contrast adjustment"],
    related: ["image-brightness", "saturation-adjust", "image-sharpen"],
  },

  "saturation-adjust": {
    h2: "Adjust Image Saturation Online — Boost or Reduce Colour Intensity",
    tagline: "Make colours vibrant or muted with a simple slider.",
    description:
      "Control the intensity of colours in any image. Boost saturation to make photos look vibrant and lively — perfect for travel photography. Reduce saturation for a muted, cinematic look, or desaturate completely to convert to black and white.",
    keywords: ["adjust saturation online", "increase color saturation photo", "photo saturation editor", "boost image colors"],
    related: ["contrast-adjust", "image-brightness", "grayscale"],
  },

  "noise-reduction": {
    h2: "Reduce Image Noise Online — Remove Grain and Artefacts from Photos",
    tagline: "Clean up grainy low-light photos for a professional look.",
    description:
      "Remove digital noise, grain, and compression artefacts from photos. Particularly useful for images taken in low light, high ISO settings, or images that have been over-compressed. Apply light noise reduction (blur 1px) for subtle cleaning.",
    keywords: ["reduce image noise online", "remove grain from photo", "denoise image online", "remove photo noise"],
    related: ["image-blur", "image-sharpen", "edge-enhance"],
  },

  "edge-enhance": {
    h2: "Enhance Image Edges Online — Sharpen and Define Photo Outlines",
    tagline: "Make details crisp and bring out fine textures.",
    description:
      "Apply edge enhancement to make fine details, textures, and outlines pop. Ideal for technical drawings, product images, microscopy photos, and any image where edge definition matters. Uses contrast boosting to isolate and strengthen edge regions.",
    keywords: ["enhance image edges online", "edge detection image", "sharpen image edges", "outline image enhancer"],
    related: ["image-sharpen", "contrast-adjust", "noise-reduction"],
  },

  // ── EFFECTS ───────────────────────────────────────────────────────────────
  "grayscale": {
    h2: "Convert Image to Black and White Online Free — Grayscale Converter",
    tagline: "Turn any colour photo into a classic black and white image.",
    description:
      "Convert colour images to grayscale (black and white) instantly. Perfect for creating timeless portrait photography, documentary-style images, or professional headshots. Works with all image formats — output is a clean, accurate luminosity-weighted grayscale conversion.",
    keywords: ["convert image to black and white online free", "grayscale converter online", "black and white photo converter", "desaturate image online"],
    related: ["saturation-adjust", "contrast-adjust", "color-invert"],
  },

  "color-invert": {
    h2: "Invert Image Colours Online — Create Negative Photo Effect",
    tagline: "Flip all colours to their opposites for creative effects.",
    description:
      "Invert all colours in an image — white becomes black, red becomes cyan, and so on — creating a photographic negative effect. Useful for analysing images, creating artistic effects, inverting X-ray images for printouts, and designing dark-mode UI assets.",
    keywords: ["invert image colors online", "negative image effect", "invert photo online", "image negative converter"],
    related: ["grayscale", "image-brightness", "saturation-adjust"],
  },

  "background-blur": {
    h2: "Blur Image Background Online Free — Portrait Background Blur Effect",
    tagline: "Simulate a professional DSLR bokeh effect on any photo.",
    description:
      "Apply a blur effect that simulates a shallow depth of field, making your subject stand out from the background. Adjust the blur strength from subtle (2–3px) to dramatic (10–15px). Note: this applies uniform blur — for subject-aware blur, use our Remove Background tool.",
    keywords: ["blur image background online free", "background blur effect", "bokeh effect online", "portrait blur background"],
    related: ["remove-background", "image-blur", "add-border"],
  },

  "add-border": {
    h2: "Add Border to Image Online Free — Custom Photo Frame & Border Generator",
    tagline: "Add colour borders and frames around any photo in seconds.",
    description:
      "Add a solid colour border around any image. Set the border thickness (1–100px) and choose any colour with the colour picker or preset options. Perfect for creating photo frames, adding white borders for Instagram, or making images stand out in presentations.",
    keywords: ["add border to image online free", "photo border generator", "image border maker", "add frame to photo online"],
    related: ["square-maker", "image-crop", "watermark"],
  },

  "square-maker": {
    h2: "Make Image Square Online Free — Pad Photos to 1:1 Ratio",
    tagline: "Convert rectangular photos to squares with custom background padding.",
    description:
      "Add padding to make any image a perfect square (1:1 aspect ratio) without cropping. Choose white, black, or any custom colour for the padding background. Essential for Instagram posts, product catalogues, and any platform that requires square images.",
    keywords: ["make image square online free", "square image maker", "pad image to square", "1:1 image ratio online"],
    related: ["image-crop", "resize-instagram", "add-border", "circle-maker"],
  },

  "circle-maker": {
    h2: "Crop Image to Circle Online Free — Make Round Profile Photo",
    tagline: "Create circular profile pictures and icons from any photo.",
    description:
      "Crop any image into a perfect circle with transparent background (PNG). Ideal for profile pictures, app icons, avatar images, and logo designs. The output PNG preserves transparency so the circle displays correctly on any background colour.",
    keywords: ["crop image to circle online free", "make round profile picture", "circular image crop", "circle photo maker"],
    related: ["image-crop", "square-maker", "remove-background"],
  },

  "remove-border": {
    h2: "Remove Image Border Online — Auto-Detect and Strip Photo Borders",
    tagline: "Clean up scanned documents and photos with unwanted borders.",
    description:
      "Automatically detect and remove solid-colour borders from images. Useful for cleaning up scanned documents, removing white borders from photos saved from the web, and stripping unwanted padding from screenshots.",
    keywords: ["remove image border online", "crop white border image", "strip photo border", "remove white frame image"],
    related: ["image-crop", "add-border", "square-maker"],
  },

  // ── WATERMARK ─────────────────────────────────────────────────────────────
  "watermark": {
    h2: "Add Watermark to Image Online Free — Text Watermark Generator",
    tagline: "Protect your photos with custom text watermarks.",
    description:
      "Add text watermarks to protect copyright on photos, prevent unauthorised use of your images, and brand your photography. Customise font size, colour, opacity (10–100%), and position (9 placement options). Watermarks are applied entirely in your browser.",
    keywords: ["add watermark to image online free", "image watermark generator", "photo watermark online", "add text watermark"],
    faqs: [
      {
        q: "Can I add a logo watermark instead of text?",
        a: "Currently the watermark tool supports text watermarks. For logo watermarks, you can use the 'Add Text to Image' tool with your brand name, or use the Merge Images tool to overlay a separate logo PNG onto your image.",
      },
    ],
    related: ["add-text", "remove-background", "merge-images"],
  },

  "add-text": {
    h2: "Add Text to Image Online Free — Write on Photos and Create Graphics",
    tagline: "Overlay custom text on any image without design software.",
    description:
      "Add custom text overlays to photos for memes, announcements, social media graphics, quotes, captions, and promotional images. Control font size, text colour, opacity, and position. Text is rendered using the browser's Canvas API for instant preview.",
    keywords: ["add text to image online free", "write on photo online", "text on image", "add caption to photo"],
    related: ["watermark", "add-border", "merge-images", "resize-instagram"],
  },

  "remove-background": {
    h2: "Remove Image Background Online Free — AI Background Remover",
    tagline: "Cut out subjects from any photo automatically with AI.",
    description:
      "Use AI-powered background removal to extract subjects from photos in seconds. Works great for portraits, product photography, and logo creation. Replace the removed background with transparent (PNG), white, black, a custom colour, or a blurred version of the original.",
    keywords: ["remove background from image online free", "AI background remover", "remove photo background", "background eraser online"],
    faqs: [
      {
        q: "How does AI background removal work?",
        a: "The tool uses a deep learning model (running entirely in your browser via WebAssembly) trained on millions of images to identify foreground subjects and separate them from the background. The AI model loads once (~5MB) from CDN and then runs locally — your images never leave your device.",
      },
      {
        q: "What types of images give the best results?",
        a: "The AI works best on images with a clear subject against a contrasting background — portraits, product photos on plain backgrounds, and animals with clear outlines. Complex scenes with multiple overlapping elements may need fine-tuning.",
      },
    ],
    related: ["background-blur", "circle-maker", "watermark", "square-maker"],
  },

  // ── CONVERT ───────────────────────────────────────────────────────────────
  "png-to-jpg": {
    h2: "Convert PNG to JPG Online Free — PNG to JPEG Converter",
    tagline: "Convert transparent PNG files to smaller JPG images instantly.",
    description:
      "Convert PNG images to JPG/JPEG format to reduce file size significantly. JPG is ideal for photographs and complex images where transparency is not needed. Adjust the output quality (1–100%) to balance size and visual clarity.",
    keywords: ["convert png to jpg online free", "png to jpeg converter", "png to jpg", "change png to jpg"],
    faqs: [
      {
        q: "What happens to transparency when converting PNG to JPG?",
        a: "JPG does not support transparency — transparent areas will be filled with white by default. If your PNG has important transparent areas (like a logo), consider using PNG to WEBP conversion instead, which preserves transparency.",
      },
    ],
    related: ["jpg-to-png", "png-to-webp", "compress-for-web", "image-compressor"],
  },

  "jpg-to-png": {
    h2: "Convert JPG to PNG Online Free — JPEG to PNG Converter",
    tagline: "Convert JPEG photos to lossless PNG format.",
    description:
      "Convert JPG/JPEG images to PNG format for lossless storage or when you need to add transparency. PNG is ideal for logos, icons, screenshots, and images with text. Note: converting JPG to PNG will not recover quality lost in the original JPG compression.",
    keywords: ["convert jpg to png online free", "jpeg to png converter", "jpg to png", "change jpeg to png"],
    related: ["png-to-jpg", "png-to-webp", "jpg-to-webp"],
  },

  "jpg-to-webp": {
    h2: "Convert JPG to WEBP Online Free — JPEG to WebP Converter",
    tagline: "Switch to the modern WEBP format for 30% smaller file sizes.",
    description:
      "WEBP images are 25–35% smaller than equivalent JPG files at the same visual quality. Converting to WEBP is one of the easiest wins for website performance. All modern browsers (Chrome, Firefox, Safari, Edge) fully support WEBP.",
    keywords: ["convert jpg to webp online free", "jpeg to webp converter", "jpg to webp", "image to webp"],
    related: ["png-to-webp", "webp-to-jpg", "compress-for-web"],
  },

  "webp-to-jpg": {
    h2: "Convert WEBP to JPG Online Free — WebP to JPEG Converter",
    tagline: "Convert WEBP images to universally compatible JPG format.",
    description:
      "Convert WEBP files back to JPG for use in applications that don't support the WEBP format — such as older image editors, email clients, and messaging apps. Set the output quality to control the file size.",
    keywords: ["convert webp to jpg online free", "webp to jpeg converter", "webp to jpg", "change webp to jpeg"],
    related: ["jpg-to-webp", "webp-to-png", "png-to-jpg"],
  },

  "png-to-webp": {
    h2: "Convert PNG to WEBP Online Free — PNG to WebP Converter",
    tagline: "Reduce PNG file sizes by switching to the modern WEBP format.",
    description:
      "Convert PNG images to WEBP format with transparency preserved. WEBP offers significantly smaller file sizes than PNG, making it ideal for web use. The output WEBP file maintains the same visual quality with a fraction of the storage footprint.",
    keywords: ["convert png to webp online free", "png to webp converter", "png to webp", "change png to webp"],
    related: ["webp-to-png", "jpg-to-webp", "compress-for-web"],
  },

  "webp-to-png": {
    h2: "Convert WEBP to PNG Online Free — WebP to PNG Converter",
    tagline: "Convert WEBP images to portable PNG format.",
    description:
      "Convert WEBP files to PNG for compatibility with tools and workflows that don't yet support WEBP. PNG conversion is lossless, so you retain the maximum quality from the WEBP source.",
    keywords: ["convert webp to png online free", "webp to png converter", "webp to png", "change webp to png"],
    related: ["png-to-webp", "webp-to-jpg", "jpg-to-png"],
  },

  "gif-to-jpg": {
    h2: "Convert GIF to JPG Online Free — GIF to JPEG Image Converter",
    tagline: "Extract the first frame of any GIF as a static JPG image.",
    description:
      "Convert animated or static GIF files to JPEG format. Useful for extracting a preview frame from an animated GIF, converting old GIF photos to a modern format, or reducing file sizes for static images.",
    keywords: ["convert gif to jpg online free", "gif to jpeg converter", "gif to jpg", "gif image converter"],
    related: ["gif-to-png", "jpg-to-png", "batch-convert"],
  },

  "gif-to-png": {
    h2: "Convert GIF to PNG Online Free — GIF to PNG Image Converter",
    tagline: "Convert GIF images to PNG with transparency support.",
    description:
      "Convert GIF files to PNG format, preserving any transparency in the original. PNG is superior to GIF for most static image use cases — it supports millions of colours (vs GIF's 256), better compression, and full alpha transparency.",
    keywords: ["convert gif to png online free", "gif to png converter", "gif to png", "change gif format"],
    related: ["gif-to-jpg", "png-to-webp", "batch-convert"],
  },

  "heic-to-jpg": {
    h2: "Convert HEIC to JPG Online Free — iPhone HEIC Photo Converter",
    tagline: "Convert iPhone photos to universally compatible JPG format.",
    description:
      "iPhones save photos in HEIC (High Efficiency Image Container) format by default. While HEIC offers excellent quality at small sizes, it is not supported by all apps and websites. Convert HEIC photos to JPG for universal compatibility.",
    keywords: ["convert heic to jpg online free", "heic to jpeg converter", "iphone photo converter", "open heic file"],
    faqs: [
      {
        q: "Why can't I open HEIC photos on my computer?",
        a: "HEIC is Apple's proprietary format — Windows requires a paid codec pack to open HEIC files, and many image editors don't support it. Converting to JPG gives you universal compatibility. Our tool uses your browser's native HEIC support (Chrome 104+ and Safari support HEIC natively).",
      },
    ],
    related: ["tiff-to-jpg", "jpg-to-png", "jpg-to-webp", "batch-convert"],
  },

  "tiff-to-jpg": {
    h2: "Convert TIFF to JPG Online Free — TIFF to JPEG Converter",
    tagline: "Convert large TIFF files to web-friendly JPG images.",
    description:
      "TIFF files are used in professional photography and printing but are impractical for web use due to their large size. Convert TIFF to JPG to reduce file sizes dramatically while maintaining good visual quality for web and email use.",
    keywords: ["convert tiff to jpg online free", "tiff to jpeg converter", "tiff to jpg", "change tiff to jpeg"],
    related: ["heic-to-jpg", "jpg-to-webp", "image-compressor"],
  },

  "batch-convert": {
    h2: "Batch Image Converter Online — Convert Multiple Images Between Formats",
    tagline: "Convert hundreds of images between formats simultaneously.",
    description:
      "Upload multiple images and convert them all to the same output format (JPG, PNG, or WEBP) in one click. Ideal for converting entire photo libraries, standardising image formats for a website, or processing exports from a camera.",
    keywords: ["batch image converter online", "convert multiple images", "bulk image format converter", "batch convert images online"],
    related: ["jpg-to-webp", "png-to-jpg", "bulk-image-compressor", "batch-image-resize"],
  },

  // ── COMBINE ───────────────────────────────────────────────────────────────
  "merge-images": {
    h2: "Merge Images Online Free — Combine Multiple Photos Into One",
    tagline: "Join two or more images side by side, stacked, or in a grid.",
    description:
      "Combine multiple images into a single file with flexible layout options: side by side, vertically stacked, or in a 2×2, 2×3, or 3×2 grid. Set the gap between images and background colour. Download the merged result as JPG.",
    keywords: ["merge images online free", "combine images online", "join photos online", "merge photos into one"],
    related: ["collage-maker", "split-image", "add-border", "watermark"],
  },

  "split-image": {
    h2: "Split Image Online Free — Divide Photo Into Grid Tiles",
    tagline: "Slice images into equal grid sections for multi-post social media.",
    description:
      "Split a single image into a grid of equal tiles — popular for Instagram carousel multi-posts, jigsaw-style reveals, and creating print-ready tile sets. Choose from preset grids (2×2, 3×3, 4×4) or set a custom rows/columns count. Download all tiles as a ZIP.",
    keywords: ["split image online free", "divide image into grid", "image splitter online", "cut image into pieces"],
    faqs: [
      {
        q: "How do I split an image for an Instagram grid?",
        a: "Use the 3×3 preset to divide your image into 9 equal tiles. Upload each tile as a separate Instagram post, starting from the bottom-right tile and working right to left, bottom to top. The result is a seamless panoramic grid on your profile.",
      },
    ],
    related: ["merge-images", "collage-maker", "image-crop", "resize-instagram"],
  },

  "collage-maker": {
    h2: "Collage Maker Online Free — Create Photo Collages in Any Layout",
    tagline: "Design beautiful photo collages with 6 layout templates.",
    description:
      "Create professional photo collages using pre-designed layouts: 2-photo side by side, 3 equal columns, 1 large + 2 small, 2+3 mixed layout, 2×2 grid, or 2×3 grid. Click each slot to add your photos, set the output canvas size, and download as JPG.",
    keywords: ["collage maker online free", "photo collage creator", "make photo collage online", "free collage maker"],
    faqs: [
      {
        q: "What is the best collage size for printing?",
        a: "For A4 print (297×210mm at 300 DPI), set the canvas to 3508×2480 pixels using the A4 preset in the collage settings. For standard 6×4 inch prints, use 1800×1200 pixels. Use the Square preset (1080×1080) for Instagram collage posts.",
      },
    ],
    related: ["merge-images", "split-image", "add-border", "resize-instagram"],
  },
};

export function getToolSeo(id: string): ToolSeo | undefined {
  return TOOL_SEO[id];
}
