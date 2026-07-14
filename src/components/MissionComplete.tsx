// ============================================================
// MissionComplete — celebration overlay when all 4 done
// ============================================================

import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { getTodaysJoke } from '../data/jokes';

interface MissionCompleteProps {
  soundEnabled: boolean;
  onDismiss: () => void;
}

export function MissionComplete({ soundEnabled: _, onDismiss }: MissionCompleteProps) {
  const { todayRecord, state, today } = useApp();
  const [showAnswer, setShowAnswer] = useState(false);
  const joke = getTodaysJoke(today);

  // Stable star positions — avoid layout flash on every parent re-render
  const stars = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 7) % 100}%`,
        top: `${(i * 23 + 11) % 100}%`,
        delay: `${(i % 5) * 0.4}s`,
      })),
    [],
  );

  // Trigger confetti
  useEffect(() => {
    let mounted = true;
    const fireConfetti = async () => {
      try {
        const confetti = (await import('canvas-confetti')).default;
        if (!mounted) return;
        // Burst from both sides
        confetti({ particleCount: 100, spread: 70, origin: { x: 0.2, y: 0.6 } });
        setTimeout(() => {
          if (!mounted) return;
          confetti({ particleCount: 100, spread: 70, origin: { x: 0.8, y: 0.6 } });
        }, 300);
        setTimeout(() => {
          if (!mounted) return;
          confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.4 } });
        }, 600);
      } catch {
        // confetti optional
      }
    };
    fireConfetti();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10"
         style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute text-2xl animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              opacity: 0.5,
            }}
          >
            ⭐
          </div>
        ))}
      </div>

      {/* Trophy */}
      <div className="text-8xl mb-2 animate-bounce">🏆</div>

      {/* Title */}
      <h1 className="text-white font-black text-4xl text-center mb-1"
          style={{ fontFamily: 'Fredoka One, cursive', textShadow: '0 0 20px rgba(251,191,36,0.8)' }}>
        MISSION COMPLETE!
      </h1>
      <div className="text-yellow-300 text-xl font-bold mb-6">AMAZING WORK TODAY! 🎉</div>

      {/* Stats */}
      <div className="flex gap-6 mb-6">
        <div className="text-center bg-white/10 rounded-2xl px-6 py-4">
          <div className="text-yellow-400 text-3xl font-black">{todayRecord.xpEarned}</div>
          <div className="text-white/70 text-sm">XP Earned</div>
        </div>
        <div className="text-center bg-white/10 rounded-2xl px-6 py-4">
          <div className="text-orange-400 text-3xl font-black">{state.currentStreak}</div>
          <div className="text-white/70 text-sm">Day Streak</div>
        </div>
        <div className="text-center bg-white/10 rounded-2xl px-6 py-4">
          <div className="text-green-400 text-3xl font-black">${todayRecord.allowanceEarned.toFixed(2)}</div>
          <div className="text-white/70 text-sm">Earned Today</div>
        </div>
      </div>

      {/* Joke of the day */}
      <div className="bg-white/10 rounded-2xl p-5 max-w-sm w-full text-center border border-white/20">
        <div className="text-white/60 text-sm mb-2">😄 JOKE OF THE DAY</div>
        <div className="text-white font-bold text-base mb-3">{joke.question}</div>
        {showAnswer ? (
          <div className="text-yellow-300 font-bold">{joke.answer}</div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="px-6 py-2 bg-yellow-400 text-gray-900 font-black rounded-xl active:scale-95 transition-transform"
          >
            Show Answer!
          </button>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-black rounded-2xl
                   active:scale-95 transition-all border border-white/30"
        style={{ fontFamily: 'Fredoka One, cursive' }}
      >
        View My Missions ✓
      </button>
    </div>
  );
}
