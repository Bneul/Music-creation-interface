import React, { useEffect, useRef } from 'react';
import { Track } from '../types';

interface LCDScreenProps {
  bpm: number;
  isPlaying: boolean;
  currentStep: number;
  tracks: Track[];
}

export const LCDScreen: React.FC<LCDScreenProps> = ({ bpm, isPlaying, currentStep, tracks }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Grid background
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            for(let i=0; i<canvas.width; i+=10) {
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
            }
            for(let i=0; i<canvas.height; i+=10) {
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
            }
            ctx.stroke();

            // Dancing Bars
            const barWidth = 20;
            const gap = 10;
            const startX = (canvas.width - (4 * (barWidth + gap))) / 2;
            
            tracks.forEach((track, idx) => {
                const isActiveStep = track.steps[currentStep];
                
                // Base height
                let height = 10;
                
                // Jump if playing and active step
                if (isPlaying && isActiveStep) {
                    height = 50 + Math.random() * 20;
                } else if (isPlaying) {
                    height = 10 + Math.sin(Date.now() / 200 + idx) * 5;
                }

                ctx.fillStyle = '#2a2a2a';
                if (isActiveStep && isPlaying) {
                     // Invert colors for active hit
                     ctx.fillStyle = '#2a2a2a';
                     ctx.fillRect(startX + idx * (barWidth + gap) - 2, canvas.height - height - 2, barWidth + 4, height + 4);
                     ctx.fillStyle = '#f0f0e8'; // inner "hole"
                }
                
                ctx.fillRect(startX + idx * (barWidth + gap), canvas.height - height, barWidth, height);
            });

            // Metronome Circle
            if (isPlaying) {
                const beat = Math.floor(currentStep / 4);
                const subStep = currentStep % 4;
                const radius = subStep === 0 ? 8 : 4;
                
                ctx.beginPath();
                ctx.arc(canvas.width - 20, 20, radius, 0, Math.PI * 2);
                ctx.fillStyle = '#2a2a2a';
                ctx.fill();
            }

            // BPM Text
            ctx.font = 'bold 20px "Space Mono"';
            ctx.fillStyle = '#2a2a2a';
            ctx.fillText(`BPM ${bpm}`, 10, 25);

            // Play Status
            ctx.font = '12px "Space Mono"';
            ctx.fillText(isPlaying ? "PLAY" : "STOP", 10, 45);

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(animationFrameId);
    }, [bpm, isPlaying, currentStep, tracks]);

    return (
        <div className="border-4 border-[#2a2a2a] rounded-sm bg-[#9ca3af] p-1 shadow-inner mb-6 relative">
            {/* Glass reflection effect */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none z-10"></div>
            <canvas 
                ref={canvasRef} 
                width={300} 
                height={100}
                className="w-full h-24 bg-[#87919e] opacity-90 pixelated"
                style={{ imageRendering: 'pixelated' }} 
            />
        </div>
    );
};