import { useCallback } from 'react'
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard'
import type { Chess } from 'chess.js'
import type { SquareIndex } from './useSquareSelection'

export function useChessboardHandlers(
  chessGame: Chess,
  setChessPosition: (fen: string) => void,
  analyzePosition: (fen: string) => Promise<void>,
  setSelectedSquare: (square: SquareIndex) => void,
  updateLastMoveStyles: (from: string, to: string) => void
) {

  const onSquareClick = useCallback(({ square }: SquareHandlerArgs) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const fileIndex = files.indexOf(square[0])
    const rankIndex = 8 - parseInt(square[1])
    setSelectedSquare({ file: fileIndex, rank: rankIndex })
  }, [setSelectedSquare])

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
    if (!targetSquare) {
      return false
    }

    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      })

      const newFen = chessGame.fen()
      setChessPosition(newFen)
      analyzePosition(newFen)
      updateLastMoveStyles(sourceSquare, targetSquare)

      return true
    } catch {
      return false
    }
  }, [chessGame, setChessPosition, analyzePosition, updateLastMoveStyles])

  return { onSquareClick, onPieceDrop }
}
