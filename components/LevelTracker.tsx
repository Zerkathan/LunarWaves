import React from 'react';
import { Trophy, Star } from 'lucide-react';

interface LevelTrackerProps {
  completedCount: number;
}

const LevelTracker: React.FC<LevelTrackerProps> = ({ completedCount }) => {
  // Logic for leveling up
  // Level 1: 0-2 tasks
  // Level 2: 3-5 tasks
  // Level 3: 6-9 tasks
  // Level 4: 10-14 tasks
  // Level 5: 15+ tasks
  
  const getLevelInfo = (count: number) => {
    if (count < 3) return { level: 1, max: 3, title: "Novice", char: "🥚" }; // Egg
    if (count < 6) return { level: 2, max: 6, title: "Apprentice", char: "🐣" }; // Chick
    if (count < 10) return { level: 3, max: 10, title: "Explorer", char: "🐢" }; // Turtle
    if (count < 15) return { level: 4, max: 15, title: "Hunter", char: "🦊" }; // Fox
    return { level: 5, max: 100, title: "Master", char: "🐉" }; // Dragon
  };

  const { level, max, title, char } = getLevelInfo(completedCount);
  
  // Calculate progress bar percentage
  // If level 1 (0 to 3), and count is 1. Progress is 33%.
  // Need to calculate progress relative to the current bracket.
  
  let progress = 0;
  let prevMax = 0;
  
  if (level === 1) {
    progress = (completedCount / max) * 100;
  } else if (level === 2) {
    prevMax = 3;
    progress = ((completedCount - prevMax) / (max - prevMax)) * 100;
  } else if (level === 3) {
    prevMax = 6;
    progress = ((completedCount - prevMax) / (max - prevMax)) * 100;
  } else if (level === 4) {
    prevMax = 10;
    progress = ((completedCount - prevMax) / (max - prevMax)) * 100;
  } else {
    progress = 100;
  }

  return (
    <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm flex items-center gap-4 min-w-[200px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Character Container */}
      <div className="relative group">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-2xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          {char}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-[10px] font-bold text-slate-900 px-1.5 rounded-full border border-slate-900">
          {level}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-end mb-1">
          <span className="text-amber-200 text-xs font-bold uppercase tracking-wide">{title}</span>
          <span className="text-slate-500 text-[10px] font-mono">{completedCount} / {level === 5 ? '∞' : max} XP</span>
        </div>
        
        {/* Progress Bar Track */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          {/* Progress Bar Fill */}
          <div 
            className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LevelTracker;