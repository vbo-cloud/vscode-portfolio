import { useEffect, useRef, useState } from 'react';
import { Bug } from 'lucide-react';
import { ActionsRail, DifficultyRail } from './GameRails';
import {
    bugAdjacency,
    createGame,
    DIFFICULTY_CONFIG,
    resetGame,
    reveal,
    toggleFlag,
    type Cell,
    type Difficulty,
    type GameState,
} from './DebugConsole.logic';

const CELL = 36;
const PAD = 16;
const BUG_SIZE = 22;

const FAIL_RED = '#ef4444';

// Classic minesweeper digit colors — a universally recognized convention.
const DIGIT_COLORS = [
    '',
    '#3b82f6',
    '#22c55e',
    '#ef4444',
    '#a855f7',
    '#f59e0b',
    '#14b8a6',
    '#e11d48',
    '#64748b',
];

export const DebugConsole = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [game, setGame] = useState<GameState>(() => createGame('normal'));
    const wrapperRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const measured = useRef(false);
    const wonTimer = useRef<number | undefined>(undefined);

    // As many columns as fit the board container at the cell size its height allows.
    const colsFor = (level: Difficulty) => {
        const board = boardRef.current;
        if (!board) return undefined;
        const { width: w, height: h } = board.getBoundingClientRect();
        const scale = h / (DIFFICULTY_CONFIG[level].rows * CELL + PAD * 2);
        return Math.floor((w / scale - PAD * 2) / CELL);
    };

    // Focus on mount so the keyboard shortcuts work immediately; drop the
    // pending auto-advance timer on unmount.
    useEffect(() => {
        wrapperRef.current?.focus({ preventScroll: true });
        return () => window.clearTimeout(wonTimer.current);
    }, []);

    const newGame = (level: Difficulty = difficulty) => {
        window.clearTimeout(wonTimer.current);
        setGame(createGame(level, colsFor(level)));
    };

    const restartGame = () => {
        window.clearTimeout(wonTimer.current);
        setGame(g => resetGame(g));
    };

    const changeDifficulty = (level: Difficulty) => {
        setDifficulty(level);
        newGame(level);
    };

    // Regenerate once the container is measurable, so the grid fills the panel width.
    const onBoardMount = (el: HTMLDivElement | null) => {
        boardRef.current = el;
        if (el && !measured.current) {
            measured.current = true;
            newGame(difficulty);
        }
    };

    const clickCell = (c: Cell) => {
        if (game.status === 'lost') {
            restartGame();
            return;
        }
        const next = reveal(game, c);
        if (next === game) return;
        setGame(next);
        if (next.status === 'won') {
            // Brief success state, then move on to a fresh board.
            wonTimer.current = window.setTimeout(() => newGame(), 1500);
        }
    };

    const markCell = (c: Cell, e: React.MouseEvent) => {
        e.preventDefault();
        setGame(g => toggleFlag(g, c));
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Backspace') {
            e.preventDefault();
            restartGame();
        } else if (e.key === ' ') {
            e.preventDefault();
            newGame();
        }
    };

    const width = game.cols * CELL + PAD * 2;
    const height = game.rows * CELL + PAD * 2;
    const px = (n: number) => PAD + n * CELL;
    const counts = bugAdjacency(game);
    const playing = game.status === 'fresh' || game.status === 'playing';

    const isRevealed = (x: number, y: number) =>
        x >= 0 && x < game.cols && y >= 0 && y < game.rows && game.revealed[y][x];

    // White contour along the border of each connected revealed area: a cell
    // side is part of it when the neighbour across that side is not revealed
    // (or is off the board).
    const contour: { x1: number; y1: number; x2: number; y2: number }[] = [];
    game.revealed.forEach((row, y) =>
        row.forEach((rev, x) => {
            if (!rev) return;
            if (!isRevealed(x, y - 1)) contour.push({ x1: px(x), y1: px(y), x2: px(x + 1), y2: px(y) });
            if (!isRevealed(x, y + 1)) contour.push({ x1: px(x), y1: px(y + 1), x2: px(x + 1), y2: px(y + 1) });
            if (!isRevealed(x - 1, y)) contour.push({ x1: px(x), y1: px(y), x2: px(x), y2: px(y + 1) });
            if (!isRevealed(x + 1, y)) contour.push({ x1: px(x + 1), y1: px(y), x2: px(x + 1), y2: px(y + 1) });
        })
    );

    const bugIcon = (c: Cell, color: string, opacity = 1) => (
        <Bug
            key={`b${c.x},${c.y}`}
            x={px(c.x) + (CELL - BUG_SIZE) / 2}
            y={px(c.y) + (CELL - BUG_SIZE) / 2}
            width={BUG_SIZE}
            height={BUG_SIZE}
            color={color}
            strokeWidth={2}
            opacity={opacity}
            style={{ pointerEvents: 'none' }}
        />
    );

    const explodedAt = (c: Cell) =>
        game.exploded !== null && game.exploded.x === c.x && game.exploded.y === c.y;

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
                    aria-label="Bug-themed minesweeper"
                >
                    <style>{`
                        .dcz-hidden { transition: opacity 80ms linear; }
                        .dcz-hidden:hover { opacity: 0.75; }
                        @keyframes dcz-glitch {
                            0% { transform: translate(0, 0) skewX(0); opacity: 1; }
                            8% { transform: translate(-3px, 1px) skewX(-1.2deg); }
                            16% { transform: translate(2px, -2px) skewX(0.8deg); opacity: 0.75; }
                            24% { transform: translate(-1px, 2px); opacity: 1; }
                            34% { transform: translate(4px, 0) skewX(1.6deg); opacity: 0.85; }
                            42% { transform: translate(0, -1px) skewX(-0.4deg); }
                            55% { transform: translate(-2px, 0) skewX(-0.6deg); opacity: 1; }
                            70% { transform: translate(1px, 1px); opacity: 0.9; }
                            84% { transform: translate(-2px, -1px) skewX(0.5deg); opacity: 0.8; }
                            100% { transform: translate(0, 0) skewX(0); opacity: 1; }
                        }
                        .dcz-glitch { animation: dcz-glitch 0.7s steps(2, end) infinite; }
                    `}</style>

                    {/* Hidden cells (kept out of the glitch layer) */}
                    {game.revealed.map((row, y) =>
                        row.map((rev, x) =>
                            rev ? null : (
                                <rect
                                    key={`h${x},${y}`}
                                    x={px(x) + 1.5}
                                    y={px(y) + 1.5}
                                    width={CELL - 3}
                                    height={CELL - 3}
                                    rx={4}
                                    fill="var(--bg-panel)"
                                    stroke="var(--border)"
                                    strokeWidth={1}
                                    className={playing ? 'dcz-hidden cursor-pointer' : undefined}
                                    onClick={() => clickCell({ x, y })}
                                    onContextMenu={e => markCell({ x, y }, e)}
                                />
                            )
                        )
                    )}

                    {/* Revealed area: lighter-than-outside fill, digits and the
                        white group contour — the whole layer glitches on defeat */}
                    <g className={game.status === 'lost' ? 'dcz-glitch' : undefined}>
                        {game.revealed.map((row, y) =>
                            row.map((rev, x) => {
                                if (!rev) return null;
                                const count = counts[y][x];
                                return (
                                    <g key={`r${x},${y}`}>
                                        <rect
                                            x={px(x)}
                                            y={px(y)}
                                            width={CELL}
                                            height={CELL}
                                            fill="rgba(255, 255, 255, 0.08)"
                                            stroke="var(--border)"
                                            strokeWidth={0.5}
                                            strokeOpacity={0.25}
                                        />
                                        {count > 0 && (
                                            <text
                                                x={px(x) + CELL / 2}
                                                y={px(y) + CELL / 2 + 1}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fontSize={15}
                                                fontWeight={600}
                                                fontFamily="'Consolas', 'Monaco', 'Courier New', monospace"
                                                fill={DIGIT_COLORS[count]}
                                                style={{ pointerEvents: 'none' }}
                                            >
                                                {count}
                                            </text>
                                        )}
                                    </g>
                                );
                            })
                        )}
                        {contour.map((l, i) => (
                            <line
                                key={i}
                                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                                stroke="#ffffff"
                                strokeWidth={1.8}
                                strokeOpacity={0.9}
                                strokeLinecap="square"
                                pointerEvents="none"
                            />
                        ))}
                    </g>

                    {/* Player marks (the flag, drawn as a red bug) */}
                    {game.flagged.flatMap((row, y) =>
                        row.map((f, x) =>
                            f &&
                            !game.revealed[y][x] &&
                            !(game.status === 'lost' && game.bugs.some(b => b.x === x && b.y === y))
                                ? bugIcon({ x, y }, FAIL_RED)
                                : null
                        )
                    )}

                    {/* Defeat: the culprit turns black on a red cell, the rest
                        of the swarm is shown */}
                    {game.status === 'lost' && game.exploded && (
                        <rect
                            x={px(game.exploded.x) + 1.5}
                            y={px(game.exploded.y) + 1.5}
                            width={CELL - 3}
                            height={CELL - 3}
                            rx={4}
                            fill={FAIL_RED}
                            opacity={0.9}
                        />
                    )}
                    {game.status === 'lost' &&
                        game.bugs.map(c =>
                            explodedAt(c) ? bugIcon(c, '#000000') : bugIcon(c, FAIL_RED, 0.65)
                        )}
                    {game.status === 'lost' && (
                        <g pointerEvents="none">
                            <rect
                                x={width / 2 - 145}
                                y={height / 2 - 14}
                                width={290}
                                height={28}
                                rx={4}
                                fill="var(--bg-activity)"
                                opacity={0.92}
                            />
                            <text
                                x={width / 2}
                                y={height / 2 + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={FAIL_RED}
                                fontSize={13}
                                fontWeight={600}
                                fontFamily="'Consolas', 'Monaco', 'Courier New', monospace"
                            >
                                // you pushed a bug to prod
                            </text>
                        </g>
                    )}

                    {game.status === 'won' && (
                        <text
                            x={width / 2}
                            y={height / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="var(--success)"
                            fontSize={13}
                            fontFamily="'Consolas', 'Monaco', 'Courier New', monospace"
                        >
                            // all bugs squashed ✓
                        </text>
                    )}
                </svg>
            </div>

            <ActionsRail onReset={restartGame} onNew={() => newGame()} />
        </div>
    );
};
