"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navLinks = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#workflow", label: "Workflow" },
    { href: "#capabilities", label: "Capabilities" },
    { href: "#diff-engine", label: "Code Diff" },
    { href: "#architecture", label: "Architecture" },
    { href: "/workspace", label: "Workspace" },
    { href: "https://github.com", label: "GitHub", external: true },
  ];

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      ),
    },
    {
      name: "X (formerly Twitter)",
      href: "https://x.com",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
  ];

  return (
    <footer
      ref={footerRef}
      role="contentinfo"
      className="relative z-10 bg-[#0A0A0B] border-t border-white/[0.08] pt-36 sm:pt-44 lg:pt-48 pb-24 sm:pb-32 overflow-hidden select-none"
    >
      {/* Subtle peripheral ambient illumination for atmospheric depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(240,164,60,0.025),transparent)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center relative z-10">
        {/* 1. LoopForge Centered Canonical Logo */}
        <div
          className={`transition-all duration-700 ease-apple ${
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-98"
          }`}
        >
          <a
            href="/"
            onClick={handleScrollToTop}
            className="inline-block group logo-hover cursor-pointer"
            aria-label="LoopForge — Back to Top"
            title="LoopForge — Back to Top"
          >
            <img
              src="/loopforge-logo.png"
              alt="LoopForge"
              className="h-8 sm:h-9 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
              style={{ width: "auto", height: "34px" }}
            />
          </a>
        </div>

        {/* 2. Single Horizontal Navigation Row */}
        <nav
          aria-label="Footer navigation"
          className={`mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-sans text-[#A6A6A3] transition-all duration-700 delay-100 ease-apple ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {navLinks.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="relative py-1 hover:text-[#F2F2F0] transition-colors after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[1.5px] after:bg-[#F0A43C] hover:after:w-full after:transition-all after:duration-250 cursor-pointer"
              >
                {item.label}
              </a>
            ) : item.href.startsWith("/") ? (
              <Link
                key={item.label}
                href={item.href}
                className="relative py-1 hover:text-[#F2F2F0] transition-colors after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[1.5px] after:bg-[#F0A43C] hover:after:w-full after:transition-all after:duration-250 cursor-pointer"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="relative py-1 hover:text-[#F2F2F0] transition-colors after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[1.5px] after:bg-[#F0A43C] hover:after:w-full after:transition-all after:duration-250 cursor-pointer"
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* 3. Social Media Icon Row */}
        <div
          className={`mt-8 sm:mt-10 mb-14 sm:mb-16 flex items-center justify-center gap-3.5 transition-all duration-700 delay-200 ease-apple ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.name}
              className="w-9 h-9 rounded-full bg-[#111214] border border-white/[0.08] hover:border-white/[0.18] flex items-center justify-center text-[#A6A6A3] hover:text-[#F2F2F0] hover:bg-[#181A1D] transition-all duration-200 shadow-sm active:scale-95 group cursor-pointer"
            >
              <span className="transition-transform duration-200 group-hover:-translate-y-0.5">
                {social.icon}
              </span>
            </a>
          ))}
        </div>

        {/* 4. Constrained Editorial Horizontal Divider */}
        <div className="w-full flex justify-center mb-12 sm:mb-14">
          <div
            className={`w-full max-w-lg sm:max-w-xl lg:max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent transition-transform duration-1000 delay-300 ease-out origin-center ${
              isVisible ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </div>

        {/* 5. Editorial Closing Phrase */}
        <div
          className={`transition-all duration-700 delay-400 ease-apple ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <p className="font-serif text-2xl sm:text-3xl text-[#F2F2F0] tracking-[-0.01em] font-medium leading-snug">
            Plan it. Build it. Test it. Fix it.
          </p>
        </div>

        {/* 6. Centered Copyright & System Identity */}
        <div
          className={`mt-4 sm:mt-5 flex flex-col items-center gap-1.5 transition-all duration-700 delay-500 ease-apple ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="text-xs font-mono text-[#6B6B6B] tracking-wide">
            &copy; 2026 LoopForge &middot; AI Software Engineering Assistant
          </div>

          {/* Faint Finished Pipeline Telemetry Signature */}
          <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-[#404040]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]/80" />
            <span>PLAN &middot; ANALYZE &middot; BUILD &middot; TEST &middot; VERIFY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

