import React from 'react';
import { X, Play, Music, Radio, Trash2 } from 'lucide-react';
import { useAudioContext } from '../contexts/AudioContext';

interface PlaylistPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlaylistPanel: React.FC<PlaylistPanelProps> = ({ isOpen, onClose }) => {
  const { playlist, currentTrack, playTrack, removeTrack, isPlaying } = useAudioContext();

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-24 left-0 md:left-4 w-72 bg-slate-900/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 flex flex-col max-h-[400px]">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10 shrink-0">
        <h3 className="text-xs font-bold text-violet-300 uppercase tracking-widest flex items-center gap-2">
            <Music size={14} /> Playlist
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-1">
        {playlist.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs italic">
                No tracks loaded.
            </div>
        )}
        
        {playlist.map((track, index) => {
          const isActive = currentTrack?.id === track.id;
          return (
            <div 
              key={track.id}
              className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-all group ${
                isActive 
                  ? 'bg-violet-600/20 border border-violet-500/40' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              {/* Play Click Area */}
              <button
                onClick={() => playTrack(index)}
                className="flex-1 flex items-center gap-3 text-left overflow-hidden outline-none"
              >
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'
                }`}>
                    {isActive && isPlaying ? (
                        <div className="flex gap-0.5 items-end h-3">
                            <div className="w-0.5 bg-white h-full animate-[pulse_0.6s_ease-in-out_infinite]"></div>
                            <div className="w-0.5 bg-white h-2/3 animate-[pulse_0.8s_ease-in-out_infinite]"></div>
                            <div className="w-0.5 bg-white h-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                        </div>
                    ) : (
                        <Play size={10} fill="currentColor" />
                    )}
                </div>
                
                <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${isActive ? 'text-violet-200' : 'text-slate-300'}`}>
                        {track.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                        {track.id.startsWith('default') ? <Radio size={10} /> : null}
                        {track.artist}
                    </div>
                </div>
              </button>

              {/* Delete Action */}
              <button 
                onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
                className="p-1.5 text-slate-600 hover:text-rose-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-rose-900/20"
                title="Remove Track"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-slate-500 text-center shrink-0">
         {playlist.length} Tracks • {playlist.filter(t => t.id.startsWith('local')).length} Uploaded
      </div>
    </div>
  );
};

export default PlaylistPanel;