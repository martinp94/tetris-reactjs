import { Tetromino } from '../../types'

export const tetrominoT: Tetromino = {
	name: 'T',
	color: '#800080',
	shapes: [
		[[null, '#800080', null], ['#800080', '#800080', '#800080']],
		[['#800080', '#800080', '#800080'], [null, '#800080', null]],
		[['#800080', null], ['#800080', '#800080'], ['#800080', null]],
		[[null, '#800080'], ['#800080', '#800080'], [null, '#800080']],
	]
}
