import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

// Destinations matching the sequence of frames with geographic coordinates
const DESTINATIONS = [
  { name: 'LADAKH MOUNTAINS', coords: "34°09'09\" N · 77°34'37\" E" },
  { name: 'KASHMIR VALLEYS', coords: "34°05'01\" N · 74°47'50\" E" },
  { name: 'KERALA BACKWATERS', coords: "09°29'52\" N · 76°19'19\" E" },
  { name: 'MUNNAR TEA GARDENS', coords: "10°05'20\" N · 77°03'34\" E" },
  { name: 'GOA BEACHES', coords: "15°17'56\" N · 73°58'37\" E" },
  { name: 'MEGHALAYA WATERFALLS', coords: "25°27'57\" N · 91°43'29\" E" },
  { name: 'RAJASTHAN DUNES', coords: "26°55'11\" N · 70°54'08\" E" },
  { name: 'UDAIPUR LAKES', coords: "24°34'55\" N · 73°40'55\" E" },
  { name: 'ANDAMAN ISLANDS', coords: "11°40'11\" N · 92°43'53\" E" },
  { name: 'TAJ MAHAL', coords: "27°10'30\" N · 78°02'31\" E" },
  { name: 'HIMACHAL PRADESH', coords: "32°13'01\" N · 77°10'22\" E" },
  { name: 'SIKKIM MOUNTAINS', coords: "27°19'53\" N · 88°37'11\" E" }
];

export default function Cinematic3DHero() {
  const { theme } = useTheme();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDest, setCurrentDest] = useState(DESTINATIONS[0]);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const animationFrameRef = useRef(null);
  
  // Mouse movement target & current positions for spring interpolation
  const mouseRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });
  const frameIndexRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  
  const totalFrames = 192;

  // Smooth Scroll past Hero section
  const handleExploreScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  // 1. Preload the Image Sequence
  useEffect(() => {
    let loadedCount = 0;
    const images = [];

    const handleImageLoad = () => {
      loadedCount++;
      const progress = Math.floor((loadedCount / totalFrames) * 100);
      setLoadingProgress(progress);

      if (loadedCount === totalFrames) {
        setTimeout(() => {
          setIsLoading(false);
        }, 600);
      }
    };

    const handleImageError = (e) => {
      console.warn("Failed to load a frame. Continuing...", e);
      handleImageLoad(); // Count as loaded to not block the experience
    };

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/8899670e253cf24673a6f9370eb17c46/ffout${frameNum}.gif`;
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      images.push(img);
    }
    
    imagesRef.current = images;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 2. Track Mouse Position for Parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) - 0.5;
      const y = ((e.clientY - rect.top) / rect.height) - 0.5;
      
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3. Canvas Rendering & Animation Loop (Theme Adaptive & Normal Speed)
  useEffect(() => {
    if (isLoading || imagesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize 3D particles
    const particles = [];
    const particleCount = 35; // Fewer, cleaner particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        z: Math.random() * 1.0 + 0.1, // Depth index: closer moves faster
        size: Math.random() * 1.5 + 0.8,
        speedX: (Math.random() - 0.5) * 0.1,
        speedY: -Math.random() * 0.2 - 0.05,
        opacity: Math.random() * 0.3 + 0.05,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        pulseValue: Math.random() * Math.PI
      });
    }

    const render = (time) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      ctx.clearRect(0, 0, width, height);

      // A. Smooth Spring Interpolation for Mouse Movement
      const mouse = mouseRef.current;
      const spring = 0.07; // Snappy, professional spring damping
      mouse.currentX += (mouse.targetX - mouse.currentX) * spring;
      mouse.currentY += (mouse.targetY - mouse.currentY) * spring;

      // Add a subtle camera breath effect
      const breatheX = Math.sin(time * 0.0006) * 0.01;
      const breatheY = Math.cos(time * 0.0008) * 0.01;
      const visualX = mouse.currentX + breatheX;
      const visualY = mouse.currentY + breatheY;

      // B. Frame Selection & India Landscape Text Mapping (Normal Speed - 24 FPS)
      const fps = 24; // Normal video playback speed for crisp motion
      const frameInterval = 1000 / fps;
      const elapsed = time - lastFrameTimeRef.current;

      if (elapsed > frameInterval) {
        frameIndexRef.current = (frameIndexRef.current + 1) % totalFrames;
        lastFrameTimeRef.current = time - (elapsed % frameInterval);
        
        // Map frame indices to location display name
        const destinationIndex = Math.floor((frameIndexRef.current / totalFrames) * DESTINATIONS.length);
        setCurrentDest(DESTINATIONS[destinationIndex]);
      }

      // C. Render Video Background Frame (100% Crisp, No blur)
      const currentImage = imagesRef.current[frameIndexRef.current];
      if (currentImage && currentImage.complete) {
        ctx.save();
        
        const zoom = 1.05; // Less extreme zoom for a clean, sharp look
        const panX = -visualX * 24;
        const panY = -visualY * 24;
        
        // Scale to cover canvas
        const imgAspect = currentImage.width / currentImage.height;
        const canvasAspect = width / height;
        let drawWidth, drawHeight;
        
        if (canvasAspect > imgAspect) {
          drawWidth = width * zoom;
          drawHeight = (width / imgAspect) * zoom;
        } else {
          drawHeight = height * zoom;
          drawWidth = (height * imgAspect) * zoom;
        }
        
        const dx = (width - drawWidth) / 2 + panX;
        const dy = (height - drawHeight) / 2 + panY;
        
        ctx.drawImage(currentImage, dx, dy, drawWidth, drawHeight);
        ctx.restore();
      }

      // D. Draw Subtle Vignette (Less dark overlay so wallpaper is clearly visible)
      const ambientGlow = ctx.createRadialGradient(
        width / 2 + visualX * 60, 
        height / 2 + visualY * 60, 
        width * 0.3, 
        width / 2, 
        height / 2, 
        width * 0.75
      );
      
      if (theme === 'light') {
        ambientGlow.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        ambientGlow.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
        ambientGlow.addColorStop(1, 'rgba(255, 255, 255, 0.45)');
      } else {
        ambientGlow.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
        ambientGlow.addColorStop(0.6, 'rgba(0, 0, 0, 0.25)');
        ambientGlow.addColorStop(1, 'rgba(5, 5, 5, 0.55)');
      }
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // E. Draw 3D Floating Dust Particles Layer (Clean & Subtle)
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulseValue += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10 || p.x > width + 10) {
          p.x = Math.random() * width;
        }

        const px = p.x + (visualX * p.z * 80);
        const py = p.y + (visualY * p.z * 80);
        
        const activeSize = p.size * (1 + Math.sin(p.pulseValue) * 0.15);
        const activeOpacity = p.opacity * (0.6 + Math.sin(p.pulseValue) * 0.4);

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, activeSize, 0, Math.PI * 2);
        
        ctx.fillStyle = theme === 'light' 
          ? `rgba(37, 99, 235, ${activeOpacity})` 
          : `rgba(56, 189, 248, ${activeOpacity})`;
        
        ctx.fill();
        ctx.restore();
      });

      // F. Smooth 3D Tilts (Low values for subtle, professional motion)
      const wrapper = document.getElementById('hero-3d-wrapper');
      if (wrapper) {
        wrapper.style.transform = `rotateY(${visualX * 3.5}deg) rotateX(${-visualY * 3.5}deg) translateZ(0px)`;
      }

      const infoTag = document.getElementById('hero-3d-location-tag');
      if (infoTag) {
        infoTag.style.transform = `translate3d(${visualX * -25}px, ${visualY * -25}px, 25px)`;
      }

      const content = document.getElementById('hero-3d-content');
      if (content) {
        content.style.transform = `translate3d(${visualX * -12}px, ${visualY * -12}px, 12px)`;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoading, theme]);

  return (
    <section 
      ref={containerRef}
      className="hero-3d-container" 
      style={{
        position: 'relative',
        width: '100%',
        height: '84vh',
        backgroundColor: theme === 'light' ? '#ffffff' : '#050505',
        overflow: 'hidden',
        perspective: '1200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.4s ease',
      }}
    >
      {/* 1. Cinematic Preloader Screen */}
      {isLoading && (
        <div 
          className="hero-loader-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            backgroundColor: theme === 'light' ? '#ffffff' : '#050505',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            color: theme === 'light' ? '#0a0a0c' : '#ffffff',
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '6px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
              Trip<span style={{ color: '#2563EB' }}>Together</span>
            </span>
            <span style={{ fontSize: '0.75rem', letterSpacing: '8px', color: theme === 'light' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '500' }}>
              EXPEDITION CO-PILOT
            </span>
          </div>

          <div style={{ width: '180px', height: '2px', backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
            <div 
              style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2563EB 0%, #38BDF8 100%)',
                transition: 'width 0.15s ease-out',
                boxShadow: theme === 'light' ? '0 0 10px rgba(37, 99, 235, 0.4)' : '0 0 10px rgba(56, 189, 248, 0.7)'
              }}
            ></div>
          </div>
          
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>
            {loadingProgress}%
          </span>
        </div>
      )}

      {/* 2. Interactive 3D Canvas Base */}
      <div 
        id="hero-3d-wrapper"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'block',
            transform: 'scale(1.01)'
          }} 
        />

        {/* 3. Flying Birds Layer (Subtle, Clean Birds Flock) */}
        <div 
          className="birds-flock"
          style={{
            position: 'absolute',
            top: '22%',
            left: '10%',
            width: '120px',
            height: '60px',
            opacity: theme === 'light' ? 0.35 : 0.22,
            pointerEvents: 'none',
            zIndex: 3,
            transform: 'translateZ(40px)',
            animation: 'flyAcross 52s linear infinite'
          }}
        >
          <svg viewBox="0 0 100 50" fill={theme === 'light' ? '#444444' : '#dddddd'}>
            <path className="bird-svg" d="M10,20 Q15,10 20,20 Q25,10 30,20 Q20,18 10,20 Z" style={{ animation: 'flap 0.85s ease-in-out infinite' }} />
            <path className="bird-svg" d="M40,25 Q43,17 47,25 Q51,17 55,25 Q47,23 40,25 Z" style={{ animation: 'flap 0.85s ease-in-out infinite 0.2s' }} />
            <path className="bird-svg" d="M25,35 Q28,29 32,35 Q36,29 40,35 Q32,33 25,35 Z" style={{ animation: 'flap 0.85s ease-in-out infinite 0.1s' }} />
          </svg>
        </div>
      </div>

      {/* 4. Professional Coordinates location overlay tag */}
      <div 
        id="hero-3d-location-tag"
        className="luxury-location-tag"
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '6%',
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <span className="coordinate-ticker" style={{ color: theme === 'light' ? '#2563EB' : '#38BDF8' }}>
          {currentDest.coords}
        </span>
        <span className="location-name" style={{ color: theme === 'light' ? '#1e0004' : '#ffffff' }}>
          {currentDest.name}
        </span>
      </div>

      {/* 5. Clean Professional Content Overlay */}
      <div 
        id="hero-3d-content"
        className="container"
        style={{
          position: 'relative',
          zIndex: 5,
          color: theme === 'light' ? '#0a0a0c' : '#ffffff',
          textAlign: 'center',
          maxWidth: '850px',
          padding: '0 24px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
          pointerEvents: 'auto',
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '280px', height: '280px', background: theme === 'light' ? 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none', zIndex: -1 }}></div>

        <h1 className="hero-3d-title" style={{ color: theme === 'light' ? '#0a0a0c' : '#ffffff', letterSpacing: '4px', textTransform: 'uppercase' }}>
          EXPLORE THE BEAUTY OF <br />
          <span className="hero-3d-title-gradient">INDIA</span>
        </h1>

        {/* Single Explore button with luxury arrow indicator */}
        <div style={{ animation: 'scaleInFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards', opacity: 0, display: 'inline-block' }}>
          <button 
            onClick={handleExploreScroll} 
            className="hero-luxury-btn"
            style={{
              transform: 'translateZ(15px)',
            }}
          >
            <span>Start Expedition</span>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="btn-arrow" style={{ transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
