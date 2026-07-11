// Pure logic for the OUTPUT tab puzzle (tangled arrow chains).
// The grid has `cols` x `rows` cells. Chains are snakes of adjacent cells;
// each chain slides out head-first along its exit direction. A chain can be
// extracted when the straight ray from its head to the grid border is free
// of every other remaining chain.

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Cell {
    x: number;
    y: number;
}

/** Unit direction the head slides toward. */
export type Dir = readonly [number, number];

export interface Chain {
    id: number;
    /** Body cells in order, tail first, head (exit end) last. */
    cells: Cell[];
    dir: Dir;
    /** Procedural hue so any chain count stays distinguishable. */
    hue: number;
}

export interface Puzzle {
    cols: number;
    rows: number;
    chains: Chain[];
}

interface DifficultyConfig {
    rows: number;
    maxCols: number;
    /** random-walk target length range for the snake partition */
    minLen: number;
    maxLen: number;
}

// The ladder starts at what used to be the hardest setting; normal and hard
// scale the grid and chain lengths up from there.
export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
    easy: { rows: 11, maxCols: 62, minLen: 16, maxLen: 40 },
    normal: { rows: 13, maxCols: 74, minLen: 20, maxLen: 50 },
    hard: { rows: 15, maxCols: 86, minLen: 24, maxLen: 60 },
};

const DIRS: Dir[] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
];

const cellKey = (x: number, y: number) => `${x},${y}`;

const shuffle = <T,>(items: T[]): T[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

/** Cells the head crosses between the chain and the grid border (may be empty). */
export const exitRay = (chain: Pick<Chain, 'cells' | 'dir'>, cols: number, rows: number): Cell[] => {
    const head = chain.cells[chain.cells.length - 1];
    const ray: Cell[] = [];
    let x = head.x + chain.dir[0];
    let y = head.y + chain.dir[1];
    while (x >= 0 && x < cols && y >= 0 && y < rows) {
        ray.push({ x, y });
        x += chain.dir[0];
        y += chain.dir[1];
    }
    return ray;
};

/**
 * Cells of other still-present chains sitting on `chain`'s exit ray.
 * Empty result = the chain can slide out.
 */
export const blockingCells = (
    puzzle: Puzzle,
    chain: Chain,
    gone: ReadonlySet<number>
): Cell[] => {
    const occupied = new Set<string>();
    for (const other of puzzle.chains) {
        if (other.id === chain.id || gone.has(other.id)) continue;
        for (const c of other.cells) occupied.add(cellKey(c.x, c.y));
    }
    return exitRay(chain, puzzle.cols, puzzle.rows).filter(c => occupied.has(cellKey(c.x, c.y)));
};

const neighborsOf = (c: Cell, cols: number, rows: number): Cell[] =>
    DIRS.map(([dx, dy]) => ({ x: c.x + dx, y: c.y + dy })).filter(
        n => n.x >= 0 && n.x < cols && n.y >= 0 && n.y < rows
    );

/**
 * Partition the whole grid into snake-shaped chains — every cell is used, so
 * the chains fill the rectangle completely. Chains grow long and winding:
 * each walk aims for a large target length, stepping onto the tightest free
 * cells (fewest free neighbours) so it hugs walls and leaves no orphan
 * pockets, and backtracks out of dead ends instead of stopping there.
 * Leftover stubs are merged onto an adjacent chain end when the snake shape
 * allows it (safety net, not the norm).
 */
export const partitionGrid = (cols: number, rows: number, minLen: number, maxLen: number): Cell[][] => {
    // Never let one chain swallow the whole board.
    const capCells = Math.ceil(cols * rows * 0.6);
    // Numeric cell indices: this function is the generation hot spot, and
    // string keys dominated its cost.
    const idxOf = (c: Cell) => c.y * cols + c.x;
    const free = new Map<number, Cell>();
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) free.set(y * cols + x, { x, y });
    }
    const freeDegree = (c: Cell) => {
        let d = 0;
        if (c.x + 1 < cols && free.has(idxOf(c) + 1)) d++;
        if (c.x - 1 >= 0 && free.has(idxOf(c) - 1)) d++;
        if (c.y + 1 < rows && free.has(idxOf(c) + cols)) d++;
        if (c.y - 1 >= 0 && free.has(idxOf(c) - cols)) d++;
        return d;
    };

    const bodies: Cell[][] = [];
    while (free.size > 0) {
        // Tightest start cell among a random sample (a full scan per chain
        // was the other hot spot; a sample finds corners just as well).
        const freeCells = [...free.values()];
        let start: Cell = freeCells[0];
        let startScore = Infinity;
        for (let s = Math.min(48, freeCells.length); s > 0; s--) {
            const c = freeCells[Math.floor(Math.random() * freeCells.length)];
            const sc = freeDegree(c) + Math.random();
            if (sc < startScore) {
                startScore = sc;
                start = c;
            }
        }
        // Skewed draw (r^1.6): lengths near maxLen stay possible but rare.
        const target = Math.min(
            minLen + Math.floor(Math.pow(Math.random(), 1.6) * (maxLen - minLen + 1)),
            capCells
        );
        const body: Cell[] = [start];
        free.delete(idxOf(start));
        // Cells already attempted from each position, so backtracking tries
        // a different branch instead of re-entering the same dead end.
        const tried: Set<number>[] = [new Set()];
        let backtracks = target * 2;
        // Variable straight-run length, redrawn at every turn: mostly short
        // (1-2 steps), occasionally longer (3-5), so the meanders look
        // organic instead of a repeated comb pattern.
        const drawSegTarget = () =>
            Math.random() < 0.6 ? 1 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 3);
        let segTarget = drawSegTarget();
        while (body.length < target) {
            const cur = body[body.length - 1];
            // Current direction and how many consecutive steps kept it.
            // Derived from the body so it survives backtracking.
            let lastDx = 0;
            let lastDy = 0;
            let run = 0;
            if (body.length >= 2) {
                const prev = body[body.length - 2];
                lastDx = cur.x - prev.x;
                lastDy = cur.y - prev.y;
                run = 1;
                for (let i = body.length - 2; i > 0; i--) {
                    if (body[i].x - body[i - 1].x !== lastDx || body[i].y - body[i - 1].y !== lastDy) break;
                    run++;
                }
            }
            const isStraight = (o: Cell) =>
                body.length >= 2 && o.x - cur.x === lastDx && o.y - cur.y === lastDy;
            let options = neighborsOf(cur, cols, rows).filter(n => {
                const k = idxOf(n);
                return free.has(k) && !tried[tried.length - 1].has(k);
            });
            // Segment finished: a turn is mandatory whenever one is available
            // (going straight stays allowed by necessity only).
            if (run >= segTarget) {
                const turns = options.filter(o => !isStraight(o));
                if (turns.length > 0) options = turns;
            }
            if (options.length > 0) {
                // Below the segment target, going straight gets a bonus so
                // segments actually reach their drawn length; turns are picked
                // with enough randomness that no axis dominates, while tight
                // cells keep a mild edge to avoid orphan pockets.
                let next = options[0];
                let nextScore = Infinity;
                for (const o of shuffle(options)) {
                    const s =
                        freeDegree(o) +
                        (isStraight(o) ? (run < segTarget ? -1.0 : 2.5) : 0) +
                        Math.random();
                    if (s < nextScore) {
                        nextScore = s;
                        next = o;
                    }
                }
                if (!isStraight(next)) segTarget = drawSegTarget();
                tried[tried.length - 1].add(idxOf(next));
                body.push(next);
                free.delete(idxOf(next));
                tried.push(new Set());
            } else {
                // Dead end: step back and branch elsewhere.
                if (body.length <= 1 || backtracks-- <= 0) break;
                const dropped = body.pop()!;
                free.set(idxOf(dropped), dropped);
                tried.pop();
            }
        }
        bodies.push(body);
    }

    // Merge tiny stubs onto an adjacent chain end (stub end must touch the
    // other chain's end to keep the snake contiguous).
    const isAdj = (a: Cell, b: Cell) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
    for (let i = bodies.length - 1; i >= 0; i--) {
        const stub = bodies[i];
        if (stub.length >= 6) continue;
        for (const other of bodies) {
            if (other === stub) continue;
            const done = [stub, [...stub].reverse()].some(oriented => {
                if (isAdj(other[other.length - 1], oriented[0])) {
                    other.push(...oriented);
                    return true;
                }
                if (isAdj(other[0], oriented[oriented.length - 1])) {
                    other.unshift(...oriented);
                    return true;
                }
                return false;
            });
            if (done) {
                bodies.splice(i, 1);
                break;
            }
        }
    }

    // A single-cell stub can't stay (every arrow must span at least two
    // dots) and end-merging may have failed: absorb it into a neighbouring
    // chain by splitting that chain at the adjacent cell, so the stub
    // becomes the new end of one part. Both parts must keep >= 2 cells.
    for (let i = bodies.length - 1; i >= 0; i--) {
        const stub = bodies[i];
        if (stub.length !== 1) continue;
        const s = stub[0];
        let absorbed = false;
        for (const other of bodies) {
            if (other === stub || absorbed) continue;
            for (let j = 0; j < other.length && !absorbed; j++) {
                if (!isAdj(other[j], s)) continue;
                const restLen = other.length - (j + 1);
                if (restLen === 0) {
                    other.push(s);
                    absorbed = true;
                } else if (j === 0) {
                    other.unshift(s);
                    absorbed = true;
                } else if (restLen >= 2) {
                    bodies.push(other.splice(j + 1));
                    other.push(s);
                    absorbed = true;
                } else if (j >= 2) {
                    const back = other.splice(j);
                    bodies.push(other.splice(0));
                    other.push(...back);
                    other.unshift(s);
                    absorbed = true;
                }
            }
        }
        if (absorbed) bodies.splice(i, 1);
    }
    return bodies;
};

/**
 * Assign each chain an exit end + direction by simulating the solve on the
 * full grid: repeatedly pick a chain that could slide out right now and
 * remove it, preferring exits whose ray crosses many already-removed cells —
 * those cells are occupied in the initial state, so the chain starts blocked
 * and the puzzle stays tangled. The peel order is a valid extraction order,
 * which guarantees solvability by construction. Returns null on a deadlock
 * (e.g. a spiral chain that can never exit); the caller just retries.
 */
export const peelDirections = (
    bodies: Cell[][],
    cols: number,
    rows: number,
    tangleBias = 10
): { cells: Cell[]; dir: Dir }[] | null => {
    const owner = new Map<string, number>();
    bodies.forEach((b, i) => b.forEach(c => owner.set(cellKey(c.x, c.y), i)));

    // Cheap pre-check: a chain whose every candidate ray crosses its own body
    // (a tight spiral) can never exit, even from an empty board — reject the
    // partition in one pass instead of discovering it after a full peel.
    const selfLocked = (body: Cell[], idx: number): boolean => {
        for (const head of body.length === 1 ? [body[0]] : [body[0], body[body.length - 1]]) {
            for (const dir of DIRS) {
                let x = head.x + dir[0];
                let y = head.y + dir[1];
                let clear = true;
                while (x >= 0 && x < cols && y >= 0 && y < rows) {
                    if (owner.get(cellKey(x, y)) === idx) {
                        clear = false;
                        break;
                    }
                    x += dir[0];
                    y += dir[1];
                }
                if (clear) return false;
            }
        }
        return true;
    };
    if (bodies.some((b, i) => selfLocked(b, i))) return null;

    const present = new Set(bodies.map((_, i) => i));
    const result: { cells: Cell[]; dir: Dir }[] = [];
    while (present.size > 0) {
        let best: { idx: number; fromStart: boolean; dir: Dir } | null = null;
        let bestScore = -Infinity;
        for (const idx of present) {
            const body = bodies[idx];
            for (const fromStart of body.length === 1 ? [false] : [false, true]) {
                const head = fromStart ? body[0] : body[body.length - 1];
                for (const dir of DIRS) {
                    let x = head.x + dir[0];
                    let y = head.y + dir[1];
                    let initialBlockers = 0;
                    let valid = true;
                    while (x >= 0 && x < cols && y >= 0 && y < rows) {
                        const o = owner.get(cellKey(x, y))!;
                        if (o === idx || present.has(o)) {
                            valid = false;
                            break;
                        }
                        initialBlockers++;
                        x += dir[0];
                        y += dir[1];
                    }
                    if (!valid) continue;
                    const score = initialBlockers * tangleBias + Math.random() * 8;
                    if (score > bestScore) {
                        bestScore = score;
                        best = { idx, fromStart, dir };
                    }
                }
            }
        }
        if (!best) return null;
        const body = bodies[best.idx];
        result.push({ cells: best.fromStart ? [...body].reverse() : body, dir: best.dir });
        present.delete(best.idx);
    }
    return result;
};

/** Last-resort layout (rows of right-pointing segments), trivially solvable. */
const fallbackChains = (cols: number, rows: number, maxLen: number): { cells: Cell[]; dir: Dir }[] => {
    const out: { cells: Cell[]; dir: Dir }[] = [];
    for (let y = 0; y < rows; y++) {
        let x = 0;
        while (x < cols) {
            let len = Math.min(2 + Math.floor(Math.random() * (maxLen - 1)), cols - x);
            // never strand a single-cell remainder at the end of the row
            if (cols - x - len === 1) len++;
            out.push({
                cells: Array.from({ length: len }, (_, i) => ({ x: x + i, y })),
                dir: [1, 0],
            });
            x += len;
        }
    }
    return out;
};

/**
 * Generate a completely filled, solvable puzzle: partition the rectangle
 * into snakes, then peel-assign the exit directions. Only the display order
 * (ids, hues) is shuffled afterwards; the geometry is untouched.
 */
export const generatePuzzle = (difficulty: Difficulty = 'normal', wantedCols?: number): Puzzle => {
    const { rows, maxCols, minLen, maxLen } = DIFFICULTY_CONFIG[difficulty];
    const cols = Math.min(Math.max(wantedCols ?? 8, 5), maxCols);

    let placed: { cells: Cell[]; dir: Dir }[] | null = null;
    for (let attempt = 0; attempt < 120 && !placed; attempt++) {
        const bodies = partitionGrid(cols, rows, minLen, maxLen);
        // Every arrow must at least span the distance between two dots:
        // reject partitions left with an unmergeable single-cell stub.
        if (bodies.some(b => b.length < 2)) continue;
        placed = peelDirections(bodies, cols, rows);
    }
    placed ??= fallbackChains(cols, rows, maxLen);

    // Golden-angle hue steps from a random base keep the tints apart for any
    // chain count; shuffling the display order detaches it from the solution.
    const baseHue = Math.floor(Math.random() * 360);
    const chains = shuffle(placed).map((c, i) => ({
        id: i,
        cells: c.cells,
        dir: c.dir,
        hue: Math.round(baseHue + i * 137.5) % 360,
    }));
    return { cols, rows, chains };
};
