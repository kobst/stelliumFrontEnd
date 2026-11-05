import { useLayoutEffect } from 'react';

// Keep one input aligned with the content column; reserve its measured height
// at the end of the page so the final reply can scroll fully above the dock.
export default function useComposerDock(page, column, input, visible) {
  useLayoutEffect(() => {
    const root = page.current;
    const form = input.current?.form;
    if (!visible || !root || !column.current || !form) {
      root?.style.setProperty('--cp-dock-height', '0px');
      return undefined;
    }
    const update = () => {
      const rect = column.current.getBoundingClientRect();
      const padding = parseFloat(getComputedStyle(column.current).paddingRight) || 0;
      root.style.setProperty('--cp-dock-left', `${rect.left}px`);
      root.style.setProperty('--cp-dock-width', `${rect.width - padding}px`);
      root.style.setProperty('--cp-dock-height', `${form.getBoundingClientRect().height + 32}px`);
      const viewport = window.visualViewport;
      root.style.setProperty('--cp-keyboard-offset', `${viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0}px`);
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(column.current);
    observer?.observe(form);
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, [page, column, input, visible]);
}
