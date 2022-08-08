export type TetrominoColor = '#00FFFF' | '#0000FF' | '#FF8100' | '#FFFF00' | '#008000' | '#800080' | '#FF0000'

export type TetrominoShape = Array<Array<TetrominoColor | null>>

export type Tetromino = {
	name: string;
	color: TetrominoColor;
	shapes: Array<TetrominoShape>;
	xyDiff: Array<Array<number>>;
}
