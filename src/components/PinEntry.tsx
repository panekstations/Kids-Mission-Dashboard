// ============================================================
// PinEntry — parent admin PIN unlock screen
// ============================================================

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { getTheme } from '../data/themes';
import { X } from 'lucide-react';

interface PinEntryProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinEntry({ onSuccess, onCancel }: PinEntryProps) {
  const { state } = useApp();
  const theme = getTheme(state.settings.theme);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === state.settings.parentPin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 800);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
         style={{ background: theme.adminBackground }}>
      <div className="bg-white/10 backdrop-blur rounded-3xl p-8 max-w-xs w-full border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-black text-2xl" style={{ fontFamily: 'Fredoka One, cursive' }}>
            🔒 Parent Mode
          </h2>
          <button onClick={onCancel} className="text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-white/60 text-sm text-center mb-6">Enter your PIN to continue</p>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                error ? 'border-red-400 bg-red-400' :
                pin.length > i ? '' :
                'border-white/40'
              }`}
              style={
                !error && pin.length > i
                  ? { borderColor: theme.accent, backgroundColor: theme.accent }
                  : undefined
              }
            />
          ))}
        </div>

        {error && (
          <div className="text-red-400 text-center text-sm mb-4 font-bold">Wrong PIN!</div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button
              key={n}
              onClick={() => handleDigit(String(n))}
              className="py-4 bg-white/10 hover:bg-white/20 text-white font-black text-2xl 
                         rounded-2xl active:scale-95 transition-all"
              style={{ fontFamily: 'Fredoka One, cursive' }}
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="py-4 bg-white/10 hover:bg-white/20 text-white font-black text-2xl 
                       rounded-2xl active:scale-95 transition-all"
            style={{ fontFamily: 'Fredoka One, cursive' }}
          >
            0
          </button>
          <button
            onClick={() => setPin(pin.slice(0, -1))}
            className="py-4 bg-red-500/20 hover:bg-red-500/40 text-white font-black text-lg 
                       rounded-2xl active:scale-95 transition-all"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
