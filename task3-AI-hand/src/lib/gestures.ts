import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type GestureName = 'Open Hand' | 'Fist' | 'Thumbs Up' | 'Victory' | 'Unknown';

export interface GestureResult {
  name: GestureName;
  confidence: number;
}

interface FingerState {
  extended: boolean;
  curled: boolean;
}

const FINGER_TIPS = [8, 12, 16, 20];
const FINGER_PIPS = [6, 10, 14, 18];
const FINGER_MCPS = [5, 9, 13, 17];

function fingerStates(landmarks: NormalizedLandmark[]): FingerState[] {
  const wrist = landmarks[0];
  const palmNormal = cross(
    sub(landmarks[5], wrist),
    sub(landmarks[17], wrist)
  );

  return FINGER_TIPS.map((tip, i) => {
    const pip = landmarks[FINGER_PIPS[i]];
    const mcp = landmarks[FINGER_MCPS[i]];
    const tipToPip = sub(landmarks[tip], pip);
    const dotP = dot(tipToPip, palmNormal);
    const tipDistFromWrist = dist(landmarks[tip], wrist);
    const pipDistFromWrist = dist(pip, wrist);
    const extended = dotP > 0 && tipDistFromWrist > pipDistFromWrist * 1.1;
    return { extended, curled: !extended };
  });
}

function thumbState(landmarks: NormalizedLandmark[]): { extended: boolean; up: boolean } {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const indexMcp = landmarks[5];
  const pinkyMcp = landmarks[17];

  const palmWidth = dist(indexMcp, pinkyMcp);
  const tipToIndex = dist(thumbTip, indexMcp);
  const extended = tipToIndex > palmWidth * 0.8;

  const wristToTip = sub(thumbTip, wrist);
  const wristToMcp = sub(thumbMcp, wrist);
  const up = wristToTip.y < wristToMcp.y && thumbTip.y < thumbIp.y;

  return { extended, up };
}

export function classifyGesture(landmarks: NormalizedLandmark[]): GestureResult {
  const fingers = fingerStates(landmarks);
  const thumb = thumbState(landmarks);

  const extendedCount = fingers.filter((f) => f.extended).length;

  if (thumb.extended && thumb.up && fingers.every((f) => f.curled)) {
    return { name: 'Thumbs Up', confidence: 0.95 };
  }
  if (fingers[0].extended && fingers[1].extended && fingers[2].curled && fingers[3].curled) {
    return { name: 'Victory', confidence: 0.92 };
  }
  if (fingers.every((f) => f.extended) && thumb.extended) {
    return { name: 'Open Hand', confidence: 0.93 };
  }
  if (fingers.every((f) => f.curled) && !thumb.extended) {
    return { name: 'Fist', confidence: 0.9 };
  }
  if (fingers.every((f) => f.curled) && thumb.extended && !thumb.up) {
    return { name: 'Fist', confidence: 0.8 };
  }

  const conf = 0.4 + extendedCount * 0.08;
  return { name: 'Unknown', confidence: Math.min(conf, 0.6) };
}

function sub(a: NormalizedLandmark, b: NormalizedLandmark) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function dot(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
function cross(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}
function dist(a: NormalizedLandmark, b: NormalizedLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}
