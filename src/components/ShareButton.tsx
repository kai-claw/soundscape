import { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getShareUrl, updateUrlHash } from '../utils/urlState';

/**
 * ShareButton — Copy a shareable URL with the current visualizer config.
 *
 * One click copies a URL that encodes the user's exact mode, theme,
 * sensitivity, and effects setup. The recipient opens it and gets the
 * same configuration.
 *
 * Yellow Hat Pass 4: Makes sharing SoundScape configurations effortless.
 */

export function ShareButton() {
  const mode = useStore((s) => s.mode);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);
  const cinematic = useStore((s) => s.cinematic);
  const starfield = useStore((s) => s.starfield);
  const orbitRing = useStore((s) => s.orbitRing);
  const beatPulse = useStore((s) => s.beatPulse);
  const shockwave = useStore((s) => s.shockwave);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep URL hash in sync with state
  useEffect(() => {
    updateUrlHash({
      mode, theme, sensitivity,
      cinematic, starfield, orbitRing, beatPulse, shockwave,
    });
  }, [mode, theme, sensitivity, cinematic, starfield, orbitRing, beatPulse, shockwave]);

  const handleShare = useCallback(async () => {
    const url = getShareUrl({
      mode, theme, sensitivity,
      cinematic, starfield, orbitRing, beatPulse, shockwave,
    });

    try {
      // Try native share API first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: 'SoundScape Configuration',
          text: `Check out my SoundScape setup: ${mode} mode + ${theme} theme`,
          url,
        });
        return;
      }
    } catch {
      // User cancelled share dialog — fall through to clipboard
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort: prompt
      prompt('Copy this URL to share:', url);
    }
  }, [mode, theme, sensitivity, cinematic, starfield, orbitRing, beatPulse, shockwave]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <button
      className="icon-btn share-btn"
      onClick={handleShare}
      aria-label={copied ? 'Link copied!' : 'Share configuration'}
      title={copied ? 'Copied!' : 'Share'}
    >
      {copied ? '✅' : '🔗'}
    </button>
  );
}
