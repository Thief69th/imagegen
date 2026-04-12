"use client";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Tools", href: "#tools" },
    { label: "About", href: "#about" },
    { label: "Blog", href: "#blog" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      style={{ height: "70px" }}
      className="sticky top-0 z-50 bg-white border-b-2 border-black flex items-center"
    >
      <div className="w-full max-w-screen-xl mx-auto px-4 flex items-center justify-between h-full">
        {/* Logo */}
        <a
          href="/"
          className="font-mono font-bold text-black text-lg tracking-tight select-none"
          style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "-0.02em" }}
        >
          imagegen<span className="opacity-40">.</span>online
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="nav-link text-black hover:opacity-60 transition-opacity">
              {link.label}
            </a>
          ))}
          <a
            href="#tools"
            className="font-mono text-xs uppercase tracking-widest bg-black text-white px-4 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors"
          >
            Start Free
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 bg-black transition-transform origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-black transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-black transition-transform origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-[70px] left-0 right-0 bg-white border-b-2 border-black md:hidden z-50">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-mono text-xs uppercase tracking-widest px-6 py-4 border-b border-black hover:bg-black hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#tools"
              onClick={() => setMenuOpen(false)}
              className="font-mono text-xs uppercase tracking-widest px-6 py-4 bg-black text-white hover:bg-white hover:text-black transition-colors"
            >
              Start Free →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
