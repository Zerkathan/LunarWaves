import React, { useEffect, useRef } from 'react';
import { Star } from '../types';

interface VisualizerProps {
  isActive: boolean;
  waveColors: string[]; // Changed from single string to array
}

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  // Fallback for safety
  if (!hex) return `rgba(139, 92, 246, ${alpha})`;
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Visualizer: React.FC<VisualizerProps> = ({ isActive, waveColors }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

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
    // If audio is active, time moves faster
    const timeStep = isActive ? 0.03 : 0.005;
    timeRef.current += timeStep;
    const t = timeRef.current;

    // Define Dynamic Waves based on props
    // We Map each color in the array to a specific wave definition
    // Ensure we have fallback colors if array is short
    const c1 = waveColors[0] || '#8b5cf6';
    const c2 = waveColors[1] || '#8b5cf6';
    const c3 = waveColors[2] || '#8b5cf6';

    const waveDefinitions = [
        { length: 0.006, amplitude: 50, speed: 0.01, color: hexToRgba(c1, 0.2) },
        { length: 0.012, amplitude: 30, speed: 0.02, color: hexToRgba(c2, 0.2) },
        { length: 0.004, amplitude: 60, speed: 0.005, color: hexToRgba(c3, 0.1) }
    ];

    // Rhythm Simulation:
    // Create a "pulse" that mimics a beat by combining sine waves at different frequencies.
    // This makes the waves jump up and down rhythmically when active.
    const beatPulse = isActive 
        ? Math.sin(t * 8) * 15 + Math.cos(t * 17) * 10 // Fast complex beat
        : 0;

    // Draw Waves
    waveDefinitions.forEach((wave, i) => {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let x = 0; x < width; x += 5) { // Optimization: step by 5px
        // Amplitude modulation
        const baseAmp = wave.amplitude;
        
        // When active, increase amplitude AND apply the beat pulse
        const activeAmp = isActive ? (baseAmp * 1.2) + beatPulse : baseAmp;
        
        // Complex sine wave function
        // Add (i * 10) phase shift so waves don't overlap perfectly
        const y = Math.sin(x * wave.length + t + (i * 10)) * activeAmp * Math.sin(t * 0.5 + i);
        
        ctx.lineTo(x, (height / 2) + y + (i * 20)); // Offset Y slightly per wave
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

    // Start animation loop
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(() => animate(ctx, canvas.width, canvas.height));

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, waveColors]); // Re-init if active state or colors change

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none transition-opacity duration-1000"
    />
  );
};

export default Visualizer;