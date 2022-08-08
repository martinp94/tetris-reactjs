import { useState, useEffect } from 'react'
import { initialMatrix } from '../data/initialMatrix'
import { GameBoard, GameStatus, TetrominoShape } from '../types'
import { useTetromino } from '../hooks/useTetromino'
import { usePrevious } from '../hooks/usePrevious'
import { throttle } from 'throttle-debounce'

let matrix: GameBoard = JSON.parse(JSON.stringify(initialMatrix))
let currentTetrominoMatrix: GameBoard = matrix

// // console.log('matrix', matrix)
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

const getShapeWidth = (shape: TetrominoShape): number => Array.isArray(shape) ? shape[0].length : 0
const getShapeHeight = (shape: TetrominoShape): number  => Array.isArray(shape) ? shape.length : 0

let timeoutId: null | ReturnType<typeof setTimeout> = null

export const useGameLoop = (gameStatus: GameStatus): [GameBoard, GameBoard, boolean, number] => {
  const [speed, setSpeed] = useState<number>(500)
  // const [score, setScore] = useState<number>(0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [isRotating, setIsRotating] = useState<boolean>(false)
  const [updateTimestamp, setUpdateTimestamp] = useState<number>(Date.now())

	const isRotatingPrev = usePrevious(isRotating)

	const {
		tetrominoId,
		currentTetromino,
		currentShape,
		currentShapeIndex,
		updateTetrominoes,
		rotate,
		getNextShape
	} = useTetromino()

	useEffect(() => {
		if (gameStatus === 'started') {
			setGameOver(false)
			resetMatrix()
			updateTetrominoes()
		}
	}, [gameStatus])

	useEffect(function initRount() {
		if (!currentShape) return
		console.log('init r tetrominoId', tetrominoId)
		console.log('init r tetromino name', currentTetromino?.name)
		window.addEventListener("keydown", handleInput)

		// console.log('INIT ROUND!!!')
		// console.log('tetrominoId', tetrominoId)

		updateVectors({ newVX: 0, newVY: 1 })
		// console.log('current shape', currentShape)
		updateCoordinates({ newX: getInitialX(), newY: -1 })
		// console.log('x', x)
		move()

		return () => {
			console.log('REMOVE EL')
			window.removeEventListener('keydown', handleInput)
		}
	}, [tetrominoId])

	// useEffect(() => {
	// 	// window.addEventListener("keydown", handleInput)
	// 	return () => {
	// 		console.log('REMOVE EL')
	// 		// window.removeEventListener('keydown', handleInput)
	// 	}
	// }, [currentShapeIndex])

	useEffect(function rotation() {
		if (!currentShape) return

		// if (timeoutId) clearTimeout(timeoutId)
		// window.removeEventListener('keydown', handleInput)

		console.log('CSH CURRENT SHAPE UPDATED currentShapeIndex currentShape', currentShapeIndex, currentShape)

		if (isRotating) {
			console.log('CSH ROTATION old xy', x, y)
			console.log('CSH ROTATION old vxvy', vX, vY)
			// console.log('CSH ROTATION CURRENT SHAPE NEW', currentShape)

			updateCurrentTetrominoMatrix()
			updateCoordinates({ newX: getNextX(), newY: getNextY() })
			updateVectors({ newVX: 0, newVY: 1 })
			console.log('CSH ROTATION new xy', x, y)
			console.log('CSH ROTATION new vxvy', vX, vY)
			setUpdateTimestamp(Date.now())
			
			setIsRotating(false)
			// timeoutId = setTimeout(move, speed)
		}

		if (isRotatingPrev && !isRotating) {
			console.log('CSH ROTATION add listener NOW')
			window.addEventListener("keydown", handleInput)
			timeoutId = setTimeout(move, speed)
		}

		return () => {
			console.log('ROTATION CURRENT SHAPE REMOVE EL')
		}
	}, [isRotating])

	const move = (): void => {
		window.removeEventListener('keydown', handleInput)
		// console.log('MOVE!!!')
		console.log('MOVE vx vy', vX, vY)
		if (timeoutId) clearTimeout(timeoutId)

		if (!checkBounds(getNextX())) {
			console.log('BOUNDS NOT OK!!!')
			updateVectors({ newVX: 0, newVY: 1 })
			// return
		}

		if (checkCollision()) {
			console.log('COLLISION DETECTED!!!')
			if (getNextY() === 0) {
				updateCurrentTetrominoMatrix()
				setUpdateTimestamp(Date.now())

				setGameOver(true)
				return
			}

			updateMatrix()
			setUpdateTimestamp(Date.now())

			clearLevels()

			// setSpeed(speed - 50)
			updateTetrominoes()
			return
		}

		updateCurrentTetrominoMatrix()
		updateCoordinates({ newX: getNextX(), newY: getNextY() })
		updateVectors({ newVX: 0, newVY: 1 })
		setUpdateTimestamp(Date.now())

		// console.log('END MOVE!!!')
		window.addEventListener("keydown", handleInput)
		timeoutId = setTimeout(move, speed)
	}

	const clearLevels = (): void => {
		if (!currentShape) return
		const shapeHeight = getShapeHeight(currentShape)


		console.log('clear levels from to', y, y + shapeHeight)
		for (let row = y; row < y + shapeHeight; row++) {
			let clear = true

			for (let col = 0; col < 10; col++) {
				if (matrix[row][col] === null) clear = false
			}

			console.log('clear levels?', clear)
			if (clear) {
				for (let row1 = row; row1 > 0; row1--) {
					for (let col1 = 0; col1 < 10; col1++) {
						matrix[row1][col1] = matrix[row1 - 1][col1]
					}
				}
			}
		}
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

	const checkBounds = (x: number, shape: TetrominoShape | null = currentShape): boolean => {
		if (!shape) return false

		const shapeWidth = getShapeWidth(shape)

		if (x + shapeWidth - 1 > 9 || x < 0) return false
		return true
	}

	const performRotation = (): void => {
		// const nextShape: TetrominoShape = getNextShape()
		// const [shape, shapeIndex, xyDiff] = nextShape
		const [nextShape, shapeIndex, xyDiff] = getNextShape()
		console.log('performRotation next shape', nextShape)
		console.log('performRotation next xyDiff', xyDiff)
		updateVectors({ newVX: xyDiff[0], newVY: xyDiff[1] })

		if (!checkBounds(getNextX(), nextShape)) {
			console.log('BOUNDS NOT OK!!!')
			updateVectors({ newVX: 0, newVY: 1 })
			timeoutId = setTimeout(move, speed)
			return
		}

		if (checkCollision(nextShape)) {
			console.log('COLLISION DETECTED ON ROTATION!!!')
			updateVectors({ newVX: 0, newVY: 1 })
			timeoutId = setTimeout(move, speed)
			return
		}

		console.log('ROTATION CURRENT SHAPE OLD', currentShape)
		rotate()
		setIsRotating(true)
	}

	const handleInput = throttle(100, (event: KeyboardEvent): void => {
		if (timeoutId) clearTimeout(timeoutId)
		window.removeEventListener('keydown', handleInput)
		console.log('handleInput currentShape', currentShape)
		console.log('handleInput key', event.key)

		switch (event.key) {
			case 'ArrowUp':
				performRotation()
				// window.addEventListener("keydown", handleInput)
				// timeoutId = setTimeout(move, speed)
				break
			case 'ArrowDown':
				move()
				break
			case 'ArrowLeft':
				updateVectors({ newVX: -1, newVY: 0 })
				if (!checkBounds(getNextX())) {
					console.log('BOUNDS NOT OK!!!')
					updateVectors({ newVX: 0, newVY: 1 })

					window.addEventListener("keydown", handleInput)
					// timeoutId = setTimeout(move, speed)
					move()
				} else {
					if (checkCollision()) updateVectors({ newVX: 0, newVY: 1 })
					move()
				}
				break
			case 'ArrowRight':
				updateVectors({ newVX: 1, newVY: 0 })
				if (!checkBounds(getNextX())) {
					console.log('BOUNDS NOT OK!!!')
					updateVectors({ newVX: 0, newVY: 1 })
					
					window.addEventListener("keydown", handleInput)
					// timeoutId = setTimeout(move, speed)
					move()
				} else {
					if (checkCollision()) updateVectors({ newVX: 0, newVY: 1 })
					move()
				}
				break
			case ' ':
				while (!checkCollision()) move()
				console.log('handleInput SPACE')
				break
			default: break
		}
	})

	const checkCollision = (shape: TetrominoShape | null = currentShape): boolean => {
		if (!shape) {console.log('checkCollision SHAPE NOT OK', shape); return true}

		const nextX = getNextX()
		const nextY = getNextY()

		const shapeWidth = getShapeWidth(shape)
		const shapeHeight = getShapeHeight(shape)

		if (nextY + shapeHeight > 20) return true
		// console.log('checkCollision nextY + shapeHeight > 20', nextY + shapeHeight > 20)

		let tetroX = 0, tetroY = 0

		console.log('ccol nextX nextY shapeWidth shapeHeight', nextX, nextY, shapeWidth, shapeHeight)
		for (let row = nextY; row < nextY + shapeHeight; row++) {
			for (let col = nextX; col < nextX + shapeWidth; col++) {
				if (matrix[row][col] !== null && shape[tetroY][tetroX] !== null) {
					console.log('checkCollision matrix[row][col] !== null && shape[tetroY][tetroX] !== null', matrix[row][col] !== null && shape[tetroY][tetroX] !== null)
					console.log('checkCollision row, col, tetroY, tetroX', row, col, tetroY, tetroX)

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
		
		if (checkBounds(newX)) {
			// console.log('getinitialx new', newX);
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

	return [matrix, currentTetrominoMatrix, gameOver, updateTimestamp]
}
