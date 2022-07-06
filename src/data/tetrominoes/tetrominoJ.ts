import { Tetromino } from '../../types'

export const tetrominoJ: Tetromino = {
	name: 'J',
	color: '#0000FF',
	shapes: [
		[['#0000FF', null, null, ], ['#0000FF', '#0000FF', '#0000FF']],
		[['#0000FF', '#0000FF', '#0000FF'], [null, null, '#0000FF']],
		[[null, '#0000FF'], [null, '#0000FF'], ['#0000FF', '#0000FF']],
		[['#0000FF', '#0000FF'], ['#0000FF', null], ['#0000FF', null]]
	]
}
