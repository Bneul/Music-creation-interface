import React from 'react';
import { Track } from '../types';
import { StepButton } from './StepButton';
import { Volume2, VolumeX } from 'lucide-react';

interface TrackRowProps {
  track: Track;
  currentStep: number;
  onStepToggle: (trackId: string, stepIndex: number) => void;
  onMuteToggle: (trackId: string) => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, currentStep, onStepToggle, onMuteToggle }) => {
  return (
    <div className="flex items-center gap-2 mb-2 sm:mb-3">
      {/* Track Controls */}
      <div className="w-20 sm:w-24 shrink-0 flex flex-col items-start gap-1">
        <div className="flex items-center justify-between w-full pr-2">
            <span className="font-mono text-sm font-bold tracking-tighter text-gray-800 select-none">
            {track.name}
            </span>
            <button 
                onClick={() => onMuteToggle(track.id)}
                className={`p-1 rounded-sm hover:bg-gray-200 transition-colors ${track.muted ? 'text-red-500' : 'text-gray-400'}`}
            >
                {track.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
        </div>
        <div className={`h-1 w-full rounded-full overflow-hidden bg-gray-300`}>
            <div className={`h-full ${track.color} ${track.muted ? 'opacity-20' : 'opacity-100'}`} style={{ width: '80%' }}></div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-8 sm:grid-cols-16 gap-1 sm:gap-1.5">
        {track.steps.map((isActive, index) => (
          <StepButton
            key={`${track.id}-${index}`}
            active={isActive}
            isCurrent={currentStep === index}
            colorClass={track.color}
            onClick={() => onStepToggle(track.id, index)}
          />
        ))}
      </div>
    </div>
  );
};