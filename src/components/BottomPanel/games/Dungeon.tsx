import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Bug, Coins, Dices, Folder, FolderOpen, Gift, Heart, Shield, ShoppingCart, Skull } from 'lucide-react';
import { ActionsRail } from './GameRails';
import {
    createGame,
    executeCommand,
    salePrice,
    UPGRADE_INFO,
    type EnemyTier,
    type GameEvent,
    type GameState,
    type LineKind,
    type LogLine,
} from './Dungeon.logic';

const FAIL_RED = '#ef4444';
const MONO = "'Consolas', 'Monaco', 'Courier New', monospace";
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const LINE_COLORS: Record<LineKind, string> = {
    info: 'var(--text-primary)',
    dim: 'var(--text-secondary)',
    warn: 'var(--warning)',
    error: FAIL_RED,
    success: 'var(--success)',
    echo: 'var(--accent)',
};

/** immediate visual cue of relative power — green is reserved for the trail */
const TIER_COLORS: Record<EnemyTier, string> = {
    weak: 'var(--text-secondary)',
    medium: 'var(--warning)',
    strong: '#fb923c',
    boss: FAIL_RED,
};

const hpColor = (frac: number) =>
    frac > 0.5 ? 'var(--success)' : frac > 0.25 ? 'var(--warning)' : FAIL_RED;

interface FxItem extends GameEvent {
    gi: number;
}

/** Up to 2 command results stay pinned above their rooms at once; the older one is evicted. */
interface FxBatch {
    key: number;
    items: FxItem[];
}
const MAX_FX_BATCHES = 2;

/**
 * One action beat above a room card: the dice tumble for a full second,
 * settle on the real rolls, then stay put until evicted by newer actions.
 */
const RollBadge = ({ fx }: { fx: FxItem }) => {
    const delay = fx.gi * 650;
    const [phase, setPhase] = useState<'hidden' | 'rolling' | 'settled'>('hidden');
    const [faces, setFaces] = useState('');

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(
            setTimeout(() => {
                if (fx.rolls && fx.rolls.length > 0) {
                    setPhase('rolling');
                    const spin = setInterval(() => {
                        setFaces(
                            Array.from({ length: fx.rolls!.length }, () => DICE_FACES[Math.floor(Math.random() * 6)]).join('')
                        );
                    }, 80);
                    timers.push(spin);
                    timers.push(
                        setTimeout(() => {
                            clearInterval(spin);
                            setPhase('settled');
                        }, 1100)
                    );
                } else {
                    setPhase('settled');
                }
            }, delay)
        );
        return () =>
            timers.forEach(t => {
                clearTimeout(t);
                clearInterval(t);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (phase === 'hidden') return null;
    const color = fx.actor === 'player' ? 'var(--accent)' : 'var(--warning)';
    const total = fx.rolls?.reduce((a, b) => a + b, 0) ?? 0;
    return (
        <div
            className="dgn-fx-enter px-1 py-px rounded border bg-[var(--bg-panel)] text-[9px] md:text-[10px] whitespace-nowrap shadow"
            style={{ borderColor: color, color }}
        >
            {phase === 'rolling' ? (
                <span className="text-[12px] md:text-[13px] leading-none">{faces}</span>
            ) : (
                <>
                    {fx.rolls && fx.rolls.length > 0 && (
                        <span>
                            🎲 {fx.rolls.join('+')}
                            {fx.rolls.length > 1 ? ` = ${total}` : ''} ·{' '}
                        </span>
                    )}
                    {fx.label}
                </>
            )}
        </div>
    );
};

export const Dungeon = () => {
    const [game, setGame] = useState<GameState>(() => createGame());
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    /** cursor into history while browsing with ArrowUp/Down, null = not browsing */
    const histIdx = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    /** action beats of the last commands, drawn above the room they happened in — oldest evicted past MAX_FX_BATCHES */
    const [fxBatches, setFxBatches] = useState<FxBatch[]>([]);
    /** transient message for errors/help — fades, never a persistent journal */
    const [flash, setFlash] = useState<{ key: number; line: LogLine } | null>(null);

    const treeWrapRef = useRef<HTMLDivElement>(null);
    const treeInnerRef = useRef<HTMLDivElement>(null);
    /**
     * Scale the whole dungeon (CSS zoom, which affects layout) so it always
     * fills the panel and stays centered — up as well as down, clamped so
     * text stays readable; past the low clamp the area scrolls (bars hidden).
     */
    const fitTree = () => {
        const wrap = treeWrapRef.current;
        const inner = treeInnerRef.current;
        if (!wrap || !inner) return;
        inner.style.zoom = '1';
        const scale = Math.min(wrap.clientHeight / inner.offsetHeight, wrap.clientWidth / inner.offsetWidth);
        inner.style.zoom = String(Math.min(1.5, Math.max(0.6, scale)));
    };
    useLayoutEffect(fitTree, [game]);
    useEffect(() => {
        const wrap = treeWrapRef.current;
        if (!wrap) return;
        const observer = new ResizeObserver(fitTree);
        observer.observe(wrap);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        inputRef.current?.focus({ preventScroll: true });
    }, []);
    useEffect(() => {
        if (!flash) return;
        const t = setTimeout(() => setFlash(null), 3500);
        return () => clearTimeout(t);
    }, [flash]);

    const newDungeon = () => {
        setGame(createGame());
        setFxBatches([]);
        setFlash(null);
        inputRef.current?.focus({ preventScroll: true });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const typed = input.trim();
        setInput('');
        if (!typed) return;
        setHistory(prev => [...prev, typed]);
        histIdx.current = null;
        const result = executeCommand(game, typed);
        if (result.requestNew) {
            newDungeon();
            return;
        }
        setGame(result.state);
        if (result.events && result.events.length > 0) {
            const batch: FxBatch = { key: Date.now(), items: result.events.map((ev, i) => ({ ...ev, gi: i })) };
            setFxBatches(prev => [...prev, batch].slice(-MAX_FX_BATCHES));
        } else if (result.lines.length > 0) {
            setFlash({ key: Date.now(), line: result.lines[result.lines.length - 1] });
        }
    };

    const browseHistory = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length === 0) return;
            const idx = histIdx.current === null ? history.length - 1 : Math.max(0, histIdx.current - 1);
            histIdx.current = idx;
            setInput(history[idx]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIdx.current === null) return;
            const idx = histIdx.current + 1;
            if (idx >= history.length) {
                histIdx.current = null;
                setInput('');
            } else {
                histIdx.current = idx;
                setInput(history[idx]);
            }
        }
    };

    /** One room card: contents (monsters) only once entered — boss always shown. */
    const renderRoom = (id: number) => {
        const room = game.rooms[id];
        const visited = game.visited.has(id);
        const current = game.cwd === id;
        const isBossRoom = id === game.bossId;
        const isShop = id === game.shopId;
        const revealed = visited || isBossRoom || isShop;
        const alive = room.enemies.some(e => e.hp > 0);
        const FolderIcon = current ? FolderOpen : Folder;
        // walked rooms leave a green trail; the current room stays accent
        const nameColor = current ? 'var(--accent)' : visited ? 'var(--success)' : 'var(--text-primary)';
        const iconColor = current ? 'var(--accent)' : visited ? 'var(--success)' : 'var(--text-secondary)';
        const roomFx = fxBatches.flatMap(batch =>
            batch.items.filter(f => f.roomId === id).map(f => ({ batchKey: batch.key, item: f }))
        );
        return (
            <div className="relative">
                {roomFx.length > 0 && (
                    <div className="absolute bottom-full left-1 mb-0.5 z-20 flex flex-col items-start gap-0.5">
                        {roomFx.map(({ batchKey, item }) => (
                            <RollBadge key={`${batchKey}-${item.gi}`} fx={item} />
                        ))}
                    </div>
                )}
                <div
                    className={`shrink-0 rounded border px-1.5 py-0.5 ${current ? 'bg-[var(--bg-panel)]' : ''}`}
                    style={{
                        borderColor: isBossRoom && alive ? FAIL_RED : current ? 'var(--accent)' : 'var(--border)',
                    }}
                >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                        <FolderIcon size={12} className="shrink-0" color={iconColor} />
                        <span style={{ color: nameColor }}>{room.name}</span>
                        {!revealed && <span className="text-[var(--text-secondary)] opacity-60">?</span>}
                    </div>
                    {revealed &&
                        room.enemies.map(enemy => {
                            const eAlive = enemy.hp > 0;
                            const isBoss = enemy.tier === 'boss';
                            const EnemyIcon = isBoss ? Skull : Bug;
                            return (
                                <div key={enemy.name}>
                                    <div className="flex items-center gap-1 pl-3 whitespace-nowrap">
                                        <EnemyIcon
                                            size={isBoss ? 13 : 11}
                                            className="shrink-0"
                                            style={{ opacity: eAlive ? 1 : 0.35 }}
                                            color={TIER_COLORS[enemy.tier]}
                                        />
                                        <span
                                            style={{
                                                color: TIER_COLORS[enemy.tier],
                                                opacity: eAlive ? 1 : 0.35,
                                                textDecoration: eAlive ? undefined : 'line-through',
                                            }}
                                        >
                                            {enemy.name}
                                        </span>
                                        {eAlive && enemy.shield > 0 && (
                                            <span className="flex items-center gap-0.5 text-[var(--text-secondary)]">
                                                <Shield size={10} className="shrink-0" />
                                                {enemy.shield}
                                            </span>
                                        )}
                                        {eAlive && enemy.dice > 1 && (
                                            <span className="flex items-center gap-0.5 text-[var(--text-secondary)]">
                                                <Dices size={10} className="shrink-0" />
                                                {enemy.dice}
                                            </span>
                                        )}
                                        {isBoss && eAlive && (
                                            <span style={{ color: FAIL_RED }}>
                                                {enemy.hp}/{enemy.maxHp}
                                            </span>
                                        )}
                                    </div>
                                    {eAlive && (
                                        <div
                                            className="ml-3 mt-0.5 rounded bg-[var(--border)] overflow-hidden"
                                            style={{ height: isBoss ? 5 : 3 }}
                                        >
                                            <div
                                                className="h-full rounded transition-[width] duration-300"
                                                style={{
                                                    width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                                                    background: TIER_COLORS[enemy.tier],
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    {revealed && (room.loot.coins > 0 || room.loot.upgrades.length > 0) && (
                        <div className="flex items-center gap-1.5 pl-3 whitespace-nowrap">
                            {room.loot.coins > 0 && (
                                <span className="flex items-center gap-0.5" style={{ color: 'var(--warning)' }}>
                                    <Coins size={10} className="shrink-0" />
                                    {room.loot.coins}
                                </span>
                            )}
                            {room.loot.upgrades.map((u, i) => (
                                <span key={i} className="flex items-center gap-0.5 text-[var(--accent)]">
                                    <Gift size={10} className="shrink-0" />
                                    {UPGRADE_INFO[u].label}
                                </span>
                            ))}
                            <span className="text-[var(--text-secondary)] opacity-60">rm *</span>
                        </div>
                    )}
                    {/* whole inventory on one line — a stacked list makes the tree overflow the panel */}
                    {isShop && game.shopItems.some(item => !item.sold) && (
                        <div className="flex items-center gap-2 pl-3 whitespace-nowrap">
                            <ShoppingCart size={10} className="shrink-0 text-[var(--text-secondary)]" />
                            {game.shopItems.filter(item => !item.sold).map(item => (
                                <span key={item.id} className="flex items-center gap-1">
                                    <span className="text-[var(--accent)]">{item.id}</span>
                                    <span className="text-[var(--text-secondary)]">{UPGRADE_INFO[item.id].label}</span>
                                    {item.sale ? (
                                        <>
                                            <span className="line-through text-[var(--text-secondary)] opacity-60">{item.price}</span>
                                            <span style={{ color: 'var(--warning)' }}>{salePrice(item)}¢ −30%</span>
                                        </>
                                    ) : (
                                        <span style={{ color: 'var(--warning)' }}>{item.price}¢</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    /** Static horizontal org-chart, structure fully visible: entrance left. */
    const renderTree = (id: number): React.ReactNode => {
        const kids = game.rooms[id].children;
        return (
            <div className="flex items-center">
                {renderRoom(id)}
                {kids.length > 0 && (
                    <>
                        <div className="w-2 md:w-3 h-px shrink-0 bg-[var(--border)]" />
                        <div className="flex flex-col">
                            {kids.map((c, i) => (
                                <div key={c} className="relative flex items-center pl-2 md:pl-3 py-0.5">
                                    <div className="absolute left-0 top-1/2 w-2 md:w-3 h-px bg-[var(--border)]" />
                                    {kids.length > 1 && (
                                        <div
                                            className="absolute left-0 w-px bg-[var(--border)]"
                                            style={{
                                                top: i === 0 ? '50%' : 0,
                                                bottom: i === kids.length - 1 ? '50%' : 0,
                                            }}
                                        />
                                    )}
                                    {renderTree(c)}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const hpFrac = game.hp / game.maxHp;
    // Dice expressions shown left of the icons: upgraded d8s are thrown
    // first, the flat bonus closes the formula (e.g. "1d8+1d6+2").
    const nD8 = Math.min(game.d8Count, game.dice);
    const nD6 = game.dice - nD8;
    const attackExpr =
        [nD8 > 0 ? `${nD8}d8` : '', nD6 > 0 ? `${nD6}d6` : ''].filter(Boolean).join('+') +
        (game.dmgBonus > 0 ? `+${game.dmgBonus}` : '');
    const shieldExpr = `2d6${game.shieldBonus > 0 ? `+${game.shieldBonus}` : ''}`;

    return (
        <div
            className="h-full flex items-stretch gap-3 md:gap-5 px-3 md:px-5 py-1.5 md:py-2 font-sans"
            onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
            <style>{`
                @keyframes dgn-fx-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                .dgn-fx-enter { animation: dgn-fx-in 0.25s ease-out both; }
            `}</style>
            <div className="flex-1 min-w-0 flex flex-col" style={{ fontFamily: MONO }}>
                {/* Static tree diagram — the main visual element */}
                <div className="relative flex-1 min-h-0 text-[10px] md:text-[11px]">
                    {/* inline scrollbar-width beats the unlayered global CustomScrollbar CSS */}
                    <div ref={treeWrapRef} className="h-full overflow-auto flex" style={{ scrollbarWidth: 'none' }}>
                        {/* m-auto centers both ways when it fits, scrolls cleanly when it overflows */}
                        <div ref={treeInnerRef} className="m-auto min-w-max px-6 py-1">
                            {renderTree(0)}
                        </div>
                    </div>
                    {flash && (
                        <div
                            key={flash.key}
                            className="absolute bottom-1 left-1 z-20 max-w-full truncate px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-panel)] text-[10px] md:text-[11px]"
                            style={{ color: LINE_COLORS[flash.line.kind] }}
                        >
                            {flash.line.text}
                        </div>
                    )}
                    {game.status !== 'playing' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                            <div
                                className="px-3 py-1.5 rounded border bg-[var(--bg-panel)] text-xs md:text-sm font-bold tracking-wider"
                                style={{
                                    borderColor: game.status === 'won' ? 'var(--success)' : FAIL_RED,
                                    color: game.status === 'won' ? 'var(--success)' : FAIL_RED,
                                }}
                            >
                                {game.status === 'won'
                                    ? `VICTOIRE · ${game.coins} pièces — tape \`new\``
                                    : 'GAME OVER — tape `new`'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom band: the separator skirts the stats column then hugs the input */}
                <div className="shrink-0 flex items-end">
                    <div className="shrink-0 grid grid-cols-[auto_auto_auto] items-center gap-x-1.5 gap-y-0.5 border-t border-r border-[var(--border)] pt-1 pr-2 md:pr-3 pb-0.5 text-[10px] md:text-xs">
                        <span />
                        <Heart size={12} color={hpColor(hpFrac)} fill={hpColor(hpFrac)} />
                        <span style={{ color: hpColor(hpFrac) }}>
                            {game.hp}/{game.maxHp}
                        </span>

                        <span className="justify-self-end text-[var(--text-secondary)]">{shieldExpr}</span>
                        <Shield
                            size={12}
                            color={game.shield > 0 ? 'var(--accent)' : 'var(--text-secondary)'}
                        />
                        <span style={{ color: game.shield > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                            {game.shield}
                        </span>

                        <span className="justify-self-end text-[var(--text-secondary)]">{attackExpr}</span>
                        <Dices size={12} className="text-[var(--text-secondary)]" />
                        <span />

                        <span />
                        <Coins size={12} color="var(--warning)" />
                        <span style={{ color: 'var(--warning)' }}>{game.coins}</span>
                    </div>
                    <form
                        onSubmit={submit}
                        className="flex-1 min-w-0 flex items-center gap-2 border-t border-[var(--border)] pt-1 pb-0.5 pl-2 md:pl-3 text-[11px] md:text-xs"
                    >
                        <span className="text-[var(--accent)] shrink-0">→ ~</span>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={browseHistory}
                            className="flex-1 min-w-0 bg-transparent outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
                            style={{ fontFamily: MONO }}
                            placeholder="cd data · shoot worm · rm * · buy d8"
                            spellCheck={false}
                            autoComplete="off"
                            aria-label="dungeon command input"
                        />
                    </form>
                </div>
            </div>

            {/* New button only, no keyboard hint (the player types in a field) */}
            <ActionsRail onNew={newDungeon} newHint={null} />
        </div>
    );
};
