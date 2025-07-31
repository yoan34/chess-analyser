import { useState, useEffect, useCallback } from 'react'
import type { Square } from 'chess.js'
import type { AnalysisData } from '../engine'
import type { SquareIndex } from './useSquareSelection'
import { SquarePreferences } from './useVisualizationPreferences'
type SquareStyleType = 'MOBILITY' | 'LAST_MOVE' | 'WEAK_SQUARE' | 'CHECK_SQUARE'

type SquareStyle = Partial<Record<Square, {
  backgroundColor: string
  type: SquareStyleType
}>>

export function useSquareStylesManager(
  selectedSquare: SquareIndex | null,
  analysisData: AnalysisData | null,
  squarePreferences: SquarePreferences
) {
  const [squareStyles, setSquareStyles] = useState<Record<string, React.CSSProperties>>({})
  const [internalStyles, setInternalStyles] = useState<SquareStyle>({})

  useEffect(() => {
    if (selectedSquare && analysisData) {
      updateSquareStylesForSelectedSquare()
    }
  }, [selectedSquare, squarePreferences, analysisData])

  const updateSquareStylesForSelectedSquare = () => {
    if (!selectedSquare || !analysisData) return

    const square = analysisData.board[selectedSquare.rank][selectedSquare.file]
    if (!square) return

    // Nettoyer les styles de mobilité précédents
    const cleanedStyles: SquareStyle = {}
    for (const key in internalStyles) {
      const style = internalStyles[key as Square]
      if (style?.type !== 'MOBILITY') {
        cleanedStyles[key as Square] = style
      }
    }

    // Ajouter les nouveaux styles de mobilité
    const newMobilityStyles: SquareStyle = {}
    if (squarePreferences.showMobility) {
      const allMoves = [
        ...square.mobility.moves,
        ...square.mobility.captures,
        ...square.mobility.checks
      ]

      allMoves.forEach((move) => {
        newMobilityStyles[move as Square] = {
          backgroundColor: 'rgb(96, 149, 247)',
          type: 'MOBILITY',
        }
      })
    }

    const finalStyles = { ...cleanedStyles, ...newMobilityStyles }
    setInternalStyles(finalStyles)
    setSquareStyles(convertToCSSStyles(finalStyles))
  }

  const updateLastMoveStyles = useCallback((from: string, to: string) => {
    // Supprimer les anciens styles de dernier coup
    const cleanedStyles: SquareStyle = {}
    for (const key in internalStyles) {
      const style = internalStyles[key as Square]
      if (style?.type !== 'LAST_MOVE') {
        cleanedStyles[key as Square] = style
      }
    }

    // Ajouter les nouveaux styles de dernier coup
    const finalStyles = {
      ...cleanedStyles,
      [from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)', type: 'LAST_MOVE' as SquareStyleType },
      [to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)', type: 'LAST_MOVE' as SquareStyleType },
    }

    setInternalStyles(finalStyles)
    setSquareStyles(convertToCSSStyles(finalStyles))
  }, [internalStyles])

  return { squareStyles, updateLastMoveStyles }
}

// Fonction utilitaire pour convertir les styles internes en styles CSS
function convertToCSSStyles(styles: SquareStyle): Record<string, React.CSSProperties> {
  const result: Record<string, React.CSSProperties> = {}

  for (const key in styles) {
    const style = styles[key as Square]
    if (style) {
      result[key] = { backgroundColor: style.backgroundColor }
    }
  }

  return result
}