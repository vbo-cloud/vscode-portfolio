import { useEffect, useRef, useState } from 'react';
import { ActionsRail, DifficultyRail } from './GameRails';
import {
    blockingCells,
    DIFFICULTY_CONFIG,
    exitRay,
    generatePuzzle,
    type Cell,
    type Chain,
    type Difficulty,
    type Puzzle,
} from './OutputPuzzle.logic';

const CELL = 36;
const PAD = 16;
// Thin monochrome strokes, one arrowhead per chain (Arrow-Puzzle-like style).
const BODY_WIDTH = 3.5;
const ARROW_EXT = CELL * 0.35;

const FAIL_RED = '#ef4444';
// Blocked feedback: the chain starts sliding out normally, bumps into the
// first chain on its way, turns red and snaps back.
const BUMP = CELL * 0.3;
const BOUNCE_BACK_MS = 130;

/**
 * Slide-out geometry of a chain: its SVG path runs tail → head → off-grid
 * along the exit direction, so extraction animates by sliding the dash
 * (the visible body) toward the path end. The arrowhead sits at the dash's
 * leading end and translates straight out at the same speed.
 */
const geometryFor = (chain: Chain, cols: number, rows: number) => {
    const cx = (c: Cell) => PAD + c.x * CELL + CELL / 2;
    const cy = (c: Cell) => PAD + c.y * CELL + CELL / 2;
    const rayLen = exitRay(chain, cols, rows).length;
    // From the head center to safely past the drawing area.
    const ext = rayLen * CELL + CELL / 2 + PAD + CELL;
    const head = chain.cells[chain.cells.length - 1];
    const d = [
        `M ${cx(chain.cells[0])} ${cy(chain.cells[0])}`,
        ...chain.cells.slice(1).map(c => `L ${cx(c)} ${cy(c)}`),
        `L ${cx(head) + chain.dir[0] * ext} ${cy(head) + chain.dir[1] * ext}`,
    ].join(' ');
    const bodyLen = (chain.cells.length - 1) * CELL + ARROW_EXT;
    const total = (chain.cells.length - 1) * CELL + ext;
    const exitMs = Math.min(700, 140 + (total / CELL) * 35);
    const tip = {
        x: cx(head) + chain.dir[0] * ARROW_EXT,
        y: cy(head) + chain.dir[1] * ARROW_EXT,
    };
    return { d, bodyLen, total, exitMs, tip };
};

export const OutputPuzzle = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle('normal'));
    const [extracted, setExtracted] = useState<ReadonlySet<number>>(new Set());
    const [exiting, setExiting] = useState<ReadonlySet<number>>(new Set());
    const [blocked, setBlocked] = useState<{
        id: number;
        travel: number;
        forwardMs: number;
        phase: 'forward' | 'back';
    } | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const measured = useRef(false);
    const timers = useRef<number[]>([]);

    const after = (ms: number, fn: () => void) => {
        timers.current.push(window.setTimeout(fn, ms));
    };
    const clearTimers = () => {
        timers.current.forEach(t => window.clearTimeout(t));
        timers.current.length = 0;
    };

    // As many columns as fit the board container at the cell size its height allows.
    const colsFor = (level: Difficulty) => {
        const board = boardRef.current;
        if (!board) return undefined;
        const { width: w, height: h } = board.getBoundingClientRect();
        const scale = h / (DIFFICULTY_CONFIG[level].rows * CELL + PAD * 2);
        return Math.floor((w / scale - PAD * 2) / CELL);
    };

    // Focus on mount so the keyboard shortcuts work immediately; drop any
    // pending animation/auto-advance timers on unmount.
    useEffect(() => {
        wrapperRef.current?.focus({ preventScroll: true });
        const pending = timers.current; // same array for the component's lifetime
        return () => pending.forEach(t => window.clearTimeout(t));
    }, []);

    const newPuzzle = (level: Difficulty = difficulty) => {
        clearTimers();
        setPuzzle(generatePuzzle(level, colsFor(level)));
        setExtracted(new Set());
        setExiting(new Set());
        setBlocked(null);
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

    const tryExtract = (chain: Chain) => {
        if (extracted.has(chain.id) || exiting.has(chain.id)) return;
        if (blocked?.id === chain.id) return; // already bouncing
        // Chains already sliding out count as gone: releasing one frees the
        // ones queued behind it right away (cascade).
        const gone = new Set([...extracted, ...exiting]);
        const blockers = blockingCells(puzzle, chain, gone);
        if (blockers.length > 0) {
            // Slide up to the first chain in the way (plus a slight overlap,
            // so a touching neighbour still gives a visible bump).
            const head = chain.cells[chain.cells.length - 1];
            const first = blockers[0];
            const freeCells = Math.abs(first.x - head.x) + Math.abs(first.y - head.y) - 1;
            const travel = freeCells * CELL + BUMP;
            const forwardMs = 100 + (travel / CELL) * 35;
            setBlocked({ id: chain.id, travel, forwardMs, phase: 'forward' });
            after(forwardMs, () =>
                setBlocked(b => (b?.id === chain.id ? { ...b, phase: 'back' } : b))
            );
            after(forwardMs + BOUNCE_BACK_MS + 60, () =>
                setBlocked(b => (b?.id === chain.id ? null : b))
            );
            return;
        }
        setExiting(prev => new Set(prev).add(chain.id));
        const { exitMs } = geometryFor(chain, puzzle.cols, puzzle.rows);
        after(exitMs + 50, () => {
            setExiting(prev => {
                const next = new Set(prev);
                next.delete(chain.id);
                return next;
            });
            setExtracted(prev => new Set(prev).add(chain.id));
        });
        // Last chain under way: brief success state, then the next puzzle.
        if (gone.size + 1 === puzzle.chains.length) {
            after(exitMs + 1550, () => newPuzzle());
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ' ') {
            e.preventDefault();
            newPuzzle(difficulty);
        }
    };

    const width = puzzle.cols * CELL + PAD * 2;
    const height = puzzle.rows * CELL + PAD * 2;
    const px = (n: number) => PAD + n * CELL;

    const remaining = puzzle.chains.filter(c => !extracted.has(c.id));
    const solved = puzzle.chains.length > 0 && extracted.size === puzzle.chains.length;

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
                    role="img"
                    aria-label="Tangled arrow chains puzzle"
                >
                    <defs>
                        <clipPath id="opz-board-clip">
                            <rect x={PAD - 2} y={PAD - 2} width={puzzle.cols * CELL + 4} height={puzzle.rows * CELL + 4} rx={5} />
                        </clipPath>
                    </defs>

                    {/* Dot lattice on the cell centers, so the chains and their
                        arrows sit exactly on the dots (reference style) */}
                    {Array.from({ length: puzzle.rows }, (_, y) =>
                        Array.from({ length: puzzle.cols }, (_, x) => (
                            <circle
                                key={`p${x},${y}`}
                                cx={px(x) + CELL / 2} cy={px(y) + CELL / 2} r={1.5}
                                fill="var(--text-secondary)" opacity={0.4}
                            />
                        ))
                    )}

                    {/* Chains: thin monochrome lines sliding out along their own
                        path, a single arrowhead marking the exit end. */}
                    <g clipPath="url(#opz-board-clip)">
                        {remaining.map(chain => {
                            const geo = geometryFor(chain, puzzle.cols, puzzle.rows);
                            const isExiting = exiting.has(chain.id);
                            // The chain slides along its own path by `shift` px:
                            // all the way out on extraction, up to the first
                            // obstacle then (in red) back to zero when blocked.
                            let shift = 0;
                            let motion: string | undefined;
                            let color = 'var(--text-primary)';
                            if (isExiting) {
                                shift = geo.total;
                                motion = `${geo.exitMs}ms cubic-bezier(0.45, 0, 0.85, 0.6)`;
                                color = 'var(--accent)';
                            } else if (blocked?.id === chain.id) {
                                if (blocked.phase === 'forward') {
                                    shift = blocked.travel;
                                    motion = `${blocked.forwardMs}ms cubic-bezier(0.45, 0, 0.85, 0.6)`;
                                    color = 'var(--accent)';
                                } else {
                                    motion = `${BOUNCE_BACK_MS}ms cubic-bezier(0.2, 0.6, 0.35, 1)`;
                                    color = FAIL_RED;
                                }
                            }
                            const angle = (Math.atan2(chain.dir[1], chain.dir[0]) * 180) / Math.PI;
                            return (
                                <g key={chain.id}>
                                    <path
                                        d={geo.d}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth={BODY_WIDTH}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray={`${geo.bodyLen} ${geo.total + CELL * 2}`}
                                        strokeDashoffset={-shift}
                                        style={motion ? { transition: `stroke-dashoffset ${motion}` } : undefined}
                                    />
                                    {/* Arrowhead rides the straight exit segment at the
                                        same speed as the sliding body. */}
                                    <g
                                        style={{
                                            transform: `translate(${chain.dir[0] * shift}px, ${chain.dir[1] * shift}px)`,
                                            transition: motion ? `transform ${motion}` : undefined,
                                        }}
                                    >
                                        <path
                                            d="M -6 -4.5 L 0 0 L -6 4.5"
                                            fill="none"
                                            stroke={color}
                                            strokeWidth={BODY_WIDTH}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            transform={`translate(${geo.tip.x} ${geo.tip.y}) rotate(${angle})`}
                                        />
                                    </g>
                                </g>
                            );
                        })}
                    </g>

                    {/* Click targets */}
                    {remaining.flatMap(chain =>
                        exiting.has(chain.id)
                            ? []
                            : chain.cells.map(c => (
                                  <rect
                                      key={`t${chain.id}:${c.x},${c.y}`}
                                      x={px(c.x)} y={px(c.y)} width={CELL} height={CELL}
                                      fill="transparent"
                                      className="cursor-pointer"
                                      onClick={() => tryExtract(chain)}
                                  />
                              ))
                    )}

                    {solved && (
                        <text
                            x={width / 2}
                            y={height / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="var(--success)"
                            fontSize={13}
                            fontFamily="'Consolas', 'Monaco', 'Courier New', monospace"
                        >
                            // output flushed ✓
                        </text>
                    )}
                </svg>
            </div>

            <ActionsRail onNew={() => newPuzzle(difficulty)} />
        </div>
    );
};
