import { useState } from 'react'

export interface SquareIndex {
  file: number
  rank: number
}

export function useSquareSelection() {
  const [selectedSquare, setSelectedSquare] = useState<SquareIndex | null>(null)

  return { selectedSquare, setSelectedSquare }
}