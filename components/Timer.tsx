import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { TimerMode } from '../types';

interface TimerProps {
  onTimerComplete?: () => void;
}

const Timer: React.FC<TimerProps> = ({ onTimerComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (onTimerComplete) onTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onTimerComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === TimerMode.FOCUS ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === TimerMode.FOCUS ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-8 md:p-12 text-center max-w-md w-full mx-auto relative overflow-hidden group rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-violet-600 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>

      <div className="relative z-10">
        <p className="text-violet-300 text-sm tracking-[0.2em] mb-4 uppercase font-bold">
          {mode === TimerMode.FOCUS ? 'Focus Mode' : 'Break Mode'}
        </p>

        <div className={`text-7xl md:text-8xl font-bold mb-8 text-white tabular-nums tracking-tighter drop-shadow-lg transition-colors duration-500 ${timeLeft === 0 ? 'text-green-400' : ''}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 shadow-lg hover:-translate-y-1 ${isActive ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/30'} text-white`}
          >
            {isActive ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all duration-300 shadow-lg hover:-translate-y-1 shadow-slate-900/30"
          >
            <RotateCcw />
          </button>
        </div>

        <div className="flex justify-center gap-2">
          <button 
            onClick={() => switchMode(TimerMode.FOCUS)}
            className={`text-xs px-3 py-1 rounded border transition-colors ${mode === TimerMode.FOCUS ? 'border-violet-500 bg-violet-500/20 text-white' : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-white'}`}
          >
            POMODORO (25)
          </button>
          <button 
            onClick={() => switchMode(TimerMode.BREAK)}
            className={`text-xs px-3 py-1 rounded border transition-colors ${mode === TimerMode.BREAK ? 'border-violet-500 bg-violet-500/20 text-white' : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-white'}`}
          >
            BREAK (5)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timer;