"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<"default" | "hover" | "code" | "inspect">("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only activate on pointer devices (desktop with mouse)
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let animationId: number;
    let deferTimeout: ReturnType<typeof setTimeout>;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) setVisible(true);

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest("button, a, input, textarea, [role='button']")) {
        setCursorType("hover");
      } else if (target.closest("pre, code, .font-mono")) {
        setCursorType("code");
      } else if (target.closest("#capabilities, #self-correction, #repo-intelligence")) {
        setCursorType("inspect");
      } else {
        setCursorType("default");
      }
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    const animate = () => {
      // Smooth lerp (0.2)
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;
      setPosition({ x: currentX, y: currentY });
      animationId = requestAnimationFrame(animate);
    };

    // Defer cursor initialization to avoid competing with initial page paint
    deferTimeout = setTimeout(() => {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("mouseenter", handleMouseEnter);
      animationId = requestAnimationFrame(animate);
    }, 150);

    return () => {
      clearTimeout(deferTimeout);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationId);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Outer subtle ring */}
      <div
        className={`rounded-full transition-all duration-150 flex items-center justify-center ${
          cursorType === "hover"
            ? "w-8 h-8 border border-[#F0A43C]/80 bg-[#F0A43C]/10 scale-110"
            : cursorType === "code"
            ? "w-6 h-6 border border-[#3B82F6]/60 bg-[#3B82F6]/10"
            : cursorType === "inspect"
            ? "w-7 h-7 border border-[#F6D58A]/70 bg-[#F6D58A]/10"
            : "w-4 h-4 border border-white/20 bg-transparent"
        }`}
      >
        {/* Inner Amber Dot */}
        <div
          className={`rounded-full transition-all duration-100 ${
            cursorType === "hover"
              ? "w-2 h-2 bg-[#F0A43C]"
              : cursorType === "code"
              ? "w-1.5 h-1.5 bg-[#3B82F6]"
              : cursorType === "inspect"
              ? "w-1.5 h-1.5 bg-[#F6D58A]"
              : "w-1.5 h-1.5 bg-[#F0A43C]/80"
          }`}
        />
      </div>
    </div>
  );
}
