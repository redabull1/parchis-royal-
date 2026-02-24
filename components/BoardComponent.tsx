
import React from 'react';
import { GRID_SIZE, GRID_MAP, getHomeLaneCoords, getNestCoords } from '../constants';
import { PlayerColor, SAFE_SPACES, PLAYER_CONFIG } from '../types';

const BoardComponent: React.FC = () => {
  const cellSize = 100 / GRID_SIZE;

  // Render main track
  const trackCells = Object.entries(GRID_MAP).map(([idx, coords]) => {
    const index = parseInt(idx);
    const isSafe = SAFE_SPACES.includes(index);
    const isEntry = [5, 22, 39, 56].includes(index);
    const entryColor = Object.entries(PLAYER_CONFIG).find(([_, cfg]) => cfg.entry === index)?.[0] as PlayerColor;

    // Specific logic for numbers 8, 25, 42, 59
    const isCornerNumber = [8, 25, 42, 59].includes(index);
    let rotationClass = "";
    let textColor = "text-black";

    if (isCornerNumber) {
      textColor = "text-[#6B3E26]"; // Make these numbers "brown" as requested
      // Rotate numbers to face their respective player's starting side
      if (index === 8) rotationClass = "rotate-0"; // Yellow (Bottom)
      if (index === 25) rotationClass = "rotate-[-90deg]"; // Blue (Right)
      if (index === 42) rotationClass = "rotate-180"; // Red (Top)
      if (index === 59) rotationClass = "rotate-90"; // Green (Left)
    }

    return (
      <div
        key={`track-${idx}`}
        className="absolute border-[0.5px] border-black flex items-center justify-center bg-white z-10"
        style={{
          left: `${coords[0] * cellSize}%`,
          top: `${coords[1] * cellSize}%`,
          width: `${cellSize}%`,
          height: `${cellSize}%`,
        }}
      >
        {/* Space Number */}
        <span className={`text-[7px] sm:text-[9px] font-bold pointer-events-none select-none ${textColor} ${rotationClass}`}>
          {index}
        </span>

        {/* Brown Circle for Safe Spaces (as seen in image) */}
        {isSafe && !isEntry && (
          <div className="absolute w-[60%] h-[60%] bg-[#6B3E26] rounded-full opacity-90 border border-black/20" />
        )}

        {/* White Circle for Entry Points */}
        {isEntry && (
          <div className="absolute w-[75%] h-[75%] bg-white border border-black rounded-full flex items-center justify-center shadow-sm">
             <div className="w-[45%] h-[45%] rounded-full opacity-40" style={{ backgroundColor: PLAYER_CONFIG[entryColor].colorHex }} />
          </div>
        )}
      </div>
    );
  });

  // Render home lanes
  const laneCells = (['red', 'blue', 'yellow', 'green'] as PlayerColor[]).flatMap(color => {
    return Array.from({ length: 7 }).map((_, i) => {
      const coords = getHomeLaneCoords(color, i);
      const colorHex = PLAYER_CONFIG[color].colorHex;
      
      return (
        <div
          key={`lane-${color}-${i}`}
          className="absolute border-[0.5px] border-black flex items-center justify-center shadow-inner z-0"
          style={{
            left: `${coords[0] * cellSize}%`,
            top: `${coords[1] * cellSize}%`,
            width: `${cellSize}%`,
            height: `${cellSize}%`,
            backgroundColor: colorHex,
          }}
        >
        </div>
      );
    });
  });

  // Render Nests
  const nests = (['red', 'blue', 'yellow', 'green'] as PlayerColor[]).map(color => {
    const coords = getNestCoords(color);
    const colorHex = PLAYER_CONFIG[color].colorHex;

    return (
      <div
        key={`nest-${color}`}
        className="absolute flex items-center justify-center"
        style={{
          left: `${(coords[0] - 3.5) * cellSize}%`,
          top: `${(coords[1] - 3.5) * cellSize}%`,
          width: `${7 * cellSize}%`,
          height: `${7 * cellSize}%`,
        }}
      >
        <div 
          className="w-full h-full rounded-full border-[10px] sm:border-[14px] bg-white flex items-center justify-center shadow-md overflow-hidden"
          style={{ borderColor: colorHex }}
        >
           <div className="w-full h-full rounded-full border-2 border-black/10" />
        </div>
      </div>
    );
  });

  // Render Central Triangle Junction (Home)
  const homeTriangles = (
    <div
      className="absolute overflow-hidden border border-black z-0"
      style={{
        left: `${7 * cellSize}%`,
        top: `${7 * cellSize}%`,
        width: `${3 * cellSize}%`,
        height: `${3 * cellSize}%`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Green Triangle (Left) */}
        <polygon points="0,0 50,50 0,100" fill={PLAYER_CONFIG.green.colorHex} />
        {/* Red Triangle (Top) */}
        <polygon points="0,0 100,0 50,50" fill={PLAYER_CONFIG.red.colorHex} />
        {/* Blue Triangle (Right) */}
        <polygon points="100,0 100,100 50,50" fill={PLAYER_CONFIG.blue.colorHex} />
        {/* Yellow Triangle (Bottom) */}
        <polygon points="0,100 100,100 50,50" fill={PLAYER_CONFIG.yellow.colorHex} />
        
        {/* Junction Lines */}
        <line x1="0" y1="0" x2="100" y2="100" stroke="black" strokeWidth="0.5" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="black" strokeWidth="0.5" />
      </svg>
    </div>
  );

  return (
    <div className="relative w-full aspect-square bg-white rounded-sm shadow-2xl overflow-hidden border-[3px] border-black">
      {/* Background/Lanes */}
      {laneCells}
      {homeTriangles}
      
      {/* Main Track Cells */}
      {trackCells}
      
      {/* Player Nests */}
      {nests}
    </div>
  );
};

export default BoardComponent;
