import { Hand, ThumbsUp, Circle, HandMetal, HelpCircle } from 'lucide-react';
import type { GestureName } from '@/lib/gestures';

const GESTURE_META: Record<GestureName, { icon: typeof Hand; color: string; desc: string }> = {
  'Open Hand': { icon: Hand, color: 'sky', desc: 'All five fingers extended' },
  'Fist': { icon: Circle, color: 'amber', desc: 'All fingers curled in' },
  'Thumbs Up': { icon: ThumbsUp, color: 'emerald', desc: 'Thumb raised, fingers curled' },
  'Victory': { icon: HandMetal, color: 'violet', desc: 'Index and middle finger raised' },
  'Unknown': { icon: HelpCircle, color: 'slate', desc: 'No recognized gesture' },
};

interface Props {
  gesture: GestureName;
  confidence: number;
  active: boolean;
}

export function GestureCard({ gesture, confidence, active }: Props) {
  const meta = GESTURE_META[gesture];
  const Icon = meta.icon;
  const color = meta.color;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
        active
          ? `border-${color}-400/60 bg-${color}-500/10 shadow-lg shadow-${color}-500/20`
          : 'border-slate-700/50 bg-slate-800/30 opacity-50'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            active ? `bg-${color}-500/20 text-${color}-300` : 'bg-slate-700/40 text-slate-500'
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className={`font-semibold ${active ? `text-${color}-200` : 'text-slate-400'}`}>
            {gesture}
          </div>
          <div className="text-xs text-slate-500">{meta.desc}</div>
        </div>
      </div>
      {active && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Confidence</span>
            <span>{Math.round(confidence * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
            <div
              className={`h-full rounded-full bg-${color}-400 transition-all duration-200`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
