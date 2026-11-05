import { useEffect, useRef } from 'react';

// Reveal an explicit send target, never a history load or a service switch.
// Wait for dock measurement and keyboard/layout changes before positioning.
export default function useReplyReveal(messageId, transcript, input, enabled) {
  const revealed = useRef(null);
  useEffect(() => {
    if (!messageId || !enabled || revealed.current === messageId) return undefined;
    let frame, settle, cancelled = false;
    const reveal = () => {
      if (cancelled) return;
      const reply = [...(transcript.current?.querySelectorAll('[data-message]') || [])].find(node => node.dataset.message === messageId);
      if (!reply) return;
      revealed.current = messageId;
      const navigation = document.querySelector('.cp-product-navigation, .cp-horo-toolbar');
      const top = (navigation?.getBoundingClientRect().height || 0) + 20;
      const bottom = input.current?.form?.getBoundingClientRect().top || window.innerHeight;
      const rect = reply.getBoundingClientRect();
      // Small replies fit fully; longer replies start below the sticky controls.
      if (rect.top < top || rect.bottom > bottom - 16) {
        window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - top), behavior: 'instant' });
      }
      reply.focus({ preventScroll: true });
    };
    const cancel = () => { cancelled = true; revealed.current = messageId; };
    const actions = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    frame = requestAnimationFrame(() => {
      // Do not mistake the Enter key event that sent this message for a new action.
      actions.forEach(event => window.addEventListener(event, cancel, { passive: true }));
      frame = requestAnimationFrame(() => { reveal(); settle = window.setTimeout(reveal, 250); });
    });
    return () => { cancelAnimationFrame(frame); clearTimeout(settle); actions.forEach(event => window.removeEventListener(event, cancel)); };
  }, [messageId, transcript, input, enabled]);
}
