"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode, type CSSProperties, type ElementType } from "react";

type CardVariant = "subtle" | "interactive" | "spotlight" | "tilt";

interface InteractiveCardProps {
  /** Interaction intensity tier */
  variant?: CardVariant;
  /** Extra Tailwind / CSS classes appended to the root element */
  className?: string;
  /** Inline style overrides */
  style?: CSSProperties;
  /** Card content */
  children: ReactNode;
  /** Root HTML element. Defaults to "div" */
  as?: ElementType;
  /** Click handler */
  onClick?: () => void;
  /** Disable all motion (useful when parent manages interaction state) */
  disabled?: boolean;
  /** Delay (ms) for the scroll-in reveal stagger */
  revealDelay?: number;
  /** Extra classes for the inner child container */
  innerClassName?: string;
}

/**
 * A reusable premium card interaction wrapper for the LoopForge landing page.
 *
 * Tiers (cumulative):
 *  - subtle:      hover lift + border brightening + shadow elevation
 *  - interactive: + micro-scale (1.01) + slightly stronger shadow
 *  - spotlight:   + cursor-following radial gradient overlay
 *  - tilt:        + restrained 3D mouse-follow tilt (max ±1.2° X, ±1.8° Y)
 *
 * Accessibility:
 *  - Respects `prefers-reduced-motion` via CSS + JS matchMedia
 *  - Disables tilt on touch / coarse-pointer devices
 */
export default function InteractiveCard({
  variant = "subtle",
  className = "",
  style,
  children,
  as: Component = "div",
  onClick,
  disabled = false,
  revealDelay = 0,
  innerClassName = "",
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isRevealed, setIsRevealed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  // Detect reduced motion + pointer type once on mount
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const pointerQuery = window.matchMedia("(pointer: coarse)");
    setIsCoarsePointer(pointerQuery.matches);

    const onMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", onMotionChange);
    return () => motionQuery.removeEventListener("change", onMotionChange);
  }, []);

  // IntersectionObserver scroll reveal
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Apply stagger delay
          const timer = setTimeout(() => setIsRevealed(true), revealDelay);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealDelay, prefersReducedMotion]);

  // Mouse move handler (spotlight + tilt variants)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || prefersReducedMotion) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    },
    [disabled, prefersReducedMotion]
  );

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0.5, y: 0.5 });
  };

  // --- Computed styles ---
  const motionDisabled = disabled || prefersReducedMotion;

  // Lift
  const liftY = isHovered && !motionDisabled ? -3.5 : 0;

  // Scale (interactive+ only)
  const hasScale = variant !== "subtle";
  const scale = isHovered && hasScale && !motionDisabled ? 1.01 : 1;

  // 3D tilt (tilt variant only, disabled on coarse pointer)
  const hasTilt = variant === "tilt" && !isCoarsePointer && !motionDisabled;
  const tiltX = hasTilt && isHovered ? (mousePos.y - 0.5) * -2.4 : 0; // ±1.2°
  const tiltY = hasTilt && isHovered ? (mousePos.x - 0.5) * 3.6 : 0;  // ±1.8°

  // Spotlight gradient (spotlight+ variants)
  const hasSpotlight = (variant === "spotlight" || variant === "tilt") && !motionDisabled;

  // Reveal entrance animation
  const revealTransform = isRevealed ? "translateY(0)" : "translateY(18px)";
  const revealOpacity = isRevealed ? 1 : 0;

  const combinedTransform = [
    revealTransform,
    `translateY(${liftY}px)`,
    `scale(${scale})`,
    hasTilt ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const transitionDuration = motionDisabled ? "0ms" : "320ms";

  return (
    <Component
      ref={cardRef}
      className={`interactive-card relative ${className}`}
      style={{
        transform: combinedTransform,
        opacity: revealOpacity,
        transition: `transform ${transitionDuration} cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), border-color 260ms ease, box-shadow 320ms ease`,
        willChange: isHovered ? "transform" : "auto",
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Spotlight radial overlay */}
      {hasSpotlight && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-[1]"
          style={{
            background: isHovered
              ? `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(240,164,60,0.07), transparent 50%)`
              : "none",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 260ms ease",
          }}
        />
      )}
      {/* Children always above the spotlight */}
      <div className={`relative z-[2] ${innerClassName}`}>{children}</div>
    </Component>
  );
}
