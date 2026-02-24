
export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

export type PawnPosition = {
  type: 'nest' | 'track' | 'lane' | 'home';
  index: number; // 1-68 for track, 0-6 for lane, 0-3 for nest
};

export interface Pawn {
  id: string;
  color: PlayerColor;
  position: PawnPosition;
}

export interface Player {
  color: PlayerColor;
  isAI: boolean;
  name: string;
  pawns: Pawn[];
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  dice: number[];
  availableMoves: number[];
  isRolling: boolean;
  gameStatus: 'setup' | 'playing' | 'finished';
  winner?: PlayerColor;
  logs: string[];
  lastDoubleCount: number;
}

// Strictly based on the markings in the provided image (brown dots + tips + entries)
export const SAFE_SPACES = [12, 17, 29, 34, 46, 51, 63, 68, 5, 22, 39, 56];

export const PLAYER_CONFIG = {
  yellow: { entry: 5, laneStart: 68, colorHex: '#FFD700' },
  blue: { entry: 22, laneStart: 17, colorHex: '#0047AB' },
  red: { entry: 39, laneStart: 34, colorHex: '#FF0000' },
  green: { entry: 56, laneStart: 51, colorHex: '#00FF00' },
};
