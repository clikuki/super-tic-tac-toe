const enum PLAYER {
	'FIRST' = 'x',
	'LAST' = 'o',
}
type GAME_STATES = 'PLAY' | 'DRAW' | PLAYER;

let gameState: GAME_STATES = 'PLAY';
let isPlayerX = true;
let mustPlayAt = NaN;
const ignoredBoardIndices = new Set<number>();
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

function markBoard(outer: number, inner: number): void {
	let mark = isPlayerX ? PLAYER.FIRST : PLAYER.LAST;
	board[outer][inner] = mark;
	innerTileEls[outer][inner].setAttribute('data-mark', mark);
}

const boardEl = document.querySelector('.board')!;
const outerTileEls = Array.from(boardEl.children);
const innerTileEls = outerTileEls.map((el) => {
	const smallContainer = el.querySelector('.container') as HTMLElement;
	return Array.from(smallContainer.children);
});

innerTileEls.forEach((innerTiles, i) => {
	innerTiles.forEach((innerEl, j) => {
		innerEl.addEventListener('click', () => {
			if (
				(isNaN(mustPlayAt) && ignoredBoardIndices.has(i)) ||
				(!isNaN(mustPlayAt) && i !== mustPlayAt)
			) {
				return;
			}

			markBoard(i, j);
			isPlayerX = !isPlayerX;

			const innerWinner = getBoardWinner(board[i]);
			if (innerWinner) {
				outerTileEls[i].setAttribute('data-mark', innerWinner);
			}
			if (innerWinner || isBoardDraw(board[i])) {
				outerTileEls[i].removeAttribute('data-enabled');
				ignoredBoardIndices.add(i);
			}

			if (ignoredBoardIndices.has(j)) {
				mustPlayAt = NaN;
				for (let k = 0; k < 9; k++) {
					if (ignoredBoardIndices.has(k)) continue;
					outerTileEls[k].setAttribute('data-enabled', '');
				}
			} else {
				mustPlayAt = j;
				for (const outer of outerTileEls) {
					outer.removeAttribute('data-enabled');
				}
				outerTileEls[j].setAttribute('data-enabled', '');
			}

			gameState = getOuterBoardState(i);
		});
	});
});
