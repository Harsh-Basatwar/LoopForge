"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-28 border-b border-white/[0.08] bg-transparent text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <h2 className="font-serif font-semibold sm:font-bold text-4xl sm:text-6xl md:text-7xl lg:text-[76px] tracking-[-0.01em] text-[#F2F2F0] leading-[1.02]">
          Give your next task to the agent.
        </h2>
        <p className="mt-5 text-base sm:text-xl text-[#F6D58A] font-sans font-medium">
          Plan it. Build it. Test it. Fix it.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/workspace"
            className="flex items-center gap-2 bg-[#F0A43C] hover:bg-[#F5B85D] text-[#0A0A0B] font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>

          <a
            href="#architecture"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[#F2F2F0] hover:text-white bg-[#111214] hover:bg-[#181A1D] border border-white/[0.08] font-medium text-sm transition-all"
          >
            <span>View Architecture</span>
          </a>
        </div>
      </div>
    </section>
  );
}
