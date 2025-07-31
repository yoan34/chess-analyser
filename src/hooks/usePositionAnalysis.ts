import { useState, useCallback } from 'react'
import { type AnalysisData, chessAnalyzer } from '../engine'

export function usePositionAnalysis() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzePosition = useCallback(async (fen: string) => {
    setIsAnalyzing(true)
    try {
      const data = await chessAnalyzer(fen)
      setAnalysisData(data)
    } catch (error) {
      console.error('❌ Erreur d\'analyse:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  return { analysisData, isAnalyzing, analyzePosition }
}