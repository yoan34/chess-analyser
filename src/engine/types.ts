import type { Color, PieceSymbol, Square } from 'chess.js'


export type PawnBlocked = {
  isBlocked: boolean;
  blockedBy: string | undefined;
  permanentlyBlocked: boolean;
}
export type EnrichedSquare = {
  piece: {
    type: PieceSymbol;
    color: Color;
    // Infos tactiques spécifiques à cette pièce
    attackedBy: Square[];      // Pièces ennemies qui attaquent cette pièce
    defendedBy: Square[];      // Pièces alliées qui défendent cette pièce
    exchangeValue: number;     // Valeur nette si échange sur cette case
    isHanging: boolean;        // Pièce en prise
    isPinned: boolean;         // Pièce clouée
    threats: string[];         // Menaces tactiques spécifiques (fork, skewer, etc.)
  } | undefined;

  evaluation: undefined;
  moveValue: {
    white: number | undefined;
    black: number | undefined;
  }

  // ===== INFORMATIONS POSITION =====
  square: Square;
  rank: number;
  file: number;

  // ===== CONTRÔLE DE LA CASE (indépendant de la pièce présente) =====
  control: {
    whiteControllers: Square[];    // Pièces blanches qui "voient" cette case
    blackControllers: Square[];    // Pièces noires qui "voient" cette case
    whiteStrength: number;         // Force du contrôle blanc
    blackStrength: number;         // Force du contrôle noir
    dominantColor: Color | undefined;
    controlBalance: number;        // > 0 = avantage blanc, < 0 = noir
    isContested: boolean;          // Case disputée par les deux camps
  };

  // ===== MOBILITÉ (depuis cette case si pièce présente) =====
  mobility: {
    moves: Square[];         // Cases accessibles
    captures: Square[];      // Captures possibles
    checks: Square[];        // Coups donnant échec
    totalMobility: number;
  };

  // ===== IMPORTANCE STRATÉGIQUE =====
  strategic: {
    isKey: boolean;          // Case clé (centre, avant-poste)
    importance: number;      // Score d'importance (0-10)
  };
}

export type EnrichedBoard = EnrichedSquare[][];