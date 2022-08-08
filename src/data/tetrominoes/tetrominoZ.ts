import { Tetromino } from '../../types'

export const tetrominoZ: Tetromino = {
	name: 'Z',
	color: '#FF0000',
	shapes: [
		[['#FF0000', '#FF0000', null], [null, '#FF0000', '#FF0000']],
		[[null, '#FF0000'], ['#FF0000', '#FF0000'], ['#FF0000', null]],
		[['#FF0000', '#FF0000', null], [null, '#FF0000', '#FF0000']],
		[[null, '#FF0000'], ['#FF0000', '#FF0000'], ['#FF0000', null]]
	],
	xyDiff: [
		[0, 0],
		[1, 0],
		[-1, 1],
		[0, -1]
	]
}
