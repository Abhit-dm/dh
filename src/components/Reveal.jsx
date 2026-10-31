import { useEffect, useRef } from 'react';

export default function Reveal({ children, className = '', delay = 0 }) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    if (!('IntersectionObserver' in window)) return undefined;

    element.dataset.revealPending = '';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        delete element.dataset.revealPending;
        element.classList.add('is-visible');
        observer.unobserve(element);
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`reveal${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </div>
  );
}
