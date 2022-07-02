import { useState, useEffect } from 'react'
import { initialMatrix } from '../data/initialMatrix'
import { Tetromino, GameBoard, GameStatus } from '../types'


const tetrominoT: Tetromino = {
	name: 'T',
	color: '#800080',
	matrix: [[null, '#800080', null], ['#800080', '#800080', '#800080']]
}

let matrix: GameBoard = JSON.parse(JSON.stringify(initialMatrix))
console.log('matrix', matrix)
let prevX: number = -1
let prevY: number = -1
let timeoutId: null | ReturnType<typeof setTimeout> = null

export const useGameLoop = (gameStatus: GameStatus): [GameBoard, boolean, number] => {
  const [speed] = useState<number>(50)
  const [currentTetromino, setCurrentTetromino] = useState<Tetromino | null>(null)
  // const [nextTetromino, setNextTetromino] = useState<Tetromino | null>(null)
  // const [score, setScore] = useState<number>(0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [updateTimestamp, setUpdateTimestamp] = useState<number>(Date.now())
  const [x, setX] = useState<number>(-1)
  const [y, setY] = useState<number>(-1)

	const clearPrevTetromino = (): void => {
		if (!currentTetromino) return

		let tetroX = 0
		let tetroY = 0

		for (let col = prevY; col < prevY + currentTetromino.matrix.length; col++) {
			for (let row = prevX; row < prevX + currentTetromino.matrix[0].length; row++) {
				console.log('tetroX', tetroX)
				console.log('tetroY', tetroY)
				console.log('currentTetromino[tetroY][tetroX]', currentTetromino.matrix[tetroY][tetroX])
				matrix[col][row] = null
				tetroX++
			}

			tetroX = 0
			tetroY++
		}
	}

	const updateMatrix = () => {
		if (!currentTetromino) return

		if (y + currentTetromino.matrix.length > 20) return
		clearPrevTetromino()

		let tetroX = 0
		let tetroY = 0

		for (let col = y; col < y + currentTetromino.matrix.length; col++) {
			for (let row = x; row < x + currentTetromino.matrix[0].length; row++) {

				console.log('updateMatrix tetroX', tetroX)
				console.log('updateMatrix tetroY', tetroY)
				console.log('updateMatrix col', col)
				console.log('updateMatrix row', row)
				console.log('updateMatrix currentTetromino[tetroY][tetroX]', currentTetromino.matrix[tetroY][tetroX])
				if (typeof matrix[col] !== 'undefined') {
					matrix[col][row] = currentTetromino.matrix[tetroY][tetroX]
				}
				tetroX++
			}

			tetroX = 0
			tetroY++
		}
	}

	const updateMatrixPrevElement = () => {
		if (!currentTetromino) return

		let tetroX = 0
		let tetroY = 0

		for (let col = prevY; col < prevY + currentTetromino.matrix.length; col++) {
			for (let row = prevX; row < prevX + currentTetromino.matrix[0].length; row++) {

				console.log('updateMatrix tetroX', tetroX)
				console.log('updateMatrix tetroY', tetroY)
				console.log('updateMatrix col', col)
				console.log('updateMatrix row', row)
				console.log('updateMatrix currentTetromino[tetroY][tetroX]', currentTetromino.matrix[tetroY][tetroX])
				if (typeof matrix[col] !== 'undefined') {
					matrix[col][row] = currentTetromino.matrix[tetroY][tetroX]
				}
				tetroX++
			}

			tetroX = 0
			tetroY++
		}
	}

	const checkBounds = (x: number) => {
		if (!currentTetromino) return

		if (x + currentTetromino.matrix[0].length > 9 || x < 0) return false
		return true
	}

	const checkCollision = () => {
		if (!currentTetromino) return

		if (y + currentTetromino.matrix.length > 20) return true
		clearPrevTetromino()

		let tetroX = 0
		let tetroY = 0

		for (let col = y; col < y + currentTetromino.matrix.length; col++) {
			for (let row = x; row < x + currentTetromino.matrix[0].length; row++) {
				console.log('checkCollision tetroX', tetroX)
				console.log('checkCollision tetroY', tetroY)
				console.log('checkCollision r', row)
				console.log('checkCollision c', col)
				console.log('checkCollision currentTetromino[tetroY][tetroX]', currentTetromino.matrix[tetroY][tetroX])
				console.log('checkCollision matrix[col][row]', matrix[col][row])
				if (matrix[col][row] !== null && currentTetromino.matrix[tetroY][tetroX] !== null) {
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
		if (!currentTetromino || gameOver || x === -1 || y === -1) return

		if (y < 20) {
			const cc = checkCollision()
			console.log(`yisy cc`, y, cc)
			if (cc && y < currentTetromino.matrix.length) return setGameOver(true)

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
			setY(y + 1)
			prevY = y
		}, speed)
	}, [x, y, currentTetromino, gameOver])

	useEffect(() => {
		if (!currentTetromino) return

		if (x === - 1 && y === -1) {
			const initialX = getInitialX()
			setX(initialX)
			prevX = initialX
			setY(0)
			prevY = 0
		}
	}, [x, y, currentTetromino])

	useEffect(() => {
		if (gameStatus === 'started') {
			matrix = JSON.parse(JSON.stringify(initialMatrix))
			setCurrentTetromino(tetrominoT)
			setGameOver(false)
		}
	}, [gameStatus])


	return [matrix, gameOver, updateTimestamp]
}
