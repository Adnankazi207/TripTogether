import React, { useEffect, useState } from 'react';

export default function GlobalCursorSpotlight() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      animationFrameId = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      className="global-cursor-spotlight-layer"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        background: `radial-gradient(650px circle at ${pos.x}px ${pos.y}px, rgba(56, 189, 248, 0.13) 0%, rgba(212, 163, 115, 0.07) 40%, transparent 80%)`,
        transition: 'opacity 0.5s ease',
      }}
    />
  );
}
