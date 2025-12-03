import React from 'react';

interface ScrollingMarqueeProps {
  text: string;
  isActive: boolean;
}

const ScrollingMarquee: React.FC<ScrollingMarqueeProps> = ({ text, isActive }) => {
  return (
    <div className="relative overflow-hidden w-full max-w-[200px] sm:max-w-[300px] h-6 mask-linear-fade">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
        .paused {
          animation-play-state: paused;
        }
        /* Fade edges */
        .mask-linear-fade {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
      
      <div className={`whitespace-nowrap flex gap-8 ${isActive ? 'animate-scroll' : 'paused'}`}>
        {/* Duplicate content for seamless loop */}
        <span className="text-sm font-space-mono text-violet-200 tracking-wider">
          {text}
        </span>
        <span className="text-sm font-space-mono text-violet-200 tracking-wider" aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
};

export default ScrollingMarquee;
