
import { GameState, PlayerColor, Pawn, PawnPosition, PLAYER_CONFIG, SAFE_SPACES } from './types';

export const calculateMove = (
  pawn: Pawn,
  move: number,
  gameState: GameState
): PawnPosition | null => {
  const { position, color } = pawn;
  const config = (PLAYER_CONFIG as any)[color];

  // If in nest, needs a 5 to enter track
  if (position.type === 'nest') {
    if (move === 5) {
      return { type: 'track', index: config.entry };
    }
    return null;
  }

  if (position.type === 'home') return null;

  if (position.type === 'track') {
    // Distance traveled relative to entry point
    const currentDist = (position.index - config.entry + 68) % 68;
    
    // Check if entering home lane
    if (currentDist + move >= 63) {
      const laneIndex = (currentDist + move) - 63;
      if (laneIndex > 7) return null; // Overshot home
      if (laneIndex === 7) return { type: 'home', index: 0 };
      return { type: 'lane', index: laneIndex };
    } else {
      // Check for blockades
      for (let i = 1; i <= move; i++) {
        let stepIndex = position.index + i;
        if (stepIndex > 68) stepIndex -= 68;
        if (isBlockadeAt(stepIndex, gameState, color)) return null;
      }
      let nextIndex = position.index + move;
      if (nextIndex > 68) nextIndex -= 68;
      return { type: 'track', index: nextIndex };
    }
  }

  if (position.type === 'lane') {
    const nextIndex = position.index + move;
    if (nextIndex > 7) return null;
    if (nextIndex === 7) return { type: 'home', index: 0 };
    return { type: 'lane', index: nextIndex };
  }

  return null;
};

const isBlockadeAt = (index: number, gameState: GameState, movingColor: PlayerColor): boolean => {
  const pawnsOnSquare = gameState.players.flatMap(p => p.pawns).filter(p => 
    p.position.type === 'track' && p.position.index === index
  );
  
  if (pawnsOnSquare.length >= 2) {
    const colors = new Set(pawnsOnSquare.map(p => p.color));
    return colors.size === 1;
  }
  return false;
};

export const checkCapture = (
  landedPosition: PawnPosition,
  movingColor: PlayerColor,
  gameState: GameState
): { capturedPawnId: string, playerColor: PlayerColor } | null => {
  if (landedPosition.type !== 'track') return null;
  if (SAFE_SPACES.includes(landedPosition.index)) return null;

  const opponentPawns = gameState.players
    .filter(p => p.color !== movingColor)
    .flatMap(p => p.pawns.map(pawn => ({ ...pawn, playerColor: p.color })))
    .filter(p => p.position.type === 'track' && p.position.index === landedPosition.index);

  if (opponentPawns.length === 1) {
    return { capturedPawnId: opponentPawns[0].id, playerColor: opponentPawns[0].playerColor };
  }

  return null;
};

export const getMovesFromDice = (dice: number[]): number[] => {
  // Now simply returns the dice provided (expected to be length 1)
  return [...dice];
};
