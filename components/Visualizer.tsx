import React, { useEffect, useRef } from 'react';
import { WaveConfig, Star } from '../types';

interface VisualizerProps {
  isActive: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Configuration
  const waves: WaveConfig[] = [
    { y: 0, length: 0.01, amplitude: 50, speed: 0.01, color: 'rgba(139, 92, 246, 0.2)' },
    { y: 0, length: 0.02, amplitude: 30, speed: 0.02, color: 'rgba(56, 189, 248, 0.2)' },
    { y: 0, length: 0.005, amplitude: 80, speed: 0.005, color: 'rgba(76, 29, 149, 0.1)' }
  ];

  const starsRef = useRef<Star[]>([]);

  // Initialize stars once
  useEffect(() => {
    const starCount = 100;
    const newStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2,
        opacity: Math.random()
      });
    }
    starsRef.current = newStars;
  }, []);

  const animate = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Draw Stars
    starsRef.current.forEach(star => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Update time
    // If audio is active, waves move faster
    const timeStep = isActive ? 0.02 : 0.005;
    timeRef.current += timeStep;
    const t = timeRef.current;

    // Draw Waves
    waves.forEach((wave, i) => {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let x = 0; x < width; x += 5) { // Optimization: step by 5px
        // Amplitude modulation based on audio state
        const baseAmp = wave.amplitude;
        const activeAmp = isActive ? baseAmp * 1.5 : baseAmp;
        
        // Complex sine wave function
        const y = Math.sin(x * wave.length + t + (i * 10)) * activeAmp * Math.sin(t * 0.5);
        ctx.lineTo(x, (height / 2) + y + (i * 20));
      }

      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fillStyle = wave.color;
      ctx.fill();
    });

    requestRef.current = requestAnimationFrame(() => animate(ctx, width, height));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    requestRef.current = requestAnimationFrame(() => animate(ctx, canvas.width, canvas.height));

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]); 

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
};

export default Visualizer;