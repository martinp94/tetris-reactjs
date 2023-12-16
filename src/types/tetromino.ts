export type TetrominoColor = '#00FFFF' | '#0000FF' | '#FF8100' | '#FFFF00' | '#008000' | '#800080' | '#FF0000'
export type TetriminoPosition = 0 | 1 | 2 | 3
export type TetrominoShape = Array<Array<TetrominoColor | null>>

export type TetriminoRotations = {
  [K in TetriminoPosition]: { [K in TetriminoPosition]?: number[][] };
}

export type Tetromino = {
	name: string;
	color: TetrominoColor;
	shapes: Array<TetrominoShape>;
	rotations?: TetriminoRotations;
}
