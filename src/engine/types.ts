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
  } | undefined;
  evaluation: undefined

  // ===== INFORMATIONS POSITION =====
  square: Square;        // 'e4', 'a1', etc.
  rank: number;         // 0-7 (0 = 8ème rangée)
  file: number;         // 0-7 (0 = colonne a)

  // ===== ANALYSE TACTIQUE =====
  attackers: string[];
  defenders: string[];
  mobility: {
    moves: string[];        // Cases accessibles depuis ici
    captures: string[];     // Captures possibles
    checks: string[];       // Coups donnant échec
    totalMobility: number;  // Nombre total de coups
  };

  // ===== CONTRÔLE ET INFLUENCE =====
  control: {
    white: Square[];  // Force du contrôle blanc
    black: Square[];  // Force du contrôle noir
    dominantColor: Color | undefined;
  };

  // ===== STRUCTURE DE PIONS =====
  pawnStructure: {
    isPawn: boolean;
    isolated: boolean;      // Pion isolé
    doubled: boolean;       // Pion doublé
    passed: boolean;        // Pion passé
    backward: boolean;      // Pion arriéré
    hanging: boolean;       // Pion pendant
    chain: boolean;         // Dans une chaîne
    support: number;        // Nombre de soutiens
    weakness: number;       // Score de faiblesse (0-10)
    blocked: PawnBlocked
  };

  // ===== MENACES ET TENSIONS =====
  threats: {
    isHanging: boolean;        // Pièce en prise
    isPinned: boolean;         // Pièce clouée
    isFork: boolean;          // Dans une fourchette
    isSkewer: boolean;        // Dans un enfilage
    threatLevel: number;      // Niveau de menace (0-10)
  }
}

export type EnrichedBoard = EnrichedSquare[][];

export type Mobility = {
  moves: string[];
  captures: string[];
  checks: string[];
  totalMobility: number;
};
