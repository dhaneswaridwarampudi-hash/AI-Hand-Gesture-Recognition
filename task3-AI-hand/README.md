# GestureAI — Real-Time Hand Gesture Recognition

A browser-based AI hand gesture recognition system that uses your webcam to detect and classify four basic hand gestures in real time:

- ✋ **Open Hand** — all five fingers extended
- ✊ **Fist** — all fingers curled in
- 👍 **Thumbs Up** — thumb raised, fingers curled
- ✌️ **Victory / Peace** — index and middle finger raised

## Technology

| Layer | Technology |
|-------|-----------|
| Hand tracking | [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) — `HandLandmarker` model |
| Gesture classification | Custom geometric heuristics on 21 3D hand landmarks |
| UI framework | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Build tool | Vite |

### How it works

1. **Detect** — MediaPipe's Hand Landmarker model tracks 21 normalized 3D landmarks on the hand in real time using the GPU.
2. **Classify** — For each finger, the app computes whether it is extended or curled by comparing the finger tip's position relative to the palm normal and the wrist. The thumb's state is determined by its distance from the index knuckle and its vertical orientation. These finger states are matched against gesture patterns.
3. **Display** — The recognized gesture name and a confidence score are shown live on screen, along with a skeleton overlay of the detected hand landmarks.

Everything runs entirely in the browser — no data is sent to any server.

## Getting Started

```bash
npm install
npm run dev
```

Open the app in your browser and click **Start Camera**. Allow webcam access, then make one of the four gestures to the camera.

## Project Structure

```
src/
├── App.tsx                  # Main application layout
├── components/
│   ├── HandOverlay.tsx      # Canvas overlay drawing hand skeleton
│   └── GestureCard.tsx      # Gesture info cards in the sidebar
├── hooks/
│   └── useHandLandmarker.ts # Webcam + MediaPipe hand detection hook
└── lib/
    └── gestures.ts          # Gesture classification logic
```

## Deliverables

- **GitHub repository** — this repository
- **Working demo** — run `npm run dev` and use a webcam
- **Technology explanation** — see the Technology section above
- **README documentation** — this file
