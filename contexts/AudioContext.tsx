import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

// Tipos
export interface Track {
  src: string;
  title: string;
  artist: string;
  duration?: number;
}

export interface AmbienceLayer {
  id: string;
  name: string;
  src: string; // URL to audio file
  volume: number; // 0 to 1
  isActive: boolean;
  icon: string; // Icon name for UI mapping
}

export type RepeatMode = 'off' | 'all' | 'one';

interface AudioContextType {
  // Main Track State
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  mainVolume: number;

  // Playback Controls
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  uploadTracks: (files: FileList) => void;
  setMainVolume: (vol: number) => void;

  // Modes
  isShuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  toggleRepeat: () => void;

  // Ambience State
  layers: AmbienceLayer[];
  toggleLayer: (id: string) => void;
  updateLayerVolume: (id: string, volume: number) => void;

  // Zen Mode
  toggleZenMode: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Configuración inicial de capas de ambiente
const INITIAL_LAYERS: AmbienceLayer[] = [
  { id: 'rain', name: 'Soft Rain', src: 'https://cdn.pixabay.com/audio/2022/03/24/audio_03d6d53293.mp3', volume: 0.5, isActive: false, icon: 'CloudRain' },
  { id: 'wind', name: 'Deep Wind', src: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c36b801454.mp3', volume: 0.4, isActive: false, icon: 'Wind' },
  { id: 'water', name: 'River Flow', src: 'https://cdn.pixabay.com/audio/2021/08/09/audio_0dcdd03d04.mp3', volume: 0.5, isActive: false, icon: 'Waves' },
  { id: 'forest', name: 'Night Forest', src: 'https://cdn.pixabay.com/audio/2021/09/06/audio_3659207909.mp3', volume: 0.3, isActive: false, icon: 'Trees' },
];

// --- RADIO STATION DEFAULT ---
const DEFAULT_RADIO_TRACK: Track = {
  title: "Cosmic Chill",
  artist: "Lunar Radio",
  src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"
};

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Refs ---
  const mainAudioRef = useRef<HTMLAudioElement>(new Audio());
  const layerAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // --- State ---
  const [playlist, setPlaylist] = useState<Track[]>([DEFAULT_RADIO_TRACK]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mainVolume, setMainVolumeState] = useState(0.5);
  const [layers, setLayers] = useState<AmbienceLayer[]>(INITIAL_LAYERS);

  // Shuffle & Repeat
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  const currentTrack = playlist[currentTrackIndex] || null;

  // --- Initialization of Layers ---
  useEffect(() => {
    // Inicializar objetos de audio para capas
    layers.forEach(layer => {
      if (!layerAudioRefs.current.has(layer.id)) {
        const audio = new Audio(layer.src);
        audio.loop = true;
        audio.volume = layer.isActive ? layer.volume : 0;
        layerAudioRefs.current.set(layer.id, audio);
      }
    });

    // Initialize Main Track src immediately
    if (currentTrack && !mainAudioRef.current.src) {
      mainAudioRef.current.src = currentTrack.src;
      mainAudioRef.current.volume = mainVolume;
      // Default loop behavior depends on repeat mode, but for single radio track we might want loop
      // if it's the ONLY track.
    }

    // Cleanup
    return () => {
      layerAudioRefs.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      layerAudioRefs.current.clear();
    };
  }, []); // Run once on mount

  // --- Audio Event Listeners (Auto-next) ---
  useEffect(() => {
    const audio = mainAudioRef.current;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack(true); // true = auto triggered
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, playlist, repeatMode, isShuffle]);

  // --- Track Change Effect ---
  useEffect(() => {
    if (currentTrack) {
      // Only change src if it's different to avoid reloading same track (unless forced)
      // But for simplicity, we update if index changed.
      const audio = mainAudioRef.current;
      if (audio.src !== currentTrack.src && !audio.src.endsWith(currentTrack.src)) {
        audio.src = currentTrack.src;
        audio.volume = mainVolume;
        if (isPlaying) {
          audio.play().catch(e => console.error("Play error:", e));
        }
      }
    }
  }, [currentTrackIndex, playlist]);

  // --- Main Track Logic ---
  const togglePlay = () => {
    if (!currentTrack) return;

    // Ensure src is set
    if (!mainAudioRef.current.src) {
      mainAudioRef.current.src = currentTrack.src;
    }

    if (isPlaying) {
      mainAudioRef.current.pause();
    } else {
      mainAudioRef.current.volume = mainVolume;
      const playPromise = mainAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Auto-play prevented.", e);
          return;
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const uploadTracks = (files: FileList) => {
    const newTracks: Track[] = Array.from(files).map(file => ({
      src: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      artist: 'Local Upload'
    }));

    setPlaylist(prev => {
      // If the only track is the default radio and user uploads, maybe replace it?
      // For now, let's just append.
      return [...prev, ...newTracks];
    });

    // If we were on the default track and it wasn't playing, maybe switch?
    // Let's keep it simple: User adds to playlist.
  };

  const nextTrack = (auto = false) => {
    if (playlist.length === 0) return;

    let nextIndex = currentTrackIndex;

    if (isShuffle) {
      // Pick random index
      if (playlist.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentTrackIndex);
      }
    } else {
      // Normal order
      if (currentTrackIndex + 1 < playlist.length) {
        nextIndex = currentTrackIndex + 1;
      } else {
        // End of list
        if (repeatMode === 'all' || repeatMode === 'one') { // 'one' logic handled in 'ended' usually, but if user clicks next, 'one' usually means go to next? No, standard behavior: Next button goes to next track even in Repeat One.
          nextIndex = 0;
        } else {
          // Stop if auto, loop if manual? Or just stop.
          if (auto) {
            setIsPlaying(false);
            return;
          } else {
            nextIndex = 0; // Manual next at end loops to start usually
          }
        }
      }
    }

    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;

    // If more than 3 seconds in, restart track
    if (mainAudioRef.current.currentTime > 3) {
      mainAudioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = currentTrackIndex;
    if (isShuffle) {
      // In true shuffle, we should have a history stack. For simple shuffle, random again or just prev index?
      // Let's just go to previous index linearly for simplicity in this version, or random.
      // Standard shuffle behavior: Prev goes to previously played song. 
      // Without history, let's just go linear prev.
      if (prevIndex - 1 >= 0) prevIndex--;
      else prevIndex = playlist.length - 1;
    } else {
      if (prevIndex - 1 >= 0) {
        prevIndex = prevIndex - 1;
      } else {
        prevIndex = playlist.length - 1;
      }
    }

    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const setMainVolume = (vol: number) => {
    setMainVolumeState(vol);
    mainAudioRef.current.volume = vol;
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // --- Ambience Logic ---
  const toggleLayer = (id: string) => {
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
  };

  const updateLayerVolume = (id: string, volume: number) => {
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
  };

  const toggleZenMode = () => {
    const fadeOut = setInterval(() => {
      if (mainAudioRef.current.volume > 0.05) {
        mainAudioRef.current.volume -= 0.05;
      } else {
        mainAudioRef.current.pause();
        mainAudioRef.current.volume = mainVolume;
        setIsPlaying(false);
        clearInterval(fadeOut);
      }
    }, 100);
  };

  return (
    <AudioContext.Provider value={{
      currentTrack,
      playlist,
      isPlaying,
      mainVolume,
      togglePlay,
      nextTrack,
      prevTrack,
      uploadTracks,
      setMainVolume,
      isShuffle,
      toggleShuffle,
      repeatMode,
      toggleRepeat,
      layers,
      toggleLayer,
      updateLayerVolume,
      toggleZenMode
    }}>
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