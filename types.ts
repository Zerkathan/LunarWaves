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
}