import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { SpotifyPlayer, SpotifyPlayerState, SpotifyUser } from '../types';
import { SPOTIFY_CONFIG } from '../config/spotify';

interface SpotifyContextType {
  // Auth State
  spotifyToken: string | null;
  user: SpotifyUser | null;
  isPremium: boolean;
  
  // Player State
  player: SpotifyPlayer | null;
  deviceId: string | null;
  playerState: SpotifyPlayerState | null;
  isSpotifyPlaying: boolean;
  
  // Actions
  connectSpotify: () => void;
  toggleSpotifyPlay: () => void;
  skipToPrevious: () => void;
  skipToNext: () => void;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

// Use configuration from config file
const { CLIENT_ID, REDIRECT_URI, SCOPES } = SPOTIFY_CONFIG;

export const SpotifyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<SpotifyPlayerState | null>(null);
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);
  
  const playerRef = useRef<SpotifyPlayer | null>(null);

  // Check for token in URL on mount
  useEffect(() => {
    checkToken();
  }, []);

  // Initialize player when token is available and SDK is ready
  useEffect(() => {
    if (spotifyToken && typeof window !== 'undefined' && window.Spotify) {
      initPlayer();
    }
  }, [spotifyToken]);

  // Setup SDK Ready Callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('Spotify SDK Ready');
        if (spotifyToken) {
          initPlayer();
        }
      };
    }
  }, [spotifyToken]);

  const checkToken = () => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      
      if (token) {
        setSpotifyToken(token);
        // Clean URL
        window.history.pushState("", document.title, window.location.pathname);
        
        // Fetch user data
        fetchUser(token);
      }
    }
  };

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data: SpotifyUser = await response.json();
      
      setUser(data);
      setIsPremium(data.product === 'premium');
      
      if (data.product !== 'premium') {
        console.warn('Spotify Premium required for Web Playback SDK');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const initPlayer = () => {
    if (!spotifyToken || playerRef.current) return;

    const newPlayer = new window.Spotify.Player({
      name: 'Lunar Waves Web Player',
      getOAuthToken: (cb) => { cb(spotifyToken); },
      volume: 0.5
    });

    // Error handling
    newPlayer.addListener('initialization_error', ({ message }: any) => {
      console.error('Initialization Error:', message);
    });
    
    newPlayer.addListener('authentication_error', ({ message }: any) => {
      console.error('Authentication Error:', message);
    });
    
    newPlayer.addListener('account_error', ({ message }: any) => {
      console.error('Account Error:', message);
    });
    
    newPlayer.addListener('playback_error', ({ message }: any) => {
      console.error('Playback Error:', message);
    });

    // Playback status updates
    newPlayer.addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
      if (!state) return;
      setPlayerState(state);
      setIsSpotifyPlaying(!state.paused);
    });

    // Ready
    newPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
      transferPlaybackHere(device_id);
    });

    // Not Ready
    newPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player
    newPlayer.connect();
    
    playerRef.current = newPlayer;
    setPlayer(newPlayer);
  };

  const transferPlaybackHere = async (id: string) => {
    if (!spotifyToken) return;
    
    try {
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_ids: [id],
          play: false
        })
      });
    } catch (error) {
      console.error('Error transferring playback:', error);
    }
  };

  const connectSpotify = () => {
    if (spotifyToken) return; // Already connected
    
    let url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(CLIENT_ID);
    url += '&scope=' + encodeURIComponent(SCOPES.join(' '));
    url += '&redirect_uri=' + encodeURIComponent(REDIRECT_URI);
    window.location.href = url;
  };

  const toggleSpotifyPlay = () => {
    if (player) {
      player.togglePlay();
    }
  };

  const skipToPrevious = () => {
    if (player) {
      player.previousTrack();
    }
  };

  const skipToNext = () => {
    if (player) {
      player.nextTrack();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SpotifyContext.Provider value={{
      spotifyToken,
      user,
      isPremium,
      player,
      deviceId,
      playerState,
      isSpotifyPlaying,
      connectSpotify,
      toggleSpotifyPlay,
      skipToPrevious,
      skipToNext
    }}>
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};


