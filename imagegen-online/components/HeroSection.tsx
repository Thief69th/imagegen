export default function HeroSection() {
  return (
    <section className="w-full border-b-2 border-black bg-white">
      <div className="max-w-screen-xl mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 border-2 border-black px-3 py-1 mb-4">
              <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest">
                50+ Free Tools · No Sign-up
              </span>
            </div>
            <h1
              className="font-mono font-bold text-3xl md:text-5xl tracking-tight leading-tight mb-4"
              style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "-0.03em" }}
            >
              Every Image Tool
              <br />
              <span className="relative inline-block">
                You Need.
                <span
                  className="absolute bottom-1 left-0 right-0 h-1 bg-black"
                  aria-hidden="true"
                />
              </span>
            </h1>
            <p className="text-base text-black/60 leading-relaxed max-w-md">
              Compress, resize, convert, crop, watermark, and more — all in your browser. Fast, free, and nothing stored.
            </p>
          </div>
          {/* Stats */}
          <div className="flex gap-8 md:gap-10 flex-shrink-0">
            {[
              { value: "50+", label: "Image Tools" },
              { value: "100%", label: "Free" },
              { value: "0 KB", label: "Data Stored" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="font-mono font-bold text-2xl md:text-3xl tracking-tight"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {stat.value}
                </p>
                <p className="font-mono text-xs uppercase tracking-widest text-black/40 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
