import { useState, useEffect } from 'react'
import { initialMatrix } from '../data/initialMatrix'
import { GameBoard, GameStatus } from '../types'
import { useTetromino } from '../hooks/useTetromino'

let matrix: GameBoard = JSON.parse(JSON.stringify(initialMatrix))
let currentTetrominoMatrix: GameBoard = matrix

console.log('matrix', matrix)
let x: number = -1
let y: number = -1

let vX: number = 0
let vY: number = 1

const updateCoordinates = ({ newX, newY }: { newX: number; newY: number; }): void => {
	if (typeof newX === 'number') x = newX
	if (typeof newY === 'number') y = newY
}

const updateVectors = ({ newVX, newVY }: { newVX: number; newVY: number; }): void => {
	if (typeof newVX === 'number') vX = newVX
	if (typeof newVY === 'number') vY = newVY
}

const getNextX = () => x + vX
const getNextY = () => y + vY

let timeoutId: null | ReturnType<typeof setTimeout> = null

export const useGameLoop = (gameStatus: GameStatus): [GameBoard, GameBoard, boolean, number] => {
  const [speed, setSpeed] = useState<number>(500)
  // const [score, setScore] = useState<number>(0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [updateTimestamp, setUpdateTimestamp] = useState<number>(Date.now())

	const [tetrominoId, currentTetromino, currentShape, shapeWidth, shapeHeight, updateTetrominoes, rotate] = useTetromino()

	useEffect(() => {
		if (gameStatus === 'started') {
			setGameOver(false)
			resetMatrix()
			updateTetrominoes()
		}
	}, [gameStatus])

	useEffect(function initRount() {
		if (!currentShape) return

		console.log('INIT ROUND!!!')
		console.log('tetrominoId', tetrominoId)

		updateVectors({ newVX: 0, newVY: 1 })
		console.log('current shape', currentShape)
		updateCoordinates({ newX: getInitialX(), newY: -1 })
		console.log('x', x)
		move()
	}, [tetrominoId])

	const move = (): void => {
		console.log('MOVE!!!')
		if (timeoutId) clearTimeout(timeoutId)

		if (!checkBounds(getNextX())) {
			console.log('BOUNDS NOT OK!!!')
			updateVectors({ newVX: 0, newVY: 1 })
			return
		}

		if (checkCollision()) {
			if (getNextY() === 0) {
				updateCurrentTetrominoMatrix()
				setUpdateTimestamp(Date.now())

				setGameOver(true)
				return
			}

			updateMatrix()
			setUpdateTimestamp(Date.now())
			// setSpeed(speed - 50)
			updateTetrominoes()
			return
		}

		updateCurrentTetrominoMatrix()
		updateCoordinates({ newX: getNextX(), newY: getNextY() })
		updateVectors({ newVX: 0, newVY: 1 })
		setUpdateTimestamp(Date.now())

		console.log('END MOVE!!!')
		timeoutId = setTimeout(move, speed)
	}

	const updateMatrix = (): void => {
		if (!currentShape) return

		let tetroX = 0, tetroY = 0

		for (let row = y; row < y + shapeHeight; row++) {
			for (let col = x; col < x + shapeWidth; col++) {
				if (currentShape[tetroY][tetroX] !== null || matrix[row][col] === null) {
					matrix[row][col] = currentShape[tetroY][tetroX]
				}

				tetroX++
			}

			tetroX = 0
			tetroY++
		}
	}

	const checkBounds = (x: number) => {
		if (!currentShape) return

		if (x + shapeWidth > 9 || x < 0) return false
		return true
	}

	const checkCollision = (): boolean => {
		if (!currentShape) return true

		const nextX = getNextX()
		const nextY = getNextY()

		if (nextY + shapeHeight > 20) return true

		let tetroX = 0, tetroY = 0

		for (let row = nextY; row < nextY + shapeHeight; row++) {
			for (let col = nextX; col < nextX + shapeWidth; col++) {
				if (matrix[row][col] !== null && currentShape[tetroY][tetroX] !== null) {
					return true
				}
				tetroX++
			}

			tetroX = 0
			tetroY++
		}

		return false
	}

	const getInitialX = (): number => {
		const newX = Math.floor(Math.random() * 10)
		
		if (checkBounds(newX)) { console.log('getinitialx new', newX); return newX }
		return getInitialX()
	}

	const resetMatrix = (): void => {
		matrix = JSON.parse(JSON.stringify(initialMatrix))
		currentTetrominoMatrix = matrix
	}

	const updateCurrentTetrominoMatrix = (): void => {
		if (!currentShape) return

		currentTetrominoMatrix = JSON.parse(JSON.stringify(initialMatrix))

		for (let row = 0; row < 20; row++) {
			for (let col = 0; col < 10; col++) {
				currentTetrominoMatrix[row][col] = matrix[row][col]
			}
		}

		let tetroX = 0, tetroY = 0

		const nextX = getNextX()
		const nextY = getNextY()

		for (let row = nextY; row < nextY + shapeHeight; row++) {
			for (let col = nextX; col < nextX + shapeWidth; col++) {
				if (currentShape[tetroY][tetroX] === null && matrix[row][col] !== null) {
					currentTetrominoMatrix[row][col] = matrix[row][col]
				} else {
					currentTetrominoMatrix[row][col] = currentShape[tetroY][tetroX]
				}
				tetroX++
			}

			tetroX = 0
			tetroY++
		}
	}

	return [matrix, currentTetrominoMatrix, gameOver, updateTimestamp]
}
