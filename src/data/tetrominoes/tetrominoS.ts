import { Tetromino } from '../../types'

export const tetrominoS: Tetromino = {
	name: 'S',
	color: '#008000',
	shapes: [
		[[null, '#008000', '#008000'], ['#008000', '#008000', null]],
		[['#008000', null], ['#008000', '#008000'], [null, '#008000']]
	]
}
