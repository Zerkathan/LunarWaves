import React, { useState, useRef } from 'react';
import { Play, Pause, Upload, Sliders, Music2, Volume2, VolumeX, Smartphone, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { useAudioContext } from '../contexts/AudioContext';
import ScrollingMarquee from './ScrollingMarquee';
import AmbienceMixer from './AmbienceMixer';

const AudioControl: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    uploadTracks,
    mainVolume,
    setMainVolume,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat
  } = useAudioContext();

  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadTracks(files);
    }
  };

  const connectSpotify = () => {
    // Visual-only for now
    alert("Spotify Integration Coming Soon in v2.0");
  };

  return (
    <footer className="w-full max-w-5xl mx-auto relative">
      {/* Mixer Popover */}
      <AmbienceMixer isOpen={isMixerOpen} onClose={() => setIsMixerOpen(false)} />

      {/* Main Control Bar */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl transition-all hover:border-violet-500/30">

        {/* Left: Play Controls & Track Info */}
        <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden justify-center md:justify-start">

          <div className="flex items-center gap-2">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isShuffle ? 'text-violet-400 bg-violet-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              title="Shuffle"
            >
              <Shuffle size={16} />
            </button>

            {/* Prev */}
            <button
              onClick={prevTrack}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${currentTrack
                  ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-violet-500/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${repeatMode !== 'off' ? 'text-violet-400 bg-violet-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              title="Repeat"
            >
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          <div className="flex flex-col overflow-hidden min-w-[150px] hidden sm:flex">
            <div className="flex items-center gap-2 mb-1">
              <Music2 size={12} className="text-violet-400" />
              <span className="text-[10px] uppercase font-bold text-slate-500">Now Playing</span>
            </div>
            {currentTrack ? (
              <ScrollingMarquee
                text={`${currentTrack.title} - ${currentTrack.artist} • LUNAR WAVES • `}
                isActive={isPlaying}
              />
            ) : (
              <span className="text-sm text-slate-500 italic">No track loaded</span>
            )}
          </div>
        </div>

        {/* Center: Upload & Spotify */}
        <div className="flex gap-2 w-full md:w-auto justify-center">
          <input
            type="file"
            accept="audio/*"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 border border-white/5 rounded-full flex items-center gap-2 text-xs font-medium text-slate-300 transition-colors"
          >
            <Upload size={14} />
            Add Songs
          </button>
          <button
            onClick={connectSpotify}
            className="px-4 py-2 bg-green-900/20 hover:bg-green-900/30 border border-green-500/20 rounded-full flex items-center gap-2 text-xs font-medium text-green-400 transition-colors"
          >
            <Smartphone size={14} />
            Connect
          </button>
        </div>

        {/* Right: Volume & Mixer Trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end bg-slate-900/50 p-2 rounded-xl border border-white/5">
          {/* Main Volume */}
          <div className="flex items-center gap-2 mr-2">
            <button onClick={() => setMainVolume(0)} className="text-slate-500 hover:text-white">
              <VolumeX size={14} />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={mainVolume}
              onChange={(e) => setMainVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>

          <div className="w-px h-6 bg-slate-700 mx-1"></div>

          {/* Mixer Toggle */}
          <button
            onClick={() => setIsMixerOpen(!isMixerOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isMixerOpen ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'hover:bg-slate-700 text-slate-400 hover:text-white'}`}
          >
            <Sliders size={16} />
            <span className="text-xs font-bold">Mixer</span>
          </button>
        </div>

      </div>
    </footer>
  );
};

export default AudioControl;
