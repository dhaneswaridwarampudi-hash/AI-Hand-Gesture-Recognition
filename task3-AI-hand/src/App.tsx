import { useEffect, useRef, useState } from 'react';
import { Camera, Power, Loader2, Hand, Activity, Github, Zap } from 'lucide-react';
import { useHandLandmarker } from '@/hooks/useHandLandmarker';
import { classifyGesture, type GestureName, type GestureResult } from '@/lib/gestures';
import { HandOverlay } from '@/components/HandOverlay';
import { GestureCard } from '@/components/GestureCard';

const VIDEO_W = 1280;
const VIDEO_H = 720;

const GESTURES: GestureName[] = ['Open Hand', 'Fist', 'Thumbs Up', 'Victory'];

export default function App() {
  const { ready, error, running, start, stop, videoRef, setOnFrame } = useHandLandmarker();
  const [gesture, setGesture] = useState<GestureResult>({ name: 'Unknown', confidence: 0 });
  const [landmarks, setLandmarks] = useState<GestureResult['name'] extends never ? never : any>(null);
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastFpsTime = useRef(performance.now());

  setOnFrame((d) => {
    frameCount.current++;
    const now = performance.now();
    if (now - lastFpsTime.current > 1000) {
      setFps(Math.round((frameCount.current * 1000) / (now - lastFpsTime.current)));
      frameCount.current = 0;
      lastFpsTime.current = now;
    }
    if (d.landmarks) {
      setLandmarks(d.landmarks);
      setGesture(classifyGesture(d.landmarks));
    } else {
      setLandmarks(null);
      setGesture({ name: 'Unknown', confidence: 0 });
    }
  });

  const activeName = gesture.name;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/60 backdrop-blur-sm sticky top-0 z-20 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-lg shadow-sky-500/30">
              <Hand className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">GestureAI</h1>
              <p className="text-xs text-slate-400">Real-time hand gesture recognition</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${ready ? 'bg-emerald-400 animate-pulse-slow' : 'bg-slate-600'}`} />
                {ready ? 'Model loaded' : 'Loading model...'}
              </span>
              {running && (
                <span className="flex items-center gap-1.5 text-sky-400">
                  <Activity className="h-3.5 w-3.5" />
                  {fps} FPS
                </span>
              )}
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        {/* Video panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover -scale-x-100"
              playsInline
              muted
            />
            <HandOverlay landmarks={landmarks} width={VIDEO_W} height={VIDEO_H} />

            {/* Idle / loading overlay */}
            {!running && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm">
                {ready ? (
                  <button
                    onClick={start}
                    className="group flex flex-col items-center gap-4"
                  >
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 shadow-xl shadow-sky-500/40 group-hover:scale-105 transition-transform">
                      <Camera className="h-8 w-8 text-white" />
                    </span>
                    <span className="text-sm font-medium text-slate-200">Click to start camera</span>
                  </button>
                ) : error ? (
                  <div className="text-center px-6">
                    <p className="text-red-400 font-medium mb-2">Failed to load</p>
                    <p className="text-xs text-slate-400 max-w-xs">{error}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                    <p className="text-sm">Loading AI hand model...</p>
                  </div>
                )}
              </div>
            )}

            {/* Top-left badge */}
            {running && (
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-slate-950/70 backdrop-blur-md px-3 py-1.5 text-xs font-medium border border-slate-700/50">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </div>
            )}

            {/* Bottom gesture banner */}
            {running && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-fade-in">
                <div className="rounded-full bg-slate-950/80 backdrop-blur-md px-6 py-2.5 border border-slate-700/50 flex items-center gap-3">
                  {activeName !== 'Unknown' ? (
                    <>
                      <Zap className="h-4 w-4 text-sky-400" />
                      <span className="text-sm font-semibold text-white">{activeName}</span>
                      <span className="text-xs text-slate-400">{Math.round(gesture.confidence * 100)}%</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">Show a gesture to the camera</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {!running ? (
              <button
                onClick={start}
                disabled={!ready}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Camera className="h-4 w-4" />
                Start Camera
              </button>
            ) : (
              <button
                onClick={stop}
                className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <Power className="h-4 w-4 text-red-400" />
                Stop Camera
              </button>
            )}
            {error && (
              <span className="text-xs text-red-400">{error}</span>
            )}
          </div>

          {/* How it works */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">How it works</h3>
            <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-400">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-bold">1</span>
                  Detect
                </div>
                <p>MediaPipe Hand Landmarker tracks 21 3D landmarks on your hand in real time.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-bold">2</span>
                  Classify
                </div>
                <p>Each finger's extension state is computed from landmark geometry to identify the gesture.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-bold">3</span>
                  Display
                </div>
                <p>The recognized gesture and confidence score are shown live on screen.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gesture panel */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 mb-1">Recognizable Gestures</h2>
            <p className="text-xs text-slate-500">Make one of these gestures to the camera</p>
          </div>
          <div className="space-y-3">
            {GESTURES.map((g) => (
              <GestureCard
                key={g}
                gesture={g}
                confidence={gesture.confidence}
                active={activeName === g}
              />
            ))}
          </div>
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Detected hand</span>
              <span className="text-slate-200 font-medium capitalize">
                {landmarks ? 'Tracking' : 'None'}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-500">
          Built with MediaPipe Hand Landmarker &middot; Runs entirely in your browser
        </div>
      </footer>
    </div>
  );
}
