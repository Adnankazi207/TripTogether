import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const DESTINATIONS = [
  { name: 'LADAKH MOUNTAINS',    coords: "34°09' N · 77°34' E" },
  { name: 'KASHMIR VALLEYS',     coords: "34°05' N · 74°47' E" },
  { name: 'KERALA BACKWATERS',   coords: "09°29' N · 76°19' E" },
  { name: 'MUNNAR TEA GARDENS',  coords: "10°05' N · 77°03' E" },
  { name: 'GOA BEACHES',         coords: "15°17' N · 73°58' E" },
  { name: 'MEGHALAYA FALLS',     coords: "25°27' N · 91°43' E" },
  { name: 'RAJASTHAN DUNES',     coords: "26°55' N · 70°54' E" },
  { name: 'UDAIPUR LAKES',       coords: "24°34' N · 73°40' E" },
  { name: 'ANDAMAN ISLANDS',     coords: "11°40' N · 92°43' E" },
  { name: 'TAJ MAHAL',           coords: "27°10' N · 78°02' E" },
];

export default function Cinematic3DHero() {
  const { theme } = useTheme();
  const [loadingPct, setLoadingPct] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [destIndex, setDestIndex] = useState(0);

  const trackRef   = useRef(null);  // 300vh scroll track
  const stickyRef  = useRef(null);  // 100vh sticky viewport
  const canvasRef  = useRef(null);
  const videoRef   = useRef(null);
  const mouseRef   = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const scrollPctRef = useRef(0);   // 0–1 scroll progress

  // ─── Lenis smooth scroll ─────────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });

    const onRaf = (time) => {
      lenis.raf(time);
      ScrollTrigger.update();
    };
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onRaf);
      lenis.destroy();
    };
  }, []);

  // ─── Video preload ────────────────────────────────────────────────────
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/Travel_montage_showcasing_India_1080p_202608071922.mp4';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    videoRef.current = video;

    let pct = 0;
    const tick = setInterval(() => {
      pct = Math.min(pct + 6, 94);
      setLoadingPct(pct);
    }, 80);

    const onCanPlay = () => {
      clearInterval(tick);
      setLoadingPct(100);
      setTimeout(() => setIsLoaded(true), 350);
    };

    video.addEventListener('loadeddata', onCanPlay);
    video.load();

    return () => {
      clearInterval(tick);
      video.removeEventListener('loadeddata', onCanPlay);
      video.pause();
      video.src = '';
    };
  }, []);

  // ─── Mouse parallax ───────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.tx = (e.clientX / window.innerWidth  - 0.5);
      mouseRef.current.ty = (e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ─── Three.js + GSAP ScrollTrigger ────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !videoRef.current) return;

    const video = videoRef.current;
    video.play().catch(() => {});

    const canvas = canvasRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Scene
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Video Texture on a sphere
    const videoTex = new THREE.VideoTexture(video);
    videoTex.minFilter = THREE.LinearFilter;
    videoTex.colorSpace = THREE.SRGBColorSpace;

    const sphereGeo = new THREE.SphereGeometry(3.5, 64, 64);
    // Flip inside-out so we see the video from inside the sphere
    sphereGeo.scale(-1, 1, 1);
    const sphereMat = new THREE.MeshBasicMaterial({ map: videoTex });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Outer wireframe overlay for depth
    const wireGeo = new THREE.SphereGeometry(3.52, 32, 32);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    });
    scene.add(new THREE.Mesh(wireGeo, wireMat));

    // Particle constellation
    const particleCount = 180;
    const pPos = new Float32Array(particleCount * 3);
    const pSpeeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      pSpeeds[i] = Math.random() * 0.008 + 0.002;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── GSAP Camera path driven by ScrollTrigger ──────────────────────
    // We animate a proxy object so GSAP handles the easing & scrub
    const camProxy = { z: 5, rotX: 0, rotY: 0, tiltZ: 0 };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.8,                // butter-smooth scrub
        onUpdate: (self) => {
          scrollPctRef.current = self.progress;
          // Update destination tag based on scroll
          const idx = Math.min(
            Math.floor(self.progress * DESTINATIONS.length),
            DESTINATIONS.length - 1
          );
          setDestIndex(idx);
        },
      },
    });

    // Stage 1 (0–35%): Wide field of view, gentle tilt
    tl.to(camProxy, { z: 4.2, rotY: 0.3, tiltZ: 0.05, duration: 1 }, 0)
    // Stage 2 (35–65%): Zoom in, shift left
    .to(camProxy, { z: 3.4, rotY: -0.25, rotX: 0.15, tiltZ: -0.04, duration: 1 }, 1)
    // Stage 3 (65–100%): Maximum cinematic zoom
    .to(camProxy, { z: 2.6, rotY: 0.1, rotX: -0.1, tiltZ: 0.06, duration: 1 }, 2);

    // Slide visibility GSAP animations
    const slideConf = [
      { id: 'hero-slide-1', start: 0,    end: 0.28 },
      { id: 'hero-slide-2', start: 0.32, end: 0.62 },
      { id: 'hero-slide-3', start: 0.66, end: 1.0  },
    ];

    // ── Render Loop ────────────────────────────────────────────────────
    let raf;
    let time = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      time += 0.016;

      // Destination ticker from video
      if (video.duration) {
        const idx = Math.min(
          Math.floor((video.currentTime / video.duration) * DESTINATIONS.length),
          DESTINATIONS.length - 1
        );
        setDestIndex(idx);
      }

      // Apply GSAP proxy to camera (combine with mouse parallax)
      const m = mouseRef.current;
      m.x += (m.tx - m.x) * 0.06;
      m.y += (m.ty - m.y) * 0.06;

      camera.position.z = camProxy.z;
      camera.rotation.y = camProxy.rotY + m.x * 0.08;
      camera.rotation.x = camProxy.rotX - m.y * 0.05;
      camera.rotation.z = camProxy.tiltZ;

      // Sphere slow auto-rotation
      sphere.rotation.y += 0.0006;

      // Particles drift upward
      const pa = pGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pa[i * 3 + 1] += pSpeeds[i] * (1 + scrollPctRef.current * 2);
        if (pa[i * 3 + 1] > 6) {
          pa[i * 3 + 1] = -6;
          pa[i * 3] = (Math.random() - 0.5) * 16;
        }
      }
      pGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = time * 0.04;

      // Direct-DOM slide opacity (bypasses React re-renders)
      const prog = scrollPctRef.current;
      slideConf.forEach(({ id, start, end }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const inRange = prog >= start && prog <= end;
        let opacity = 0;
        if (inRange) {
          const fadeIn  = start + 0.06;
          const fadeOut = end - 0.06;
          if (prog < fadeIn)  opacity = (prog - start) / 0.06;
          else if (prog > fadeOut) opacity = (end - prog) / 0.06;
          else opacity = 1;
        }
        opacity = Math.max(0, Math.min(1, opacity));
        el.style.opacity   = opacity;
        el.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
        el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
        // Parallax translate on slide content
        const translate = (prog - (start + end) / 2) * 60;
        el.style.transform = `translateY(${translate}px)`;
      });

      renderer.render(scene, camera);
    };
    loop();

    // ── Resize ──────────────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      videoTex.dispose();
      pGeo.dispose();
      pMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
    };
  }, [isLoaded]);

  const dest = DESTINATIONS[destIndex];

  return (
    // 300vh scroll track — the sticky viewport pins inside it
    <section
      ref={trackRef}
      style={{ position: 'relative', height: '300vh', width: '100%' }}
    >
      {/* ── Sticky 100vh viewport ────────────────────────────────────── */}
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          background: '#050505',
        }}
      >
        {/* ── Cinematic Preloader ─────────────────────────────────────── */}
        {!isLoaded && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: '#050505',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.8rem', fontWeight: 800, letterSpacing: '8px',
                textTransform: 'uppercase', color: '#fff', fontFamily: 'var(--font-heading)',
                marginBottom: 8
              }}>
                Trip<span style={{ color: '#3b82f6' }}>Together</span>
              </div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '8px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
                EXPEDITION CO-PILOT
              </div>
            </div>

            {/* Loading bar */}
            <div style={{
              width: 200, height: 2,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 4, overflow: 'hidden',
            }}>
              <div style={{
                width: `${loadingPct}%`, height: '100%',
                background: 'linear-gradient(90deg, #2563eb, #7c3aed, #ec4899)',
                transition: 'width 0.12s ease-out',
                boxShadow: '0 0 12px rgba(96,165,250,0.7)',
              }} />
            </div>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', fontVariantNumeric: 'tabular-nums' }}>
              {loadingPct}%
            </span>
          </div>
        )}

        {/* ── Three.js Canvas ─────────────────────────────────────────── */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        />

        {/* ── Dark gradient vignette overlay ──────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,5,5,0.55) 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to top, rgba(5,5,5,0.7) 0%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '20%', zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(5,5,5,0.5) 0%, transparent 100%)',
        }} />

        {/* ── Swiss coordinates ticker ─────────────────────────────────── */}
        <div
          className="luxury-location-tag"
          style={{ position: 'absolute', bottom: '9%', right: '5%', zIndex: 10, textAlign: 'right' }}
        >
          <span className="coordinate-ticker" style={{ color: '#60a5fa' }}>{dest.coords}</span>
          <span className="location-name" style={{ color: 'rgba(255,255,255,0.9)' }}>{dest.name}</span>
        </div>

        {/* ── Progress dots ───────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', left: '3.5%', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: 10, zIndex: 10,
        }}>
          {[0, 1, 2].map(i => {
            const prog = scrollPctRef.current;
            const active = (i === 0 && prog < 0.33) || (i === 1 && prog >= 0.33 && prog < 0.66) || (i === 2 && prog >= 0.66);
            return (
              <div key={i} style={{
                width: active ? 3 : 3,
                height: active ? 24 : 10,
                borderRadius: 4,
                background: active ? '#60a5fa' : 'rgba(255,255,255,0.25)',
                transition: 'all 0.4s ease',
              }} />
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SLIDE 1 — WELCOME
        ══════════════════════════════════════════════════════════════ */}
        <div
          id="hero-slide-1"
          style={{
            position: 'absolute', inset: 0, zIndex: 5,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '0 24px',
            opacity: 1, visibility: 'visible', pointerEvents: 'auto',
            transition: 'opacity 0.15s ease, visibility 0.15s',
          }}
        >
          <div style={{ maxWidth: 800, position: 'relative' }}>
            {/* Ambient glow behind text */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500, height: 500,
              background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
              filter: 'blur(50px)', pointerEvents: 'none', zIndex: -1,
            }} />

            <div style={{
              display: 'inline-block', marginBottom: 24,
              fontSize: '0.7rem', letterSpacing: '5px', fontWeight: 700,
              textTransform: 'uppercase', color: '#93c5fd',
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.2)',
              padding: '6px 18px', borderRadius: 100,
            }}>
              India Awaits
            </div>

            <h1 className="hero-3d-title">
              Explore The Beauty<br />Of <span className="hero-3d-title-gradient">India</span>
            </h1>

            <p className="hero-3d-subtitle">
              Plan group expeditions, coordinate shared itineraries, and track Rupee finances — all in one cinematic, collaborative workspace.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link to="/register" className="hero-luxury-btn">
                <span>Start Expedition</span>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="btn-arrow" style={{ transition: 'transform 0.3s ease' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link to="/destinations" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 32px', borderRadius: 100, color: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s ease',
                background: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              >
                Browse Destinations
              </Link>
            </div>

            {/* Scroll mouse prompt */}
            <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.6 }}>
              <span style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Scroll to journey
              </span>
              <div style={{
                width: 20, height: 32, border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: 12, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  width: 4, height: 7, background: '#60a5fa', borderRadius: 4,
                  position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
                  animation: 'scrollDotAnim 1.8s ease infinite',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SLIDE 2 — COOPERATIVE ROOMS
        ══════════════════════════════════════════════════════════════ */}
        <div
          id="hero-slide-2"
          style={{
            position: 'absolute', inset: 0, zIndex: 5,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '0 24px',
            opacity: 0, visibility: 'hidden', pointerEvents: 'none',
            transition: 'opacity 0.15s ease, visibility 0.15s',
          }}
        >
          <div style={{ maxWidth: 800, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500, height: 500,
              background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
              filter: 'blur(50px)', pointerEvents: 'none', zIndex: -1,
            }} />

            <div style={{
              display: 'inline-block', marginBottom: 24,
              fontSize: '0.7rem', letterSpacing: '5px', fontWeight: 700,
              textTransform: 'uppercase', color: '#a78bfa',
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.2)',
              padding: '6px 18px', borderRadius: 100,
            }}>
              Collaboration
            </div>

            <h2 className="hero-3d-title" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
              Plan Together,<br /><span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Go Together</span>
            </h2>

            <p className="hero-3d-subtitle">
              Generate a secure 6-character room code. Share it with friends to collaboratively plan itineraries, split expenses, and share memories in real time.
            </p>

            <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: '🔐', label: 'Secure Room Codes' },
                { icon: '📅', label: 'Shared Itineraries' },
                { icon: '💸', label: 'Split Expenses' },
              ].map(({ icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 20px', borderRadius: 100,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.88rem', fontWeight: 600,
                }}>
                  <span>{icon}</span> {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SLIDE 3 — AI PLANNER
        ══════════════════════════════════════════════════════════════ */}
        <div
          id="hero-slide-3"
          style={{
            position: 'absolute', inset: 0, zIndex: 5,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '0 24px',
            opacity: 0, visibility: 'hidden', pointerEvents: 'none',
            transition: 'opacity 0.15s ease, visibility 0.15s',
          }}
        >
          <div style={{ maxWidth: 800, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500, height: 500,
              background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
              filter: 'blur(50px)', pointerEvents: 'none', zIndex: -1,
            }} />

            <div style={{
              display: 'inline-block', marginBottom: 24,
              fontSize: '0.7rem', letterSpacing: '5px', fontWeight: 700,
              textTransform: 'uppercase', color: '#34d399',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              padding: '6px 18px', borderRadius: 100,
            }}>
              AI-Powered
            </div>

            <h2 className="hero-3d-title" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
              Intelligent<br /><span style={{ background: 'linear-gradient(135deg, #34d399 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI Planner</span>
            </h2>

            <p className="hero-3d-subtitle">
              Powered by Google Gemini AI — get personalized day-by-day sightseeing, curated restaurant picks, and smart transit calculations for any destination in seconds.
            </p>

            <Link to="/register" className="hero-luxury-btn" style={{ display: 'inline-flex', margin: '0 auto' }}>
              <span>Try For Free</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="btn-arrow" style={{ transition: 'transform 0.3s ease' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scrollDotAnim {
          0%   { top: 6px;  opacity: 1; }
          55%  { top: 18px; opacity: 0.2; }
          100% { top: 6px;  opacity: 1; }
        }
      `}</style>
    </section>
  );
}
