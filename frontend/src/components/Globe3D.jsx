import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

// Key India destination coordinates [lat, lng]
const DESTINATIONS_COORDS = [
  { name: 'Delhi',    lat: 28.6,  lng: 77.2  },
  { name: 'Mumbai',   lat: 19.0,  lng: 72.8  },
  { name: 'Goa',      lat: 15.3,  lng: 74.0  },
  { name: 'Jaipur',   lat: 26.9,  lng: 75.8  },
  { name: 'Manali',   lat: 32.2,  lng: 77.2  },
  { name: 'Kerala',   lat: 10.1,  lng: 76.4  },
  { name: 'Ladakh',   lat: 34.2,  lng: 77.6  },
  { name: 'Kolkata',  lat: 22.6,  lng: 88.4  },
  { name: 'Udaipur',  lat: 24.6,  lng: 73.7  },
  { name: 'Agra',     lat: 27.2,  lng: 78.0  },
];

function latLngToVec3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function Globe3D() {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const size = container.clientWidth;
    const isDark = theme === 'dark';

    // ─── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ─── Scene & Camera ────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 2.8;

    // ─── Globe Wireframe ───────────────────────────────────────────────
    const RADIUS = 1.0;
    const sphereGeo = new THREE.SphereGeometry(RADIUS, 40, 40);
    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x1e3a8a : 0xdbeafe,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.18 : 0.25,
    });
    const globe = new THREE.Mesh(sphereGeo, wireMat);
    scene.add(globe);

    // ─── Dot Cloud surface ─────────────────────────────────────────────
    const dotCount = 2000;
    const dotGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < dotCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = RADIUS + 0.01;
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const dotMat = new THREE.PointsMaterial({
      size: 0.012,
      color: isDark ? 0x3b82f6 : 0x2563eb,
      transparent: true,
      opacity: isDark ? 0.55 : 0.35,
      sizeAttenuation: true,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    scene.add(dots);

    // ─── Destination Markers ───────────────────────────────────────────
    DESTINATIONS_COORDS.forEach(({ lat, lng }) => {
      const pos = latLngToVec3(lat, lng, RADIUS + 0.025);
      const markerGeo = new THREE.SphereGeometry(0.025, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.9,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      globe.add(marker);

      // Glow ring
      const ringGeo = new THREE.RingGeometry(0.032, 0.048, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      globe.add(ring);
    });

    // ─── Ambient Light ─────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    // ─── Mouse Drag ────────────────────────────────────────────────────
    const drag = { active: false, prevX: 0, prevY: 0, velX: 0, velY: 0 };

    const onDown = (e) => {
      drag.active = true;
      drag.prevX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      drag.prevY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };
    const onMove = (e) => {
      if (!drag.active) return;
      const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      drag.velX = x - drag.prevX;
      drag.velY = y - drag.prevY;
      globe.rotation.y += drag.velX * 0.005;
      globe.rotation.x += drag.velY * 0.005;
      dots.rotation.y += drag.velX * 0.005;
      dots.rotation.x += drag.velY * 0.005;
      drag.prevX = x;
      drag.prevY = y;
    };
    const onUp = () => { drag.active = false; };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    // ─── Resize ────────────────────────────────────────────────────────
    const onResize = () => {
      const s = container.clientWidth;
      renderer.setSize(s, s);
    };
    window.addEventListener('resize', onResize);

    // ─── Render Loop ───────────────────────────────────────────────────
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!drag.active) {
        globe.rotation.y += 0.003;
        dots.rotation.y += 0.003;
        // Inertia
        drag.velX *= 0.9;
        drag.velY *= 0.9;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      sphereGeo.dispose();
      wireMat.dispose();
      dotGeo.dispose();
      dotMat.dispose();
    };
  }, [theme]);

  return (
    <div ref={containerRef} className="globe-canvas-wrap">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'grab', display: 'block', borderRadius: '50%' }} />
    </div>
  );
}
