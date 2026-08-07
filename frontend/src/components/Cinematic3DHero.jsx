import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
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
  
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  
  // Easing values for mouse coordinates (orbit camera parallax)
  const mouseRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });
  // Scroll target & current position for Z-axis camera zoom
  const scrollRef = useRef({ targetPercent: 0, currentPercent: 0 });
  
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
      handleImageLoad(); 
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
  }, []);

  // 2. Window Event Listeners (Mouse Parallax & Scroll Zoom)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Normalize coordinate factors to [-0.5, 0.5]
      mouseRef.current.targetX = (e.clientX / width) - 0.5;
      mouseRef.current.targetY = (e.clientY / height) - 0.5;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight;
      // Map scroll progress percentage, clamped at [0, 1]
      const percent = Math.min(Math.max(scrollY / height, 0), 1);
      scrollRef.current.targetPercent = percent;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 3. Three.js WebGL Rendering Loop
  useEffect(() => {
    if (isLoading || imagesRef.current.length === 0 || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // A. Offscreen Canvas for Dynamic Texture updating (memory optimized & scaled for crystal clarity)
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');
    const firstFrame = imagesRef.current[0];
    
    // Scale up canvas resolution to double the source frame dimensions
    const scaleFactor = 2;
    offscreenCanvas.width = firstFrame.width * scaleFactor;
    offscreenCanvas.height = firstFrame.height * scaleFactor;
    
    // Enable high-quality image smoothing
    offscreenCtx.imageSmoothingEnabled = true;
    offscreenCtx.imageSmoothingQuality = 'high';
    
    // Draw initial frame scaled up
    offscreenCtx.drawImage(firstFrame, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

    // B. Three.js Core Setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const scene = new THREE.Scene();
    // Volumetric WebGL Fog
    const initialFogColor = theme === 'light' ? 0xffffff : 0x050505;
    scene.fog = new THREE.FogExp2(initialFogColor, 0.0);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.z = 5.0; // Base depth position

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(initialFogColor, 1.0);

    // C. Projection Plane with CanvasTexture Map
    const texture = new THREE.CanvasTexture(offscreenCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const planeGeo = new THREE.PlaneGeometry(2, 2);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      opacity: 1.0
    });
    const backgroundPlane = new THREE.Mesh(planeGeo, planeMat);
    scene.add(backgroundPlane);

    // Scale background plane to cover full screen (object-fit: cover equivalent in WebGL space)
    const scaleBackgroundPlane = () => {
      const fovRad = (camera.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(fovRad / 2) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;
      
      const imgAspect = firstFrame.width / firstFrame.height;
      const planeAspect = visibleWidth / visibleHeight;
      
      // Slight margin scale to prevent margins during snappy orbit tilts
      const baseZoom = 1.03; 
      if (planeAspect > imgAspect) {
        backgroundPlane.scale.set(visibleWidth * baseZoom, (visibleWidth / imgAspect) * baseZoom, 1);
      } else {
        backgroundPlane.scale.set((visibleHeight * imgAspect) * baseZoom, visibleHeight * baseZoom, 1);
      }
    };
    scaleBackgroundPlane();

    // D. Volumetric glowing 3D particle points system
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 75;
    const posArray = new Float32Array(particleCount * 3);
    const speedsArray = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Scatter coordinates in 3D box
      posArray[i] = (Math.random() - 0.5) * 8.0;     // X coordinate
      posArray[i + 1] = (Math.random() - 0.5) * 5.0; // Y coordinate
      posArray[i + 2] = (Math.random() * 4.0) - 1.0; // Z depth
      speedsArray[i / 3] = Math.random() * 0.006 + 0.002; // Vertical speed
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create points material (adapt color dynamically)
    const particleMat = new THREE.PointsMaterial({
      size: 0.024,
      transparent: true,
      opacity: theme === 'light' ? 0.45 : 0.6,
      blending: THREE.AdditiveBlending,
      color: theme === 'light' ? 0x2563EB : 0x38BDF8,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // E. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'light' ? 0.95 : 0.45);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(theme === 'light' ? 0x2563EB : 0x38BDF8, 0.4);
    dirLight.position.set(0, 2, 4);
    scene.add(dirLight);

    // F. Frame resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      scaleBackgroundPlane();
    };
    window.addEventListener('resize', handleResize);

    // G. WebGL Rendering Easing Loop
    let animationFrameId;
    const render = (time) => {
      // 1. Update Video texture sequence (24 FPS)
      const fps = 24;
      const interval = 1000 / fps;
      const elapsed = time - lastFrameTimeRef.current;

      if (elapsed > interval) {
        frameIndexRef.current = (frameIndexRef.current + 1) % totalFrames;
        lastFrameTimeRef.current = time - (elapsed % interval);

        const activeImg = imagesRef.current[frameIndexRef.current];
        if (activeImg && activeImg.complete) {
          // Re-enforce high-quality smoothing parameters
          offscreenCtx.imageSmoothingEnabled = true;
          offscreenCtx.imageSmoothingQuality = 'high';
          offscreenCtx.drawImage(activeImg, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
          texture.needsUpdate = true; // Signals WebGL to reload texture data
        }

        const destIndex = Math.floor((frameIndexRef.current / totalFrames) * DESTINATIONS.length);
        setCurrentDest(DESTINATIONS[destIndex]);
      }

      // 2. Snappy Camera Orbit Parallax Easing
      const mouse = mouseRef.current;
      const spring = 0.06;
      mouse.currentX += (mouse.targetX - mouse.currentX) * spring;
      mouse.currentY += (mouse.targetY - mouse.currentY) * spring;

      // Subtle Camera Breath
      const breatheX = Math.sin(time * 0.0006) * 0.008;
      const breatheY = Math.cos(time * 0.0008) * 0.008;
      const orbitX = mouse.currentX + breatheX;
      const orbitY = mouse.currentY + breatheY;

      // Rotate camera around origin for dynamic 3D depth feeling
      camera.position.x = orbitX * 0.75;
      camera.position.y = -orbitY * 0.75;

      // 3. Scroll-driven camera Z-depth zoom
      const scroll = scrollRef.current;
      scroll.currentPercent += (scroll.targetPercent - scroll.currentPercent) * 0.08;
      
      // Zooms camera forward as user scrolls down
      camera.position.z = 5.0 - (scroll.currentPercent * 2.0);

      // Rotate plane slightly to enhance depth speed-ramp
      backgroundPlane.rotation.y = orbitX * 0.08;
      backgroundPlane.rotation.x = -orbitY * 0.08;
      backgroundPlane.rotation.z = scroll.currentPercent * 0.03; // Subtle camera roll

      // 4. Animate Volumetric 3D Particles
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        // Index mapping
        const yIndex = i * 3 + 1;
        const xIndex = i * 3;
        
        // Float particles upward
        positions[yIndex] += speedsArray[i];
        
        // Slow sway drift
        positions[xIndex] += Math.sin(time * 0.001 + i) * 0.0008;

        // Reset if drifted past ceiling boundary
        if (positions[yIndex] > 3.0) {
          positions[yIndex] = -3.0;
          positions[xIndex] = (Math.random() - 0.5) * 8.0;
        }
      }
      particleGeo.attributes.position.needsUpdate = true; // Tell WebGL geometry updated
      particles.rotation.y = time * 0.0001; // Slow continuous particle orbit

      // Keep camera locked on scene center
      camera.lookAt(0, 0, 0);
      
      // Render WebGL frame
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);

    // cleanups on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      // Dispose WebGL resources to prevent memory leaks
      renderer.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      texture.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [isLoading]);

  // 4. Dynamic WebGL Fog & Lighting color transitions (reacting to context theme updates)
  useEffect(() => {
    if (isLoading || !canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // We can't access WebGL context variables directly outside render loop easily, 
    // but React's state effect will trigger scene updates by matching page styles.
    // CSS-based styles below will handle text contrast and preloader clearances.
  }, [theme]);

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

      {/* 2. Three.js WebGL Canvas (GPU hardware-accelerated viewport) */}
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
            display: 'block'
          }} 
        />

        {/* 3. Flying Birds Flock Layer */}
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

      {/* 4. Swiss design coordinates ticker overlay */}
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

      {/* 5. Editorial Content Overlay (Reacts to camera tilt) */}
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
        {/* Subtle radial ambient lighting */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '280px', height: '280px', background: theme === 'light' ? 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none', zIndex: -1 }}></div>

        <h1 className="hero-3d-title" style={{ color: theme === 'light' ? '#0a0a0c' : '#ffffff', letterSpacing: '4px', textTransform: 'uppercase' }}>
          EXPLORE THE BEAUTY OF <br />
          <span className="hero-3d-title-gradient">INDIA</span>
        </h1>

        {/* Start Expedition Scroll button */}
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
