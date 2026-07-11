// Pure logic for the DEBUG CONSOLE puzzle (classic minesweeper, bug-themed).
// Bugs are placed after the first click (which is always safe, along with
// its 8 neighbours) and never move. The player marks suspected cells with a
// bug icon (minesweeper flags); marked cells can't be revealed until
// unmarked. The player wins when every bug-free cell is revealed.

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Cell {
    x: number;
    y: number;
}

export type Status = 'fresh' | 'playing' | 'won' | 'lost';

export interface GameState {
    cols: number;
    rows: number;
    bugCount: number;
    /** revealed[y][x] */
    revealed: boolean[][];
    /** flagged[y][x] — cells the player marked with a bug icon */
    flagged: boolean[][];
    /** bug positions, fixed once placed */
    bugs: Cell[];
    /** first placement, kept for Reset */
    initialBugs: Cell[];
    status: Status;
    /** the bug the player clicked on (defeat) */
    exploded: Cell | null;
}

interface DifficultyConfig {
    rows: number;
    maxCols: number;
    /** share of cells holding a bug */
    bugShare: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
    easy: { rows: 5, maxCols: 26, bugShare: 0.1 },
    normal: { rows: 6, maxCols: 32, bugShare: 0.13 },
    hard: { rows: 7, maxCols: 38, bugShare: 0.16 },
};

const shuffle = <T,>(items: T[]): T[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const neighbors8 = (c: Cell, cols: number, rows: number): Cell[] => {
    const out: Cell[] = [];
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const x = c.x + dx;
            const y = c.y + dy;
            if (x >= 0 && x < cols && y >= 0 && y < rows) out.push({ x, y });
        }
    }
    return out;
};

const blankGrid = (cols: number, rows: number): boolean[][] =>
    Array.from({ length: rows }, () => Array(cols).fill(false));

/** counts[y][x] = bugs in the 8 surrounding cells */
export const bugAdjacency = (state: GameState): number[][] => {
    const counts = Array.from({ length: state.rows }, () => Array(state.cols).fill(0));
    for (const bug of state.bugs) {
        for (const n of neighbors8(bug, state.cols, state.rows)) counts[n.y][n.x]++;
    }
    return counts;
};

export const createGame = (difficulty: Difficulty = 'normal', wantedCols?: number): GameState => {
    const { rows, maxCols, bugShare } = DIFFICULTY_CONFIG[difficulty];
    const cols = Math.min(Math.max(wantedCols ?? 12, 8), maxCols);
    return {
        cols,
        rows,
        bugCount: Math.round(cols * rows * bugShare),
        revealed: blankGrid(cols, rows),
        flagged: blankGrid(cols, rows),
        bugs: [],
        initialBugs: [],
        status: 'fresh',
        exploded: null,
    };
};

/** Same initial bug layout, board wiped. */
export const resetGame = (state: GameState): GameState => ({
    ...state,
    revealed: blankGrid(state.cols, state.rows),
    flagged: blankGrid(state.cols, state.rows),
    bugs: state.initialBugs,
    status: state.initialBugs.length > 0 ? 'playing' : 'fresh',
    exploded: null,
});

/** Mark/unmark a hidden cell with a bug icon (the minesweeper flag). */
export const toggleFlag = (state: GameState, target: Cell): GameState => {
    if (state.status === 'won' || state.status === 'lost') return state;
    if (state.revealed[target.y][target.x]) return state;
    const flagged = state.flagged.map(row => [...row]);
    flagged[target.y][target.x] = !flagged[target.y][target.x];
    return { ...state, flagged };
};

/** Random placement, keeping the first click and its 8 neighbours bug-free. */
const placeBugs = (cols: number, rows: number, count: number, safe: Cell): Cell[] => {
    const candidates: Cell[] = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (Math.abs(x - safe.x) > 1 || Math.abs(y - safe.y) > 1) candidates.push({ x, y });
        }
    }
    return shuffle(candidates).slice(0, count);
};

/**
 * Reveal a cell: defeat if a bug sits there, otherwise standard cascade on
 * zero-adjacency cells (flagged cells are never auto-revealed), then win
 * check. Flagged and already-revealed cells are inert.
 */
export const reveal = (state: GameState, target: Cell): GameState => {
    if (state.status === 'won' || state.status === 'lost') return state;
    if (state.revealed[target.y][target.x] || state.flagged[target.y][target.x]) return state;

    let bugs = state.bugs;
    let initialBugs = state.initialBugs;
    if (state.status === 'fresh') {
        bugs = placeBugs(state.cols, state.rows, state.bugCount, target);
        initialBugs = bugs;
    }

    const idx = (c: Cell) => c.y * state.cols + c.x;
    const bugSet = new Set(bugs.map(idx));
    if (bugSet.has(idx(target))) {
        return { ...state, bugs, initialBugs, status: 'lost', exploded: target };
    }

    const revealed = state.revealed.map(row => [...row]);
    const countAt = (c: Cell) =>
        neighbors8(c, state.cols, state.rows).filter(n => bugSet.has(idx(n))).length;
    const stack = [target];
    revealed[target.y][target.x] = true;
    while (stack.length > 0) {
        const c = stack.pop()!;
        if (countAt(c) !== 0) continue;
        for (const n of neighbors8(c, state.cols, state.rows)) {
            if (revealed[n.y][n.x] || state.flagged[n.y][n.x]) continue;
            revealed[n.y][n.x] = true;
            stack.push(n);
        }
    }

    let unrevealed = 0;
    for (const row of revealed) for (const cell of row) if (!cell) unrevealed++;

    return {
        ...state,
        revealed,
        bugs,
        initialBugs,
        status: unrevealed === bugs.length ? 'won' : 'playing',
        exploded: null,
    };
};
