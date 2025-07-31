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

    if (arrowPreferences.showAttackers && square.attackers.length > 0) {
      const attackArrows = square.attackers.map((attacker: string, index: number) => ({
        startSquare: attacker,
        endSquare: square.square,
        color: 'red',
        id: `ATK_${attacker}_${square.square}_${index}`
      }))
      newArrows.push(...attackArrows)
    }

    if (arrowPreferences.showDefenders && square.defenders.length > 0) {
      const defendArrows = square.defenders.map((defender: string, index: number) => ({
        startSquare: defender,
        endSquare: square.square,
        color: 'green',
        id: `DEF_${defender}_${square.square}_${index}`
      }))
      newArrows.push(...defendArrows)
    }

    setArrows(newArrows)
  }, [selectedSquare, analysisData, arrowPreferences])

  useEffect(() => {
    if (selectedSquare && analysisData) {
      updateArrowsForSelectedSquare()
    }
  }, [selectedSquare, analysisData, arrowPreferences, updateArrowsForSelectedSquare])

  return { arrows }
}
