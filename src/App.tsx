import './styles/normalize.css'
import './styles/index.css'
import { Canvas } from './components/Canvas/Canvas'
import { useGameLoop } from './hooks/useGameLoop'
import { usePrevious } from './hooks/usePrevious'
import { GameBoard, GameStatus } from './types'
import { useState, useEffect } from 'react'


const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(null)

  const [matrix, gameOver, updateTimestamp]: [GameBoard, boolean, number] = useGameLoop(gameStatus)

  const prevGameOver = usePrevious(gameOver)
  
  useEffect(() => {
    if (!prevGameOver && gameOver) {
      setGameStatus(null)
    }

  }, [gameOver])

  console.log('updtimespam[', updateTimestamp)
  return (
    <main>
      <Canvas
        updateTimestamp={updateTimestamp}
        isGameOver={gameOver}
        matrix={matrix}
      />
      {gameStatus === null ? <button onClick={() => { setGameStatus('started') }}>Start new game</button> : null}
      {gameStatus && ['started', 'resumed'].includes(gameStatus) ? <button onClick={() => { setGameStatus('paused') }}>Pause</button> : null}
      {gameStatus === 'paused' ? <button onClick={() => { setGameStatus('resumed') }}>Resumse</button> : null}
    </main>
  )
}

export default App
