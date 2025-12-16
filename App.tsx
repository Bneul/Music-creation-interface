import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, RefreshCcw } from 'lucide-react';
import { TrackRow } from './components/TrackRow';
import { LCDScreen } from './components/LCDScreen';
import { audioEngine } from './services/audioEngine';
import { INITIAL_TRACKS, DEFAULT_BPM, STEPS_PER_BAR, THEME_COLORS } from './constants';
import { Track, InstrumentType } from './types';

function App() {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Audio Scheduling Refs
  const nextNoteTimeRef = useRef(0);
  const currentStepRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);
  const lookahead = 25.0; // ms
  const scheduleAheadTime = 0.1; // s

  // Initialize Audio Engine on first interaction
  const handleStartAudio = useCallback(() => {
    audioEngine.init();
  }, []);

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpm;
    const secondsPerStep = secondsPerBeat / 4; // 16th notes
    
    nextNoteTimeRef.current += secondsPerStep;
    currentStepRef.current = (currentStepRef.current + 1) % STEPS_PER_BAR;
  }, [bpm]);

  const scheduleNote = useCallback((stepNumber: number, time: number) => {
    // Update UI synchronously-ish for visual feedback
    // In a real precise system, we might use a Draw loop synced to audio time
    // But for React, setting state here is "good enough" for the visual cursor
    // We use a small requestAnimationFrame loop in the effect to sync UI cleanly
    
    tracks.forEach(track => {
      if (track.steps[stepNumber] && !track.muted) {
        audioEngine.trigger(track.id, time, track.vol);
      }
    });
  }, [tracks]);

  const scheduler = useCallback(() => {
    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (nextNoteTimeRef.current < audioEngine.getCurrentTime() + scheduleAheadTime) {
      scheduleNote(currentStepRef.current, nextNoteTimeRef.current);
      nextNote();
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  }, [nextNote, scheduleNote]);

  // UI Sync Effect
  useEffect(() => {
    let animationFrameId: number;
    
    const updateUI = () => {
        // Calculate which step should be highlighted based on audio time
        // This provides smoother visual syncing than updating state inside the scheduler
        if (isPlaying) {
             // We can just rely on the ref for now as it's updated in the lookahead
             // But for React rendering, we need to flush that ref to state periodically
             // To avoid excessive re-renders, we only update if it changed
             if (currentStep !== currentStepRef.current) {
                 setCurrentStep(currentStepRef.current);
             }
        }
        animationFrameId = requestAnimationFrame(updateUI);
    };

    if (isPlaying) {
        updateUI();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, currentStep]);


  // Play/Stop Logic
  useEffect(() => {
    if (isPlaying) {
      if (audioEngine.getCurrentTime() === 0) audioEngine.init(); // Ensure context is ready
      nextNoteTimeRef.current = audioEngine.getCurrentTime() + 0.05;
      currentStepRef.current = 0;
      setCurrentStep(0);
      scheduler();
    } else {
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
    }
    return () => {
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
    };
  }, [isPlaying, scheduler]);

  const togglePlay = () => {
    handleStartAudio();
    setIsPlaying(!isPlaying);
  };

  const handleStepToggle = (trackId: string, stepIndex: number) => {
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        const newSteps = [...t.steps];
        newSteps[stepIndex] = !newSteps[stepIndex];
        return { ...t, steps: newSteps };
      }
      return t;
    }));
  };

  const handleMuteToggle = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, muted: !t.muted } : t
    ));
  };

  const handleClear = () => {
    setTracks(prev => prev.map(t => ({...t, steps: Array(16).fill(false)})));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 select-none" style={{ backgroundColor: THEME_COLORS.bg }} onClick={handleStartAudio}>
      <div className="max-w-3xl w-full bg-[#e3e3dc] p-6 sm:p-8 rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] border border-white/50 relative overflow-hidden">
        
        {/* Screw Decorations (TE style) */}
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-[#d1d1ca] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center"><div className="w-full h-[1px] bg-gray-400 rotate-45"></div></div>
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-[#d1d1ca] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center"><div className="w-full h-[1px] bg-gray-400 rotate-45"></div></div>
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-[#d1d1ca] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center"><div className="w-full h-[1px] bg-gray-400 rotate-45"></div></div>
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-[#d1d1ca] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center"><div className="w-full h-[1px] bg-gray-400 rotate-45"></div></div>

        {/* Header / Logo */}
        <div className="flex justify-between items-end mb-6">
            <div>
                <h1 className="font-mono text-2xl font-bold tracking-tight text-gray-800 uppercase">PO-Clone-1337</h1>
                <p className="font-mono text-xs text-gray-500 mt-1">POCKET OPERATOR REACT EDITION</p>
            </div>
            
            {/* Pattern/Bank indicators (Decorative) */}
            <div className="flex gap-1">
                {[1,2,3,4].map(n => (
                    <div key={n} className={`w-2 h-2 rounded-full ${n===1 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                ))}
            </div>
        </div>

        {/* LCD Screen Visualization */}
        <LCDScreen bpm={bpm} isPlaying={isPlaying} currentStep={currentStep} tracks={tracks} />

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8 bg-[#d8d8d1] p-4 rounded-lg border border-white/40 shadow-sm">
            
            {/* Playback Controls */}
            <div className="flex gap-3">
                <button
                    onClick={togglePlay}
                    className={`
                        h-12 w-12 rounded-full flex items-center justify-center border-2 border-gray-700 shadow-[0_4px_0_#374151] active:shadow-none active:translate-y-[4px] transition-all
                        ${isPlaying ? 'bg-green-400' : 'bg-gray-200 hover:bg-white'}
                    `}
                    title={isPlaying ? "Stop" : "Play"}
                >
                    {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                </button>
                
                <button
                    onClick={handleClear}
                    className="h-10 w-10 rounded-full flex items-center justify-center border-2 border-gray-700 shadow-[0_3px_0_#374151] active:shadow-none active:translate-y-[3px] transition-all bg-red-400 hover:bg-red-300 text-gray-800 mt-1"
                    title="Clear Pattern"
                >
                    <RefreshCcw size={14} />
                </button>
            </div>

            {/* Tempo Slider */}
            <div className="flex-1 min-w-[120px] max-w-[200px] flex flex-col gap-1">
                <div className="flex justify-between font-mono text-xs font-bold text-gray-600">
                    <span>TEMPO</span>
                    <span>{bpm}</span>
                </div>
                <input
                    type="range"
                    min="60"
                    max="200"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full"
                />
            </div>

             {/* Swing Slider (Mock/Visual only for now, could be implemented in AudioEngine) */}
             <div className="flex-1 min-w-[120px] max-w-[200px] flex flex-col gap-1 opacity-70">
                <div className="flex justify-between font-mono text-xs font-bold text-gray-600">
                    <span>SWING</span>
                    <span>30%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="30"
                    className="w-full"
                />
            </div>
        </div>

        {/* The Grid */}
        <div className="flex flex-col gap-1">
            <div className="flex gap-1 mb-1 pl-20 sm:pl-24">
                {[...Array(4)].map((_, beatIdx) => (
                    <div key={beatIdx} className="flex-1 border-b border-gray-400/50 pb-1 text-center">
                        <span className="font-mono text-[10px] text-gray-400">{beatIdx + 1}</span>
                    </div>
                ))}
            </div>
            {tracks.map((track) => (
                <TrackRow
                    key={track.id}
                    track={track}
                    currentStep={currentStep}
                    onStepToggle={handleStepToggle}
                    onMuteToggle={handleMuteToggle}
                />
            ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase">
            <span>Designed for Web Audio</span>
            <span>v1.0.0</span>
        </div>

      </div>
    </div>
  );
}

export default App;