
import React from 'react';
import { PlayerColor, PawnPosition } from '../types';
import { getGridCoords, getHomeLaneCoords, getNestCoords, getHomeCoords, GRID_SIZE } from '../constants';

interface PawnProps {
  color: PlayerColor;
  position: PawnPosition;
  isSelectable: boolean;
  onClick: () => void;
  isMoving?: boolean;
}

const PawnComponent: React.FC<PawnProps> = ({ color, position, isSelectable, onClick, isMoving }) => {
  const getCoords = () => {
    if (position.type === 'track') {
      const [gx, gy] = getGridCoords(position.index);
      return [gx + 0.5, gy + 0.5];
    }
    if (position.type === 'lane') {
      const [lx, ly] = getHomeLaneCoords(color, position.index);
      return [lx + 0.5, ly + 0.5];
    }
    if (position.type === 'nest') {
      const base = getNestCoords(color);
      const offsets = [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]];
      const offset = offsets[position.index % 4];
      return [base[0] + offset[0], base[1] + offset[1]];
    }
    if (position.type === 'home') {
      const base = getHomeCoords();
      // Adjust positioning within the triangular home segments
      const triangleOffsets: Record<PlayerColor, [number, number]> = {
        red: [1.5, 0.7],
        blue: [2.3, 1.5],
        yellow: [1.5, 2.3],
        green: [0.7, 1.5]
      };
      const [ox, oy] = triangleOffsets[color];
      return [base[0] + ox, base[1] + oy];
    }
    return [0, 0];
  };

  const [x, y] = getCoords();
  const cellSize = 100 / GRID_SIZE;

  const colorMap = {
    red: 'bg-red-600 shadow-red-900/40',
    blue: 'bg-blue-800 shadow-blue-900/40',
    yellow: 'bg-yellow-500 shadow-yellow-900/40',
    green: 'bg-green-600 shadow-green-900/40',
  };

  return (
    <div
      onClick={isSelectable ? onClick : undefined}
      className={`
        absolute z-30 cursor-pointer transition-all duration-300 ease-out
        w-[4.2%] h-[4.2%] rounded-full border-[1.5px] border-white/90 flex items-center justify-center
        ${colorMap[color]} shadow-md
        ${isSelectable ? 'ring-4 ring-yellow-400 animate-pulse scale-125 z-40 shadow-yellow-500/50' : ''}
        ${isMoving ? 'scale-150 z-50 brightness-110' : ''}
        hover:scale-110 active:scale-95
      `}
      style={{
        left: `${x * cellSize}%`,
        top: `${y * cellSize}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-[50%] h-[50%] rounded-full bg-white/20" />
    </div>
  );
};

export default PawnComponent;
