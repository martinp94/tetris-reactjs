import { useEffect, useState } from "react"
import { tetrominoT, tetrominoI, tetrominoJ, tetrominoL, tetrominoO, tetrominoS, tetrominoZ } from '../data/tetrominoes'
import { Tetromino, TetrominoShape } from '../types'

const getRandomTetromino = (): Tetromino => {
	const random: number = Math.floor(Math.random() * 7)

	switch (random) {
		case 0: return tetrominoI
		case 1: return tetrominoO
		case 2: return tetrominoT
		case 3: return tetrominoJ
		case 4: return tetrominoL
		case 5: return tetrominoS
		case 6: return tetrominoZ
		default: return tetrominoI
	}
}

const uniqueId = (): string => {
  return Math.ceil(Math.random() * Date.now()).toPrecision(16).toString().replace(".", "")
}

export const useTetromino = (): {
	tetrominoId: string,
	currentTetromino: Tetromino | null,
	currentShape: TetrominoShape | null,
	currentShapeIndex: number,
	updateTetrominoes: Function,
	rotate: Function,
	getNextShape: () => [TetrominoShape | null, number, Array<number>]
} => {
	const [id, setId] = useState<string>(uniqueId())
  const [currentTetromino, setCurrentTetromino] = useState<Tetromino | null>(null)
  const [nextTetromino, setNextTetromino] = useState<Tetromino | null>(null)
	const [shape, setShape] = useState<TetrominoShape | null>(null)
	const [shapeIndex, setShapeIndex] = useState<number>(0)

	const updateTetrominoes = (): void => {
		console.log('updateTetrominoes')
		let tetromino: Tetromino | null = null

		if (nextTetromino) {
			tetromino = nextTetromino
			setNextTetromino(getRandomTetromino())
		} else {
			tetromino = getRandomTetromino()
			setNextTetromino(getRandomTetromino())
		}

		// console.log('updated tetromino', tetromino.name)
		setCurrentTetromino(tetromino)
		setShapeIndex(0)
		setShape(tetromino.shapes[0])
		setId(uniqueId())
	}

	const getNextShape = (): [TetrominoShape | null, number, Array<number>] => {
		if (!currentTetromino) return [null, 0, [0, 0]]

		const nextShapeIndex = (shapeIndex + 1) % currentTetromino.shapes.length

		const nextShape = currentTetromino.shapes[nextShapeIndex]

		return [nextShape, nextShapeIndex, currentTetromino.xyDiff[nextShapeIndex]]
	}

	const rotate = (): void => {
		const [nextShape, nextShapeIndex] = getNextShape()

		console.log('rotate', nextShape, nextShapeIndex)

		setShapeIndex(nextShapeIndex)
		setShape(nextShape)
	}

	return {
		tetrominoId: id,
		currentTetromino,
		currentShape: shape,
		currentShapeIndex: shapeIndex,
		
		updateTetrominoes,
		rotate,
		getNextShape
	}
}
