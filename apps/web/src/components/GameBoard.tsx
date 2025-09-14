import { useState, useEffect } from 'react';
import { Game, GameState, Position, Piece } from '../lib/packages';

interface GameBoardProps {
  game: Game;
  onMove: (from: Position, to: Position) => void;
  onCombatStart: (attacker: Piece, defender: Piece) => void;
  selectedPiece: Piece | null;
  onPieceSelect: (piece: Piece | null) => void;
  legalMoves: Position[];
}

export const GameBoard: React.FC<GameBoardProps> = ({
  game,
  onMove,
  onCombatStart,
  selectedPiece,
  onPieceSelect,
  legalMoves
}) => {
  const [gameState, setGameState] = useState<GameState>(game.getState());
  const [animatingMoves] = useState<Position[]>([]);

  useEffect(() => {
    setGameState(game.getState());
  }, [game]);

  const handleSquareClick = (x: number, y: number) => {
    const clickedPiece = game.getSelectedPiece({ x, y });

    // If we have a selected piece
    if (selectedPiece) {
      // Check if clicking on a legal move
      const isLegalMove = legalMoves.some(move => move.x === x && move.y === y);

      if (isLegalMove) {
        // Check if there's an enemy piece there (combat)
        const targetPiece = gameState.units.find((p: Piece) =>
          p.position.x === x && p.position.y === y && p.side !== selectedPiece.side
        );

        if (targetPiece) {
          onCombatStart(selectedPiece, targetPiece);
        } else {
          onMove(selectedPiece.position, { x, y });
        }
        onPieceSelect(null);
      } else if (clickedPiece && clickedPiece.side === gameState.active) {
        // Select different piece of same side
        onPieceSelect(clickedPiece);
      } else {
        // Deselect
        onPieceSelect(null);
      }
    } else if (clickedPiece && clickedPiece.side === gameState.active && !clickedPiece.hasMoved) {
      // Select piece
      onPieceSelect(clickedPiece);
    }
  };

  const getSquareClasses = (x: number, y: number): string => {
    gameState.units.find(p => p.position.x === x && p.position.y === y);
    const isSelected = selectedPiece?.position.x === x && selectedPiece?.position.y === y;
    const isLegalMove = legalMoves.some(move => move.x === x && move.y === y);
    const isAnimating = animatingMoves.some(move => move.x === x && move.y === y);

    let classes = "w-8 h-8 border rounded flex items-center justify-center text-xs cursor-pointer transition-all duration-200 ";

    // Base colors based on field type
    const field = gameState.board.tiles[y][x];
    if (field.type === 'permanent-light') {
      classes += "bg-yellow-100 border-yellow-300 ";
    } else if (field.type === 'permanent-dark') {
      classes += "bg-gray-800 border-gray-600 ";
    } else {
      classes += "bg-gray-600 border-gray-500 ";
    }

    // Legal move highlighting
    if (isLegalMove) {
      classes += "ring-2 ring-green-400 bg-green-200 ";
    }

    // Animation for AI moves
    if (isAnimating) {
      classes += "ring-2 ring-yellow-400 bg-yellow-200 animate-pulse ";
    }

    // Selection
    if (isSelected) {
      classes += "ring-2 ring-blue-400 ";
    }

    return classes;
  };

  const getPieceSymbol = (piece: Piece): string => {
    const symbols = {
      wizard: '🧙',
      dragon: '🐉',
      unicorn: '🦄',
      golem: '🪨',
      knight: '⚔️'
    };
    return symbols[piece.type as keyof typeof symbols] || '?';
  };

  const getPieceClasses = (piece: Piece): string => {
    return piece.side === 'light' ? "text-yellow-600" : "text-gray-300";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold mb-2">9×9 Game Board</h2>
        <p className="text-gray-400">
          Turn {gameState.turn} • {gameState.active === 'light' ? 'Light' : 'Dark'} to move
        </p>
        <p className="text-sm text-gray-500">
          Cycle: {gameState.cycle.step}/{gameState.cycle.of}
        </p>
      </div>

      <div className="grid grid-cols-9 gap-1 bg-gray-700 p-4 rounded">
        {Array.from({ length: 9 }, (_, y) =>
          Array.from({ length: 9 }, (_, x) => {
            const piece = gameState.units.find((p: Piece) => p.position.x === x && p.position.y === y);
            return (
              <div
                key={`${x}-${y}`}
                className={getSquareClasses(x, y)}
                onClick={() => handleSquareClick(x, y)}
                title={`(${x}, ${y})`}
              >
                {piece && (
                  <span className={getPieceClasses(piece)}>
                    {getPieceSymbol(piece)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedPiece && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Selected: {selectedPiece.type} at ({selectedPiece.position.x}, {selectedPiece.position.y})
          </p>
          <p className="text-xs text-gray-500">
            Health: {selectedPiece.health}/{selectedPiece.maxHealth}
          </p>
        </div>
      )}
    </div>
  );
};
