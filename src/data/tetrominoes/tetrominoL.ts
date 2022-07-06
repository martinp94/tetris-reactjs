import { Tetromino } from '../../types'

export const tetrominoL: Tetromino = {
	name: 'L',
	color: '#FF8100',
	shapes: [
		[[null, null, '#FF8100'], ['#FF8100', '#FF8100', '#FF8100']],
		[['#FF8100', '#FF8100', '#FF8100'], ['#FF8100', null, null]],
		[['#FF8100', null], ['#FF8100', null], ['#FF8100', '#FF8100']],
		[['#FF8100', '#FF8100'], [null, '#FF8100'], [null, '#FF8100']],
	]
}
