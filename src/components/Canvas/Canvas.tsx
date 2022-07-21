import { useRef, useEffect } from 'react'
import { GameBoard } from '../../types'

type Matrix = GameBoard;

interface Props {
	matrix: Matrix;
	currentTetrominoMatrix: Matrix;
	isGameOver: boolean;
	updateTimestamp: number;
}

const draw = (ctx: (CanvasRenderingContext2D | null), matrix: Matrix, currentTetrominoMatrix: Matrix): void => {
	console.log('matrica', matrix)
	console.log('matrica current', currentTetrominoMatrix)
	if (!ctx) return

	const canvasWidth = ctx.canvas.width
	// console.log('canvasWidth', canvasWidth)
	// console.log('ctx.canvas', ctx)
	// ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

	const rectWidth = canvasWidth / 10
	// console.log('rww', Math.round(rectWidth))


	for (let col = 0; col < 20; col++) {
		for (let row = 0; row < 10; row++) {
			ctx.beginPath()
			// ctx.fillStyle = 'rgb(255, 0, 0)'
			ctx.fillStyle = matrix[col][row] || currentTetrominoMatrix[col][row] || '#000'
			// if (row === 4 && [3,4,5,6].includes(col)) {
			// 	ctx.fillStyle = '#00BFFF'
			// } else {
			// 	ctx.fillStyle = '#000000'
			// }
			ctx.fillRect(rectWidth * row, rectWidth * col, rectWidth, rectWidth)
			ctx.strokeStyle = "#fff"
			ctx.lineWidth = 1
			ctx.strokeRect(rectWidth * row, rectWidth * col, rectWidth, rectWidth)
			ctx.fill()
		}
	}

}

export const Canvas: React.FC<Props> = ({ matrix, currentTetrominoMatrix, updateTimestamp }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const canvas = canvasRef.current

		if (canvas) {
			const widthRatio = 0.5
			canvas.width = canvas.height * widthRatio
	
			const context: (CanvasRenderingContext2D | null) = canvas.getContext('2d')
	
			draw(context, matrix, currentTetrominoMatrix)
		}
	}, [updateTimestamp])

	const height = window.innerHeight * .9

	return (
		<canvas ref={canvasRef} width={height/2} height={height} id="game-canvas">
			Unable to run game
		</canvas>
	)
}
