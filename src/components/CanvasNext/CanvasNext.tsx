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

	for (let col = 0; col < 2; col++) {
		for (let row = 0; row < 4; row++) {
			ctx.beginPath()
			if (shape[col] && shape[col][row]) {
				ctx.fillStyle = shape[col][row] as TetrominoColor
				ctx.strokeStyle = "#fff"
			} else {
				ctx.strokeStyle = "#FFFAD0"
				ctx.fillStyle = '#FFFAD0'
			}
			ctx.fillRect(rectWidth * row, rectWidth * col, rectWidth, rectWidth)
			ctx.lineWidth = 1
			ctx.strokeRect(rectWidth * row, rectWidth * col, rectWidth, rectWidth)
			ctx.fill()
		}
	}

}

export const CanvasNext: React.FC<Props> = ({ tetromino, tetrominoId }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const canvas = canvasRef.current

		if (canvas) {
			const context: (CanvasRenderingContext2D | null) = canvas.getContext('2d')
	
			draw(context, tetromino)
		}
	}, [tetrominoId])

	return (
		<canvas ref={canvasRef} width={250} height={tetromino.shapes[0].length * 75} id="game-canvas-next">
			Unable to run game
		</canvas>
	)
}
