import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';
import { audioEngine } from '../audio/AudioEngine';

/**
 * RecordButton — Capture WebGL canvas as video (WebM).
 *
 * Uses canvas.captureStream() + MediaRecorder to record the visualization.
 * Optionally includes audio from the AudioContext destination.
 * Shows a pulsing red indicator while recording.
 *
 * Keyboard shortcut: R (toggle recording)
 */

/** Check if MediaRecorder and captureStream are available */
function isRecordingSupported(): boolean {
  if (typeof MediaRecorder === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return typeof canvas.captureStream === 'function';
}

/** Find the best supported video MIME type */
function getSupportedMime(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return 'video/webm';
}

export function RecordButton() {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [supported] = useState(isRecordingSupported);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  /** Track audio routing nodes created during recording so we can disconnect them */
  const audioNodesRef = useRef<{ gain: GainNode | null; dest: MediaStreamAudioDestinationNode | null }>({ gain: null, dest: null });
  const theme = useStore((s) => s.theme);
  const colors = themeMap[theme];

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    try {
      // Capture video stream from canvas at 30fps
      const videoStream = canvas.captureStream(30);

      // Try to include audio from AudioContext
      let combinedStream: MediaStream;
      try {
        const audioCtx = audioEngine.ctx;
        if (audioCtx) {
          const audioDest = audioCtx.createMediaStreamDestination();
          // Connect the AudioContext destination to the MediaStream
          const gain = audioCtx.createGain();
          gain.gain.value = 1;
          if (audioEngine.analyser) {
            audioEngine.analyser.connect(gain);
            gain.connect(audioDest);
          }
          // Store refs so we can disconnect when recording stops
          audioNodesRef.current = { gain, dest: audioDest };
          // Combine video + audio tracks
          const tracks = [
            ...videoStream.getVideoTracks(),
            ...audioDest.stream.getAudioTracks(),
          ];
          combinedStream = new MediaStream(tracks);
        } else {
          combinedStream = videoStream;
        }
      } catch {
        // Audio capture failed — record video only
        combinedStream = videoStream;
      }

      const mimeType = getSupportedMime();
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 5_000_000, // 5 Mbps
      });

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Build blob and trigger download
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `soundscape-${Date.now()}.webm`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        chunksRef.current = [];
      };

      recorder.start(1000); // Collect data every second
      recorderRef.current = recorder;

      startTimeRef.current = Date.now();
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      setRecording(true);
    } catch (err) {
      console.warn('[SoundScape] Recording failed:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Disconnect audio routing nodes to prevent leak
    const { gain, dest } = audioNodesRef.current;
    if (gain) {
      try { gain.disconnect(); } catch { /* already disconnected */ }
    }
    if (dest) {
      try { dest.disconnect(); } catch { /* already disconnected */ }
    }
    audioNodesRef.current = { gain: null, dest: null };
    recorderRef.current = null;
    setRecording(false);
    setDuration(0);
  }, []);

  const toggleRecording = useCallback(() => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recording, startRecording, stopRecording]);

  // Expose toggle for keyboard handler via store (avoids fragile window global)
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__soundscapeToggleRecording = toggleRecording;
    return () => {
      delete (window as unknown as Record<string, unknown>).__soundscapeToggleRecording;
    };
  }, [toggleRecording]);

  if (!supported) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <button
      className={`record-btn${recording ? ' recording' : ''}`}
      onClick={toggleRecording}
      aria-label={recording ? `Stop recording (${formatDuration(duration)})` : 'Start recording video (key R)'}
      title={recording ? `Recording ${formatDuration(duration)} — click to stop` : 'Record video (R)'}
      style={recording ? {
        borderColor: '#ff3b3b',
        background: 'rgba(255, 59, 59, 0.15)',
      } : {
        borderColor: colors.primary + '40',
      }}
    >
      {recording ? (
        <>
          <span className="record-dot" aria-hidden="true" />
          <span className="record-time">{formatDuration(duration)}</span>
        </>
      ) : (
        <>⏺ Rec</>
      )}
    </button>
  );
}
