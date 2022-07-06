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

export const useTetromino = (): [Tetromino | null, TetrominoShape | null, Function, Function, Function] => {
  const [currentTetromino, setCurrentTetromino] = useState<Tetromino | null>(null)
  const [nextTetromino, setNextTetromino] = useState<Tetromino | null>(null)
	const [shape, setShape] = useState<TetrominoShape | null>(null)
	const [shapeIndex, setShapeIndex] = useState<number>(0)

	const updateTetrominoes = (): void => {
		let tetromino: Tetromino | null = null

		if (nextTetromino) {
			tetromino = nextTetromino
			setNextTetromino(getRandomTetromino())
		} else {
			tetromino = getRandomTetromino()
			setNextTetromino(getRandomTetromino())
		}

		console.log('updated tetromino', tetromino.name)
		setCurrentTetromino(tetromino)
		setShapeIndex(0)
		setShape(tetromino.shapes[0])
	}

	const getNextShape = (): [TetrominoShape | null, number] => {
		if (!currentTetromino) return [null, 0]

		const nextShapeIndex = (shapeIndex + 1) % currentTetromino.shapes.length

		return [currentTetromino.shapes[nextShapeIndex], nextShapeIndex]
	}

	const rotate = (): void => {
		const [nextShape, nextShapeIndex] = getNextShape()

		console.log('rotate', nextShape, nextShapeIndex)

		setShapeIndex(nextShapeIndex)
		setShape(nextShape)
	}

	return [currentTetromino, shape, updateTetrominoes, rotate, getNextShape]
}
