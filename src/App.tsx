import './styles/normalize.css'
import './styles/index.css'
import { Canvas } from './components/Canvas/Canvas'
import { CanvasSingleTetromino } from './components/CanvasSingleTetromino/CanvasSingleTetromino'
import { useGameLoop } from './hooks/useGameLoop'
import { usePrevious } from './hooks/usePrevious'
import { GameBoard, GameStatus, Tetromino } from './types'
import { useState, useEffect } from 'react'

let interval: NodeJS.Timeout

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(null)
  const [time, setTime] = useState<number>(0)

  const [
    matrix,
    currentTetrominoMatrix,
    tetrominoId,
    gameOver,
    updateTimestamp,
    points,
    speed,
    level,
    nextTetromino1,
    nextTetromino2,
    nextTetromino3,
    holdTetromino
  ]: [GameBoard, GameBoard, string, boolean, number, number, number, number, Tetromino | null, Tetromino | null, Tetromino | null, Tetromino | null] = useGameLoop(gameStatus)

  const prevGameOver = usePrevious(gameOver)

  useEffect(() => {
    // add event listener on key press for pausing game on "P" or "p" key
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.key.toLowerCase() === 'p') {
        if (gameStatus === 'started') {
          setGameStatus('paused')
        } else if (gameStatus === 'paused') {
          setGameStatus('started')
        }
      }
    }

    window.addEventListener('keypress', handleKeyPress)
  }, [gameStatus])

  useEffect(() => {
    if (gameStatus === 'started') {
      interval = setInterval(() => {
        setTime((time) => time + 1)
      }, 1000)

      if (prevGameOver) setTime(0)
    }

    return () => { clearInterval(interval) }
  }, [gameStatus])

  const getTime = (): string => {
    const minutes = Math.floor(time / 60)
    const seconds = time - minutes * 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!prevGameOver && gameOver) {
      setGameStatus(null)
    }

  }, [gameOver])

  return (
    <div className="container">
      <aside>
        <div className='canvas-aside'>
          {holdTetromino ? (
            <>
              <h2>Hold</h2>
              <CanvasSingleTetromino tetrominoId={tetrominoId} tetromino={holdTetromino} />
            </>

          ) : null}
        </div>
      </aside>

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
          <h2>Level: {level}</h2>
        </div>

        <div className='canvas-aside'>
          <h2>Next</h2>

          {nextTetromino1 ? <CanvasSingleTetromino tetrominoId={tetrominoId} tetromino={nextTetromino1} /> : null}
          {nextTetromino2 ? <CanvasSingleTetromino tetrominoId={tetrominoId} tetromino={nextTetromino2} /> : null}
          {nextTetromino3 ? <CanvasSingleTetromino tetrominoId={tetrominoId} tetromino={nextTetromino3} /> : null}

        </div>
      </aside>
    </div>
  )
}

export default App
