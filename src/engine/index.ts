import { Chess, BLACK, WHITE, Square, Color } from 'chess.js'
import { initializeEmptyBoard } from './initialize-board'
import { EnrichedBoard } from './types'

export type AnalysisData = {
  board: EnrichedBoard;
}

export async function chessAnalyzer (fen: string): Promise<AnalysisData> {
  const startAnalyze = Date.now()
  const chess = new Chess(fen)
  const board = initializeEmptyBoard()

  // Ajouter les pièces au plateau
  addPiecesToBoard(board, chess)

  // Analyse tactique
  addPieceThreats(board, chess)
  addSquareControl(board, chess)
  addMobility(board, chess)

  const endAnalyze = Date.now()
  console.log(`Analyze in ${endAnalyze - startAnalyze}ms`)
  console.log(board)
  return { board }
}

/**
 * Ajoute les pièces présentes sur le plateau
 */
function addPiecesToBoard(board: EnrichedBoard, chess: Chess) {
  board.forEach((rank, rankIndex) => {
    rank.forEach((square, fileIndex) => {
      const piece = chess.get(square.square)
      if (piece) {
        board[rankIndex][fileIndex].piece = {
          type: piece.type,
          color: piece.color,
          // Les infos tactiques seront ajoutées par addPieceThreats
          attackedBy: [],
          defendedBy: [],
          exchangeValue: 0,
          isHanging: false,
          isPinned: false,
          threats: []
        }
      }
    })
  })
}

/**
 * Ajoute les informations d'attaque/défense pour les pièces présentes
 */
function addPieceThreats(board: EnrichedBoard, chess: Chess) {
  board.forEach((rank, rankIndex) => {
    rank.forEach((square, fileIndex) => {
      if (square.piece) {
        const attackerColor = square.piece.color === 'w' ? 'b' : 'w';
        const defenderColor = square.piece.color;

        // Mise à jour de la pièce avec ses menaces
        board[rankIndex][fileIndex].piece = {
          ...square.piece,
          attackedBy: chess.attackers(square.square, attackerColor),
          defendedBy: chess.attackers(square.square, defenderColor),
          exchangeValue: calculateExchangeValue(square.square, chess),
          isHanging: isHanging(square.square, chess),
          isPinned: isPinned(square.square, chess),
          threats: detectTacticalThreats(square.square, chess)
        };
      }
    });
  });
}

/**
 * Ajoute les informations de contrôle pour toutes les cases
 */
function addSquareControl(board: EnrichedBoard, chess: Chess) {
  board.forEach((rank, rankIndex) => {
    rank.forEach((square, fileIndex) => {
      const whiteControllers = chess.attackers(square.square, 'w');
      const blackControllers = chess.attackers(square.square, 'b');

      board[rankIndex][fileIndex].control = {
        whiteControllers,
        blackControllers,
        whiteStrength: calculateControlStrength(whiteControllers, chess),
        blackStrength: calculateControlStrength(blackControllers, chess),
        dominantColor: determineDominantColor(whiteControllers, blackControllers, chess),
        controlBalance: calculateControlBalance(whiteControllers, blackControllers, chess),
        isContested: whiteControllers.length > 0 && blackControllers.length > 0
      };
    });
  });
}

/**
 * Ajoute les informations de mobilité pour les pièces présentes
 */
function addMobility(board: EnrichedBoard, chess: Chess) {
  board.forEach((rank, rankIndex) => {
    rank.forEach((square, fileIndex) => {
      if (square.piece) {
        const moves = chess.moves({ square: square.square, verbose: true });

        board[rankIndex][fileIndex].mobility = {
          moves: moves.map(move => move.to),
          captures: moves.filter(move => move.captured).map(move => move.to),
          checks: moves.filter(move => {
            chess.move(move);
            const inCheck = chess.inCheck();
            chess.undo();
            return inCheck;
          }).map(move => move.to),
          totalMobility: moves.length
        };
      } else {
        // Case vide = aucune mobilité
        board[rankIndex][fileIndex].mobility = {
          moves: [],
          captures: [],
          checks: [],
          totalMobility: 0
        };
      }
    });
  });
}

// ===== FONCTIONS UTILITAIRES =====

function calculateControlStrength(controllers: Square[], chess: Chess): number {
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

  return controllers.reduce((total, square) => {
    const piece = chess.get(square);
    return total + (piece ? pieceValues[piece.type] || 0 : 0);
  }, 0);
}

function determineDominantColor(
  whiteControllers: Square[],
  blackControllers: Square[],
  chess: Chess
): Color | undefined {
  const whiteStrength = calculateControlStrength(whiteControllers, chess);
  const blackStrength = calculateControlStrength(blackControllers, chess);

  if (whiteStrength > blackStrength) return 'w';
  if (blackStrength > whiteStrength) return 'b';
  return undefined;
}

function calculateControlBalance(
  whiteControllers: Square[],
  blackControllers: Square[],
  chess: Chess
): number {
  const whiteStrength = calculateControlStrength(whiteControllers, chess);
  const blackStrength = calculateControlStrength(blackControllers, chess);
  return whiteStrength - blackStrength;
}

function isHanging(square: Square, chess: Chess): boolean {
  const piece = chess.get(square);
  if (!piece) return false;

  const attackerColor = piece.color === 'w' ? 'b' : 'w';
  const attackers = chess.attackers(square, attackerColor);
  const defenders = chess.attackers(square, piece.color);

  return attackers.length > defenders.length;
}

function calculateExchangeValue(square: Square, chess: Chess): number {
  const piece = chess.get(square);
  if (!piece) return 0;

  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const attackerColor = piece.color === 'w' ? 'b' : 'w';

  const attackers = chess.attackers(square, attackerColor)
    .map(sq => chess.get(sq))
    .filter(p => p !== null)
    .map(p => pieceValues[p!.type])
    .sort((a, b) => a - b);

  const defenders = chess.attackers(square, piece.color)
    .map(sq => chess.get(sq))
    .filter(p => p !== null)
    .map(p => pieceValues[p!.type])
    .sort((a, b) => a - b);

  let capturedValue = pieceValues[piece.type];
  let lostValue = 0;
  let turn = 0;

  while (turn < Math.max(attackers.length, defenders.length)) {
    if (turn % 2 === 0 && turn < attackers.length) {
      if (turn < defenders.length) {
        lostValue += attackers[turn];
      }
    } else if (turn % 2 === 1 && turn < defenders.length) {
      if (turn < attackers.length) {
        capturedValue += defenders[turn];
      }
    }
    turn++;
  }

  return capturedValue - lostValue;
}

function isPinned(square: Square, chess: Chess): boolean {
  const piece = chess.get(square);
  if (!piece) return false;

  const originalPiece = chess.remove(square);
  const kingInCheck = chess.inCheck();
  chess.put(originalPiece!, square);

  return kingInCheck;
}

function detectTacticalThreats(square: Square, chess: Chess): string[] {
  const threats: string[] = [];
  const piece = chess.get(square);
  if (!piece) return threats;

  if (isPinned(square, chess)) threats.push('pinned');
  if (isHanging(square, chess)) threats.push('hanging');

  return threats;
}