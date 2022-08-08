import { Tetromino } from '../../types'

export const tetrominoI: Tetromino = {
	name: 'I',
	color: '#00FFFF',
	shapes: [
		[['#00FFFF', '#00FFFF', '#00FFFF', '#00FFFF']],
		[['#00FFFF'], ['#00FFFF'], ['#00FFFF'], ['#00FFFF']]
	],
	xyDiff: [
		[-2, 1],
		[2, -1]
	]
}
