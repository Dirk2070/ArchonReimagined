import { useState, useEffect } from 'react';
import { Game, GameState, Position, Piece, Difficulty, CombatResult } from '@archon/core';
import { createAIPlayer } from '@archon/ai';
import { GameBoard } from './components/GameBoard';
import { ArenaDialog } from './components/ArenaDialog';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const [game] = useState(() => new Game());
  const [gameState, setGameState] = useState<GameState>(game.getState());
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [showArena, setShowArena] = useState(false);
  const [combatData, setCombatData] = useState<{attacker: Piece, defender: Piece} | null>(null);
  const [aiPlayer] = useState(() => createAIPlayer('normal'));
  const [settings, setSettings] = useState({
    aiDifficulty: 'normal' as Difficulty,
    aiSpeed: 1.0,
    autoResolve: false
  });

  useEffect(() => {
    setGameState(game.getState());
  }, [game]);

  useEffect(() => {
    if (selectedPiece) {
      setLegalMoves(game.getLegalMoves(selectedPiece));
    } else {
      setLegalMoves([]);
    }
  }, [selectedPiece, game]);

  // AI turn
  useEffect(() => {
    if (gameState.active === 'dark' && !showArena) {
      const timer = setTimeout(() => {
        const aiMove = aiPlayer.calculateBestMove(game, gameState);
        if (aiMove) {
          const success = game.makeMove(aiMove);
          if (success) {
            setGameState(game.getState());
            setSelectedPiece(null);
          }
        }
      }, settings.aiSpeed * 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.active, showArena, aiPlayer, game, settings.aiSpeed]);

  const handleMove = (_from: Position, _to: Position) => {
    // This would be called from GameBoard when a move is made
    // For now, moves are handled directly in GameBoard
  };

  const handleCombatStart = (attacker: Piece, defender: Piece) => {
    setCombatData({ attacker, defender });
    setShowArena(true);
  };

  const handleCombatEnd = (_result: CombatResult) => {
    // Apply combat result to game state
    const newGameState = game.getState();
    setGameState(newGameState);
    setShowArena(false);
    setCombatData(null);
  };

  const handleNewGame = () => {
    game.constructor();
    setGameState(game.getState());
    setSelectedPiece(null);
    setShowArena(false);
    setCombatData(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Archon Reimagined</h1>
          <div className="flex gap-4">
            <button
              onClick={handleNewGame}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              New Game
            </button>
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <GameBoard
          game={game}
          onMove={handleMove}
          onCombatStart={handleCombatStart}
          selectedPiece={selectedPiece}
          onPieceSelect={setSelectedPiece}
          legalMoves={legalMoves}
        />

        {showArena && combatData && (
          <ArenaDialog
            attacker={combatData.attacker}
            defender={combatData.defender}
            fieldType="neutral"
            autoResolve={settings.autoResolve}
            onCombatEnd={handleCombatEnd}
          />
        )}
      </main>
    </div>
  );
}

export default App;
