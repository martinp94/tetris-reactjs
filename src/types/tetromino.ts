export type TetrominoColor = '#00FFFF' | '#0000FF' | '#FFA500' | '#FFFF00' | '#008000' | '#800080' | '#FF0000'

export type Tetromino = {
	name: string;
	color: TetrominoColor;
	matrix: Array<Array<TetrominoColor | null>>
}