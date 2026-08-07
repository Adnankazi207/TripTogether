import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

// Destinations matching the sequence of frames
const DESTINATIONS = [
  'Ladakh Mountains', 'Kashmir Valleys', 'Kerala Backwaters', 
  'Munnar Tea Gardens', 'Goa Beaches', 'Meghalaya Waterfalls', 
  'Rajasthan Sand Dunes', 'Udaipur Lakes', 'Andaman Islands', 
  'Taj Mahal', 'Himachal Pradesh', 'Sikkim Mountains'
];

export default function Cinematic3DHero() {
  const { theme } = useTheme();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDestName, setCurrentDestName] = useState(DESTINATIONS[0]);
  
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
    // The navbar is 80px, so scroll past hero viewport cleanly
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
        // Delay loader fadeout slightly for luxury experience
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    const handleImageError = (e) => {
      console.warn("Failed to load a frame. Continuing...", e);
      handleImageLoad(); // Count as loaded to not block the experience
    };

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      // Pad frame number to 3 digits (e.g. ffout001.gif)
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
      // Normalize to [-0.5, 0.5]
      const x = ((e.clientX - rect.left) / rect.width) - 0.5;
      const y = ((e.clientY - rect.top) / rect.height) - 0.5;
      
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3. Canvas Rendering & Animation Loop (Theme Adaptive)
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
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        z: Math.random() * 1.2 + 0.2, // Depth index: closer moves faster
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: -Math.random() * 0.25 - 0.08,
        opacity: Math.random() * 0.35 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseValue: Math.random() * Math.PI
      });
    }

    const render = (time) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      ctx.clearRect(0, 0, width, height);

      // A. Smooth Spring Interpolation for Mouse Movement
      const mouse = mouseRef.current;
      const spring = 0.05; // Easing coefficient (slightly damped for slower feel)
      mouse.currentX += (mouse.targetX - mouse.currentX) * spring;
      mouse.currentY += (mouse.targetY - mouse.currentY) * spring;

      // Add a subtle camera breath effect
      const breatheX = Math.sin(time * 0.0005) * 0.012;
      const breatheY = Math.cos(time * 0.0007) * 0.012;
      const visualX = mouse.currentX + breatheX;
      const visualY = mouse.currentY + breatheY;

      // B. Frame Selection & India Landscape Text Mapping (Slowing down FPS to 8 FPS)
      const fps = 8; // Slower playback for luxury travel speed
      const frameInterval = 1000 / fps;
      const elapsed = time - lastFrameTimeRef.current;

      if (elapsed > frameInterval) {
        frameIndexRef.current = (frameIndexRef.current + 1) % totalFrames;
        lastFrameTimeRef.current = time - (elapsed % frameInterval);
        
        // Map frame indices to location display name
        const destinationIndex = Math.floor((frameIndexRef.current / totalFrames) * DESTINATIONS.length);
        setCurrentDestName(DESTINATIONS[destinationIndex]);
      }

      // C. Render Video Background Frame
      const currentImage = imagesRef.current[frameIndexRef.current];
      if (currentImage && currentImage.complete) {
        ctx.save();
        
        // Dynamic Zoom/Slight pan effect
        const zoom = 1.06;
        const panX = -visualX * 30;
        const panY = -visualY * 30;
        
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

      // D. Draw Cinematic Vignette (Light theme adaptive)
      const ambientGlow = ctx.createRadialGradient(
        width / 2 + visualX * 80, 
        height / 2 + visualY * 80, 
        width * 0.25, 
        width / 2, 
        height / 2, 
        width * 0.75
      );
      
      if (theme === 'light') {
        // Light theme vignette (fades to clean white)
        ambientGlow.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        ambientGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
        ambientGlow.addColorStop(1, 'rgba(255, 255, 255, 0.75)');
      } else {
        // Dark theme vignette (fades to midnight)
        ambientGlow.addColorStop(0, 'rgba(5, 5, 5, 0.3)');
        ambientGlow.addColorStop(0.5, 'rgba(5, 5, 5, 0.55)');
        ambientGlow.addColorStop(1, 'rgba(5, 5, 5, 0.85)');
      }
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // E. Draw 3D Floating Dust Particles Layer (Theme adaptive)
      particles.forEach((p) => {
        // Move particle
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulseValue += p.pulseSpeed;

        // Reset if offscreen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10 || p.x > width + 10) {
          p.x = Math.random() * width;
        }

        // Apply mouse-based 3D Parallax offset based on depth index
        const px = p.x + (visualX * p.z * 100);
        const py = p.y + (visualY * p.z * 100);
        
        // Pulse size & opacity
        const activeSize = p.size * (1 + Math.sin(p.pulseValue) * 0.15);
        const activeOpacity = p.opacity * (0.6 + Math.sin(p.pulseValue) * 0.4);

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, activeSize, 0, Math.PI * 2);
        
        // Highlight particle color: Blue in light, Cyan in dark
        ctx.fillStyle = theme === 'light' 
          ? `rgba(37, 99, 235, ${activeOpacity})` 
          : `rgba(56, 189, 248, ${activeOpacity})`;
        
        ctx.shadowBlur = 6;
        ctx.shadowColor = theme === 'light' ? 'rgba(37, 99, 235, 0.3)' : 'rgba(56, 189, 248, 0.4)';
        ctx.fill();
        ctx.restore();
      });

      // F. Smooth Tilt Transform for visual wrapper to create 3D container depth
      const wrapper = document.getElementById('hero-3d-wrapper');
      if (wrapper) {
        wrapper.style.transform = `rotateY(${visualX * 4}deg) rotateX(${-visualY * 4}deg) translateZ(0px)`;
      }

      const infoTag = document.getElementById('hero-3d-location-tag');
      if (infoTag) {
        infoTag.style.transform = `translate3d(${visualX * -30}px, ${visualY * -30}px, 30px)`;
      }

      const content = document.getElementById('hero-3d-content');
      if (content) {
        content.style.transform = `translate3d(${visualX * -15}px, ${visualY * -15}px, 15px)`;
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
      {/* 1. Cinematic Preloader Screen (Theme Adaptive) */}
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
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.8s',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
              Trip<span style={{ color: '#2563EB' }}>Together</span>
            </span>
            <span style={{ fontSize: '0.8rem', letterSpacing: '6px', color: theme === 'light' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '500' }}>
              Cinematic Expedition
            </span>
          </div>

          <div style={{ width: '200px', height: '2px', backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
            <div 
              style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2563EB 0%, #38BDF8 100%)',
                transition: 'width 0.2s ease-out',
                boxShadow: theme === 'light' ? '0 0 10px rgba(37, 99, 235, 0.4)' : '0 0 10px rgba(56, 189, 248, 0.7)'
              }}
            ></div>
          </div>
          
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>
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
            transform: 'scale(1.02)'
          }} 
        />
        
        {/* 3. Floating 3D Cloud Layers */}
        <div className="floating-clouds-container" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, transformStyle: 'preserve-3d' }}>
          {/* Cloud 1 */}
          <div className="3d-cloud cloud-1" style={{ position: 'absolute', top: '12%', left: '4%', opacity: theme === 'light' ? 0.35 : 0.22, width: '350px', height: '140px', background: theme === 'light' ? 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', filter: 'blur(30px)', transform: 'translateZ(60px)' }}></div>
          {/* Cloud 2 */}
          <div className="3d-cloud cloud-2" style={{ position: 'absolute', top: '18%', right: '6%', opacity: theme === 'light' ? 0.3 : 0.18, width: '480px', height: '180px', background: theme === 'light' ? 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'translateZ(90px)' }}></div>
        </div>

        {/* 4. Flying Birds Layer */}
        <div 
          className="birds-flock"
          style={{
            position: 'absolute',
            top: '25%',
            left: '12%',
            width: '130px',
            height: '65px',
            opacity: theme === 'light' ? 0.45 : 0.3,
            pointerEvents: 'none',
            zIndex: 3,
            transform: 'translateZ(50px)',
            animation: 'flyAcross 50s linear infinite'
          }}
        >
          <svg viewBox="0 0 100 50" fill={theme === 'light' ? '#333333' : '#ffffff'}>
            <path className="bird-svg" d="M10,20 Q15,10 20,20 Q25,10 30,20 Q20,18 10,20 Z" style={{ animation: 'flap 0.9s ease-in-out infinite' }} />
            <path className="bird-svg" d="M40,25 Q43,17 47,25 Q51,17 55,25 Q47,23 40,25 Z" style={{ animation: 'flap 0.9s ease-in-out infinite 0.22s' }} />
            <path className="bird-svg" d="M25,35 Q28,29 32,35 Q36,29 40,35 Q32,33 25,35 Z" style={{ animation: 'flap 0.9s ease-in-out infinite 0.11s' }} />
          </svg>
        </div>
      </div>

      {/* 5. Floating Location Overlay Tag */}
      <div 
        id="hero-3d-location-tag"
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '6%',
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'none',
          textShadow: theme === 'light' ? '0 1px 4px rgba(255,255,255,0.7)' : '0 4px 12px rgba(0,0,0,0.6)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '4px', color: theme === 'light' ? '#2563EB' : '#38BDF8', fontWeight: '700', marginBottom: '4px' }}>
          Expedition Location
        </span>
        <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: theme === 'light' ? '#1e0004' : '#ffffff', fontWeight: '600', letterSpacing: '1px' }}>
          {currentDestName}
        </span>
      </div>

      {/* 6. Simplified Centered Hero Content */}
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
        {/* Glow behind title */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '250px', background: theme === 'light' ? 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none', zIndex: -1 }}></div>

        <h1 className="hero-3d-title" style={{ color: theme === 'light' ? '#0a0a0c' : '#ffffff' }}>
          Explore the Beauty of <br />
          <span className="hero-3d-title-gradient">India</span>
        </h1>

        {/* Single Explore button that smooth scrolls below hero */}
        <div style={{ animation: 'scaleInFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards', opacity: 0, display: 'inline-block' }}>
          <button 
            onClick={handleExploreScroll} 
            className="btn btn-primary"
            style={{
              padding: '14px 36px',
              fontSize: '1rem',
              borderRadius: '50px',
              fontWeight: '700',
              letterSpacing: '1px',
              background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
              border: 'none',
              boxShadow: theme === 'light' ? '0 10px 25px rgba(37, 99, 235, 0.25)' : '0 10px 25px rgba(56, 189, 248, 0.3)',
              transform: 'translateZ(20px)',
              cursor: 'pointer'
            }}
          >
            Explore Destinations
          </button>
        </div>
      </div>
    </section>
  );
}
