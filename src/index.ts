const enum PLAYER {
	'FIRST' = 'x',
	'LAST' = 'o',
}
type GAME_STATES = 'PLAY' | 'DRAW' | PLAYER;

let gameState: GAME_STATES = 'PLAY';
let isPlayerX = true;
let mustPlayAt = NaN;
const board: string[][] = [
	// Row 1
	[],
	[],
	[],
	// Row 2
	[],
	[],
	[],
	// Row 3
	[],
	[],
	[],
];

const winLines = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

function getBoardWinner(board: string[]): null | PLAYER {
	for (const [i, j, k] of winLines) {
		const a = board[i];
		const b = board[j];
		const c = board[k];
		if (a && a === b && a === c) {
			return a as PLAYER;
		}
	}

	return null;
}

function getOuterBoardState(changed?: number): GAME_STATES {
	const winTable: string[] = [];
	const path = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	if (changed !== undefined) {
		[path[changed], path[0]] = [path[0], path[changed]];
	}

	for (const i of path) {
		const innerWinner = getBoardWinner(board[i]);
		if (innerWinner) winTable[i] = innerWinner;
		else if (i === changed) {
			// Escape early since no changes
			return isBoardDraw(winTable) ? 'DRAW' : 'PLAY';
		}
	}

	const outerWinner = getBoardWinner(winTable);
	if (outerWinner) return outerWinner;
	return isBoardDraw(winTable) ? 'DRAW' : 'PLAY';
}

function isBoardDraw(board: string[]): boolean {
	for (let i = 0; i < 9; i++) {
		if (!board[i]) return false;
	}

	return true;
}

function markBoard(outer: number, inner: number): GAME_STATES {
	let mark = isPlayerX ? PLAYER.FIRST : PLAYER.LAST;
	board[outer][inner] = mark;

	if (isBoardDraw(board[inner])) {
		outer = NaN;
	} else {
		outer = inner;
	}

	return (gameState = getOuterBoardState(outer));
}
