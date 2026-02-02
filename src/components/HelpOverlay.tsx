import { useState, useEffect, useCallback, useRef } from 'react';

const shortcuts: { key: string; action: string }[] = [
  { key: '1-5', action: 'Switch visualization mode' },
  { key: 'T', action: 'Cycle color theme' },
  { key: 'Space', action: 'Pause / Resume audio' },
  { key: 'F', action: 'Toggle fullscreen' },
  { key: 'H / ?', action: 'Toggle this help overlay' },
  { key: 'Esc', action: 'Close help overlay' },
  { key: '←/→', action: 'Previous/Next mode (swipe on mobile)' },
  { key: 'Mouse drag', action: 'Orbit camera' },
  { key: 'Scroll', action: 'Zoom in/out' },
];

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function HelpOverlay() {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const toggle = useCallback(() => setVisible((v) => !v), []);
  const close = useCallback(() => setVisible(false), []);

  // Focus trap: manage focus when modal opens/closes
  useEffect(() => {
    if (visible) {
      // Save current focus to restore on close
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the close button on open
      requestAnimationFrame(() => {
        const closeBtn = dialogRef.current?.querySelector('.help-close') as HTMLElement;
        closeBtn?.focus();
      });
    } else if (previousFocusRef.current) {
      // Restore focus on close
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [visible]);

  // Focus trap: keep Tab cycling within the dialog
  useEffect(() => {
    if (!visible) return;

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTabTrap);
    return () => window.removeEventListener('keydown', handleTabTrap);
  }, [visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'h' || e.key === '?') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && visible) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, close, visible]);

  if (!visible) return null;

  return (
    <div
      className="help-overlay"
      role="dialog"
      aria-label="Keyboard shortcuts"
      aria-modal="true"
      onClick={close}
    >
      <div
        ref={dialogRef}
        className="help-content"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="help-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button
            className="help-close"
            onClick={close}
            aria-label="Close help overlay"
          >
            ✕
          </button>
        </div>
        <table className="help-table" role="grid">
          <thead>
            <tr>
              <th scope="col">Key</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((s) => (
              <tr key={s.key}>
                <td>
                  <kbd>{s.key}</kbd>
                </td>
                <td>{s.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="help-footer">
          Press <kbd>H</kbd> or <kbd>?</kbd> to toggle · <kbd>Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
