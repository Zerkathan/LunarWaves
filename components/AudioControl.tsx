import React, { useState, useRef } from 'react';
import { Play, Pause, Upload, Sliders, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { useAudioContext } from '../contexts/AudioContext';
import { useSpotify } from '../contexts/SpotifyContext';
import ScrollingMarquee from './ScrollingMarquee';
import AmbienceMixer from './AmbienceMixer';

const AudioControl: React.FC = () => {
  const { 
    mainTrack, 
    isPlaying, 
    togglePlay, 
    uploadTrack, 
    mainVolume, 
    setMainVolume,
    isBrownNoiseActive,
    toggleBrownNoise
  } = useAudioContext();

  const {
    spotifyToken,
    user,
    playerState,
    isSpotifyPlaying,
    connectSpotify,
    toggleSpotifyPlay,
    skipToPrevious,
    skipToNext
  } = useSpotify();

  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadTrack(file);
    }
  };

  // Determine what's currently playing
  const isSpotifyActive = spotifyToken && playerState;
  const currentTrack = isSpotifyActive ? playerState?.track_window.current_track : null;
  const albumArtUrl = currentTrack?.album.images[0]?.url;

  return (
    <footer className="w-full max-w-5xl mx-auto relative">
      {/* Mixer Popover */}
      <AmbienceMixer isOpen={isMixerOpen} onClose={() => setIsMixerOpen(false)} />

      {/* Main Control Bar */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-3 md:p-4 shadow-2xl transition-all hover:border-violet-500/30">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Now Playing / Brown Noise */}
          <div className="flex items-center gap-4 w-full md:w-1/3">
            <div className="relative flex-shrink-0">
              {/* Brown Noise / Album Art Button */}
              <button 
                onClick={toggleBrownNoise}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                  isBrownNoiseActive && !isSpotifyActive
                    ? 'bg-violet-600 text-white shadow-violet-500/40' 
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <i className="ph-fill ph-waves text-xl"></i>
              </button>
              
              {/* Album Art Overlay */}
              {albumArtUrl && (
                <img 
                  src={albumArtUrl} 
                  alt="Album Art"
                  className="absolute top-0 left-0 w-12 h-12 rounded-xl object-cover shadow-lg"
                />
              )}
            </div>

            <div className="flex flex-col overflow-hidden min-w-[150px]">
              <span className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Audio Source
              </span>
              
              {isSpotifyActive && currentTrack ? (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white truncate">
                    {currentTrack.name}
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    {currentTrack.artists[0].name}
                  </span>
                </div>
              ) : mainTrack ? (
                <ScrollingMarquee 
                  text={`${mainTrack.title} - ${mainTrack.artist} • `} 
                  isActive={isPlaying} 
                />
              ) : isBrownNoiseActive ? (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white truncate">
                    Brown Noise Generator
                  </span>
                  <span className="text-xs text-green-400 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Live Transmitting
                  </span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white truncate">
                    Brown Noise Generator
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    Internal Engine • Offline
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Center: Spotify Connect / Controls */}
          <div className="flex justify-center w-full md:w-1/3">
            {!spotifyToken ? (
              <button 
                onClick={connectSpotify}
                className="btn-action flex items-center gap-3 px-6 py-3 rounded-full bg-black/40 border border-white/10 hover:bg-green-500/10 hover:border-green-500/50 transition-all group"
              >
                <i className="ph-fill ph-spotify-logo text-green-500 text-xl group-hover:scale-110 transition-transform"></i>
                <span className="text-sm font-bold text-slate-300 group-hover:text-green-400">
                  Connect Premium
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-4">
                {/* User Profile Badge */}
                {user && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    {user.images?.[0]?.url && (
                      <img 
                        src={user.images[0].url} 
                        alt={user.display_name}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="text-xs text-white">{user.display_name}</span>
                  </div>
                )}
                
                {/* Playback Controls */}
                {playerState ? (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={skipToPrevious}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <SkipBack size={20} fill="currentColor" />
                    </button>
                    
                    <button 
                      onClick={toggleSpotifyPlay}
                      className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                    >
                      {isSpotifyPlaying ? (
                        <Pause size={24} fill="currentColor" />
                      ) : (
                        <Play size={24} fill="currentColor" className="ml-1" />
                      )}
                    </button>
                    
                    <button 
                      onClick={skipToNext}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <SkipForward size={20} fill="currentColor" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-green-400">Player Ready</span>
                    <span className="text-xs text-slate-300">Select music in Spotify</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Volume & Mixer */}
          <div className="flex items-center justify-end gap-4 w-full md:w-1/3">
            <Volume2 size={16} className="text-slate-500" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={mainVolume} 
              onChange={(e) => setMainVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            
            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
            
            {/* Upload Button (hidden when Spotify active) */}
            {!isSpotifyActive && (
              <>
                <input 
                  type="file" 
                  accept="audio/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-slate-300"
                >
                  <Upload size={14} />
                  Upload
                </button>
              </>
            )}
            
            <button 
              onClick={() => setIsMixerOpen(!isMixerOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isMixerOpen 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Sliders size={16} />
              <span className="text-xs font-bold">Mixer</span>
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default AudioControl;
