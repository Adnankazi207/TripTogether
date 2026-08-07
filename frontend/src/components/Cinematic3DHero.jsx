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
  const videoRef = useRef(null);
  
  // Easing values for mouse coordinates (orbit camera parallax)
  const mouseRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });
  // Scroll target & current position for Z-axis camera zoom
  const scrollRef = useRef({ targetPercent: 0, currentPercent: 0 });
  
  // Smooth Scroll past Hero section
  const handleExploreScroll = () => {
    window.scrollTo({
      top: window.innerHeight * 2.6,
      behavior: 'smooth'
    });
  };

  // 1. Preload the MP4 Video
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/Travel_montage_showcasing_India_1080p_202608071922.mp4';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    // Smoothly progress the load meter mockup
    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      if (progress >= 96) {
        clearInterval(interval);
      } else {
        setLoadingProgress(progress);
      }
    }, 80);

    const handleCanPlay = () => {
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    video.addEventListener('loadeddata', handleCanPlay);
    videoRef.current = video;

    return () => {
      clearInterval(interval);
      video.removeEventListener('loadeddata', handleCanPlay);
      video.pause();
      video.src = '';
      video.load();
    };
  }, []);

  // 2. Window Event Listeners (Mouse Parallax & Scroll Zoom relative to Hero Section)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      mouseRef.current.targetX = (e.clientX / width) - 0.5;
      mouseRef.current.targetY = (e.clientY / height) - 0.5;
    };

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const sectionHeight = rect.height;
      const scrolled = -rect.top;
      const viewHeight = window.innerHeight;
      
      const maxScroll = sectionHeight - viewHeight;
      if (maxScroll <= 0) return;
      
      const percent = Math.min(Math.max(scrolled / maxScroll, 0), 1);
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
    if (isLoading || !videoRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Explicitly trigger play (safeguard)
    video.play().catch(err => console.log('Video play triggered:', err));

    // A. Three.js Core Setup
    const width = container.clientWidth;
    const height = window.innerHeight; // Fill viewport height for sticky section
    
    const scene = new THREE.Scene();
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

    // B. Projection Plane with VideoTexture Map
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

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
      
      const videoWidth = video.videoWidth || 1920;
      const videoHeight = video.videoHeight || 1080;
      const imgAspect = videoWidth / videoHeight;
      const planeAspect = visibleWidth / visibleHeight;
      
      const baseZoom = 1.03; 
      if (planeAspect > imgAspect) {
        backgroundPlane.scale.set(visibleWidth * baseZoom, (visibleWidth / imgAspect) * baseZoom, 1);
      } else {
        backgroundPlane.scale.set((visibleHeight * imgAspect) * baseZoom, visibleHeight * baseZoom, 1);
      }
    };
    scaleBackgroundPlane();
    
    video.addEventListener('loadedmetadata', scaleBackgroundPlane);

    // C. Volumetric glowing 3D particle points system
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 100;
    const posArray = new Float32Array(particleCount * 3);
    const speedsArray = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 8.0;     // X coordinate
      posArray[i + 1] = (Math.random() - 0.5) * 5.0; // Y coordinate
      posArray[i + 2] = (Math.random() * 4.0) - 1.0; // Z depth
      speedsArray[i / 3] = Math.random() * 0.006 + 0.002; // Vertical speed
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
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

    // D. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'light' ? 0.95 : 0.45);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(theme === 'light' ? 0x2563EB : 0x38BDF8, 0.4);
    dirLight.position.set(0, 2, 4);
    scene.add(dirLight);

    // E. Frame resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      scaleBackgroundPlane();
    };
    window.addEventListener('resize', handleResize);

    // F. WebGL Rendering Easing Loop
    let animationFrameId;
    const render = (time) => {
      // 1. Cycle location tag coordinates synchronized with video playtime progress
      if (video.duration) {
        const currentTime = video.currentTime;
        const duration = video.duration;
        const destIndex = Math.min(
          Math.floor((currentTime / duration) * DESTINATIONS.length),
          DESTINATIONS.length - 1
        );
        setCurrentDest(DESTINATIONS[destIndex]);
      }

      // 2. Snappy Camera Orbit Parallax Easing
      const mouse = mouseRef.current;
      const spring = 0.06;
      mouse.currentX += (mouse.targetX - mouse.currentX) * spring;
      mouse.currentY += (mouse.targetY - mouse.currentY) * spring;

      const breatheX = Math.sin(time * 0.0006) * 0.008;
      const breatheY = Math.cos(time * 0.0008) * 0.008;
      const orbitX = mouse.currentX + breatheX;
      const orbitY = mouse.currentY + breatheY;

      // 3. Scroll-driven camera path & zooms (Apple-Style Multi-Stage Transitions)
      const scroll = scrollRef.current;
      scroll.currentPercent += (scroll.targetPercent - scroll.currentPercent) * 0.08;
      const currentScroll = scroll.currentPercent;

      let targetCamZ = 5.0;
      let targetCamY = 0.0;
      let targetCamX = 0.0;
      let targetPlaneRotZ = 0.0;

      // Select Slide DOM Elements to animate opacity directly for peak FPS
      const slide1 = document.getElementById('hero-slide-1');
      const slide2 = document.getElementById('hero-slide-2');
      const slide3 = document.getElementById('hero-slide-3');

      let s1Opacity = 0;
      let s2Opacity = 0;
      let s3Opacity = 0;

      if (currentScroll < 0.3) {
        // Stage 1: Front-facing welcome view
        targetCamZ = 5.0;
        targetCamY = 0.0;
        targetCamX = 0.0;
        targetPlaneRotZ = currentScroll * 0.04;

        // Slide 1 visible, fades out as scroll approaches 0.3
        s1Opacity = Math.max(0, Math.min(1, (0.28 - currentScroll) / 0.08));
      } else if (currentScroll >= 0.3 && currentScroll < 0.65) {
        // Stage 2: Perspective Shift left + zoom
        const t = (currentScroll - 0.3) / 0.35; // Normalized progress [0, 1]
        targetCamZ = 5.0 - (t * 1.0); // Zooms in from 5.0 to 4.0
        targetCamY = t * 0.16; // Camera shifts up
        targetCamX = -t * 0.22; // Camera shifts left
        targetPlaneRotZ = 0.012 + t * 0.04;

        // Slide 2 fades in, stays active, and fades out near 0.6
        if (currentScroll < 0.38) {
          s2Opacity = (currentScroll - 0.3) / 0.08;
        } else if (currentScroll < 0.57) {
          s2Opacity = 1;
        } else {
          s2Opacity = Math.max(0, (0.65 - currentScroll) / 0.08);
        }
      } else {
        // Stage 3: Close-up focus rotation right
        const t = (currentScroll - 0.65) / 0.35; // Normalized progress [0, 1]
        targetCamZ = 4.0 - (t * 0.9); // Zooms closer from 4.0 to 3.1
        targetCamY = 0.16 - (t * 0.28); // Camera shifts down
        targetCamX = -0.22 + (t * 0.44); // Camera shifts right
        targetPlaneRotZ = 0.052 - (t * 0.09);

        // Slide 3 fades in, stays visible till end of track
        if (currentScroll < 0.73) {
          s3Opacity = (currentScroll - 0.65) / 0.08;
        } else {
          s3Opacity = 1;
        }
      }

      // Update Opacities & Pointer Events directly in DOM to bypass React re-renders
      if (slide1) {
        slide1.style.opacity = s1Opacity;
        slide1.style.visibility = s1Opacity > 0.01 ? 'visible' : 'hidden';
        slide1.style.pointerEvents = s1Opacity > 0.5 ? 'auto' : 'none';
      }
      if (slide2) {
        slide2.style.opacity = s2Opacity;
        slide2.style.visibility = s2Opacity > 0.01 ? 'visible' : 'hidden';
        slide2.style.pointerEvents = s2Opacity > 0.5 ? 'auto' : 'none';
      }
      if (slide3) {
        slide3.style.opacity = s3Opacity;
        slide3.style.visibility = s3Opacity > 0.01 ? 'visible' : 'hidden';
        slide3.style.pointerEvents = s3Opacity > 0.5 ? 'auto' : 'none';
      }

      // Apply camera positions
      camera.position.x = targetCamX + (orbitX * 0.7);
      camera.position.y = targetCamY - (orbitY * 0.7);
      camera.position.z = targetCamZ;

      // Apply plane rotations
      backgroundPlane.rotation.y = orbitX * 0.07;
      backgroundPlane.rotation.x = -orbitY * 0.07;
      backgroundPlane.rotation.z = targetPlaneRotZ;

      // 4. Animate Volumetric 3D Particles
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const yIndex = i * 3 + 1;
        const xIndex = i * 3;
        
        positions[yIndex] += speedsArray[i] * (1.0 + currentScroll * 1.5); // Drift speed ramps up on scroll
        positions[xIndex] += Math.sin(time * 0.001 + i) * 0.0008;

        if (positions[yIndex] > 3.0) {
          positions[yIndex] = -3.0;
          positions[xIndex] = (Math.random() - 0.5) * 8.0;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = time * 0.0001;

      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);

    // Cleanups on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      video.removeEventListener('loadedmetadata', scaleBackgroundPlane);
      cancelAnimationFrame(animationFrameId);
      
      renderer.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      texture.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [isLoading]);

  return (
    <section 
      ref={containerRef}
      className="hero-3d-scroll-track" 
      style={{
        position: 'relative',
        width: '100%',
        height: '260vh', // Extended scroll track for sticky scroll interactions
        backgroundColor: theme === 'light' ? '#ffffff' : '#050505',
        transition: 'background-color 0.4s ease',
      }}
    >
      {/* Sticky Canvas Viewport container */}
      <div
        className="hero-3d-sticky-viewport"
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1200px',
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

        {/* 2. Three.js WebGL Canvas (GPU hardware viewport) */}
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

        {/* 5. Editorial Content Overlay (Reacts to camera tilt & scroll percentage) */}
        
        {/* SLIDE 1: WELCOME SCREEN */}
        <div 
          id="hero-slide-1"
          className="container hero-slide-wrapper"
          style={{
            position: 'absolute',
            zIndex: 5,
            color: theme === 'light' ? '#0a0a0c' : '#ffffff',
            textAlign: 'center',
            maxWidth: '850px',
            padding: '0 24px',
            pointerEvents: 'auto',
            opacity: 1,
            transition: 'opacity 0.2s ease, visibility 0.2s',
          }}
        >
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '280px', height: '280px', background: theme === 'light' ? 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none', zIndex: -1 }}></div>

          <h1 className="hero-3d-title" style={{ color: theme === 'light' ? '#0a0a0c' : '#ffffff', letterSpacing: '4px', textTransform: 'uppercase' }}>
            EXPLORE THE BEAUTY OF <br />
            <span className="hero-3d-title-gradient">INDIA</span>
          </h1>
          <p className="hero-3d-subtitle" style={{ color: theme === 'light' ? 'rgba(10,10,12,0.7)' : 'rgba(255,255,255,0.75)' }}>
            Plan group vacations, coordinate detailed schedules, and track Rupee financials in an Awwwards-level interactive experience.
          </p>

          <div style={{ display: 'inline-block' }}>
            <button 
              onClick={handleExploreScroll} 
              className="hero-luxury-btn"
            >
              <span>Start Expedition</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="btn-arrow" style={{ transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
          
          <div className="scroll-indicator-prompt" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '36px', opacity: 0.8 }}>
            <span style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700', color: theme === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}>Scroll down to journey</span>
            <div className="mouse-wheel-scroll" style={{ width: '18px', height: '30px', border: `2px solid ${theme === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}`, borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
              <div className="mouse-wheel-dot" style={{ width: '4px', height: '6px', background: theme === 'light' ? '#2563EB' : '#38BDF8', borderRadius: '50%', position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', animation: 'wheelScroll 1.6s infinite' }}></div>
            </div>
          </div>
        </div>

        {/* SLIDE 2: GROUP VACATION ROOMS */}
        <div 
          id="hero-slide-2"
          className="container hero-slide-wrapper"
          style={{
            position: 'absolute',
            zIndex: 5,
            color: theme === 'light' ? '#0a0a0c' : '#ffffff',
            textAlign: 'center',
            maxWidth: '850px',
            padding: '0 24px',
            pointerEvents: 'none',
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity 0.2s ease, visibility 0.2s',
          }}
        >
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '280px', height: '280px', background: theme === 'light' ? 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none', zIndex: -1 }}></div>

          <span style={{ fontSize: '0.78rem', letterSpacing: '4px', fontWeight: '800', color: theme === 'light' ? '#2563EB' : '#38BDF8', textTransform: 'uppercase', background: theme === 'light' ? 'rgba(37,99,235,0.06)' : 'rgba(56,189,248,0.08)', padding: '6px 16px', borderRadius: '100px', border: `1px solid ${theme === 'light' ? 'rgba(37,99,235,0.15)' : 'rgba(56,189,248,0.15)'}`, display: 'inline-block', marginBottom: '16px' }}>
            Collaboration
          </span>
          <h2 className="hero-3d-title" style={{ color: theme === 'light' ? '#0a0a0c' : '#ffffff', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '3rem' }}>
            COOPERATIVE <span className="hero-3d-title-gradient">TRIP ROOMS</span>
          </h2>
          <p className="hero-3d-subtitle" style={{ color: theme === 'light' ? 'rgba(10,10,12,0.7)' : 'rgba(255,255,255,0.75)', maxWidth: '620px', margin: '0 auto' }}>
            Generate secure 6-character room codes. Share codes with your friends to let them view itineraries, edit checklists, log expenses, and share vacation memories.
          </p>
        </div>

        {/* SLIDE 3: AI SUGGESTIONS */}
        <div 
          id="hero-slide-3"
          className="container hero-slide-wrapper"
          style={{
            position: 'absolute',
            zIndex: 5,
            color: theme === 'light' ? '#0a0a0c' : '#ffffff',
            textAlign: 'center',
            maxWidth: '850px',
            padding: '0 24px',
            pointerEvents: 'none',
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity 0.2s ease, visibility 0.2s',
          }}
        >
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '280px', height: '280px', background: theme === 'light' ? 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none', zIndex: -1 }}></div>

          <span style={{ fontSize: '0.78rem', letterSpacing: '4px', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', background: 'rgba(16,185,129,0.06)', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(16,185,129,0.15)', display: 'inline-block', marginBottom: '16px' }}>
            AI Assistant
          </span>
          <h2 className="hero-3d-title" style={{ color: theme === 'light' ? '#0a0a0c' : '#ffffff', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '3rem' }}>
            INTELLIGENT <span className="hero-3d-title-gradient" style={{ background: 'linear-gradient(135deg, #ffffff 30%, #10B981 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI PLANNER</span>
          </h2>
          <p className="hero-3d-subtitle" style={{ color: theme === 'light' ? 'rgba(10,10,12,0.7)' : 'rgba(255,255,255,0.75)', maxWidth: '620px', margin: '0 auto' }}>
            Unlock personalized day-by-day sightseeing recommendations, dining plans, and transit calculations, powered by Google Gemini AI.
          </p>
        </div>

      </div>

      <style>{`
        @keyframes wheelScroll {
          0% { top: 4px; opacity: 1; }
          50% { top: 14px; opacity: 0.3; }
          100% { top: 4px; opacity: 1; }
        }
      `}</style>
    </section>
  );
}
