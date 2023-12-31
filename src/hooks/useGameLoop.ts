import { useState, useEffect } from 'react'
import { initialMatrix } from '../data/initialMatrix'
import { GameBoard, GameStatus, Tetromino, TetrominoShape, TetriminoPosition } from '../types'
import { useTetromino } from '../hooks/useTetromino'
import { usePrevious } from '../hooks/usePrevious'
import { throttle } from 'throttle-debounce'

type CheckCollisionOpts = {
	nextX: number;
	nextY: number;
}

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
let currentShapeIndex: TetriminoPosition = 0

const getNextShapePosition = (currentTetromino: Tetromino | null): TetriminoPosition => {
	if (!currentTetromino) return 0

	const nextShapePosition = (currentShapeIndex+ 1) % currentTetromino.shapes.length

	if (nextShapePosition === 0 || nextShapePosition === 1 || nextShapePosition === 2 || nextShapePosition === 3) return nextShapePosition

	return 0
}

const getPreviousShapePosition = (currentTetromino: Tetromino | null): TetriminoPosition => {
	if (!currentTetromino) return 0

	const previousShapePosition = currentShapeIndex === 0 ? currentTetromino.shapes.length - 1 : currentShapeIndex - 1

	if (previousShapePosition === 0 || previousShapePosition === 1 || previousShapePosition === 2 || previousShapePosition === 3) return previousShapePosition

	return 0
}

const getNextShape = (currentTetromino: Tetromino | null): [TetrominoShape | null, TetriminoPosition, Array<number>] => {
	if (!currentTetromino?.rotations) return [null, 0, [0, 0]]

	const nextShapePosition = getNextShapePosition(currentTetromino)

	if (currentTetromino.rotations[currentShapeIndex] && nextShapePosition in currentTetromino.rotations[currentShapeIndex]) {
		const rotations = currentTetromino.rotations[currentShapeIndex][nextShapePosition]

		const nextShape = currentTetromino.shapes[nextShapePosition]

		return [nextShape, nextShapePosition, rotations?.[0] || [0, 0]]
	}

	return [null, 0, [0, 0]]
}

const getPreviousShape = (currentTetromino: Tetromino | null): [TetrominoShape | null, TetriminoPosition, Array<number>] => {
	if (!currentTetromino?.rotations) return [null, 0, [0, 0]]

	const previousShapePosition = getPreviousShapePosition(currentTetromino)

	if (currentTetromino.rotations[currentShapeIndex] && previousShapePosition in currentTetromino.rotations[currentShapeIndex]) {
		const rotations = currentTetromino.rotations[currentShapeIndex][previousShapePosition]

		const previousShape = currentTetromino.shapes[previousShapePosition]

		return [previousShape, previousShapePosition, rotations?.[0] || [0, 0]]
	}

	return [null, 0, [0, 0]]
}

const setNextShape = (currentTetromino: Tetromino | null): void => {
	if (!currentTetromino) return
	const [nextShape, nextShapePosition] = getNextShape(currentTetromino);

	currentShapeIndex = nextShapePosition;

	currentShape = nextShape;
}

const setPreviousShape = (currentTetromino: Tetromino | null): void => {
	if (!currentTetromino) return
	const [previousShape, previousShapeIndex] = getPreviousShape(currentTetromino)

	currentShapeIndex = previousShapeIndex
	currentShape = previousShape
}

const getShapeWidth = (shape: TetrominoShape): number => Array.isArray(shape) ? shape[0].length : 0
const getShapeHeight = (shape: TetrominoShape): number => Array.isArray(shape) ? shape.length : 0

const updateLock = (): void => {
	if (attemtsBeforeLock === 0) return
	attemtsBeforeLock--
	if (lockTimeoutId) clearTimeout(lockTimeoutId)

	shouldLock = false

	lockTimeoutId = setTimeout(() => {
		shouldLock = true
	}, 500)
}

let timeoutId: null | ReturnType<typeof setTimeout> = null

let lockTimeoutId: null | ReturnType<typeof setTimeout> = null
let attemtsBeforeLock: number = 15
let shouldLock: boolean = false

export const useGameLoop = (gameStatus: GameStatus): [GameBoard, GameBoard, string, boolean, number, number, number, number, Tetromino | null, Tetromino | null, Tetromino | null, Tetromino | null] => {
	const [speed, setSpeed] = useState<number>(500)
	const [gameOver, setGameOver] = useState<boolean>(false)
	const [updateTimestamp, setUpdateTimestamp] = useState<number>(Date.now())
	const [linesCleared, setLinesCleared] = useState<number>(0)
	const [points, setPoints] = useState<number>(0)
	const [level, setLevel] = useState<number>(1)

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
			timeoutId = setTimeout(moveDown, speed)
		}
	}, [gameStatus])

	useEffect(function initRount() {
		if (currentTetrominoShape) currentShape = currentTetrominoShape
		currentShapeIndex = 0
		attemtsBeforeLock = 15
		shouldLock = true

		if (!currentShape) return

		updateVectors({ newVX: 0, newVY: 1 })
		updateCoordinates({ newX: getInitialX(), newY: -1 })
		moveDown()
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

	const moveDown = (args: undefined | { forceLock: boolean } = undefined): void => {
		if (timeoutId) clearTimeout(timeoutId)

		if (checkCollision()) {
			if (getNextY() === 0) {
				updateCurrentTetrominoMatrix()
				setUpdateTimestamp(Date.now())

				setGameOver(true)
				return
			}

			if (attemtsBeforeLock === 0 || shouldLock || args?.forceLock) {
				updateMatrix()
				setUpdateTimestamp(Date.now())

				clearLevels()

				updateTetrominoes()

				return
			}

			timeoutId = setTimeout(moveDown, speed)
			return
		}

		updateVectors({ newVX: 0, newVY: 1 })
		updateCurrentTetrominoMatrix()
		updateCoordinates({ newX: getNextX(), newY: getNextY() })
		setUpdateTimestamp(Date.now())

		timeoutId = setTimeout(moveDown, speed)
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
				// let [nextShape, nextShapePosition, xyDiff] = getNextShape(currentTetromino)
				// updateVectors({ newVX: xyDiff[0], newVY: xyDiff[1] })
				if (!currentShape) return

				const nextShapePosition = getNextShapePosition(currentTetromino)
				const previousShapePosition = getPreviousShapePosition(currentTetromino)

				let isCollision = true
				let isRotatedCounterClockwise = false
				const rotationsCW = currentTetromino?.rotations?.[currentShapeIndex]?.[nextShapePosition]
				const rotationsCCW = currentTetromino?.rotations?.[currentShapeIndex]?.[previousShapePosition]

				if (Array.isArray(rotationsCW)) {
					for (const rotationIndex in rotationsCW) {
						const rotation = rotationsCW[rotationIndex]
						let newVX = rotation[0]
						let newVY = rotation[1]

						if (Number(rotationIndex) !== 0) {
							newVX = rotation[0] + rotationsCW[0][0]
							newVY = rotation[1] + rotationsCW[0][1]
						}

						updateVectors({ newVX, newVY })

						const shape = currentTetromino?.shapes?.[nextShapePosition]

						isCollision = checkCollision(shape)
						if (!isCollision) break
					}
				}

				if (Array.isArray(rotationsCCW) && isCollision) {
					for (const rotationIndex in rotationsCCW) {
						const rotation = rotationsCCW[rotationIndex]
						let newVX = rotation[0]
						let newVY = rotation[1]

						if (Number(rotationIndex) !== 0) {
							newVX = rotation[0] + rotationsCCW[0][0]
							newVY = rotation[1] + rotationsCCW[0][1]
						}

						updateVectors({ newVX, newVY })

						const shape = currentTetromino?.shapes?.[previousShapePosition]

						isCollision = checkCollision(shape)
						if (!isCollision) {
							isRotatedCounterClockwise = true
							break
						}
					}
				}

				if (isCollision) {
					updateVectors({ newVX: 0, newVY: 1 })
					break
				}

				if (isRotatedCounterClockwise) setPreviousShape(currentTetromino)
				else setNextShape(currentTetromino)

				updateCurrentTetrominoMatrix()
				updateCoordinates({ newX: getNextX(), newY: getNextY() })
				updateVectors({ newVX: 0, newVY: 1 })
				setUpdateTimestamp(Date.now())

				updateLock()

				break
			case 'ArrowDown':
				moveDown({ forceLock: true })
				break
			case 'ArrowLeft':
				updateVectors({ newVX: -1, newVY: 0 })

				if (checkCollision()) {
					updateVectors({ newVX: 0, newVY: 1 })
					break
				}

				updateCurrentTetrominoMatrix()
				updateCoordinates({ newX: getNextX(), newY: getNextY() })
				setUpdateTimestamp(Date.now())

				updateVectors({ newVX: 0, newVY: 1 })

				updateLock()

				break
			case 'ArrowRight':
				updateVectors({ newVX: 1, newVY: 0 })

				if (checkCollision()) {
					updateVectors({ newVX: 0, newVY: 1 })
					break
				}

				updateCurrentTetrominoMatrix()
				updateCoordinates({ newX: getNextX(), newY: getNextY() })
				setUpdateTimestamp(Date.now())

				updateVectors({ newVX: 0, newVY: 1 })

				updateLock()

				break
			case ' ':
				while (!checkCollision()) moveDown()
				moveDown({ forceLock: true })
				break
			case 'C':
			case 'c':
				hold()
				break
			default:
				break
		}
	})

	const checkCollision = (
		shape: TetrominoShape | null = currentShape,
		opts: CheckCollisionOpts = { nextX: getNextX(), nextY: getNextY() }
	): boolean => {
		if (!shape) return true

		const { nextX, nextY } = opts

		if (!checkBounds({ x: nextX, y: nextY }, shape)) updateVectors({ newVX: 0, newVY: 1 })

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
