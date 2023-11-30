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
	currentTetrominoShape: TetrominoShape | null,
	nextTetromino1: Tetromino | null,
	nextTetromino2: Tetromino | null,
	nextTetromino3: Tetromino | null,
	updateTetrominoes: Function
} => {
	const [id, setId] = useState<string>(uniqueId())
	const [currentTetromino, setCurrentTetromino] = useState<Tetromino | null>(null)
	const [nextTetromino1, setNextTetromino1] = useState<Tetromino | null>(null)
	const [nextTetromino2, setNextTetromino2] = useState<Tetromino | null>(null)
	const [nextTetromino3, setNextTetromino3] = useState<Tetromino | null>(null)
	const [shape, setShape] = useState<TetrominoShape | null>(null)

	useEffect(() => {
		const tetromino1: Tetromino | null = getRandomTetromino()
		setNextTetromino1(tetromino1)

		let tetromino2: Tetromino | null = getRandomTetromino()

		while (tetromino2?.name === tetromino1?.name) {
			tetromino2 = getRandomTetromino()
		}

		setNextTetromino2(tetromino2)

		let tetromino3: Tetromino | null = getRandomTetromino()

		while (tetromino3?.name === tetromino1?.name || tetromino3?.name === tetromino2?.name) {
			tetromino3 = getRandomTetromino()
		}

		setNextTetromino3(tetromino3)
	}, [])

	const updateTetrominoes = (): void => {
		let tetromino: Tetromino | null = null

		if (nextTetromino1) {
			tetromino = nextTetromino1

			if (nextTetromino2) setNextTetromino1(nextTetromino2)

			if (nextTetromino3) setNextTetromino2(nextTetromino3)


			let tetromino3: Tetromino | null = getRandomTetromino()

			while (tetromino3?.name === nextTetromino2?.name || tetromino3?.name === nextTetromino3?.name) {
				tetromino3 = getRandomTetromino()
			}

			setNextTetromino3(tetromino3)

			setCurrentTetromino(tetromino)
			setShape(tetromino.shapes[0])
			setId(uniqueId())
		}
	}

	return {
		tetrominoId: id,
		currentTetromino,
		currentTetrominoShape: shape,
		nextTetromino1,
		nextTetromino2,
		nextTetromino3,

		updateTetrominoes,
	}
}
