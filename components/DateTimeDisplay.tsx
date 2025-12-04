import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

const DateTimeDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="bg-gradient-to-r from-slate-900/40 via-slate-900/60 to-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
        {/* Time Display */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Clock className="text-violet-400" size={24} />
          <div className="font-mono text-5xl font-bold tracking-wider text-white drop-shadow-lg">
            {formatTime(currentTime)}
          </div>
        </div>
        
        {/* Date Display */}
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Calendar size={16} />
          <div className="text-sm font-medium tracking-wide">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Decorative line */}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
      </div>
    </div>
  );
};

export default DateTimeDisplay;

