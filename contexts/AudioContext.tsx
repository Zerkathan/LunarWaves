import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

// Tipos
export interface Track {
  id: string;
  src: string; // YouTube URL
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

export type RepeatMode = 'off' | 'all' | 'one';

export const PLAYLIST_CATEGORIES: Record<string, Track[]> = {
  "Space Lofi": [
    { id: 'sl1', title: 'lofi hip hop radio - beats to relax/study to', artist: 'Lofi Girl', src: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    { id: 'sl2', title: 'Synthwave Radio - Beats to Chill/Game to', artist: 'Lofi Girl', src: 'https://www.youtube.com/watch?v=4xDzrJKXOOY' },
    { id: 'sl3', title: 'Space Lofi Hip Hop Radio', artist: 'Lofi Space', src: 'https://www.youtube.com/watch?v=5yx6BWlEVcY' },
  ],
  "Deep Focus": [
    { id: 'df1', title: 'Deep Focus Music To Improve Concentration', artist: 'Quiet Quest', src: 'https://www.youtube.com/watch?v=wXOj6M7t7q4' },
    { id: 'df2', title: 'Focus Music for Work and Study', artist: 'Greenred Productions', src: 'https://www.youtube.com/watch?v=WPni755-Krg' },
  ],
  "Ambient Nebula": [
    { id: 'an1', title: 'Ambient Space Music - Spacewalk', artist: 'Space Ambient', src: 'https://www.youtube.com/watch?v=x40Y9xY1oYk' },
    { id: 'an2', title: 'Deep Space Ambient Music', artist: 'Solar System', src: 'https://www.youtube.com/watch?v=BwUaUhsWjHI' },
  ]
};

interface AudioContextType {
  // Playlist State
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  mainVolume: number;
  currentCategory: string;
  isShuffle: boolean;
  repeatMode: RepeatMode;

  // Controls
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  playTrack: (index: number) => void;
  setCategory: (category: string) => void;
  uploadTracks: (files: FileList) => void;
  setMainVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;

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

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const layerAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // --- State ---
  const [currentCategory, setCurrentCategory] = useState<string>("Space Lofi");
  const [playlist, setPlaylist] = useState<Track[]>(PLAYLIST_CATEGORIES["Space Lofi"]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mainVolume, setMainVolumeState] = useState(0.5);
  const [layers, setLayers] = useState<AmbienceLayer[]>(INITIAL_LAYERS);

  // New State
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  const currentTrack = playlist[currentIndex] || null;

  // --- Controls ---
  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying(prev => !prev);
  }, [currentTrack]);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;

    // 1. Repeat One
    if (repeatMode === 'one') {
      // Just replay same track (seek to 0 handled by player usually, but here we just ensure state is playing)
      // If we want to force restart, we might need a signal, but changing index to same index doesn't trigger effect usually.
      // However, react-player onEnded calls this. If we do nothing, it stops?
      // We probably need to force a seek or just let it replay if loop prop was true.
      // But we handle loop manually here for 'one'.
      // Actually, for 'one', we can just return and let the player handle it if we passed loop={true} to it?
      // But we want centralized logic.
      // Let's just set isPlaying(true) and maybe trigger a seek if we could, but simpler:
      // If we re-set the same index, the effect might not fire if it depends on index change.
      // But we can depend on a 'key' or just let the player handle 'loop' prop based on mode.
      // Let's keep it simple: If repeat one, we don't change index. 
      // But we need to ensure it plays again. 
      // If called from onEnded, we need to restart.
      // For now, let's assume the player component handles 'loop={repeatMode === 'one'}' prop.
      // Wait, I need to update BackgroundAudioPlayer to use that prop!
      // Or I can force update here.
      // Let's implement logic here:
      // If repeat one, we want to restart. 
      // Since we can't easily seek from here without ref, we might rely on the player's loop prop.
      // I will update BackgroundAudioPlayer to respect repeatMode='one' by setting loop={true}.
      // So here, if repeatMode is 'one', we do nothing (let player loop).
      // BUT, if the user clicks "Next" manually, they expect to go to the next track even in Repeat One mode?
      // Usually yes. "Next" button overrides Repeat One.
      // So:
    }

    let nextIndex = currentIndex;

    if (isShuffle) {
      // Simple random
      nextIndex = Math.floor(Math.random() * playlist.length);
      // Avoid same track if possible and length > 1
      if (playlist.length > 1 && nextIndex === currentIndex) {
        nextIndex = (nextIndex + 1) % playlist.length;
      }
    } else {
      nextIndex = currentIndex + 1;
    }

    // Boundary checks
    if (nextIndex >= playlist.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // Stop at end
        setIsPlaying(false);
        return;
      }
    }

    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  }, [playlist.length, currentIndex, isShuffle, repeatMode]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;

    // If shuffle, we could go back in history, but for now just go previous index
    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = playlist.length - 1;
      } else {
        prevIndex = 0; // Or stop? Usually stay at 0
      }
    }

    setCurrentIndex(prevIndex);
    setIsPlaying(true);
  }, [playlist.length, currentIndex, repeatMode]);

  const playTrack = useCallback((index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  }, [playlist.length]);

  const setCategory = useCallback((category: string) => {
    if (PLAYLIST_CATEGORIES[category]) {
      setCurrentCategory(category);
      setPlaylist(PLAYLIST_CATEGORIES[category]);
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }, []);

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

  const setMainVolume = useCallback((vol: number) => {
    setMainVolumeState(vol);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
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
    if (!isPlaying) return;

    const fadeOut = setInterval(() => {
      setMainVolumeState(prev => {
        if (prev > 0.05) return prev - 0.05;
        clearInterval(fadeOut);
        setIsPlaying(false);
        return mainVolume;
      });
    }, 100);

    let currentVol = mainVolume;
    const interval = setInterval(() => {
      if (currentVol > 0.05) {
        currentVol -= 0.05;
        setMainVolumeState(currentVol);
      } else {
        setIsPlaying(false);
        setMainVolumeState(mainVolume);
        clearInterval(interval);
      }
    }, 100);

  }, [isPlaying, mainVolume]);

  return (
    <AudioContext.Provider value={{
      currentTrack,
      playlist,
      isPlaying,
      mainVolume,
      currentCategory,
      isShuffle,
      repeatMode,
      togglePlay,
      nextTrack,
      prevTrack,
      playTrack,
      setCategory,
      uploadTracks,
      setMainVolume,
      toggleShuffle,
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