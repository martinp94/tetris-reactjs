import './styles/normalize.css'
import './styles/index.css'
import { Canvas } from './components/Canvas/Canvas'
import { CanvasNext } from './components/CanvasNext/CanvasNext'
import { useGameLoop } from './hooks/useGameLoop'
import { usePrevious } from './hooks/usePrevious'
import { GameBoard, GameStatus, Tetromino } from './types'
import { useState, useEffect } from 'react'

let interval: NodeJS.Timeout

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(null)
  const [time, setTime] = useState<number>(0)

  useEffect(() => {
    if (gameStatus === 'started') {
      interval = setInterval(() => {
        setTime((time) => time + 1)
      }, 1000)
    }

    return () => { clearInterval(interval) }
  }, [gameStatus])

  const getTime = (): string => {
    const minutes = Math.floor(time / 60)
    const seconds = time - minutes * 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const [
    matrix,
    currentTetrominoMatrix,
    tetrominoId,
    gameOver,
    updateTimestamp,
    points,
    speed,
    nextTetromino1,
    nextTetromino2,
    nextTetromino3
  ]: [GameBoard, GameBoard, string, boolean, number, number, number, Tetromino | null, Tetromino | null, Tetromino | null] = useGameLoop(gameStatus)

  const prevGameOver = usePrevious(gameOver)

  useEffect(() => {
    if (!prevGameOver && gameOver) {
      setGameStatus(null)
      setTime(0)
    }

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
        <div>
          <h2>Time</h2>

          <p style={{ color: '#f00', fontWeight: 'bold' }}>{getTime()}</p>
        </div>
        <div>
          {gameStatus === null ? <button onClick={() => { setGameStatus('started') }}>Start new game</button> : null}
          {gameStatus && ['started'].includes(gameStatus) ? <button onClick={() => { setGameStatus('paused') }}>Pause</button> : null}
          {gameStatus === 'paused' ? <button onClick={() => { setGameStatus('started') }}>Resume</button> : null}

          <h2>Points: {points}</h2>
          <h2>Speed: {Math.trunc(speed)}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2>Next</h2>
          
          {nextTetromino1 ? <CanvasNext tetrominoId={tetrominoId} tetromino={nextTetromino1} /> : null}
          {nextTetromino2 ? <CanvasNext tetrominoId={tetrominoId} tetromino={nextTetromino2} /> : null}
          {nextTetromino3 ? <CanvasNext tetrominoId={tetrominoId} tetromino={nextTetromino3} /> : null}
          

        </div>
      </aside>
    </div>
  )
}

export default App
