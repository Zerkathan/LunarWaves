import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useAudioContext } from '../contexts/AudioContext';
import { AlertCircle } from 'lucide-react';

interface BackgroundAudioPlayerProps { }

const BackgroundAudioPlayer: React.FC<BackgroundAudioPlayerProps> = () => {
    const {
        currentTrack,
        isPlaying,
        mainVolume,
        nextTrack,
        togglePlay
    } = useAudioContext();

    const playerRef = useRef<any>(null);
    const [error, setError] = React.useState<string | null>(null);

    // Handle Autoplay blocking or other errors
    const handleError = (e: any) => {
        console.error("BackgroundAudioPlayer Error:", e);
        setError("Playback blocked or error. Click play to resume.");
    };

    const handlePlay = () => {
        setError(null);
    };

    const retryPlay = () => {
        if (currentTrack) {
            togglePlay();
        }
    };

    if (!currentTrack) return null;

    return (
        <>
            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', opacity: 0, pointerEvents: 'none' }}>
                {(ReactPlayer as any) && (
                    <ReactPlayer
                        ref={playerRef}
                        url={currentTrack.src}
                        playing={isPlaying}
                        volume={mainVolume}
                        muted={false}
                        loop={false}
                        onEnded={nextTrack}
                        onError={handleError}
                        onPlay={handlePlay}
                        width="1px"
                        height="1px"
                        config={{
                            youtube: {
                                playerVars: { showinfo: 0, controls: 0, disablekb: 1, playsinline: 1, origin: window.location.origin }
                            }
                        } as any}
                    />
                )}
            </div>

            {/* Error Toast / Indicator for Autoplay Block */}
            {error && (
                <div
                    onClick={retryPlay}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 cursor-pointer hover:bg-red-600 transition-colors animate-in fade-in slide-in-from-bottom-4"
                >
                    <AlertCircle size={16} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
        </>
    );
};

export default BackgroundAudioPlayer;

