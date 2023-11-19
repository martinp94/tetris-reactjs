import './styles/normalize.css'
import './styles/index.css'
import { Canvas } from './components/Canvas/Canvas'
import { useGameLoop } from './hooks/useGameLoop'
import { usePrevious } from './hooks/usePrevious'
import { GameBoard, GameStatus } from './types'
import { useState, useEffect } from 'react'


const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(null)

  const [
    matrix,
    currentTetrominoMatrix,
    gameOver,
    updateTimestamp,
    points,
    speed
  ]: [GameBoard, GameBoard, boolean, number, number, number] = useGameLoop(gameStatus)

  const prevGameOver = usePrevious(gameOver)

  useEffect(() => {
    if (!prevGameOver && gameOver) setGameStatus(null)

  }, [gameOver])

  return (
    <div className="container">
      <main>
        <Canvas
          updateTimestamp={updateTimestamp}
          isGameOver={gameOver}
          matrix={matrix}
          currentTetrominoMatrix={currentTetrominoMatrix}
        />
      </main>

      <aside>

        {gameStatus === null ? <button onClick={() => { setGameStatus('started') }}>Start new game</button> : null}
        {gameStatus && ['started'].includes(gameStatus) ? <button onClick={() => { setGameStatus('paused') }}>Pause</button> : null}
        {gameStatus === 'paused' ? <button onClick={() => { setGameStatus('started') }}>Resume</button> : null}

        <h2>Points: {points}</h2>
        <h2>Speed: {Math.trunc(speed)}</h2>
      </aside>
    </div>
  )
}

export default App
