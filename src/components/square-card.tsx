import { EnrichedSquare } from '../engine/types'
import { ArrowPreferences, SquarePreferences } from '../hooks/useVisualizationPreferences'

type SquareCardProps = {
  square: EnrichedSquare | undefined
  arrowPreferences: ArrowPreferences
  onToggleAttackers: () => void
  onToggleDefenders: () => void
  squarePreferences: SquarePreferences
  onToggleMobility: () => void
}

export default function SquareCard ({
  square,
  arrowPreferences,
  onToggleAttackers,
  onToggleDefenders,
  squarePreferences,
  onToggleMobility
}: SquareCardProps) {
  if (!square) {
    return null
  }

  const getPieceIcon = (type: string, color: string) => {
    const pieces: Record<string, Record<string, string>> = {
      'k': { 'w': '♔', 'b': '♚' },
      'q': { 'w': '♕', 'b': '♛' },
      'r': { 'w': '♖', 'b': '♜' },
      'b': { 'w': '♗', 'b': '♝' },
      'n': { 'w': '♘', 'b': '♞' },
      'p': { 'w': '♙', 'b': '♟' }
    }
    return pieces[type]?.[color] || '?'
  }

  const getColorCircle = (color: string) => {
    return color === 'w' ? '⚪' : '⚫'
  }

  return (
    <div>
      <div className="flex items-center">
        <div className="text-lg font-bold">{square.square}</div>
        {square.piece && (
          <div className="text-2xl flex items-center gap-2">
            <span>{getPieceIcon(square.piece.type, square.piece.color)}</span>
            <span>{getColorCircle(square.piece.color)}</span>
          </div>
        )}
        {square.piece && (
          <div className="flex items-center gap-2">
            <div
              onClick={onToggleMobility}
              className="px-2 py-1 rounded-lg bg-blue-500 text-white text-xs cursor-pointer ml-2"
            >
              {squarePreferences.showMobility ? 'Hide mobility' : 'Show mobility'}
            </div>
          </div>
        )}
      </div>

      {/* PIÈCE PRÉSENTE : Afficher attaquants/défenseurs */}
      {square.piece ? (
        <>
          <div className="flex items-center justify-between mt-2">
            <div>Attackers: {square.piece.attackedBy.length}</div>
            {square.piece.attackedBy.length > 0 && (
              <div
                className={`px-2 py-1 rounded-lg text-white text-xs cursor-pointer ml-2 ${
                  arrowPreferences.showAttackers ? 'bg-red-500' : 'bg-blue-500'
                }`}
                onClick={onToggleAttackers}
              >
                {arrowPreferences.showAttackers ? 'Hide' : 'Show'}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>Defenders: {square.piece.defendedBy.length}</div>
            {square.piece.defendedBy.length > 0 && (
              <div
                className={`px-2 py-1 rounded-lg text-white text-xs cursor-pointer ml-2 ${
                  arrowPreferences.showDefenders ? 'bg-green-500' : 'bg-blue-500'
                }`}
                onClick={onToggleDefenders}
              >
                {arrowPreferences.showDefenders ? 'Hide' : 'Show'}
              </div>
            )}
          </div>

          {/* Informations tactiques */}
          {square.piece.isHanging && (
            <div className="text-red-600 font-bold">⚠️ Hanging piece!</div>
          )}
          {square.piece.isPinned && (
            <div className="text-orange-600 font-bold">📌 Pinned piece!</div>
          )}
          {square.piece.exchangeValue !== 0 && (
            <div className={square.piece.exchangeValue > 0 ? 'text-green-600' : 'text-red-600'}>
              Exchange: {square.piece.exchangeValue > 0 ? '+' : ''}{square.piece.exchangeValue}
            </div>
          )}
        </>
      ) : (
        /* CASE VIDE : Afficher contrôle de la case */
        <>
          <div className="flex items-center justify-between mt-2">
            <div>White control: {square.control.whiteControllers.length}</div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>Black control: {square.control.blackControllers.length}</div>
          </div>

          {/* Informations sur le contrôle */}
          {square.control.dominantColor && (
            <div className={`font-bold ${square.control.dominantColor === 'w' ? 'text-blue-600' : 'text-red-600'}`}>
              Controlled by: {square.control.dominantColor === 'w' ? 'White' : 'Black'}
            </div>
          )}
          {square.control.isContested && (
            <div className="text-purple-600 font-bold">⚔️ Contested square</div>
          )}
        </>
      )}

      {/* Structure de pions (gardé pour compatibilité) */}
      {square.pawnStructure.isPawn && (
        <div>
          {square.pawnStructure.isolated && <div className="text-left">Isolated Pawn</div>}
          {square.pawnStructure.doubled && <div className="text-left">Doubled Pawn</div>}
          {square.pawnStructure.passed && <div className="text-left">Passed Pawn</div>}
          {square.pawnStructure.backward && <div className="text-left">Backward pawn</div>}
          {square.pawnStructure.hanging && <div className="text-left">Hanging Pawn</div>}
          {square.pawnStructure.blocked.isBlocked && <div className="text-left">Blocked Pawn</div>}
          {square.pawnStructure.blocked.permanentlyBlocked && <div className="text-left">Locked Pawn</div>}
        </div>
      )}
    </div>
  )
}