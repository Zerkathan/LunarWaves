import React, { useState } from 'react';
import { Coffee, Heart, Star, X } from 'lucide-react';

const SupportWidget: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="relative bg-gradient-to-r from-violet-900/20 via-purple-900/30 to-violet-900/20 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/10 to-violet-500/5 pointer-events-none"></div>
        
        {/* Close button */}
        <button 
          onClick={() => setIsDismissed(true)}
          className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side - Message */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Star className="text-yellow-400" size={20} />
              <h3 className="text-lg font-bold text-white tracking-wide">
                Support Lunar Waves
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Enjoying your cosmic journey? Help us keep the waves flowing and unlock new features for the community.
            </p>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex gap-3">
            <a
              href="https://ko-fi.com" // Replace with your actual Ko-fi or donation link
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-violet-500/30"
            >
              <Coffee size={18} />
              <span>Buy us a Coffee</span>
            </a>

            <a
              href="#" // Replace with sponsor/premium link if available
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-medium rounded-xl transition-all"
            >
              <Heart size={18} className="text-pink-400" />
              <span>Become a Sponsor</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportWidget;

