
import { PlayerColor } from './types';

export const GRID_SIZE = 17;

const GRID_MAP: Record<number, [number, number]> = {};

/**
 * Maps the 68 track squares based on the 17x17 layout in the reference image.
 * 17x17 grid indices: 0 to 16.
 * Center is (8,8).
 */
const buildTrack = () => {
  // Quadrant 1: Bottom Right (Yellow area)
  // 1-7: Right side of bottom arm (going up)
  for (let i = 0; i < 7; i++) GRID_MAP[1 + i] = [9, 16 - i];
  // 8: Junction Corner
  GRID_MAP[8] = [9, 9];
  // 9-15: Bottom side of right arm (going out)
  for (let i = 0; i < 7; i++) GRID_MAP[9 + i] = [10 + i, 9];
  // 16-18: Tip of right arm (down, center, up)
  GRID_MAP[16] = [16, 9];
  GRID_MAP[17] = [16, 8]; // TIP SAFE
  GRID_MAP[18] = [16, 7];

  // Quadrant 2: Top Right (Blue area)
  // 19-25: Top side of right arm (going in)
  for (let i = 0; i < 7; i++) GRID_MAP[19 + i] = [15 - i, 7];
  // 26: Junction Corner
  GRID_MAP[25] = [9, 7]; // Correction: 25 is corner
  // Wait, let's re-align to index 25 exactly
  // 19(15,7), 20(14,7), 21(13,7), 22(12,7), 23(11,7), 24(10,7). That's 6.
  // 25 is (9,7). Correct.
  
  // 26-32: Right side of top arm (going up)
  for (let i = 0; i < 7; i++) GRID_MAP[26 + i] = [9, 6 - i];
  // 33-35: Tip of top arm (right, center, left)
  GRID_MAP[33] = [9, 0];
  GRID_MAP[34] = [8, 0]; // TIP SAFE
  GRID_MAP[35] = [7, 0];

  // Quadrant 3: Top Left (Red area)
  // 36-42: Left side of top arm (going down)
  for (let i = 0; i < 7; i++) GRID_MAP[36 + i] = [7, 1 + i];
  // 42: Junction Corner
  GRID_MAP[42] = [7, 7];
  // 43-49: Top side of left arm (going out)
  for (let i = 0; i < 7; i++) GRID_MAP[43 + i] = [6 - i, 7];
  // 50-52: Tip of left arm (up, center, down)
  GRID_MAP[50] = [0, 7];
  GRID_MAP[51] = [0, 8]; // TIP SAFE
  GRID_MAP[52] = [0, 9];

  // Quadrant 4: Bottom Left (Green area)
  // 53-59: Bottom side of left arm (going in)
  for (let i = 0; i < 7; i++) GRID_MAP[53 + i] = [1 + i, 9];
  // 59: Junction Corner
  GRID_MAP[59] = [7, 9];
  // 60-66: Left side of bottom arm (going down)
  for (let i = 0; i < 7; i++) GRID_MAP[60 + i] = [7, 10 + i];
  // 67-68-1: Tip of bottom arm (left, center, right)
  GRID_MAP[67] = [7, 16];
  GRID_MAP[68] = [8, 16]; // TIP SAFE
};

buildTrack();

export { GRID_MAP };

export const getGridCoords = (index: number): [number, number] => {
  return GRID_MAP[index] || [0, 0];
};

export const getHomeLaneCoords = (color: PlayerColor, index: number): [number, number] => {
  // index 0-6 (7 squares per lane)
  switch (color) {
    case 'yellow': return [8, 15 - index];
    case 'blue': return [15 - index, 8];
    case 'red': return [8, 1 + index];
    case 'green': return [1 + index, 8];
  }
};

export const getNestCoords = (color: PlayerColor): [number, number] => {
  switch (color) {
    case 'red': return [3.5, 3.5];
    case 'blue': return [13.5, 3.5];
    case 'yellow': return [13.5, 13.5];
    case 'green': return [3.5, 13.5];
  }
};

export const getHomeCoords = (): [number, number] => [8, 8];
