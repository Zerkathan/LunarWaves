import React from 'react';
import { CloudRain, Wind, Waves, Trees, Volume2, X, Moon } from 'lucide-react';
import { useAudioContext } from '../contexts/AudioContext';

interface AmbienceMixerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AmbienceMixer: React.FC<AmbienceMixerProps> = ({ isOpen, onClose }) => {
  const { layers, toggleLayer, updateLayerVolume, toggleZenMode, isPlaying } = useAudioContext();

  // Helper to get icon component
  const getIcon = (name: string, size: number) => {
    switch(name) {
      case 'CloudRain': return <CloudRain size={size} />;
      case 'Wind': return <Wind size={size} />;
      case 'Waves': return <Waves size={size} />;
      case 'Trees': return <Trees size={size} />;
      default: return <Volume2 size={size} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-24 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 w-64 bg-slate-900/90 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
        <h3 className="text-xs font-bold text-violet-300 uppercase tracking-widest">Ambience Mixer</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Zen Mode Control */}
      <button
        onClick={toggleZenMode}
        disabled={!isPlaying}
        className={`w-full mb-5 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 ${
          isPlaying 
            ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/30 hover:border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
            : 'bg-slate-800/50 text-slate-500 border border-white/5 cursor-default'
        }`}
      >
        <Moon size={14} className={isPlaying ? "animate-pulse" : ""} />
        {isPlaying ? "Zen Mode (Fade Music)" : "Zen Mode Active"}
      </button>

      <div className="space-y-4">
        {layers.map(layer => (
          <div key={layer.id} className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => toggleLayer(layer.id)}
                className={`flex items-center gap-2 text-xs font-medium transition-colors ${layer.isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {getIcon(layer.icon, 14)}
                <span>{layer.name}</span>
              </button>
              <div className={`w-2 h-2 rounded-full ${layer.isActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-slate-700'}`}></div>
            </div>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={layer.volume}
              onChange={(e) => updateLayerVolume(layer.id, parseFloat(e.target.value))}
              disabled={!layer.isActive}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer transition-all ${layer.isActive ? 'bg-slate-700 accent-cyan-400' : 'bg-slate-800 accent-slate-600'}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmbienceMixer;