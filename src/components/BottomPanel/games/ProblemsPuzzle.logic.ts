// Pure logic for the PROBLEMS tab puzzle (The Witness-style dot separation).
// The grid has `cols` x `rows` cells; the path is drawn on the (cols+1) x (rows+1)
// vertex lattice, from `entry` to `exit` on the border.

export type DotColor = 'black' | 'white';

export type Difficulty = 'easy' | 'normal' | 'hard';

interface DifficultyConfig {
    rows: number;
    /** share of cells that receive a dot */
    dotShare: number;
    /** minimum regions the solution must carve, as a fraction of cols (more = wigglier path) */
    minRegionsFactor: number;
    maxCols: number;
}

// The ladder starts at what used to be the hardest setting; normal and hard
// scale the grid, dot density and required wiggliness up from there.
// minRegionsFactor is calibrated against what random solution paths actually
// produce: demanding more would starve generation.
export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
    easy: { rows: 4, dotShare: 0.35, minRegionsFactor: 0.3, maxCols: 28 },
    normal: { rows: 5, dotShare: 0.4, minRegionsFactor: 0.33, maxCols: 32 },
    hard: { rows: 6, dotShare: 0.45, minRegionsFactor: 0.36, maxCols: 36 },
};

export interface Vertex {
    x: number;
    y: number;
}

export interface Puzzle {
    cols: number;
    rows: number;
    /** cells[y][x] — dot in the cell, or null for an unconstrained cell */
    cells: (DotColor | null)[][];
    entry: Vertex;
    exit: Vertex;
}

const vertexKey = (v: Vertex) => `${v.x},${v.y}`;

const edgeKey = (a: Vertex, b: Vertex) =>
    a.x < b.x || (a.x === b.x && a.y < b.y)
        ? `${vertexKey(a)}|${vertexKey(b)}`
        : `${vertexKey(b)}|${vertexKey(a)}`;

export const sameVertex = (a: Vertex, b: Vertex) => a.x === b.x && a.y === b.y;

export const isAdjacent = (a: Vertex, b: Vertex) =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

const shuffle = <T,>(items: T[]): T[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const vertexNeighbors = (v: Vertex, cols: number, rows: number): Vertex[] =>
    [
        { x: v.x + 1, y: v.y },
        { x: v.x - 1, y: v.y },
        { x: v.x, y: v.y + 1 },
        { x: v.x, y: v.y - 1 },
    ].filter(n => n.x >= 0 && n.x <= cols && n.y >= 0 && n.y <= rows);

/** Random simple path on the vertex lattice from entry to exit (randomized DFS). */
const randomSolutionPath = (cols: number, rows: number, entry: Vertex, exit: Vertex): Vertex[] => {
    const visited = new Set<string>([vertexKey(entry)]);
    const path: Vertex[] = [entry];

    const dfs = (v: Vertex): boolean => {
        if (sameVertex(v, exit)) return true;
        for (const n of shuffle(vertexNeighbors(v, cols, rows))) {
            const k = vertexKey(n);
            if (visited.has(k)) continue;
            visited.add(k);
            path.push(n);
            if (dfs(n)) return true;
            path.pop();
        }
        return false;
    };

    dfs(entry);
    return path;
};

/**
 * Flood-fill the cells into regions delimited by the path edges + grid border.
 * Returns regions[y][x] = region id.
 */
export const computeRegions = (cols: number, rows: number, path: Vertex[]): number[][] => {
    const edges = new Set<string>();
    for (let i = 0; i < path.length - 1; i++) edges.add(edgeKey(path[i], path[i + 1]));

    const regions: number[][] = Array.from({ length: rows }, () => Array(cols).fill(-1));
    let nextId = 0;

    for (let sy = 0; sy < rows; sy++) {
        for (let sx = 0; sx < cols; sx++) {
            if (regions[sy][sx] !== -1) continue;
            const id = nextId++;
            const queue: [number, number][] = [[sx, sy]];
            regions[sy][sx] = id;
            while (queue.length > 0) {
                const [x, y] = queue.pop()!;
                // A move between two adjacent cells is blocked when the path uses
                // the lattice edge that separates them.
                const moves: { nx: number; ny: number; wallA: Vertex; wallB: Vertex }[] = [
                    { nx: x + 1, ny: y, wallA: { x: x + 1, y }, wallB: { x: x + 1, y: y + 1 } },
                    { nx: x - 1, ny: y, wallA: { x, y }, wallB: { x, y: y + 1 } },
                    { nx: x, ny: y + 1, wallA: { x, y: y + 1 }, wallB: { x: x + 1, y: y + 1 } },
                    { nx: x, ny: y - 1, wallA: { x, y }, wallB: { x: x + 1, y } },
                ];
                for (const { nx, ny, wallA, wallB } of moves) {
                    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                    if (regions[ny][nx] !== -1) continue;
                    if (edges.has(edgeKey(wallA, wallB))) continue;
                    regions[ny][nx] = id;
                    queue.push([nx, ny]);
                }
            }
        }
    }
    return regions;
};

export interface PathAnalysis {
    solved: boolean;
    /** region id per cell, as carved by the completed path */
    regions: number[][];
    /** ids of regions containing at least one dot */
    dottedRegions: number[];
    /** minority-color dots inside mixed regions — why the path failed */
    intruders: [number, number][];
}

/**
 * Analyze a completed path: it wins when no region contains both dot colors.
 * On failure, the minority-color dots of each mixed region are the intruders.
 */
export const analyzePath = (puzzle: Puzzle, path: Vertex[]): PathAnalysis => {
    const regions = computeRegions(puzzle.cols, puzzle.rows, path);
    const dotsByRegion = new Map<number, Record<DotColor, [number, number][]>>();
    for (let y = 0; y < puzzle.rows; y++) {
        for (let x = 0; x < puzzle.cols; x++) {
            const dot = puzzle.cells[y][x];
            if (!dot) continue;
            const id = regions[y][x];
            let dots = dotsByRegion.get(id);
            if (!dots) {
                dots = { black: [], white: [] };
                dotsByRegion.set(id, dots);
            }
            dots[dot].push([x, y]);
        }
    }
    const intruders: [number, number][] = [];
    for (const { black, white } of dotsByRegion.values()) {
        if (black.length > 0 && white.length > 0) {
            intruders.push(...(black.length <= white.length ? black : white));
        }
    }
    return {
        solved: intruders.length === 0,
        regions,
        dottedRegions: [...dotsByRegion.keys()],
        intruders,
    };
};

/**
 * Drop dots that add no information: in an uninterrupted straight run of
 * same-color dots, only the two endpoints constrain the puzzle. Removing dots
 * never breaks solvability (it only removes constraints).
 */
const pruneRedundantRuns = (cells: (DotColor | null)[][]): void => {
    const rows = cells.length;
    const cols = cells[0].length;
    const pruneLine = (
        get: (i: number) => DotColor | null,
        clear: (i: number) => void,
        length: number
    ): void => {
        let runStart = -1;
        for (let i = 0; i <= length; i++) {
            const dot = i < length ? get(i) : null;
            if (runStart >= 0 && dot === get(runStart)) continue;
            if (runStart >= 0) {
                for (let j = runStart + 1; j < i - 1; j++) clear(j);
            }
            runStart = dot !== null ? i : -1;
        }
    };
    for (let y = 0; y < rows; y++) {
        pruneLine(x => cells[y][x], x => { cells[y][x] = null; }, cols);
    }
    for (let x = 0; x < cols; x++) {
        pruneLine(y => cells[y][x], y => { cells[y][x] = null; }, rows);
    }
};

/** Two random border vertices, far enough apart to force an interesting path. */
const pickEndpoints = (cols: number, rows: number): [Vertex, Vertex] => {
    const border: Vertex[] = [];
    for (let x = 0; x <= cols; x++) {
        for (let y = 0; y <= rows; y++) {
            if (x === 0 || x === cols || y === 0 || y === rows) border.push({ x, y });
        }
    }
    const minDist = Math.ceil((cols + rows) / 2);
    for (;;) {
        const [a, b] = shuffle(border);
        if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) >= minDist) return [a, b];
    }
};

/**
 * Generate a solvable puzzle: pick random border endpoints, draw a random
 * solution path first, color the regions it delimits (alternating so both
 * colors always exist), then drop dots that respect those regions with a
 * balanced-but-variable black/white split. Solvability is guaranteed by
 * construction. Constraints are relaxed if too many attempts fail.
 */
export const generatePuzzle = (difficulty: Difficulty = 'normal', wantedCols?: number): Puzzle => {
    const { rows, dotShare, minRegionsFactor, maxCols } = DIFFICULTY_CONFIG[difficulty];
    // Column count comes from the available width; keep it within sane puzzle bounds.
    const cols = Math.min(Math.max(wantedCols ?? 8, 4), maxCols);
    const minRegions = Math.max(2, Math.round(cols * minRegionsFactor));

    for (let attempt = 0; ; attempt++) {
        const relaxed = attempt >= 200; // safety valve, in practice never reached
        const [entry, exit] = pickEndpoints(cols, rows);
        const solution = randomSolutionPath(cols, rows, entry, exit);
        const regions = computeRegions(cols, rows, solution);
        const ids = shuffle([...new Set(regions.flat())]);
        if (ids.length < (relaxed ? 2 : minRegions)) continue;

        const regionColor = new Map<number, DotColor>();
        ids.forEach((id, i) => regionColor.set(id, i % 2 === 0 ? 'black' : 'white'));

        // Frontier cells (bordering a differently-colored region) are where dots
        // visually mix black and white — they get a small placement bonus.
        const colorAt = (x: number, y: number) => regionColor.get(regions[y][x])!;
        const candidates: Record<DotColor, { x: number; y: number; frontier: boolean }[]> = {
            black: [],
            white: [],
        };
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const color = colorAt(x, y);
                const frontier =
                    (x > 0 && colorAt(x - 1, y) !== color) ||
                    (x < cols - 1 && colorAt(x + 1, y) !== color) ||
                    (y > 0 && colorAt(x, y - 1) !== color) ||
                    (y < rows - 1 && colorAt(x, y + 1) !== color);
                candidates[color].push({ x, y, frontier });
            }
        }

        // Balanced but variable split: each color gets 35-65% of the dots.
        const total = Math.round(cols * rows * dotShare);
        const blackCount = Math.min(
            Math.max(Math.round(total * (0.35 + Math.random() * 0.3)), 1),
            total - 1
        );
        const whiteCount = total - blackCount;
        if (!relaxed && (candidates.black.length < blackCount || candidates.white.length < whiteCount)) {
            continue;
        }

        // Greedy farthest-first sampling: each dot goes to the candidate furthest
        // from every dot placed so far (small bonus for frontier cells, random
        // jitter for variety), alternating colors proportionally — so dots cover
        // the grid evenly and the colors interleave.
        const cells: (DotColor | null)[][] = Array.from({ length: rows }, () =>
            Array(cols).fill(null)
        );
        const quotas: Record<DotColor, number> = { black: blackCount, white: whiteCount };
        const remaining: Record<DotColor, number> = { ...quotas };
        const picked: [number, number][] = [];
        while (remaining.black > 0 || remaining.white > 0) {
            let color: DotColor =
                remaining.black / quotas.black >= remaining.white / quotas.white ? 'black' : 'white';
            if (remaining[color] === 0 || candidates[color].length === 0) {
                color = color === 'black' ? 'white' : 'black';
                if (remaining[color] === 0 || candidates[color].length === 0) break;
            }
            const pool = candidates[color];
            let best = 0;
            let bestScore = -Infinity;
            for (let i = 0; i < pool.length; i++) {
                let nearest = Infinity;
                for (const [dx, dy] of picked) {
                    nearest = Math.min(nearest, Math.hypot(pool[i].x - dx, pool[i].y - dy));
                }
                const score =
                    (picked.length === 0 ? 0 : nearest) +
                    (pool[i].frontier ? 1.6 : 0) +
                    Math.random() * 0.6;
                if (score > bestScore) {
                    bestScore = score;
                    best = i;
                }
            }
            const { x, y } = pool[best];
            pool.splice(best, 1);
            cells[y][x] = color;
            picked.push([x, y]);
            remaining[color]--;
        }
        pruneRedundantRuns(cells);
        return { cols, rows, cells, entry, exit };
    }
};
