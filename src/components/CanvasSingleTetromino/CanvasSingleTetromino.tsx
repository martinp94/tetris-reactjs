import { useRef, useEffect } from 'react'
import { Tetromino, TetrominoColor } from '../../types'

interface Props {
	tetrominoId: string;
	tetromino: Tetromino;
}

const draw = (ctx: (CanvasRenderingContext2D | null), tetromino: Tetromino): void => {
	if (!ctx) return

	const shape = tetromino.shapes[0]

	const canvasWidth = 500

	const rectWidth = canvasWidth / 10

	for (let colAbove = 0; colAbove < 1; colAbove++) {
		for (let row = 0; row < 6; row++) {
			ctx.beginPath()
			ctx.fillStyle = '#ffc400'
			ctx.fillRect(rectWidth * row, rectWidth * (colAbove / 2), rectWidth, rectWidth / 2)
	
			ctx.fill()
		}
	}

	for (let col = 0; col < 2; col++) {
		for (let row = 0; row < 6; row++) {
			ctx.beginPath()
			if (shape[col] && shape[col][row - 1]) {
				ctx.fillStyle = shape[col][row - 1] as TetrominoColor
				ctx.strokeStyle = "#fff"
			} else {
				ctx.strokeStyle = "#ffc400"
				ctx.fillStyle = '#ffc400'
			}
			ctx.fillRect(rectWidth * (row), rectWidth * (col + 0.5), rectWidth, rectWidth)
			ctx.lineWidth = 1
			ctx.strokeRect(rectWidth * (row), rectWidth * (col + 0.5), rectWidth, rectWidth)
			ctx.fill()
		}
	}


	for (let colBelow = 5; colBelow < 6; colBelow++) {
		for (let row = 0; row < 6; row++) {
			ctx.beginPath()
			ctx.fillStyle = '#ffc400'
			ctx.fillRect(rectWidth * row, rectWidth * (colBelow / 2), rectWidth, rectWidth / 2)
	
			ctx.fill()
		}
	}
}

export const CanvasSingleTetromino: React.FC<Props> = ({ tetromino, tetrominoId }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const canvas = canvasRef.current

		if (canvas) {
			const context: (CanvasRenderingContext2D | null) = canvas.getContext('2d')
	
			draw(context, tetromino)
		}
	}, [tetrominoId])

	return (
		<canvas ref={canvasRef} width={250} height={175} id="game-canvas-next">
			Unable to run game
		</canvas>
	)
}
