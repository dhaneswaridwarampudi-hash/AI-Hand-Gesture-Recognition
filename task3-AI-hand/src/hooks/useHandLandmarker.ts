import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface DetectionFrame {
  landmarks: NormalizedLandmark[] | null;
  handedness: string | null;
}

export function useHandLandmarker() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [latest, setLatest] = useState<DetectionFrame>({ landmarks: null, handedness: null });
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const onFrameRef = useRef<((d: DetectionFrame) => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        const lm = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });
        if (cancelled) {
          lm.close();
          return;
        }
        landmarkerRef.current = lm;
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load hand model');
      }
    })();
    return () => {
      cancelled = true;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const lm = landmarkerRef.current;
    if (!video || !lm || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    const ts = performance.now();
    let res: DetectionFrame = { landmarks: null, handedness: null };
    try {
      const out = lm.detectForVideo(video, ts);
      if (out.landmarks && out.landmarks.length > 0) {
        res = {
          landmarks: out.landmarks[0],
          handedness: out.handednesses[0]?.[0]?.categoryName ?? null,
        };
      }
    } catch {
      // transient detection errors are ignored
    }
    setLatest(res);
    onFrameRef.current?.(res);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(async () => {
    if (!landmarkerRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      });
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setRunning(true);
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not access webcam');
    }
  }, [loop]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const video = videoRef.current;
    if (video && video.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    setRunning(false);
    setLatest({ landmarks: null, handedness: null });
  }, []);

  useEffect(() => () => stop(), [stop]);

  const setOnFrame = useCallback((cb: (d: DetectionFrame) => void) => {
    onFrameRef.current = cb;
  }, []);

  return { ready, error, running, latest, start, stop, videoRef, setOnFrame };
}
