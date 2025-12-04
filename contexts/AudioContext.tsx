import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

// Tipos
export interface Track {
  id: string; 
  src: string;
  title: string;
  artist: string;
  duration?: number;
}

export interface AmbienceLayer {
  id: string;
  name: string;
  src: string;
  volume: number;
  isActive: boolean;
  icon: string;
}

// 0: Off, 1: All, 2: One
export type RepeatMode = 0 | 1 | 2;

interface AudioContextType {
  // Playlist State
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  mainVolume: number;
  
  // Playback Modes
  isShuffle: boolean;
  repeatMode: RepeatMode;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Controls
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  playTrack: (index: number) => void;
  uploadTracks: (files: FileList) => void;
  addExternalTrack: (track: Track) => void;
  removeTrack: (id: string) => void; // New function
  setMainVolume: (vol: number) => void;
  
  // Ambience State
  layers: AmbienceLayer[];
  toggleLayer: (id: string) => void;
  updateLayerVolume: (id: string, volume: number) => void;
  
  // Zen Mode
  toggleZenMode: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const INITIAL_LAYERS: AmbienceLayer[] = [
  { id: 'rain', name: 'Soft Rain', src: 'https://cdn.pixabay.com/audio/2022/03/24/audio_03d6d53293.mp3', volume: 0.5, isActive: false, icon: 'CloudRain' },
  { id: 'wind', name: 'Deep Wind', src: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c36b801454.mp3', volume: 0.4, isActive: false, icon: 'Wind' },
  { id: 'water', name: 'River Flow', src: 'https://cdn.pixabay.com/audio/2021/08/09/audio_0dcdd03d04.mp3', volume: 0.5, isActive: false, icon: 'Waves' },
  { id: 'forest', name: 'Night Forest', src: 'https://cdn.pixabay.com/audio/2021/09/06/audio_3659207909.mp3', volume: 0.3, isActive: false, icon: 'Trees' },
];

const DEFAULT_PLAYLIST: Track[] = [];

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mainAudioRef = useRef<HTMLAudioElement>(null);
  const layerAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const loadedTrackIdRef = useRef<string | null>(null);

  // --- State ---
  const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mainVolume, setMainVolumeState] = useState(0.5);
  const [layers, setLayers] = useState<AmbienceLayer[]>(INITIAL_LAYERS);
  
  // New States for Modes
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(0);

  const currentTrack = playlist[currentIndex] || null;

  // --- Helpers ---
  const safePlay = async () => {
    const audio = mainAudioRef.current;
    if (!audio) return;
    
    try {
        if (audio.paused) {
            await audio.play();
        }
    } catch (e) {
        console.warn("Playback prevented:", e);
    }
  };

  // --- Controls ---
  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying(prev => !prev);
  }, [currentTrack]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => (prev + 1) % 3 as RepeatMode);
  }, []);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;

    // 1. Repeat One Logic (Priority)
    if (repeatMode === 2) {
        const audio = mainAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            if (!isPlaying) setIsPlaying(true);
            else safePlay();
        }
        return;
    }

    // 2. Shuffle Logic
    if (isShuffle && playlist.length > 1) {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentIndex);
        setCurrentIndex(nextIndex);
        setIsPlaying(true);
        return;
    }

    // 3. Normal / Repeat All Logic
    if (currentIndex < playlist.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsPlaying(true);
    } else if (repeatMode === 1) {
        // Loop back to start
        setCurrentIndex(0);
        setIsPlaying(true);
    } else {
        // End of playlist, stop
        setIsPlaying(false);
    }
  }, [playlist.length, isPlaying, currentIndex, isShuffle, repeatMode]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    
    // If more than 3 seconds in, just restart track
    if (mainAudioRef.current && mainAudioRef.current.currentTime > 3) {
        mainAudioRef.current.currentTime = 0;
        return;
    }

    if (playlist.length === 1) {
        if(mainAudioRef.current) mainAudioRef.current.currentTime = 0;
        return;
    }
    
    if (isShuffle && playlist.length > 1) {
        let prevIndex;
        do {
            prevIndex = Math.floor(Math.random() * playlist.length);
        } while (prevIndex === currentIndex);
        setCurrentIndex(prevIndex);
    } else {
        setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    }
    setIsPlaying(true);
  }, [playlist.length, isShuffle, currentIndex]);

  const playTrack = useCallback((index: number) => {
    if (index >= 0 && index < playlist.length) {
        setCurrentIndex(index);
        setIsPlaying(true);
    }
  }, [playlist.length]);

  const uploadTracks = useCallback((files: FileList) => {
    const newTracks: Track[] = Array.from(files).map((file, idx) => ({
      id: `local_${Date.now()}_${idx}`, 
      src: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: 'Local Upload'
    }));
    
    setPlaylist(prev => [...prev, ...newTracks]);

    if (playlist.length === 0 && newTracks.length > 0) {
        setCurrentIndex(0);
        setIsPlaying(true);
    }
  }, [playlist.length]);

  const addExternalTrack = useCallback((track: Track) => {
    setPlaylist(prev => [...prev, track]);
    if (playlist.length === 0) {
        setCurrentIndex(0);
        setIsPlaying(true);
    }
  }, [playlist.length]);

  const removeTrack = useCallback((id: string) => {
    setPlaylist(prev => {
        const indexToRemove = prev.findIndex(t => t.id === id);
        if (indexToRemove === -1) return prev;

        // Logic to keep playback stable
        if (indexToRemove === currentIndex) {
            // Deleting the current track -> Stop playing
            setIsPlaying(false);
            if(mainAudioRef.current) mainAudioRef.current.pause();
            // Reset loaded ref so it doesn't think it's still loaded
            loadedTrackIdRef.current = null;
        } else if (indexToRemove < currentIndex) {
            // Deleting a previous track -> Shift index down to keep pointing to same song
            setCurrentIndex(c => Math.max(0, c - 1));
        }

        return prev.filter(t => t.id !== id);
    });
  }, [currentIndex]);

  const setMainVolume = useCallback((vol: number) => {
    setMainVolumeState(vol);
    if(mainAudioRef.current) mainAudioRef.current.volume = vol;
  }, []);

  // --- Effects ---

  // 1. Ambience Layers
  useEffect(() => {
    layers.forEach(layer => {
      if (!layerAudioRefs.current.has(layer.id)) {
        const audio = new Audio(layer.src);
        audio.loop = true;
        audio.crossOrigin = "anonymous";
        audio.volume = layer.isActive ? layer.volume : 0;
        layerAudioRefs.current.set(layer.id, audio);
      }
    });
    return () => {
      layerAudioRefs.current.forEach(a => {
        a.pause();
        a.src = '';
      });
      layerAudioRefs.current.clear();
    };
  }, []); 

  // 2. Setup Main Audio Event Listeners
  useEffect(() => {
    const audio = mainAudioRef.current;
    if (!audio) return;
    
    audio.volume = mainVolume;

    const handleEnded = () => nextTrack();
    
    const handleCanPlay = () => {
        if (isPlaying && audio.paused) {
            safePlay();
        }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [nextTrack, mainVolume, isPlaying]);


  // 3. CORE AUDIO SYNC
  useEffect(() => {
    const audio = mainAudioRef.current;
    if (!audio) return;

    const sync = async () => {
        if (!currentTrack) {
            audio.pause();
            loadedTrackIdRef.current = null;
            return;
        }

        const needsLoad = currentTrack.id !== loadedTrackIdRef.current;

        if (needsLoad) {
            audio.pause();
            audio.src = currentTrack.src;
            audio.load();
            loadedTrackIdRef.current = currentTrack.id;
        } else {
            // Same track toggling
            if (isPlaying && audio.paused) {
                await safePlay();
            } else if (!isPlaying && !audio.paused) {
                audio.pause();
            }
        }
    };
    sync();
  }, [currentTrack, isPlaying]); 

  // --- Ambience Logic ---
  const toggleLayer = useCallback((id: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === id) {
        const newState = !layer.isActive;
        const audio = layerAudioRefs.current.get(id);
        if (audio) {
          if (newState) {
            audio.volume = layer.volume;
            audio.play().catch(e => console.error("Layer play error", e));
          } else {
            audio.pause();
            audio.currentTime = 0;
          }
        }
        return { ...layer, isActive: newState };
      }
      return layer;
    }));
  }, []);

  const updateLayerVolume = useCallback((id: string, volume: number) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === id) {
        const audio = layerAudioRefs.current.get(id);
        if (audio && layer.isActive) {
          audio.volume = volume;
        }
        return { ...layer, volume };
      }
      return layer;
    }));
  }, []);

  const toggleZenMode = useCallback(() => {
    if (!mainAudioRef.current || mainAudioRef.current.paused) return;

    const fadeOut = setInterval(() => {
        if(mainAudioRef.current.volume > 0.05) {
            mainAudioRef.current.volume -= 0.05;
        } else {
            setIsPlaying(false);
            mainAudioRef.current.volume = mainVolume;
            clearInterval(fadeOut);
        }
    }, 100);
  }, [mainVolume]);

  return (
    <AudioContext.Provider value={{
      currentTrack,
      playlist,
      isPlaying,
      mainVolume,
      isShuffle,
      repeatMode,
      toggleShuffle,
      toggleRepeat,
      togglePlay,
      nextTrack,
      prevTrack,
      playTrack, 
      uploadTracks,
      addExternalTrack,
      removeTrack,
      setMainVolume,
      layers,
      toggleLayer,
      updateLayerVolume,
      toggleZenMode
    }}>
      <audio 
        ref={mainAudioRef} 
        preload="auto" 
        crossOrigin="anonymous"
        style={{ display: 'none' }} 
      />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};