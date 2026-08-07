import React, { useRef, useEffect } from 'react';

/**
 * ScrollRevealSection
 * Wraps children in an IntersectionObserver that toggles
 * sr-hidden / sr-visible CSS classes for staggered entrance animations.
 */
export default function ScrollRevealSection({ children, className = '', delay = 0, threshold = 0.15 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Start hidden
    el.classList.add('sr-hidden');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay to respect staggered children
          setTimeout(() => {
            el.classList.remove('sr-hidden');
            el.classList.add('sr-visible');
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
