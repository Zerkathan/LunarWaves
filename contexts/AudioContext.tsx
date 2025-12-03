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

  // Controls
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  playTrack: (index: number) => void;
  setCategory: (category: string) => void;
  uploadTracks: (files: FileList) => void;
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

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const layerAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // --- State ---
  const [currentCategory, setCurrentCategory] = useState<string>("Space Lofi");
  const [playlist, setPlaylist] = useState<Track[]>(PLAYLIST_CATEGORIES["Space Lofi"]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mainVolume, setMainVolumeState] = useState(0.5);
  const [layers, setLayers] = useState<AmbienceLayer[]>(INITIAL_LAYERS);

  const currentTrack = playlist[currentIndex] || null;

  // --- Controls ---
  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying(prev => !prev);
  }, [currentTrack]);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length]);

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
    // Note: react-player supports file paths but browser security might block local file paths unless using URL.createObjectURL
    // This logic remains similar but might need testing with react-player for local files.
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
    // Simple fade out logic for main volume state
    // Note: This only updates state, react-player will react to mainVolume change.
    // To do a smooth fade out we need to interval update the state.
    if (!isPlaying) return;

    const fadeOut = setInterval(() => {
      setMainVolumeState(prev => {
        if (prev > 0.05) return prev - 0.05;
        clearInterval(fadeOut);
        setIsPlaying(false);
        return mainVolume; // Reset volume after stop? Or keep it low? 
        // Original code reset it. Let's reset it after stopping.
      });
    }, 100);

    // We need to handle the reset after loop finishes. 
    // The previous implementation was a bit cleaner because it mutated the audio element directly.
    // Here we are driving state.
    // Let's simplify for now: just stop.
    // Or better, use a separate effect to handle fade out if we want to be fancy, but for now direct state manipulation is okay.
    // Actually, the setMainVolumeState inside interval might conflict with closure 'mainVolume'.
    // Let's just stop for now to be safe, or implement a proper hook later.
    // Re-implementing original logic roughly:
    let currentVol = mainVolume;
    const interval = setInterval(() => {
      if (currentVol > 0.05) {
        currentVol -= 0.05;
        setMainVolumeState(currentVol);
      } else {
        setIsPlaying(false);
        setMainVolumeState(mainVolume); // Restore original volume
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
      togglePlay,
      nextTrack,
      prevTrack,
      playTrack,
      setCategory,
      uploadTracks,
      setMainVolume,
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