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
        background: `radial-gradient(650px circle at ${pos.x}px ${pos.y}px, rgba(255, 107, 0, 0.15) 0%, rgba(249, 115, 22, 0.08) 40%, transparent 80%)`,
        transition: 'opacity 0.5s ease',
      }}
    />
  );
}
