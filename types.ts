export enum InstrumentType {
  KICK = 'KICK',
  SNARE = 'SNARE',
  HIHAT = 'HIHAT',
  CLAP = 'CLAP',
}

export interface Track {
  id: InstrumentType;
  name: string;
  color: string;
  steps: boolean[];
  muted: boolean;
  vol: number; // 0.0 to 1.0
}

export interface SequencerState {
  tracks: Track[];
  bpm: number;
  swing: number;
  isPlaying: boolean;
  currentStep: number;
}