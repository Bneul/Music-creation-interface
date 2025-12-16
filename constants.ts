import { InstrumentType, Track } from './types';

export const STEPS_PER_BAR = 16;
export const DEFAULT_BPM = 120;

export const THEME_COLORS = {
  bg: '#f0f0e8',
  dark: '#2a2a2a',
  accent: '#ff5800',
  accentHover: '#e04d00',
  gridEmpty: '#dcdcdc',
  gridActive: '#ff5800',
  kick: '#ff5800', // Orange
  snare: '#ef4444', // Red
  hihat: '#eab308', // Yellow
  clap: '#3b82f6', // Blue
};

export const INITIAL_TRACKS: Track[] = [
  {
    id: InstrumentType.KICK,
    name: "BD",
    color: "bg-orange-500",
    steps: Array(16).fill(false).map((_, i) => i % 4 === 0), // 4-on-the-floor
    muted: false,
    vol: 0.8,
  },
  {
    id: InstrumentType.SNARE,
    name: "SD",
    color: "bg-red-500",
    steps: Array(16).fill(false).map((_, i) => i % 8 === 4), // Backbeat
    muted: false,
    vol: 0.7,
  },
  {
    id: InstrumentType.HIHAT,
    name: "CH",
    color: "bg-yellow-500",
    steps: Array(16).fill(false).map((_, i) => i % 2 === 0), // 8th notes
    muted: false,
    vol: 0.6,
  },
  {
    id: InstrumentType.CLAP,
    name: "CP",
    color: "bg-blue-500",
    steps: Array(16).fill(false).map((_, i) => i === 12), // One clap
    muted: false,
    vol: 0.6,
  },
];