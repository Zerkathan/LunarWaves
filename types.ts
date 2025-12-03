export enum TimerMode {
  FOCUS = 'FOCUS',
  BREAK = 'BREAK'
}

export interface WaveConfig {
  y: number;
  length: number;
  amplitude: number;
  speed: number;
  color: string;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueTime?: number; // Timestamp for deadline
}

// Spotify Types
export interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: {
    images: { url: string }[];
  };
  duration_ms: number;
}

export interface SpotifyPlayerState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}

export interface SpotifyUser {
  display_name: string;
  email: string;
  images: { url: string }[];
  product: string; // 'premium' | 'free'
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayer;
    };
  }
}

export interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(
    event: string,
    callback: (data: any) => void
  ): void;
  removeListener(event: string): void;
  getCurrentState(): Promise<SpotifyPlayerState | null>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(position_ms: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
}