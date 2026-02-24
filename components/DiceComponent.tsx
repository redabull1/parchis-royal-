
import React from 'react';

interface DiceProps {
  values: number[];
  isRolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

const Die: React.FC<{ value: number; isRolling: boolean }> = ({ value, isRolling }) => {
  const dots = Array.from({ length: value });
  
  const getDotPositions = (v: number) => {
    switch(v) {
      case 1: return ['top-1/2 left-1/2'];
      case 2: return ['top-1/4 left-1/4', 'bottom-1/4 right-1/4'];
      case 3: return ['top-1/4 left-1/4', 'top-1/2 left-1/2', 'bottom-1/4 right-1/4'];
      case 4: return ['top-1/4 left-1/4', 'top-1/4 right-1/4', 'bottom-1/4 left-1/4', 'bottom-1/4 right-1/4'];
      case 5: return ['top-1/4 left-1/4', 'top-1/4 right-1/4', 'top-1/2 left-1/2', 'bottom-1/4 left-1/4', 'bottom-1/4 right-1/4'];
      case 6: return ['top-1/4 left-1/4', 'top-1/4 right-1/4', 'top-1/2 left-1/4', 'top-1/2 right-1/4', 'bottom-1/4 left-1/4', 'bottom-1/4 right-1/4'];
      default: return [];
    }
  };

  return (
    <div className={`
      w-16 h-16 bg-white rounded-xl shadow-inner relative flex flex-wrap p-2
      ${isRolling ? 'die-rolling' : ''}
      transition-transform duration-200
    `}>
      {getDotPositions(value).map((pos, i) => (
        <div key={i} className={`absolute w-2.5 h-2.5 bg-slate-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${pos}`} />
      ))}
    </div>
  );
};

const DiceComponent: React.FC<DiceProps> = ({ values, isRolling, onRoll, disabled }) => {
  return (
    <div className="flex flex-col items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md">
      <div className="flex gap-4">
        <Die value={values[0] || 1} isRolling={isRolling} />
      </div>
      <button
        onClick={onRoll}
        disabled={disabled}
        className={`
          px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-all
          ${disabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-lg active:scale-95'}
        `}
      >
        {isRolling ? 'Rolling...' : 'Roll Die'}
      </button>
    </div>
  );
};

export default DiceComponent;
