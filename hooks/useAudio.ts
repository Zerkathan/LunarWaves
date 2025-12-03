import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const createBrownNoise = useCallback(() => {
    if (!audioCtxRef.current) return null;
    const ctx = audioCtxRef.current;
    
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise algorithm: Leaky integrator
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // LowPass Filter for "Lofi" warm sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; 

    // Gain (Volume)
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume / 100;
    gainNodeRef.current = gainNode;

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    return noiseNode;
  }, [volume]);

  const toggleAudio = useCallback(() => {
    initAudio();
    
    if (!isPlaying) {
      const source = createBrownNoise();
      if (source) {
        source.start();
        sourceNodeRef.current = source;
        setIsPlaying(true);
        
        // Fade in
        if (gainNodeRef.current && audioCtxRef.current) {
            gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
            gainNodeRef.current.gain.linearRampToValueAtTime(volume / 100, audioCtxRef.current.currentTime + 1);
        }
      }
    } else {
       // Fade out then stop
       if (gainNodeRef.current && audioCtxRef.current) {
           gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.5);
       }
       setTimeout(() => {
           if (sourceNodeRef.current) {
             sourceNodeRef.current.stop();
             sourceNodeRef.current = null;
           }
           setIsPlaying(false);
       }, 500);
    }
  }, [isPlaying, volume, createBrownNoise, initAudio]);

  // Handle volume change in real-time
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  return {
    isPlaying,
    toggleAudio,
    volume,
    setVolume
  };
};