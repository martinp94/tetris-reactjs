import { useState, useEffect } from 'react'
import { initialMatrix } from '../data/initialMatrix'
import { GameBoard, GameStatus } from '../types'
import { useTetromino } from '../hooks/useTetromino'


let matrix: GameBoard = JSON.parse(JSON.stringify(initialMatrix))
console.log('matrix', matrix)
let prevX: number = -1
let prevY: number = -1
let timeoutId: null | ReturnType<typeof setTimeout> = null

export const useGameLoop = (gameStatus: GameStatus): [GameBoard, boolean, number] => {
  const [speed] = useState<number>(50)
  // const [score, setScore] = useState<number>(0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [updateTimestamp, setUpdateTimestamp] = useState<number>(Date.now())
  const [x, setX] = useState<number>(-1)
  const [y, setY] = useState<number>(-1)

	const [
		currentTetromino,
		currentShape,
		updateTetrominoes,
		rotate,
		// getNextShape
	] = useTetromino()

	const clearPrevTetromino = (): void => {
		if (!currentShape) return

		let tetroX = 0
		let tetroY = 0

		for (let col = prevY; col < prevY + currentShape.length; col++) {
			for (let row = prevX; row < prevX + currentShape[0].length; row++) {
				console.log('tetroX', tetroX)
				console.log('tetroY', tetroY)
				console.log('currentTetromino[tetroY][tetroX]', currentShape[tetroY][tetroX])
				matrix[col][row] = null
				tetroX++
			}

			tetroX = 0
			tetroY++
		}
	}

	const updateMatrix = () => {
		if (!currentShape) return

		if (y + currentShape.length > 20) return
		clearPrevTetromino()

		let tetroX = 0
		let tetroY = 0

		for (let col = y; col < y + currentShape.length; col++) {
			for (let row = x; row < x + currentShape[0].length; row++) {

				console.log('updateMatrix tetroX', tetroX)
				console.log('updateMatrix tetroY', tetroY)
				console.log('updateMatrix col', col)
				console.log('updateMatrix row', row)
				console.log('updateMatrix currentTetromino[tetroY][tetroX]', currentShape[tetroY][tetroX])
				if (typeof matrix[col] !== 'undefined') {
					matrix[col][row] = currentShape[tetroY][tetroX]
				}
				tetroX++
			}

			tetroX = 0
			tetroY++
		}
	}

	const updateMatrixPrevElement = () => {
		if (!currentShape) return

		let tetroX = 0
		let tetroY = 0

		for (let col = prevY; col < prevY + currentShape.length; col++) {
			for (let row = prevX; row < prevX + currentShape[0].length; row++) {

				console.log('updateMatrix tetroX', tetroX)
				console.log('updateMatrix tetroY', tetroY)
				console.log('updateMatrix col', col)
				console.log('updateMatrix row', row)
				console.log('updateMatrix currentTetromino[tetroY][tetroX]', currentShape[tetroY][tetroX])
				if (typeof matrix[col] !== 'undefined') {
					matrix[col][row] = currentShape[tetroY][tetroX]
				}
				tetroX++
			}

			tetroX = 0
			tetroY++
		}
	}

	const checkBounds = (x: number) => {
		if (!currentShape) return

		if (x + currentShape[0].length > 9 || x < 0) return false
		return true
	}

	const checkCollision = () => {
		if (!currentShape) return

		if (y + currentShape.length > 20) return true
		clearPrevTetromino()

		let tetroX = 0
		let tetroY = 0

		for (let col = y; col < y + currentShape.length; col++) {
			for (let row = x; row < x + currentShape[0].length; row++) {
				console.log('checkCollision tetroX', tetroX)
				console.log('checkCollision tetroY', tetroY)
				console.log('checkCollision r', row)
				console.log('checkCollision c', col)
				console.log('checkCollision currentTetromino[tetroY][tetroX]', currentShape[tetroY][tetroX])
				console.log('checkCollision matrix[col][row]', matrix[col][row])
				if (matrix[col][row] !== null && currentShape[tetroY][tetroX] !== null) {
					updateMatrixPrevElement()
					return true
				}
				tetroX++
			}

			tetroX = 0
			tetroY++
		}

		// updateMatrix()
		return false
	}

	const getInitialX = (): number => {
		const newX = Math.floor(Math.random() * 10)
		console.log('newX', newX)
		if (checkBounds(newX)) return newX
		return getInitialX()
	}

	useEffect(() => {
		if (!currentShape || gameOver || x === -1 || y === -1) return

		if (y < 20) {
			const cc = checkCollision()
			console.log(`yisy cc`, y, cc)
			if (cc && y < currentShape.length) return setGameOver(true)

			if (checkCollision()) {
				setX(-1)
				setY(-1)
				prevX = -1
				prevY = -1
				if (timeoutId) clearTimeout(timeoutId)
				return
			}

			updateMatrix()
			console.log('updated Matrix', matrix)
		}

		console.log('updated Matrix', matrix)
		setUpdateTimestamp(Date.now())

		timeoutId = setTimeout(() => {
			rotate()
			setY(y + 1)
			prevY = y
		}, speed)
	}, [x, y, currentShape, gameOver])

	useEffect(() => {
		if (!currentShape) return

		if (x === - 1 && y === -1) {
			updateTetrominoes()
			const initialX = getInitialX()
			setX(initialX)
			prevX = initialX
			setY(0)
			prevY = 0
		}
	}, [x, y, currentShape])

	useEffect(() => {
		if (gameStatus === 'started') {
			matrix = JSON.parse(JSON.stringify(initialMatrix))
			setGameOver(false)
			updateTetrominoes()
		}
	}, [gameStatus])


	return [matrix, gameOver, updateTimestamp]
}
