import type { Square } from 'chess.js'
import { EnrichedBoard, EnrichedSquare } from './types'

export function initializeEmptyBoard (): EnrichedBoard {
  const board: EnrichedBoard = []

  for (let rank = 0; rank < 8; rank++) {
    board[rank] = []
    for (let file = 0; file < 8; file++) {
      board[rank][file] = createEmptySquare(rank, file)
    }
  }

  return board
}

function createEmptySquare (rank: number, file: number): EnrichedSquare {
  const square = getSquareName(rank, file)

  return {
    // Données de base
    piece: undefined,
    square,
    rank,
    file,

    // Analyse tactique
    attackers: [],
    defenders: [],
    mobility: { moves: [], captures: [], checks: [], totalMobility: 0 },

    // Contrôle
    control: { white: [], black: [], dominantColor: undefined },
    evaluation: undefined,

    // Structure de pions
    pawnStructure: {
      isPawn: false,
      isolated: false,
      doubled: false,
      passed: false,
      backward: false,
      hanging: false,
      blocked: {
        isBlocked: false,
        permanentlyBlocked: false,
        blockedBy: undefined
      },
      chain: false,
      support: 0,
      weakness: 0
    },

    // Menaces
    threats: {
      isHanging: false, isPinned: false, isFork: false,
      isSkewer: false, threatLevel: 0
    },
  }
}

function getSquareName (rank: number, file: number): Square {
  return String.fromCharCode(97 + file) + (8 - rank) as Square
}