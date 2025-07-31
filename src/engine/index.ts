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

  addPieceThreats(board, chess);
  addSquareControl(board, chess);

  // addMobility(board)


  const endAnalyze = Date.now()
  console.log(`Analyze in ${endAnalyze - startAnalyze}ms`)

  return {
    board,
  }
}

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


function calculateControlStrength(controllers: Square[], chess: Chess): number {
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

  return controllers.reduce((total, square) => {
    const piece = chess.get(square);
    return total + (piece ? pieceValues[piece.type] || 0 : 0);
  }, 0);
}

/**
 * Détermine la couleur dominante sur une case
 */
function determineDominantColor(
  whiteControllers: Square[],
  blackControllers: Square[],
  chess: Chess
): Color | undefined {
  const whiteStrength = calculateControlStrength(whiteControllers, chess);
  const blackStrength = calculateControlStrength(blackControllers, chess);

  if (whiteStrength > blackStrength) return 'w';
  if (blackStrength > whiteStrength) return 'b';
  return undefined; // Équilibre
}

/**
 * Calcule la balance du contrôle (positif = avantage blanc)
 */
function calculateControlBalance(
  whiteControllers: Square[],
  blackControllers: Square[],
  chess: Chess
): number {
  const whiteStrength = calculateControlStrength(whiteControllers, chess);
  const blackStrength = calculateControlStrength(blackControllers, chess);
  return whiteStrength - blackStrength;
}

/**
 * Vérifie si une pièce est en prise (plus d'attaquants que de défenseurs)
 */
function isHanging(square: Square, chess: Chess): boolean {
  const piece = chess.get(square);
  if (!piece) return false;

  const attackerColor = piece.color === 'w' ? 'b' : 'w';
  const attackers = chess.attackers(square, attackerColor);
  const defenders = chess.attackers(square, piece.color);

  return attackers.length > defenders.length;
}

/**
 * Calcule la valeur nette d'un échange sur une case
 */
function calculateExchangeValue(square: Square, chess: Chess): number {
  const piece = chess.get(square);
  if (!piece) return 0;

  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const attackerColor = piece.color === 'w' ? 'b' : 'w';

  const attackers = chess.attackers(square, attackerColor)
    .map(sq => chess.get(sq))
    .filter(p => p !== null)
    .map(p => pieceValues[p!.type])
    .sort((a, b) => a - b); // Trier par valeur croissante

  const defenders = chess.attackers(square, piece.color)
    .map(sq => chess.get(sq))
    .filter(p => p !== null)
    .map(p => pieceValues[p!.type])
    .sort((a, b) => a - b);

  // Simulation simple d'échange
  let capturedValue = pieceValues[piece.type];
  let lostValue = 0;
  let turn = 0;

  while (turn < Math.max(attackers.length, defenders.length)) {
    if (turn % 2 === 0 && turn < attackers.length) {
      // Tour de l'attaquant
      if (turn < defenders.length) {
        lostValue += attackers[turn];
      }
    } else if (turn % 2 === 1 && turn < defenders.length) {
      // Tour du défenseur
      if (turn < attackers.length) {
        capturedValue += defenders[turn];
      }
    }
    turn++;
  }

  return capturedValue - lostValue;
}

/**
 * Vérifie si une pièce est clouée
 */
function isPinned(square: Square, chess: Chess): boolean {
  const piece = chess.get(square);
  if (!piece) return false;

  // Simulation : on retire la pièce et on voit si le roi est en échec
  const originalPiece = chess.remove(square);
  const kingInCheck = chess.inCheck();
  chess.put(originalPiece!, square);

  return kingInCheck;
}

/**
 * Détecte les motifs tactiques
 */
function detectTacticalThreats(square: Square, chess: Chess): string[] {
  const threats: string[] = [];
  const piece = chess.get(square);
  if (!piece) return threats;

  if (isPinned(square, chess)) threats.push('pinned');
  if (isHanging(square, chess)) threats.push('hanging');

  // TODO: Ajouter détection fork, skewer, etc.

  return threats;
}