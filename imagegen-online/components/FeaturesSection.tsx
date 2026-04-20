export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M12 12v9" />
          <path d="m8 17 4 4 4-4" />
        </svg>
      ),
      title: "Multiple Image Upload",
      desc: "Upload dozens of images simultaneously. No limit per session — process entire folders at once.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      title: "Fast Image Processing",
      desc: "Browser-based processing means near-instant results. No waiting for server uploads.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: "Secure Processing",
      desc: "All processing happens in your browser. Your images never leave your device.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      ),
      title: "No Images Stored",
      desc: "Zero data retention. We process and discard. Nothing is stored on any server.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
      title: "Works on All Devices",
      desc: "Fully responsive. Use on desktop, tablet, or mobile with the same experience.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      title: "Free to Use",
      desc: "All 50 tools are completely free. No sign-up, no subscription, no watermarks.",
    },
  ];

  return (
    <section
      id="about"
      className="w-full max-w-screen-xl mx-auto px-4 py-16 border-t-2 border-black"
    >
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-black/40 mb-1">Why Us</p>
        <h2
          className="font-mono font-bold text-2xl md:text-3xl tracking-tight"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Why Choose imagegen.online
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, i) => (
          <div
            key={i}
            className="border-2 border-black rounded-lg p-6 flex gap-4 hover:bg-black hover:text-white transition-colors group"
          >
            <div className="flex-shrink-0 w-10 h-10 border-2 border-black rounded-full flex items-center justify-center group-hover:border-white transition-colors">
              {feature.icon}
            </div>
            <div>
              <h3 className="font-mono font-bold text-sm uppercase tracking-widest mb-1">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-black/60 group-hover:text-white/60">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
