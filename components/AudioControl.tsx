import React from 'react';
import { Volume2, VolumeX, Activity, Waves } from 'lucide-react';

interface AudioControlProps {
  isPlaying: boolean;
  toggleAudio: () => void;
  volume: number;
  setVolume: (val: number) => void;
}

const AudioControl: React.FC<AudioControlProps> = ({ isPlaying, toggleAudio, volume, setVolume }) => {
  return (
    <footer className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:border-white/20">
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button 
          onClick={toggleAudio}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isPlaying ? 'bg-violet-600 text-white shadow-violet-500/30' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
        >
          {isPlaying ? <Waves size={20} /> : <VolumeX size={20} />}
        </button>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-wide">Brown Noise Generator</span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className={isPlaying ? "text-violet-400 animate-pulse font-medium" : ""}>
               {isPlaying ? "Transmitting..." : "Standby"}
            </span>
            {isPlaying && <Activity size={12} className="text-violet-400 animate-pulse" />}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto bg-slate-900/50 p-2 rounded-lg border border-white/5">
        <button onClick={() => setVolume(0)} className="text-slate-500 hover:text-slate-300">
            <VolumeX size={16} />
        </button>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={volume} 
          onChange={(e) => setVolume(parseInt(e.target.value))}
          className="w-full md:w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400"
        />
        <button onClick={() => setVolume(100)} className="text-slate-500 hover:text-slate-300">
            <Volume2 size={16} />
        </button>
      </div>
    </footer>
  );
};

export default AudioControl;