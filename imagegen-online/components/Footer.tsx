export default function Footer() {
  const links = [
    { label: "Tools", href: "#tools" },
    { label: "About", href: "#about" },
    { label: "Blog", href: "#blog" },
    { label: "Contact", href: "#contact" },
    { label: "Privacy", href: "#privacy" },
  ];

  return (
    <footer
      id="contact"
      className="w-full border-t-2 border-black mt-0"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-12 text-center">
        {/* Logo */}
        <a
          href="/"
          className="inline-block font-mono font-bold text-xl tracking-tight mb-2"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          imagegen<span className="opacity-30">.</span>online
        </a>
        <p className="font-mono text-xs text-black/40 tracking-widest uppercase mb-8">
          from OJU
        </p>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono text-xs uppercase tracking-widest text-black/50 hover:text-black transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-black/10 pt-6">
          <p className="font-mono text-xs text-black/30">
            © 2026 imagegen.online · from OJU · All rights reserved
          </p>
          <p className="font-mono text-xs text-black/20 mt-1">
            50+ free image tools · No sign-up · No storage
          </p>
        </div>
      </div>
    </footer>
  );
}
