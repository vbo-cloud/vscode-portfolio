import { useEffect, useRef, useState } from 'react';
import { ActionsRail, DifficultyRail } from './GameRails';
import {
    analyzePath,
    DIFFICULTY_CONFIG,
    generatePuzzle,
    isAdjacent,
    sameVertex,
    type Difficulty,
    type PathAnalysis,
    type Puzzle,
    type Vertex,
} from './ProblemsPuzzle.logic';

const CELL = 36;
const PAD = 16;

type Status = 'drawing' | 'solved' | 'failed';

const FAIL_RED = '#ef4444';

const STATUS_COLOR: Record<Status, string> = {
    drawing: 'var(--accent)',
    solved: 'var(--success)',
    failed: FAIL_RED,
};

/** Outward direction of the stub marking the exit, based on its border side. */
const stubDirection = (v: Vertex, rows: number): [number, number] => {
    if (v.y === 0) return [0, -1];
    if (v.y === rows) return [0, 1];
    if (v.x === 0) return [-1, 0];
    return [1, 0];
};

export const ProblemsPuzzle = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle('normal'));
    const [path, setPath] = useState<Vertex[]>(() => [puzzle.entry]);
    const [status, setStatus] = useState<Status>('drawing');
    const [failure, setFailure] = useState<PathAnalysis | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const measured = useRef(false);
    const solvedTimer = useRef<number | undefined>(undefined);

    // As many columns as fit the board container at the cell size its height allows.
    const colsFor = (level: Difficulty) => {
        const board = boardRef.current;
        if (!board) return undefined;
        const { width: w, height: h } = board.getBoundingClientRect();
        const scale = h / (DIFFICULTY_CONFIG[level].rows * CELL + PAD * 2);
        return Math.floor((w / scale - PAD * 2) / CELL);
    };

    // Focus on mount so arrow keys work immediately; drop any pending
    // auto-advance timer on unmount.
    useEffect(() => {
        wrapperRef.current?.focus({ preventScroll: true });
        return () => window.clearTimeout(solvedTimer.current);
    }, []);

    const width = puzzle.cols * CELL + PAD * 2;
    const height = puzzle.rows * CELL + PAD * 2;
    const px = (vx: number) => PAD + vx * CELL;
    const py = (vy: number) => PAD + vy * CELL;

    const last = path[path.length - 1];
    const pathColor = STATUS_COLOR[status];
    const [stubDx, stubDy] = stubDirection(puzzle.exit, puzzle.rows);

    // Failure feedback: one tint per dotted region, blinking intruder dots.
    const regionHue = new Map<number, number>();
    failure?.dottedRegions.forEach((id, i) => regionHue.set(id, Math.round(i * 137.5) % 360));
    const intruders = new Set(failure?.intruders.map(([x, y]) => `${x},${y}`) ?? []);

    const resetPath = () => {
        window.clearTimeout(solvedTimer.current);
        setPath([puzzle.entry]);
        setStatus('drawing');
        setFailure(null);
    };

    const newPuzzle = (level: Difficulty = difficulty) => {
        window.clearTimeout(solvedTimer.current);
        const next = generatePuzzle(level, colsFor(level));
        setPuzzle(next);
        setPath([next.entry]);
        setStatus('drawing');
        setFailure(null);
    };

    const changeDifficulty = (level: Difficulty) => {
        setDifficulty(level);
        newPuzzle(level);
    };

    // Regenerate once the container is measurable, so the grid fills the panel width.
    const onBoardMount = (el: HTMLDivElement | null) => {
        boardRef.current = el;
        if (el && !measured.current) {
            measured.current = true;
            newPuzzle(difficulty);
        }
    };

    const tryStep = (v: Vertex) => {
        if (status !== 'drawing') return;
        // Clicking (or stepping onto) a vertex already in the path rewinds to it —
        // this both prevents self-intersection and acts as undo.
        const idx = path.findIndex(p => sameVertex(p, v));
        if (idx !== -1) {
            setPath(path.slice(0, idx + 1));
            return;
        }
        if (!isAdjacent(last, v)) return;
        const next = [...path, v];
        setPath(next);
        if (sameVertex(v, puzzle.exit)) {
            const analysis = analyzePath(puzzle, next);
            setStatus(analysis.solved ? 'solved' : 'failed');
            setFailure(analysis.solved ? null : analysis);
            if (analysis.solved) {
                // Show the green path briefly, then move on to the next puzzle.
                solvedTimer.current = window.setTimeout(() => newPuzzle(), 1500);
            }
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' || e.key === 'Escape') {
            e.preventDefault();
            resetPath();
            return;
        }
        if (e.key === ' ') {
            e.preventDefault();
            newPuzzle();
            return;
        }
        const dirs: Record<string, [number, number]> = {
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
        };
        const d = dirs[e.key];
        if (!d) return;
        e.preventDefault();
        const v = { x: last.x + d[0], y: last.y + d[1] };
        if (v.x < 0 || v.x > puzzle.cols || v.y < 0 || v.y > puzzle.rows) return;
        tryStep(v);
    };

    const vertices: Vertex[] = [];
    for (let y = 0; y <= puzzle.rows; y++) {
        for (let x = 0; x <= puzzle.cols; x++) vertices.push({ x, y });
    }

    return (
        <div
            ref={wrapperRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="h-full flex items-center gap-3 md:gap-5 px-3 md:px-5 outline-none font-sans"
        >
            <DifficultyRail difficulty={difficulty} onChange={changeDifficulty} />

            {/* Board */}
            <div ref={onBoardMount} className="flex-1 h-full min-w-0 py-1.5 md:py-2 flex items-center justify-center">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMid meet"
                    onClick={() => {
                        if (status === 'failed') resetPath();
                    }}
                    role="img"
                    aria-label="Dot separation puzzle"
                >
                    <style>{`
                        @keyframes ppz-blink-fill { 50% { fill: #ef4444; } }
                        @keyframes ppz-blink-stroke { 50% { stroke: #ef4444; } }
                        .ppz-blink-fill { animation: ppz-blink-fill 0.8s ease-in-out infinite; }
                        .ppz-blink-stroke { animation: ppz-blink-stroke 0.8s ease-in-out infinite; }
                    `}</style>

                    {/* Failure feedback: tint each dotted region with its own color */}
                    {status === 'failed' && failure &&
                        puzzle.cells.map((row, y) =>
                            row.map((_, x) => {
                                const hue = regionHue.get(failure.regions[y][x]);
                                if (hue === undefined) return null;
                                return (
                                    <rect
                                        key={`f${x},${y}`}
                                        x={px(x) + 3}
                                        y={py(y) + 3}
                                        width={CELL - 6}
                                        height={CELL - 6}
                                        rx={3}
                                        fill={`hsl(${hue} 70% 55% / 0.22)`}
                                    />
                                );
                            })
                        )}

                    {/* Grid channels */}
                    {Array.from({ length: puzzle.rows + 1 }, (_, y) => (
                        <line
                            key={`h${y}`}
                            x1={px(0)} y1={py(y)} x2={px(puzzle.cols)} y2={py(y)}
                            stroke="var(--border)" strokeWidth={5} strokeLinecap="round"
                        />
                    ))}
                    {Array.from({ length: puzzle.cols + 1 }, (_, x) => (
                        <line
                            key={`v${x}`}
                            x1={px(x)} y1={py(0)} x2={px(x)} y2={py(puzzle.rows)}
                            stroke="var(--border)" strokeWidth={5} strokeLinecap="round"
                        />
                    ))}

                    {/* Exit stub, colored once the path reaches it */}
                    <line
                        x1={px(puzzle.exit.x)} y1={py(puzzle.exit.y)}
                        x2={px(puzzle.exit.x) + stubDx * 10} y2={py(puzzle.exit.y) + stubDy * 10}
                        stroke={sameVertex(last, puzzle.exit) ? pathColor : 'var(--border)'}
                        strokeWidth={5} strokeLinecap="round"
                    />

                    {/* Cell dots */}
                    {puzzle.cells.map((row, y) =>
                        row.map((dot, x) =>
                            dot ? (
                                <circle
                                    key={`d${x},${y}`}
                                    cx={px(x) + CELL / 2}
                                    cy={py(y) + CELL / 2}
                                    r={5}
                                    fill={dot === 'white' ? 'var(--text-primary)' : 'var(--bg-main)'}
                                    stroke="var(--text-secondary)"
                                    strokeWidth={dot === 'white' ? 0 : 1.5}
                                    className={
                                        status === 'failed' && intruders.has(`${x},${y}`)
                                            ? dot === 'white'
                                                ? 'ppz-blink-fill'
                                                : 'ppz-blink-stroke'
                                            : undefined
                                    }
                                />
                            ) : null
                        )
                    )}

                    {/* Player path */}
                    {path.length > 1 && (
                        <polyline
                            points={path.map(v => `${px(v.x)},${py(v.y)}`).join(' ')}
                            fill="none"
                            stroke={pathColor}
                            strokeWidth={5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Entry marker */}
                    <circle cx={px(puzzle.entry.x)} cy={py(puzzle.entry.y)} r={8} fill={pathColor} />

                    {/* Path head */}
                    {!sameVertex(last, puzzle.entry) && (
                        <circle cx={px(last.x)} cy={py(last.y)} r={4.5} fill={pathColor} />
                    )}

                    {/* Click targets */}
                    {vertices.map(v => {
                        const inPath = path.some(p => sameVertex(p, v));
                        const clickable =
                            status === 'drawing' && (inPath || isAdjacent(last, v));
                        return (
                            <circle
                                key={`t${v.x},${v.y}`}
                                cx={px(v.x)} cy={py(v.y)} r={11}
                                fill="transparent"
                                className={clickable ? 'cursor-pointer' : undefined}
                                onClick={() => tryStep(v)}
                            />
                        );
                    })}
                </svg>
            </div>

            <ActionsRail onReset={resetPath} onNew={() => newPuzzle()} />
        </div>
    );
};
