// ============================================================
// MissionTile — large interactive mission card
// ============================================================

import React from 'react';
import { Check } from 'lucide-react';

interface MissionTileProps {
  title: string;
  icon: string;
  xpReward: number;
  isComplete: boolean;
  timestamp?: string;
  children?: React.ReactNode; // extra controls (reading buttons, math button)
  onComplete?: () => void;    // simple done button (bed/helper)
  color: string;              // Tailwind gradient classes
  xpClass?: string;           // Tailwind class for +XP label
}

export function MissionTile({
  title,
  icon,
  xpReward,
  isComplete,
  timestamp,
  children,
  onComplete,
  color,
  xpClass = 'text-yellow-300',
}: MissionTileProps) {
  return (
    <div
      className={`
        relative rounded-3xl p-4 flex flex-col gap-3 overflow-hidden
        transition-all duration-300 select-none
        ${isComplete
          ? 'bg-green-500/30 border-2 border-green-400 shadow-lg shadow-green-500/20'
          : `${color} border-2 border-white/20 shadow-xl`
        }
      `}
    >
      {/* Completed overlay */}
      {isComplete && (
        <div className="absolute top-3 right-3">
          <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-4xl leading-none">{icon}</span>
        <div>
          <h3 className="font-black text-white text-lg leading-tight" style={{ fontFamily: 'Fredoka One, cursive' }}>
            {title}
          </h3>
          <div className={`${xpClass} text-sm font-bold`}>+{xpReward} XP</div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        {isComplete && timestamp ? (
          <div className="text-green-300 text-sm font-semibold">
            ✓ Marked as done at {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        ) : children ? (
          children
        ) : onComplete ? (
          <button
            onClick={onComplete}
            className="w-full py-3 bg-white/90 text-gray-800 font-black text-xl rounded-2xl 
                       active:scale-95 transition-transform shadow-lg hover:bg-white"
            style={{ fontFamily: 'Fredoka One, cursive' }}
          >
            Mark as Done ✓
          </button>
        ) : null}
      </div>
    </div>
  );
}
