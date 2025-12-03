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

interface AudioContextType {
  // Playlist State
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  mainVolume: number;
  
  // Controls
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  playTrack: (index: number) => void;
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

// --- RADIO STATION DEFAULT PLAYLIST (EMPTY) ---
const DEFAULT_PLAYLIST: Track[] = [];

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mainAudioRef = useRef<HTMLAudioElement>(new Audio());
  const layerAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  // Keep track of the play promise to prevent "The play() request was interrupted" errors
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // --- State ---
  const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_PLAYLIST);
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
    if (playlist.length === 1) {
        // Loop single track: reset time and ensure playing
        if (mainAudioRef.current) {
            mainAudioRef.current.currentTime = 0;
            // Force replay if it was ended
            if (mainAudioRef.current.paused && isPlaying) {
                 mainAudioRef.current.play().catch(console.warn);
            }
        }
        return;
    }
    setCurrentIndex(prev => (prev + 1) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length, isPlaying]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    if (playlist.length === 1) {
        if (mainAudioRef.current) mainAudioRef.current.currentTime = 0;
        return;
    }
    setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length]);

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
    
    setPlaylist(prev => {
        // Logic to determine if we should auto-play:
        // If the previous playlist was empty, we want to start.
        // We can't check 'prev.length' here for side effects, so we check current playlist state in the if below.
        return [...prev, ...newTracks];
    });

    // Note: playlist variable here is from closure (previous render), which is what we want
    if (playlist.length === 0 && newTracks.length > 0) {
        setCurrentIndex(0);
        setIsPlaying(true);
    }
  }, [playlist.length]);

  const setMainVolume = useCallback((vol: number) => {
    setMainVolumeState(vol);
    if(mainAudioRef.current) mainAudioRef.current.volume = vol;
  }, []);

  // --- Initialization Effects ---

  // 1. Initialize Ambience Layers
  useEffect(() => {
    layers.forEach(layer => {
      if (!layerAudioRefs.current.has(layer.id)) {
        const audio = new Audio(layer.src);
        audio.loop = true;
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

  // 2. Setup Main Audio Event Listeners (Ended, Error)
  useEffect(() => {
    const audio = mainAudioRef.current;
    
    audio.preload = "auto";
    audio.volume = mainVolume;

    const handleEnded = () => {
      nextTrack();
    };

    const handleError = (e: Event) => {
        const target = e.target as HTMLAudioElement;
        if (target.error) {
           console.warn(`Audio Error Code: ${target.error.code}`, target.error.message);
        }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [nextTrack, mainVolume]);


  // 3. UNIFIED Audio Sync Effect
  // Handles both track changes and play/pause toggles in a serialized manner
  useEffect(() => {
    const audio = mainAudioRef.current;
    
    const syncAudioState = async () => {
        // CASE A: No track selected
        if (!currentTrack) {
            if (!audio.paused) audio.pause();
            // Do NOT set src = '' as it causes errors in some browsers.
            // Just leave it or removeAttribute if absolutely necessary, but pause is usually enough.
            if (audio.getAttribute('src')) audio.removeAttribute('src'); 
            return;
        }

        // CASE B: Track switched
        const currentSrc = audio.getAttribute('src') || ''; // getAttribute is safer than .src property for comparison
        // Check if the Blob URL matches. 
        // Note: Blob URLs are unique strings.
        
        // We need to compare carefully. audio.src property returns absolute full URL.
        // currentTrack.src is likely "blob:http://..."
        
        const domSrc = audio.src; // Absolute
        const targetSrc = currentTrack.src;

        const isDifferentTrack = domSrc !== targetSrc && domSrc !== window.location.origin + targetSrc;

        if (isDifferentTrack) {
            // 1. Pause previous
            if (!audio.paused || playPromiseRef.current) {
                audio.pause();
                // Wait for any pending play promise to reject/resolve
                if (playPromiseRef.current) {
                    try { await playPromiseRef.current; } catch (e) { /* ignore aborts */ }
                }
            }

            // 2. Load new
            audio.src = targetSrc;
            audio.load();

            // 3. Play if state demands it
            if (isPlaying) {
                try {
                    playPromiseRef.current = audio.play();
                    await playPromiseRef.current;
                } catch (e) {
                    console.warn("Autoplay interrupted:", e);
                    // Don't auto-pause state here; user intended to play, browser might have blocked it.
                    // Or rapid switching caused abort.
                } finally {
                    playPromiseRef.current = null;
                }
            }
        } 
        // CASE C: Same track, toggle play/pause
        else {
            if (isPlaying && audio.paused) {
                try {
                    playPromiseRef.current = audio.play();
                    await playPromiseRef.current;
                } catch (e) {
                    console.warn("Play interrupted:", e);
                } finally {
                    playPromiseRef.current = null;
                }
            } else if (!isPlaying && !audio.paused) {
                audio.pause();
            }
        }
    };

    syncAudioState();

  }, [currentTrack, isPlaying]); // Dependencies: only when these change do we touch the DOM

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
      togglePlay,
      nextTrack,
      prevTrack,
      playTrack, 
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