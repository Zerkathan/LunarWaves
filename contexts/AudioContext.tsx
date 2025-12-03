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

interface AudioContextType {
  // Main Track State
  mainTrack: Track | null;
  isPlaying: boolean;
  mainVolume: number;
  togglePlay: () => void;
  uploadTrack: (file: File) => void;
  setMainVolume: (vol: number) => void;

  // Ambience State
  layers: AmbienceLayer[];
  toggleLayer: (id: string) => void;
  updateLayerVolume: (id: string, volume: number) => void;

  // Zen Mode
  toggleZenMode: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Configuración inicial de capas de ambiente
// NOTA: En un entorno real, estos src deben apuntar a archivos en /public/sounds/ o CDNs válidos
const INITIAL_LAYERS: AmbienceLayer[] = [
  { id: 'rain', name: 'Soft Rain', src: 'https://cdn.pixabay.com/audio/2022/03/24/audio_03d6d53293.mp3', volume: 0.5, isActive: false, icon: 'CloudRain' },
  { id: 'wind', name: 'Deep Wind', src: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c36b801454.mp3', volume: 0.4, isActive: false, icon: 'Wind' },
  { id: 'water', name: 'River Flow', src: 'https://cdn.pixabay.com/audio/2021/08/09/audio_0dcdd03d04.mp3', volume: 0.5, isActive: false, icon: 'Waves' },
  { id: 'forest', name: 'Night Forest', src: 'https://cdn.pixabay.com/audio/2021/09/06/audio_3659207909.mp3', volume: 0.3, isActive: false, icon: 'Trees' },
];

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Refs ---
  const mainAudioRef = useRef<HTMLAudioElement>(new Audio("/music/cancion.mp3"));
  const layerAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // --- State ---
  const [mainTrack, setMainTrack] = useState<Track | null>({
    title: "Radio Lunar",
    artist: "En Vivo",
    src: "/music/cancion.mp3"
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [mainVolume, setMainVolumeState] = useState(0.5);
  const [layers, setLayers] = useState<AmbienceLayer[]>(INITIAL_LAYERS);

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

    // Cleanup
    return () => {
      layerAudioRefs.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      layerAudioRefs.current.clear();
    };
  }, []); // Run once on mount (structure setup)

  // --- Main Track Logic ---
  const togglePlay = () => {
    if (!mainTrack) return;

    if (isPlaying) {
      mainAudioRef.current.pause();
    } else {
      mainAudioRef.current.play().catch(e => console.error("Play error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const uploadTrack = (file: File) => {
    const url = URL.createObjectURL(file);
    const newTrack = {
      src: url,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      artist: 'Local Upload'
    };

    setMainTrack(newTrack);
    mainAudioRef.current.src = url;
    mainAudioRef.current.volume = mainVolume;
    mainAudioRef.current.play();
    setIsPlaying(true);
  };

  const setMainVolume = (vol: number) => {
    setMainVolumeState(vol);
    mainAudioRef.current.volume = vol;
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
            // Fade out effect manually or just stop
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
    // Fade out main track
    const fadeOut = setInterval(() => {
      if (mainAudioRef.current.volume > 0.05) {
        mainAudioRef.current.volume -= 0.05;
      } else {
        mainAudioRef.current.pause();
        mainAudioRef.current.volume = mainVolume; // Restore volume setting for next play
        setIsPlaying(false);
        clearInterval(fadeOut);
      }
    }, 100);
  };

  return (
    <AudioContext.Provider value={{
      mainTrack,
      isPlaying,
      mainVolume,
      togglePlay,
      uploadTrack,
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
