import { useState, useEffect } from 'react'
import { initialMatrix } from '../data/initialMatrix'
import { GameBoard, GameStatus, Tetromino, TetrominoShape } from '../types'
import { useTetromino } from '../hooks/useTetromino'
import { usePrevious } from '../hooks/usePrevious'
import { throttle } from 'throttle-debounce'

let matrix: GameBoard = JSON.parse(JSON.stringify(initialMatrix))
let currentTetrominoMatrix: GameBoard = matrix

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

let currentShape: TetrominoShape | null = null
let currentShapeIndex: number = 0

const getNextShape = (currentTetromino: Tetromino | null): [TetrominoShape | null, number, Array<number>] => {
	if (!currentTetromino) return [null, 0, [0, 0]]

	const nextShapeIndex = (currentShapeIndex + 1) % currentTetromino.shapes.length

	const nextShape = currentTetromino.shapes[nextShapeIndex]

	return [nextShape, nextShapeIndex, currentTetromino.xyDiff[nextShapeIndex]]
}

const setNextShape = (currentTetromino: Tetromino | null): void => {
	if (!currentTetromino) currentShape = null
	const [nextShape, nextShapeIndex] = getNextShape(currentTetromino)

	currentShapeIndex = nextShapeIndex
	currentShape = nextShape
}

const getShapeWidth = (shape: TetrominoShape): number => Array.isArray(shape) ? shape[0].length : 0
const getShapeHeight = (shape: TetrominoShape): number => Array.isArray(shape) ? shape.length : 0

let timeoutId: null | ReturnType<typeof setTimeout> = null

export const useGameLoop = (gameStatus: GameStatus): [GameBoard, GameBoard, string, boolean, number, number, number, number, Tetromino | null, Tetromino | null,Tetromino | null, Tetromino | null] => {
	const [speed, setSpeed] = useState<number>(500)
	const [gameOver, setGameOver] = useState<boolean>(false)
	const [isRotating, setIsRotating] = useState<boolean>(false)
	const [updateTimestamp, setUpdateTimestamp] = useState<number>(Date.now())
	const [linesCleared, setLinesCleared] = useState<number>(0)
	const [points, setPoints] = useState<number>(0)
	const [level, setLevel] = useState<number>(1)

	const isRotatingPrev = usePrevious(isRotating)
	const previousGameStatus = usePrevious(gameStatus)

	const {
		tetrominoId,
		currentTetromino,
		currentTetrominoShape,
		nextTetromino1,
		nextTetromino2,
		nextTetromino3,
		holdTetromino,
		updateTetrominoes,
		hold
	} = useTetromino()

	useEffect(() => {
		if (gameStatus === 'started' && !previousGameStatus) {
			setGameOver(false)
			resetMatrix()
			updateTetrominoes()
			setSpeed(500)
			setLinesCleared(0)
			setPoints(0)
			setLevel(1)
		}

		if (gameStatus === 'paused' && previousGameStatus === 'started') {
			if (timeoutId) clearTimeout(timeoutId)
			window.removeEventListener('keydown', handleInput)
		}

		if (gameStatus === 'started' && previousGameStatus === 'paused') {
			timeoutId = setTimeout(move, speed)
		}
	}, [gameStatus])

	useEffect(function initRount() {
		if (currentTetrominoShape) currentShape = currentTetrominoShape
		currentShapeIndex = 0

		if (!currentShape) return

		updateVectors({ newVX: 0, newVY: 1 })
		updateCoordinates({ newX: getInitialX(), newY: -1 })
		move()
		window.addEventListener("keydown", handleInput)

		return () => {
			window.removeEventListener('keydown', handleInput)
		}
	}, [tetrominoId])


	useEffect(() => {
		if (linesCleared >= 10) {
			setSpeed((prevSpeed) => prevSpeed * 0.9)
			setLinesCleared(0)
			setLevel((prevLevel) => prevLevel + 1)
		}
	}, [linesCleared])

	const move = (): void => {
		if (timeoutId) clearTimeout(timeoutId)

		if (!checkBounds({ x: getNextX(), y: getNextY() })) {
			updateVectors({ newVX: 0, newVY: 1 })
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

			clearLevels()

			updateTetrominoes()
			return
		}

		updateVectors({ newVX: 0, newVY: 1 })
		updateCurrentTetrominoMatrix()
		updateCoordinates({ newX: getNextX(), newY: getNextY() })
		setUpdateTimestamp(Date.now())

		timeoutId = setTimeout(move, speed)
	}

	const clearLevels = (): void => {
		if (!currentShape) return
		const shapeHeight = getShapeHeight(currentShape)

		let clearCount = 0

		for (let row = y; row < y + shapeHeight; row++) {
			let clear = true

			for (let col = 0; col < 10; col++) {
				if (matrix[row][col] === null) clear = false
			}

			if (clear) {
				clearCount++
				for (let row1 = row; row1 > 0; row1--) {
					for (let col1 = 0; col1 < 10; col1++) {
						matrix[row1][col1] = matrix[row1 - 1][col1]
					}
				}
			}
		}

		switch (clearCount) {
			case 1:
				setPoints((prevPoints) => prevPoints + (40 * level))
				break
			case 2:
				setPoints((prevPoints) => prevPoints + (100 * level))
				break
			case 3:
				setPoints((prevPoints) => prevPoints + (300 * level))
				break
			case 4:
				setPoints((prevPoints) => prevPoints + (1200 * level))
				break
			default: break
		}

		if (clearCount > 0) setLinesCleared((prevLinesCleared) => prevLinesCleared + clearCount)
	}

	const updateMatrix = (): void => {
		if (!currentShape) return

		let tetroX = 0, tetroY = 0

		const shapeWidth = getShapeWidth(currentShape)
		const shapeHeight = getShapeHeight(currentShape)

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

	const checkBounds = ({ x, y }: { x: number; y: number; }, shape: TetrominoShape | null = currentShape): boolean => {
		if (!shape) return false

		const shapeWidth = getShapeWidth(shape)

		if (x + shapeWidth - 1 > 9 || x < 0) return false

		const shapeHeight = getShapeHeight(shape)

		if (y + shapeHeight - 1 > 19 || y < 0) return false
		return true
	}

	const handleInput = throttle(80, (event: KeyboardEvent): void => {
		switch (event.key) {
			case 'ArrowUp':
				const [nextShape, shapeIndex, xyDiff] = getNextShape(currentTetromino)

				if (!checkBounds({ x: getNextX(), y: getNextY() }, nextShape)) {
					updateVectors({ newVX: 0, newVY: 1 })
					break
				}

				if (checkCollision(nextShape)) {
					updateVectors({ newVX: 0, newVY: 1 })
					break
				}

				if (!currentShape) {
					updateVectors({ newVX: 0, newVY: 1 })
					break
				}

				setNextShape(currentTetromino)

				updateCurrentTetrominoMatrix()
				updateVectors({ newVX: 0, newVY: 1 })
				setUpdateTimestamp(Date.now())

				break
			case 'ArrowDown':
				move()
				break
			case 'ArrowLeft':
				updateVectors({ newVX: -1, newVY: 0 })

				if (!checkBounds({ x: getNextX(), y: getNextY() }) || checkCollision()) {
					updateVectors({ newVX: 0, newVY: 1 })
					window.addEventListener("keydown", handleInput)
					break
				}

				updateCurrentTetrominoMatrix()
				updateCoordinates({ newX: getNextX(), newY: getNextY() })
				setUpdateTimestamp(Date.now())

				updateVectors({ newVX: 0, newVY: 1 })

				break
			case 'ArrowRight':
				updateVectors({ newVX: 1, newVY: 0 })

				if (!checkBounds({ x: getNextX(), y: getNextY() }) || checkCollision()) {
					updateVectors({ newVX: 0, newVY: 1 })
					break
				}

				updateCurrentTetrominoMatrix()
				updateCoordinates({ newX: getNextX(), newY: getNextY() })
				setUpdateTimestamp(Date.now())

				updateVectors({ newVX: 0, newVY: 1 })

				break
			case ' ':
				while (!checkCollision()) move()
				move()
				break
			case 'C':
			case 'c':
				hold()
				break
			default:
				break
		}
	})

	const checkCollision = (shape: TetrominoShape | null = currentShape): boolean => {
		if (!shape) return true

		const nextX = getNextX()
		const nextY = getNextY()

		const shapeWidth = getShapeWidth(shape)
		const shapeHeight = getShapeHeight(shape)

		if (nextY + (shapeHeight - 1) > 19) return true

		let tetroX = 0, tetroY = 0

		for (let row = nextY; row < nextY + shapeHeight; row++) {
			for (let col = nextX; col < nextX + shapeWidth; col++) {
				if (matrix[row][col] !== null && shape[tetroY][tetroX] !== null) return true

				tetroX++
			}

			tetroX = 0
			tetroY++
		}

		return false
	}

	const getInitialX = (): number => {
		const newX = Math.floor(Math.random() * 10)

		if (checkBounds({ x: newX, y: 0 })) {
			return newX
		}
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

		const shapeWidth = getShapeWidth(currentShape)
		const shapeHeight = getShapeHeight(currentShape)

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

	return [
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
	]
}
