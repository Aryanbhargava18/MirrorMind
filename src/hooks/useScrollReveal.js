import { useEffect } from 'react';

export default function useScrollReveal(trigger) {
  useEffect(() => {
    // Small timeout to ensure DOM is painted after state changes
    const timeout = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target); // Only animate once
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      // Observe all scroll-reveal elements
      document.querySelectorAll('.scroll-reveal:not(.visible), .scroll-reveal-stagger:not(.visible)').forEach((el) => {
        observer.observe(el);
      });

      // Cleanup function for this specific observer
      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timeout);
  }, [trigger]);
}
