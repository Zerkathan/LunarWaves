import React, { useState, useRef } from 'react';
import { Play, Pause, Upload, Sliders, Music2, Volume2, VolumeX, Smartphone, SkipForward, SkipBack, ListMusic, Radio, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { useAudioContext, PLAYLIST_CATEGORIES } from '../contexts/AudioContext';
import ScrollingMarquee from './ScrollingMarquee';
import AmbienceMixer from './AmbienceMixer';
import PlaylistPanel from './PlaylistPanel';

const AudioControl: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    uploadTracks,
    mainVolume,
    setMainVolume,
    currentCategory,
    setCategory,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat
  } = useAudioContext();

  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadTracks(files);
      setIsPlaylistOpen(true);
    }
  };

  const connectSpotify = () => {
    alert("Spotify Integration Coming Soon in v2.0");
  };

  return (
    <footer className="w-full max-w-5xl mx-auto relative">
      {/* Popovers */}
      <AmbienceMixer isOpen={isMixerOpen} onClose={() => setIsMixerOpen(false)} />
      <PlaylistPanel isOpen={isPlaylistOpen} onClose={() => setIsPlaylistOpen(false)} />

      {/* Category Selector Popover */}
      {showCategorySelector && (
        <div className="absolute bottom-full left-0 mb-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl min-w-[200px] z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-xs font-bold text-slate-500 uppercase px-2 py-1 mb-1">Select Ambience</div>
          {Object.keys(PLAYLIST_CATEGORIES).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setShowCategorySelector(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${currentCategory === cat
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-300 hover:bg-white/5'
                }`}
            >
              {cat}
              {currentCategory === cat && <div className="w-2 h-2 rounded-full bg-violet-400" />}
            </button>
          ))}
        </div>
      )}

      {/* Main Control Bar */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl transition-all hover:border-violet-500/30">

        {/* Left: Play Controls & Track Info */}
        <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
          {/* Controls Group */}
          <div className="flex items-center gap-2">
            {/* Shuffle Button */}
            <button
              onClick={toggleShuffle}
              className={`p-2 transition-colors hover:scale-110 ${isShuffle ? 'text-violet-400' : 'text-slate-500 hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle size={16} />
            </button>

            <button
              onClick={prevTrack}
              className="p-2 text-slate-400 hover:text-white transition-colors hover:scale-110"
              aria-label="Previous Track"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

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

            <button
              onClick={nextTrack}
              className="p-2 text-slate-400 hover:text-white transition-colors hover:scale-110"
              aria-label="Next Track"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>

            {/* Repeat Button */}
            <button
              onClick={toggleRepeat}
              className={`p-2 transition-colors hover:scale-110 ${repeatMode !== 'off' ? 'text-violet-400' : 'text-slate-500 hover:text-white'}`}
              title="Repeat"
            >
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          <div className="flex flex-col overflow-hidden min-w-[150px]">
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
              <span className="text-sm text-slate-500 italic">Select a track</span>
            )}
          </div>
        </div>

        {/* Center: Ambience Selector & Upload */}
        <div className="flex gap-2 w-full md:w-auto justify-center">
          <button
            onClick={() => setShowCategorySelector(!showCategorySelector)}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 border border-white/5 rounded-full flex items-center gap-2 text-xs font-medium text-slate-300 transition-colors"
          >
            <Radio size={14} className={showCategorySelector ? "text-violet-400" : ""} />
            {currentCategory}
          </button>

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
        </div>

        {/* Right: Volume & Tools */}
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
              className="w-16 md:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>

          <div className="w-px h-6 bg-slate-700 mx-1"></div>

          {/* Playlist Toggle */}
          <button
            onClick={() => { setIsPlaylistOpen(!isPlaylistOpen); setIsMixerOpen(false); }}
            className={`p-2 rounded-lg transition-all ${isPlaylistOpen ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50' : 'hover:bg-slate-700 text-slate-400 hover:text-white'}`}
            title="Playlist"
          >
            <ListMusic size={16} />
          </button>

          {/* Mixer Toggle */}
          <button
            onClick={() => { setIsMixerOpen(!isMixerOpen); setIsPlaylistOpen(false); }}
            className={`p-2 rounded-lg transition-all ${isMixerOpen ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'hover:bg-slate-700 text-slate-400 hover:text-white'}`}
            title="Ambience Mixer"
          >
            <Sliders size={16} />
          </button>
        </div>

      </div>
    </footer>
  );
};

export default AudioControl;