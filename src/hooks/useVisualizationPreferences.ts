import { useState } from 'react'

export type ArrowPreferences = {
  // FLÈCHES
  showAttackers: boolean;       // Flèches rouges vers la pièce
  showDefenders: boolean;       // Flèches vertes vers la pièce
  showWhiteControl: boolean;    // Flèches jaunes de contrôle blanc
  showBlackControl: boolean;    // Flèches violettes de contrôle noir
}

export type SquarePreferences = {
  // COLORATION DES CASES
  showMobility: boolean;
  showCaptures: boolean;        // Cases orange pour les captures
  showThreats: boolean;         // Cases rouges pour les menaces
  showControl: boolean;         // Gradient de couleur selon le contrôle
}

export function useVisualizationPreferences() {
  const [arrowPreferences, setArrowPreferences] = useState<ArrowPreferences>({
    showAttackers: false,       // Flèches rouges vers la pièce
    showDefenders: false,       // Flèches vertes vers la pièce
    showWhiteControl: false,    // Flèches jaunes de contrôle blanc
    showBlackControl: false,
  })

  const [squarePreferences, setSquarePreferences] = useState<SquarePreferences>({
    showMobility: false,
    showCaptures: false,        // Cases orange pour les captures
    showThreats: false,         // Cases rouges pour les menaces
    showControl: false,
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