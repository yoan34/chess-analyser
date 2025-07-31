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
    evaluation: undefined,

    // Contrôle de la case (toujours présent)
    control: {
      whiteControllers: [],
      blackControllers: [],
      whiteStrength: 0,
      blackStrength: 0,
      dominantColor: undefined,
      controlBalance: 0,
      isContested: false
    },

    // Mobilité (vide par défaut)
    mobility: {
      moves: [],
      captures: [],
      checks: [],
      totalMobility: 0
    },

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

    // Menaces (pour compatibilité avec ancien code)
    threats: {
      isHanging: false,
      isPinned: false,
      isFork: false,
      isSkewer: false,
      threatLevel: 0
    },

    // Importance stratégique
    strategic: {
      isKey: false,
      importance: 0
    }
  }
}

function getSquareName (rank: number, file: number): Square {
  return String.fromCharCode(97 + file) + (8 - rank) as Square
}