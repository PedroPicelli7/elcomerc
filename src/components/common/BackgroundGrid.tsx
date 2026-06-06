// src/components/common/BackgroundGrid.tsx
"use client";

import { useEffect, useState } from "react";

export function BackgroundGrid() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-neutral-950">
      {/* Grade de Engenharia sutil */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00E5FF 1px, transparent 1px),
            linear-gradient(to bottom, #00E5FF 1px, transparent 1px)
          `,
          backgroundSize: "45px 45px",
        }}
      />
      
      {/* Brilho de Luz Radial seguidor de cursor */}
      <div
        className="absolute hidden md:block h-[500px] w-[500px] rounded-full bg-brand-cyan/5 blur-[100px] transition-transform duration-200 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />
    </div>
  );
}