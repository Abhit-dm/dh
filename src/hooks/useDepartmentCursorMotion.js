import { useCallback } from 'react';

function getMotionTarget(element) {
  if (!(element instanceof Element)) return null;
  return (
    element.closest('.service-image-link') ||
    element.closest('img') ||
    element.closest('.care-mascot-stage')
  );
}

export default function useDepartmentCursorMotion() {
  const onPointerMove = useCallback((event) => {
    if (
      event.pointerType === 'touch' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const target = getMotionTarget(event.target);
    if (!target || !event.currentTarget.contains(target)) return;

    const bounds = target.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    target.dataset.pointerMotion = '';
    target.style.setProperty('--pointer-shift-x', `${(x * 4).toFixed(2)}px`);
    target.style.setProperty('--pointer-shift-y', `${(y * 4).toFixed(2)}px`);
    target.style.setProperty('--pointer-rotate-x', `${(-y * 5).toFixed(2)}deg`);
    target.style.setProperty('--pointer-rotate-y', `${(x * 5).toFixed(2)}deg`);
  }, []);

  const onPointerOut = useCallback((event) => {
    const target = getMotionTarget(event.target);
    if (!target || !event.currentTarget.contains(target)) return;
    if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;

    target.style.removeProperty('--pointer-shift-x');
    target.style.removeProperty('--pointer-shift-y');
    target.style.removeProperty('--pointer-rotate-x');
    target.style.removeProperty('--pointer-rotate-y');
  }, []);

  return { onPointerMove, onPointerOut };
}
