import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './StreamingTextReveal.css';

const getRevealChunkSize = (textLength) => {
  return 1;
};

const prefersReducedMotion = () => (
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
);

function StreamingTextReveal({
  text,
  animate = true,
  className = '',
  onRevealProgress,
  onRevealComplete
}) {
  const normalizedText = text || '';
  const shouldAnimate = animate && normalizedText.length > 0 && !prefersReducedMotion();
  const tokens = useMemo(() => normalizedText.match(/\S+\s*/g) || [], [normalizedText]);
  const fullLength = shouldAnimate ? tokens.length : normalizedText.length;
  const [visibleLength, setVisibleLength] = useState(shouldAnimate ? 0 : fullLength);
  const onRevealProgressRef = useRef(onRevealProgress);
  const onRevealCompleteRef = useRef(onRevealComplete);

  useEffect(() => {
    onRevealProgressRef.current = onRevealProgress;
  }, [onRevealProgress]);

  useEffect(() => {
    onRevealCompleteRef.current = onRevealComplete;
  }, [onRevealComplete]);

  useLayoutEffect(() => {
    if (!shouldAnimate) {
      setVisibleLength(normalizedText.length);
    } else {
      setVisibleLength(0);
    }
  }, [normalizedText, shouldAnimate]);

  useEffect(() => {
    if (!shouldAnimate) {
      onRevealProgressRef.current?.();
      return undefined;
    }

    const chunkSize = getRevealChunkSize(tokens.length);

    const intervalId = window.setInterval(() => {
      setVisibleLength(prev => {
        const next = Math.min(prev + chunkSize, tokens.length);
        onRevealProgressRef.current?.();
        if (next >= tokens.length) {
          window.clearInterval(intervalId);
          onRevealCompleteRef.current?.();
        }
        return next;
      });
    }, 333);

    return () => window.clearInterval(intervalId);
  }, [normalizedText, shouldAnimate, tokens.length]);

  const visibleText = useMemo(
    () => (shouldAnimate ? tokens.slice(0, visibleLength).join('') : normalizedText),
    [normalizedText, shouldAnimate, tokens, visibleLength]
  );

  const paragraphs = visibleText.split('\n').filter(paragraph => paragraph.trim());
  const isRevealing = shouldAnimate && visibleLength < tokens.length;

  return (
    <div className={`streaming-text-reveal${isRevealing ? ' streaming-text-reveal--active' : ''}${className ? ` ${className}` : ''}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>
          {paragraph}
          {isRevealing && index === paragraphs.length - 1 && (
            <span className="streaming-text-reveal__cursor" aria-hidden="true" />
          )}
        </p>
      ))}
      {isRevealing && paragraphs.length === 0 && (
        <p>
          <span className="streaming-text-reveal__cursor" aria-hidden="true" />
        </p>
      )}
    </div>
  );
}

export default StreamingTextReveal;
