import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import SquareCard from './components/square-card'
// import TeamDisplay from './components/teamDisplay.tsx'
import { useChessboardHandlers } from './hooks/useChessboardHandlers'
import { useVisualizationPreferences } from './hooks/useVisualizationPreferences'
import { useSquareSelection } from './hooks/useSquareSelection'
import { usePositionAnalysis } from './hooks/usePositionAnalysis'
import { useArrowsManager } from './hooks/useArrowsManager'
import { useSquareStylesManager } from './hooks/useSquareStylesManager'

export default function App() {
  const chessGameRef = useRef(new Chess('r3kb1r/pp2n1pp/5p2/2B2b2/8/5N2/PPq2PPP/RN1QR1K1 w kq - 1 14'))
  const chessGame = chessGameRef.current

  const [chessPosition, setChessPosition] = useState(chessGame.fen())
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')

  // Hooks pour gérer les différentes responsabilités
  const { analysisData, isAnalyzing, analyzePosition } = usePositionAnalysis()
  const { selectedSquare, setSelectedSquare } = useSquareSelection()
  const {
    arrowPreferences,
    squarePreferences,
    toggleAttackers,
    toggleDefenders,
    toggleMobility
  } = useVisualizationPreferences()

  const { arrows } = useArrowsManager(selectedSquare, analysisData, arrowPreferences)
  const { squareStyles, updateLastMoveStyles } = useSquareStylesManager(selectedSquare, analysisData, squarePreferences)

  const { onSquareClick, onPieceDrop } = useChessboardHandlers(
    chessGame,
    setChessPosition,
    analyzePosition,
    setSelectedSquare,
    updateLastMoveStyles
  )

  // Analyse initiale
  useEffect(() => {
    analyzePosition(chessGame.fen())
  }, [analyzePosition])

  const toggleBoardOrientation = () => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')
  }

  const chessboardOptions = {
    position: chessPosition,
    onPieceDrop,
    onSquareClick,
    squareStyles,
    allowDragging: true,
    id: 'basic-chessboard',
    arrows,
    boardOrientation
  }

  // Déterminer les équipes selon l'orientation
  // const leftTeam = boardOrientation === 'white' ? analysisData?.whiteTeam : analysisData?.blackTeam
  // const rightTeam = boardOrientation === 'white' ? analysisData?.blackTeam : analysisData?.whiteTeam
  const leftTeamColor = boardOrientation === 'white' ? 'white' : 'black'
  const rightTeamColor = boardOrientation === 'white' ? 'black' : 'white'

  return (
    <div className="flex flex-row min-h-screen">
      {/* Team de gauche */}
      {/*<div className="p-3">*/}
      {/*  {leftTeam && <TeamDisplay team={leftTeam} color={leftTeamColor}/>}*/}
      {/*</div>*/}

      {/* Section centrale : Chessboard + SquareCard */}
      <div className="flex flex-col p-1 items-center">
        {/* Bouton pour changer l'orientation */}
        <div className="mb-4">
          <button
            onClick={toggleBoardOrientation}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Flip Board ({boardOrientation === 'white' ? 'Black' : 'White'} to bottom)
          </button>
        </div>

        {/* Chessboard */}
        <div className="w-[600px] mb-4">
          <Chessboard options={chessboardOptions}/>
        </div>

        {/* SquareCard */}
        <div className="w-[600px]">
          {selectedSquare ? (
            <div className="w-full h-40 bg-blue-50 p-2.5 rounded-lg border-2 border-blue-500 text-blue-800 font-bold text-center">
              <SquareCard
                key={`${selectedSquare.file}-${selectedSquare.rank}`}
                square={analysisData?.board[selectedSquare.rank][selectedSquare.file]}
                arrowPreferences={arrowPreferences}
                onToggleAttackers={toggleAttackers}
                onToggleDefenders={toggleDefenders}
                squarePreferences={squarePreferences}
                onToggleMobility={toggleMobility}
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-blue-50 p-2.5 rounded-lg border-2 border-blue-500 text-blue-800 font-bold text-center flex items-center justify-center">
              Cliquez sur une case
            </div>
          )}
        </div>
      </div>

      {/* Team de droite */}
      {/*<div className="p-3">*/}
      {/*  {rightTeam && <TeamDisplay team={rightTeam} color={rightTeamColor}/>}*/}
      {/*</div>*/}
    </div>
  )
}