import { useState } from 'react'

export interface ArrowPreferences {
  showAttackers: boolean
  showDefenders: boolean
}

export interface SquarePreferences {
  showMobility: boolean
  // Facile d'ajouter d'autres préférences ici :
  // showWeakSquares: boolean
  // showCheckSquares: boolean
}

export function useVisualizationPreferences() {
  const [arrowPreferences, setArrowPreferences] = useState<ArrowPreferences>({
    showAttackers: false,
    showDefenders: false
  })

  const [squarePreferences, setSquarePreferences] = useState<SquarePreferences>({
    showMobility: false
  })

  const toggleAttackers = () => {
    setArrowPreferences(prev => ({
      ...prev,
      showAttackers: !prev.showAttackers
    }))
  }

  const toggleDefenders = () => {
    setArrowPreferences(prev => ({
      ...prev,
      showDefenders: !prev.showDefenders
    }))
  }

  const toggleMobility = () => {
    setSquarePreferences(prev => ({
      ...prev,
      showMobility: !prev.showMobility
    }))
  }

  // Facile d'ajouter d'autres fonctions toggle :
  // const toggleWeakSquares = () => { ... }
  // const toggleCheckSquares = () => { ... }

  return {
    arrowPreferences,
    squarePreferences,
    toggleAttackers,
    toggleDefenders,
    toggleMobility
  }
}