import { useState, useCallback, useEffect } from 'react';

export function FullscreenBtn() {
  const [isFs, setIsFs] = useState(false);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <button
      className="fullscreen-btn"
      onClick={toggle}
      title={isFs ? 'Exit fullscreen' : 'Fullscreen'}
      aria-label={isFs ? 'Exit fullscreen' : 'Enter fullscreen'}
      aria-pressed={isFs}
    >
      {isFs ? '⊡' : '⛶'}
    </button>
  );
}
