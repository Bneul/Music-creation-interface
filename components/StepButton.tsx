import React from 'react';

interface StepButtonProps {
  active: boolean;
  isCurrent: boolean;
  colorClass: string;
  onClick: () => void;
}

export const StepButton: React.FC<StepButtonProps> = ({ active, isCurrent, colorClass, onClick }) => {
  // Styles for the "active" state based on the track color
  const activeStyle = active ? colorClass : 'bg-gray-200 border-gray-300';
  
  // Current step indicator (playback cursor)
  const currentStyle = isCurrent 
    ? 'ring-2 ring-offset-2 ring-gray-800 scale-110 z-10' 
    : '';

  const activeShadow = active 
    ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] translate-y-[1px]' 
    : 'shadow-[0_2px_0_#a8a8a8] hover:translate-y-[1px] hover:shadow-[0_1px_0_#a8a8a8]';


  return (
    <button
      className={`
        w-full aspect-square rounded-sm border-b-2 border-r-2 border-transparent transition-all duration-75
        ${activeStyle} 
        ${currentStyle}
        ${activeShadow}
        flex items-center justify-center
      `}
      onClick={onClick}
    >
      {/* LED indicator */}
      {active && (
        <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60 shadow-[0_0_4px_white]"></div>
      )}
    </button>
  );
};