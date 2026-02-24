
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, Player, PlayerColor, Pawn, PawnPosition, PLAYER_CONFIG } from './types';
import { calculateMove, checkCapture, getMovesFromDice } from './gameLogic';
import BoardComponent from './components/BoardComponent';
import PawnComponent from './components/PawnComponent';
import DiceComponent from './components/DiceComponent';

const INITIAL_PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];

const createInitialState = (playerCount: number, isAI: boolean): GameState => {
  const players: Player[] = INITIAL_PLAYER_COLORS.slice(0, playerCount).map((color, idx) => ({
    color,
    name: `Player ${idx + 1}`,
    isAI: idx > 0 && isAI,
    pawns: Array.from({ length: 4 }).map((_, i) => ({
      id: `${color}-pawn-${i}`,
      color,
      position: { type: 'nest', index: i }
    }))
  }));

  return {
    players,
    currentPlayerIndex: 0,
    dice: [1], // Initialize with one die
    availableMoves: [],
    isRolling: false,
    gameStatus: 'setup',
    logs: ['Welcome to Parchisi Royal!'],
    lastDoubleCount: 0
  };
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState(4, true));

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const addLog = (msg: string) => {
    setGameState(prev => ({ ...prev, logs: [msg, ...prev.logs.slice(0, 4)] }));
  };

  const nextTurn = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
      availableMoves: [],
      lastDoubleCount: 0
    }));
  }, []);

  const handleRoll = () => {
    if (gameState.isRolling || gameState.availableMoves.length > 0) return;

    setGameState(prev => ({ ...prev, isRolling: true }));
    
    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const newMoves = [d1]; // One die result
      
      setGameState(prev => {
        // Roll-again on 6 is a common rule for single-die Parchisi, 
        // but we'll stick to a simple single-turn roll as requested.
        return {
          ...prev,
          dice: [d1],
          isRolling: false,
          availableMoves: newMoves,
          lastDoubleCount: 0,
          logs: [`Rolled a ${d1}.`, ...prev.logs]
        };
      });
    }, 600);
  };

  const movePawn = (pawnId: string, moveValue: number, moveIndex: number) => {
    const pawn = currentPlayer.pawns.find(p => p.id === pawnId);
    if (!pawn) return;

    const nextPos = calculateMove(pawn, moveValue, gameState);
    if (!nextPos) return;

    setGameState(prev => {
      let nextPlayers = [...prev.players];
      let bonusMoves: number[] = [];

      // Update the moved pawn
      nextPlayers = nextPlayers.map(p => {
        if (p.color === prev.players[prev.currentPlayerIndex].color) {
          return {
            ...p,
            pawns: p.pawns.map(pw => pw.id === pawnId ? { ...pw, position: nextPos } : pw)
          };
        }
        return p;
      });

      // Check for capture
      const captureResult = checkCapture(nextPos, pawn.color, prev);
      if (captureResult) {
        nextPlayers = nextPlayers.map(p => {
          if (p.color === captureResult.playerColor) {
            return {
              ...p,
              pawns: p.pawns.map(pw => pw.id === captureResult.capturedPawnId ? { ...pw, position: { type: 'nest', index: parseInt(pw.id.split('-').pop() || '0') } } : pw)
            };
          }
          return p;
        });
        bonusMoves.push(20);
        addLog(`Captured ${captureResult.playerColor}! +20 bonus spaces.`);
      }

      // Check for Home entry bonus
      if (nextPos.type === 'home') {
        bonusMoves.push(10);
        addLog(`Reached home! +10 bonus spaces.`);
      }

      // Remove used move
      const remainingMoves = [...prev.availableMoves];
      remainingMoves.splice(moveIndex, 1);

      // Check win condition
      const allHome = nextPlayers[prev.currentPlayerIndex].pawns.every(pw => pw.position.type === 'home');
      
      const finalAvailableMoves = [...remainingMoves, ...bonusMoves];
      
      // If no moves left and no bonus moves, it's next turn
      const shouldSwitchTurn = finalAvailableMoves.length === 0;

      return {
        ...prev,
        players: nextPlayers,
        availableMoves: finalAvailableMoves,
        gameStatus: allHome ? 'finished' : 'playing',
        winner: allHome ? prev.players[prev.currentPlayerIndex].color : undefined,
        currentPlayerIndex: (allHome || !shouldSwitchTurn) ? prev.currentPlayerIndex : (prev.currentPlayerIndex + 1) % prev.players.length,
      };
    });
  };

  // Simple AI logic
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && currentPlayer.isAI && !gameState.isRolling) {
      if (gameState.availableMoves.length === 0) {
        handleRoll();
      } else {
        const moveChoice = gameState.availableMoves.map((m, idx) => {
          for (const p of currentPlayer.pawns) {
            const next = calculateMove(p, m, gameState);
            if (next) return { pawnId: p.id, val: m, idx };
          }
          return null;
        }).find(x => x !== null);

        if (moveChoice) {
          setTimeout(() => movePawn(moveChoice.pawnId, moveChoice.val, moveChoice.idx), 800);
        } else {
          setTimeout(nextTurn, 1000);
        }
      }
    }
  }, [gameState.availableMoves, currentPlayer.isAI, gameState.isRolling, nextTurn]);

  const getSelectablePawns = () => {
    if (gameState.isRolling || gameState.availableMoves.length === 0) return [];
    
    return currentPlayer.pawns.filter(pawn => 
      gameState.availableMoves.some(m => calculateMove(pawn, m, gameState) !== null)
    );
  };

  const selectablePawns = getSelectablePawns();

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-center justify-center">
      
      {/* Sidebar Info */}
      <div className="w-full lg:w-80 flex flex-col gap-6 order-2 lg:order-1">
        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-sm">
          <h1 className="unbounded text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            PARCHISI ROYAL
          </h1>
          
          <div className="space-y-4">
            {gameState.players.map((p, idx) => (
              <div key={p.color} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${gameState.currentPlayerIndex === idx ? 'bg-slate-700 border-white shadow-lg scale-105' : 'bg-slate-900/50 border-transparent'}`}>
                <div className={`w-4 h-4 rounded-full ${p.color === 'red' ? 'bg-red-500' : p.color === 'blue' ? 'bg-blue-500' : p.color === 'yellow' ? 'bg-yellow-400' : 'bg-green-500'}`} />
                <div className="flex-1">
                  <p className="font-bold text-sm">{p.name} {p.isAI ? '(AI)' : ''}</p>
                  <div className="flex gap-1 mt-1">
                    {p.pawns.map(pw => (
                      <div key={pw.id} className={`w-2 h-2 rounded-full ${pw.position.type === 'home' ? 'bg-white' : 'bg-slate-600'}`} />
                    ))}
                  </div>
                </div>
                {gameState.currentPlayerIndex === idx && <i className="fa-solid fa-arrow-left text-white animate-pulse"></i>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-xl h-48 flex flex-col">
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Game Logs</h3>
          <div className="flex-1 overflow-y-auto space-y-2 text-sm text-slate-300">
            {gameState.logs.map((log, i) => (
              <p key={i} className={i === 0 ? 'text-white font-semibold' : ''}>• {log}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="relative w-full max-w-2xl order-1 lg:order-2">
        <BoardComponent />
        
        {/* Pawns */}
        {gameState.players.flatMap(player => 
          player.pawns.map(pawn => (
            <PawnComponent
              key={pawn.id}
              color={pawn.color}
              position={pawn.position}
              isSelectable={gameState.currentPlayerIndex === gameState.players.indexOf(player) && selectablePawns.includes(pawn)}
              onClick={() => {
                const validMoveIndex = gameState.availableMoves.findIndex(m => calculateMove(pawn, m, gameState) !== null);
                if (validMoveIndex !== -1) {
                  movePawn(pawn.id, gameState.availableMoves[validMoveIndex], validMoveIndex);
                }
              }}
            />
          ))
        )}

        {/* Game End Overlay */}
        {gameState.gameStatus === 'finished' && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center rounded-3xl border-8 border-yellow-500/50">
            <i className="fa-solid fa-trophy text-7xl text-yellow-500 mb-6 drop-shadow-2xl animate-bounce"></i>
            <h2 className="unbounded text-4xl font-black text-white mb-2 uppercase">{gameState.winner} WINS!</h2>
            <p className="text-slate-400 mb-8 max-w-sm">Congratulations! Your strategy reigned supreme in the Royal Court of Parchisi.</p>
            <button 
              onClick={() => setGameState(createInitialState(4, true))}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-full transition-transform active:scale-95"
            >
              PLAY AGAIN
            </button>
          </div>
        )}

        {/* Setup Overlay */}
        {gameState.gameStatus === 'setup' && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 rounded-3xl">
            <h2 className="unbounded text-3xl font-black text-white mb-8">Parchisi Royal</h2>
            <div className="space-y-4 w-full max-w-xs">
              <button onClick={() => setGameState({ ...createInitialState(2, false), gameStatus: 'playing' })} className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-600 font-bold">2 Players (Local)</button>
              <button onClick={() => setGameState({ ...createInitialState(4, false), gameStatus: 'playing' })} className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-600 font-bold">4 Players (Local)</button>
              <button onClick={() => setGameState({ ...createInitialState(4, true), gameStatus: 'playing' })} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold shadow-xl">VS AI</button>
            </div>
            <p className="mt-8 text-xs text-slate-500 text-center px-4">Classic rules: 5 to enter, blockades stop all, safe spaces protect, capture gives +20!</p>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="w-full lg:w-64 flex flex-col gap-4 order-3">
        <DiceComponent 
          values={gameState.dice} 
          isRolling={gameState.isRolling} 
          onRoll={handleRoll}
          disabled={gameState.availableMoves.length > 0 || currentPlayer.isAI || gameState.gameStatus !== 'playing'}
        />

        {gameState.availableMoves.length > 0 && (
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-wrap gap-2 justify-center">
            {gameState.availableMoves.map((m, i) => (
              <div key={i} className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-lg shadow-lg border border-indigo-400">
                {m}
              </div>
            ))}
          </div>
        )}

        {gameState.availableMoves.length > 0 && !currentPlayer.isAI && (
          <button 
            onClick={nextTurn}
            className="text-xs text-slate-400 hover:text-white underline text-center"
          >
            No moves possible? Skip Turn
          </button>
        )}
      </div>

    </div>
  );
};

export default App;
