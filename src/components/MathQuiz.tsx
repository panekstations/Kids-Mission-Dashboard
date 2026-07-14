// ============================================================
// MathQuiz — 10-question math quiz modal
// ============================================================

import React, { useState, useCallback } from 'react';
import type { MathDifficulty, QuizState } from '../types';
import { generateMathQuestions, MATH_QUIZ_QUESTION_COUNT } from '../utils/storage';
import { X } from 'lucide-react';

interface MathQuizProps {
  difficulty: MathDifficulty;
  onComplete: (score: number) => void;
  onClose: () => void;
}

const PASS_THRESHOLD = Math.ceil(MATH_QUIZ_QUESTION_COUNT * 0.6); // same 60% as old 3/5

export function MathQuiz({ difficulty, onComplete, onClose }: MathQuizProps) {
  const [quiz] = useState<QuizState>(() => ({
    questions: generateMathQuestions(difficulty),
    currentIndex: 0,
    answers: Array(MATH_QUIZ_QUESTION_COUNT).fill(null),
    isComplete: false,
    score: 0,
  }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState<(number | null)[]>(Array(MATH_QUIZ_QUESTION_COUNT).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentQ = quiz.questions[currentIndex];
  const lastQuestionIndex = MATH_QUIZ_QUESTION_COUNT - 1;

  const handleAnswer = useCallback((value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = num;
    setAnswers(newAnswers);
    setInputValue(value);
  }, [answers, currentIndex]);

  const handleSubmit = useCallback(() => {
    if (inputValue === '') return;
    setSubmitted(true);
    setTimeout(() => {
      const newAnswers = [...answers];
      if (currentIndex < lastQuestionIndex) {
        setCurrentIndex(currentIndex + 1);
        setInputValue('');
        setSubmitted(false);
      } else {
        const score = quiz.questions.reduce((total, q, i) =>
          total + (newAnswers[i] === q.answer ? 1 : 0), 0
        );
        setFinalScore(score);
        setIsComplete(true);
      }
    }, 800);
  }, [inputValue, answers, currentIndex, quiz.questions, lastQuestionIndex]);

  const isCurrentCorrect = submitted && parseInt(inputValue, 10) === currentQ.answer;
  const isPerfect = finalScore === MATH_QUIZ_QUESTION_COUNT;

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 max-w-md w-full text-center border-2 border-purple-400 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="text-7xl mb-4">{isPerfect ? '🏆' : finalScore >= PASS_THRESHOLD ? '⭐' : '💪'}</div>
          <h2 className="text-white font-black text-3xl mb-2" style={{ fontFamily: 'Fredoka One, cursive' }}>
            {isPerfect ? 'PERFECT!' : 'QUIZ DONE!'}
          </h2>
          <div className="text-purple-200 text-xl mb-6">
            You got <span className="text-yellow-300 font-black text-2xl">{finalScore} / {MATH_QUIZ_QUESTION_COUNT}</span> correct!
          </div>

          {/* Question review */}
          <div className="space-y-2 mb-6">
            {quiz.questions.map((q, i) => (
              <div key={i} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2">
                <span className="text-white font-bold">{q.display}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/70">{answers[i] ?? '?'}</span>
                  <span>{answers[i] === q.answer ? '✅' : `❌ (${q.answer})`}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-yellow-300 font-black text-lg mb-4">
            +{10 + (isPerfect ? 10 : 0)} XP earned!
          </div>

          <button
            onClick={() => onComplete(finalScore)}
            className="w-full py-4 bg-yellow-400 text-gray-900 font-black text-2xl rounded-2xl 
                       active:scale-95 transition-transform"
            style={{ fontFamily: 'Fredoka One, cursive' }}
          >
            AWESOME! 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 max-w-sm w-full border-2 border-purple-400 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-2xl" style={{ fontFamily: 'Fredoka One, cursive' }}>
            🧮 MATH TIME!
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="text-center text-white/60 text-sm mb-2">
          Question {currentIndex + 1} of {MATH_QUIZ_QUESTION_COUNT}
        </div>
        <div className="flex gap-1.5 justify-center mb-6 flex-wrap">
          {quiz.questions.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < currentIndex ? 'bg-green-400' :
                i === currentIndex ? 'bg-yellow-400 scale-125' :
                'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Question */}
        <div className={`
          text-center py-8 px-4 rounded-2xl mb-6 border-2 transition-all
          ${submitted
            ? isCurrentCorrect
              ? 'bg-green-500/30 border-green-400'
              : 'bg-red-500/30 border-red-400'
            : 'bg-white/10 border-white/20'
          }
        `}>
          <div className="text-white font-black text-5xl" style={{ fontFamily: 'Fredoka One, cursive' }}>
            {currentQ.display}
          </div>
          {submitted && (
            <div className="mt-3 text-xl">
              {isCurrentCorrect
                ? '✅ Correct!'
                : `❌ Answer: ${currentQ.answer}`
              }
            </div>
          )}
        </div>

        {/* Number pad */}
        {!submitted && (
          <>
            <div className="bg-white/10 rounded-2xl px-4 py-3 text-center text-white text-3xl font-black mb-4 min-h-[60px]">
              {inputValue || <span className="text-white/30">?</span>}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button
                  key={n}
                  onClick={() => handleAnswer(inputValue + n.toString())}
                  className="py-4 bg-white/20 hover:bg-white/30 text-white font-black text-2xl 
                             rounded-2xl active:scale-95 transition-all"
                  style={{ fontFamily: 'Fredoka One, cursive' }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setInputValue(inputValue.slice(0, -1))}
                className="py-4 bg-red-500/30 hover:bg-red-500/50 text-white font-black text-lg 
                           rounded-2xl active:scale-95 transition-all"
              >
                ⌫
              </button>
              <button
                onClick={() => handleAnswer(inputValue + '0')}
                className="py-4 bg-white/20 hover:bg-white/30 text-white font-black text-2xl 
                           rounded-2xl active:scale-95 transition-all"
                style={{ fontFamily: 'Fredoka One, cursive' }}
              >
                0
              </button>
              <button
                onClick={() => handleAnswer('-' + inputValue.replace('-', ''))}
                className="py-4 bg-white/20 hover:bg-white/30 text-white font-bold text-xl
                           rounded-2xl active:scale-95 transition-all"
              >
                ±
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!inputValue}
              className="w-full py-4 bg-yellow-400 disabled:opacity-40 text-gray-900 font-black 
                         text-2xl rounded-2xl active:scale-95 transition-transform"
              style={{ fontFamily: 'Fredoka One, cursive' }}
            >
              CHECK! ✓
            </button>
          </>
        )}
      </div>
    </div>
  );
}
