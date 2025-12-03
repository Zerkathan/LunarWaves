import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, X, CircleDot } from 'lucide-react';

type PhaseType = 'INHALE' | 'HOLD' | 'EXHALE' | 'HOLD_OUT';

interface BreathingPattern {
  name: string;
  phases: {
    type: PhaseType;
    duration: number; // seconds
    text: string;
    scale: number;
  }[];
}

const PATTERNS: BreathingPattern[] = [
  {
    name: "Box (4-4-4-4)",
    phases: [
      { type: 'INHALE', duration: 4, text: "Inhale", scale: 1.5 },
      { type: 'HOLD', duration: 4, text: "Hold", scale: 1.5 },
      { type: 'EXHALE', duration: 4, text: "Exhale", scale: 1.0 },
      { type: 'HOLD_OUT', duration: 4, text: "Hold", scale: 1.0 },
    ]
  },
  {
    name: "Zen (7-7-7)",
    phases: [
      { type: 'INHALE', duration: 7, text: "Inhale", scale: 1.5 },
      { type: 'HOLD', duration: 7, text: "Hold", scale: 1.5 },
      { type: 'EXHALE', duration: 7, text: "Exhale", scale: 1.0 },
    ]
  },
  {
    name: "Relax (4-7-8)",
    phases: [
      { type: 'INHALE', duration: 4, text: "Inhale", scale: 1.5 },
      { type: 'HOLD', duration: 7, text: "Hold", scale: 1.5 },
      { type: 'EXHALE', duration: 8, text: "Exhale", scale: 1.0 },
    ]
  }
];

const MeditateMode: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  // Settings
  const [selectedPatternIdx, setSelectedPatternIdx] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(180); // 3 minutes default
  
  // Runtime State
  const [timeLeft, setTimeLeft] = useState(180);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPattern = PATTERNS[selectedPatternIdx];
  const currentPhase = currentPattern.phases[currentPhaseIdx];

  // Handle Session Timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Handle Breathing Cycle
  useEffect(() => {
    if (!isActive) return;

    const runPhase = () => {
      const phase = currentPattern.phases[currentPhaseIdx];
      
      phaseTimeoutRef.current = setTimeout(() => {
        setCurrentPhaseIdx((prev) => (prev + 1) % currentPattern.phases.length);
      }, phase.duration * 1000);
    };

    runPhase();

    return () => {
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    };
  }, [isActive, currentPhaseIdx, currentPattern, selectedPatternIdx]);

  // Reset when pattern or duration changes
  const reset = () => {
    setIsActive(false);
    setTimeLeft(sessionDuration);
    setCurrentPhaseIdx(0);
  };

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatternIdx, sessionDuration]);


  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors border border-transparent hover:border-cyan-500/30 px-3 py-2 rounded-full"
      >
        <Wind size={14} />
        <span>Meditate</span>
      </button>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/60 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
      
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Wind size={12} /> Breathe Mode
        </h3>
        <button 
          onClick={() => { setIsOpen(false); setIsActive(false); }} 
          className="text-slate-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Breathing Circle Visualization */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        {/* Outer Rings */}
        <div className={`absolute border border-cyan-500/10 rounded-full transition-all duration-[3000ms] ease-in-out ${isActive ? 'w-48 h-48 opacity-100' : 'w-32 h-32 opacity-20'}`}></div>
        <div className={`absolute border border-cyan-500/20 rounded-full transition-all duration-[3000ms] ease-in-out delay-75 ${isActive ? 'w-40 h-40 opacity-100' : 'w-24 h-24 opacity-20'}`}></div>
        
        {/* Main Breathing Circle */}
        <div 
          className="w-24 h-24 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-full shadow-[0_0_40px_rgba(6,182,212,0.4)] flex items-center justify-center z-10 transition-all ease-in-out"
          style={{
            transform: isActive ? `scale(${currentPhase.scale})` : 'scale(1)',
            transitionDuration: isActive ? `${currentPhase.duration}s` : '0.5s'
          }}
        >
          <span className="text-white font-bold text-xs tracking-widest uppercase drop-shadow-md">
            {isActive ? currentPhase.text : "Ready"}
          </span>
        </div>
      </div>

      {/* Controls & Info */}
      <div className="w-full space-y-4">
        
        {/* Timer Display */}
        <div className="text-center">
          <span className={`text-3xl font-light tabular-nums ${timeLeft === 0 ? 'text-cyan-400' : 'text-slate-200'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Pattern Selector (Only when paused) */}
        {!isActive && (
           <div className="flex gap-2 justify-center text-xs">
             {PATTERNS.map((p, idx) => (
               <button
                 key={p.name}
                 onClick={() => setSelectedPatternIdx(idx)}
                 className={`px-3 py-1.5 rounded-lg border transition-all ${
                   selectedPatternIdx === idx 
                     ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200' 
                     : 'bg-slate-800/50 border-transparent text-slate-500 hover:border-slate-600'
                 }`}
               >
                 {p.name}
               </button>
             ))}
           </div>
        )}
        
        {!isActive && (
            <div className="flex gap-2 justify-center text-xs">
                {[60, 180, 300].map(sec => (
                    <button
                        key={sec}
                        onClick={() => setSessionDuration(sec)}
                        className={`px-2 py-1 rounded border transition-colors ${
                            sessionDuration === sec
                            ? 'border-slate-500 text-white'
                            : 'border-transparent text-slate-600 hover:text-slate-400'
                        }`}
                    >
                        {Math.floor(sec/60)}m
                    </button>
                ))}
            </div>
        )}

        {/* Main Action Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 font-bold text-sm shadow-lg hover:-translate-y-0.5 ${
              isActive 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-500/20'
            }`}
          >
            {isActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MeditateMode;