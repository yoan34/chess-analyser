import { useState, useEffect, useCallback } from 'react'
import type { Arrow } from 'react-chessboard'
import { AnalysisData } from '../engine'
import type { SquareIndex } from './useSquareSelection'
import type { ArrowPreferences } from './useVisualizationPreferences'

type ExtendedArrow = Arrow & {
  id?: string
}

export function useArrowsManager(
  selectedSquare: SquareIndex | null,
  analysisData: AnalysisData | null,
  arrowPreferences: ArrowPreferences
) {
  const [arrows, setArrows] = useState<ExtendedArrow[]>([])

  const updateArrowsForSelectedSquare = useCallback(() => {
    if (!selectedSquare || !analysisData) return

    const square = analysisData.board[selectedSquare.rank][selectedSquare.file]
    if (!square) return

    const newArrows: ExtendedArrow[] = []

    // ===== FLÈCHES POUR LES PIÈCES (si présente) =====
    if (square.piece) {
      // Attaquants de la pièce (rouge)
      if (arrowPreferences.showAttackers && square.piece.attackedBy.length > 0) {
        const attackArrows = square.piece.attackedBy.map((attacker: string, index: number) => ({
          startSquare: attacker,
          endSquare: square.square,
          color: 'red',
          id: `PIECE_ATK_${attacker}_${square.square}_${index}`
        }))
        newArrows.push(...attackArrows)
      }

      // Défenseurs de la pièce (vert)
      if (arrowPreferences.showDefenders && square.piece.defendedBy.length > 0) {
        const defendArrows = square.piece.defendedBy.map((defender: string, index: number) => ({
          startSquare: defender,
          endSquare: square.square,
          color: 'green',
          id: `PIECE_DEF_${defender}_${square.square}_${index}`
        }))
        newArrows.push(...defendArrows)
      }

      // Note: showMobility et showCaptures sont gérés par la coloration des cases,
      // pas par les flèches - ils sont traités dans un autre hook/composant
    }

    // ===== FLÈCHES POUR LE CONTRÔLE DE LA CASE =====

    // Contrôleurs blancs (jaune clair)
    if (arrowPreferences.showWhiteControl && square.control.whiteControllers.length > 0) {
      const whiteControlArrows = square.control.whiteControllers.map((controller: string, index: number) => ({
        startSquare: controller,
        endSquare: square.square,
        color: 'yellow',
        id: `WHITE_CTRL_${controller}_${square.square}_${index}`
      }))
      newArrows.push(...whiteControlArrows)
    }

    // Contrôleurs noirs (violet clair)
    if (arrowPreferences.showBlackControl && square.control.blackControllers.length > 0) {
      const blackControlArrows = square.control.blackControllers.map((controller: string, index: number) => ({
        startSquare: controller,
        endSquare: square.square,
        color: 'purple',
        id: `BLACK_CTRL_${controller}_${square.square}_${index}`
      }))
      newArrows.push(...blackControlArrows)
    }

    setArrows(newArrows)
  }, [selectedSquare, analysisData, arrowPreferences])

  // Fonction utilitaire pour obtenir des infos sur la case sélectionnée
  const getSquareInfo = useCallback(() => {
    if (!selectedSquare || !analysisData) return null

    const square = analysisData.board[selectedSquare.rank][selectedSquare.file]
    if (!square) return null

    return {
      // Infos sur la pièce
      piece: square.piece ? {
        type: square.piece.type,
        color: square.piece.color,
        attackedBy: square.piece.attackedBy,
        defendedBy: square.piece.defendedBy,
        isHanging: square.piece.isHanging,
        isPinned: square.piece.isPinned,
        exchangeValue: square.piece.exchangeValue
      } : null,

      // Infos sur le contrôle
      control: {
        dominantColor: square.control.dominantColor,
        controlBalance: square.control.controlBalance,
        isContested: square.control.isContested,
        whiteStrength: square.control.whiteStrength,
        blackStrength: square.control.blackStrength
      },

      // Infos sur la mobilité
      mobility: square.mobility.totalMobility,

      // Coordonnées
      square: square.square
    }
  }, [selectedSquare, analysisData])

  useEffect(() => {
    if (selectedSquare && analysisData) {
      updateArrowsForSelectedSquare()
    } else {
      setArrows([]) // Nettoyer les flèches si pas de sélection
    }
  }, [selectedSquare, analysisData, arrowPreferences, updateArrowsForSelectedSquare])

  return {
    arrows,
    getSquareInfo // Bonus : fonction pour obtenir les infos de la case
  }
}