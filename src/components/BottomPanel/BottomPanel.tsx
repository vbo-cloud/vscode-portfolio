import { useEffect, useState } from 'react';
import { PanelBottom, PictureInPicture2, Terminal, X } from 'lucide-react';
import { ProblemsPuzzle } from './games/ProblemsPuzzle';
import { OutputPuzzle } from './games/OutputPuzzle';
import { DebugConsole } from './games/DebugConsole';
import { Dungeon } from './games/Dungeon';

const PANEL_TABS = ['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL'] as const;
type PanelTab = typeof PANEL_TABS[number];

interface BottomPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

interface WinRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

const MIN_DOCK_HEIGHT = 140;
const MIN_WIN_W = 420;
const MIN_WIN_H = 240;

const clampDockHeight = (h: number) =>
    Math.max(MIN_DOCK_HEIGHT, Math.min(h, Math.round(window.innerHeight * 0.8)));

/** Keep the floating window reachable: title bar on screen, size within viewport. */
const clampWinRect = (r: WinRect): WinRect => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.max(MIN_WIN_W, Math.min(r.w, vw - 24));
    const h = Math.max(MIN_WIN_H, Math.min(r.h, vh - 24));
    const x = Math.max(80 - w, Math.min(r.x, vw - 80));
    const y = Math.max(0, Math.min(r.y, vh - 60));
    return { x, y, w, h };
};

const defaultWinRect = (): WinRect =>
    clampWinRect({
        x: Math.round(window.innerWidth * 0.18),
        y: Math.round(window.innerHeight * 0.16),
        w: Math.round(Math.min(980, window.innerWidth * 0.64)),
        h: Math.round(Math.min(460, window.innerHeight * 0.6)),
    });

/** Edge/corner hit zones of the floating window, same layout as App's file windows. */
const RESIZE_HANDLES: { dir: string; cls: string }[] = [
    { dir: 'n', cls: 'top-0 left-3 right-3 h-1 cursor-ns-resize' },
    { dir: 's', cls: 'bottom-0 left-3 right-3 h-1 cursor-ns-resize' },
    { dir: 'w', cls: 'left-0 top-3 bottom-3 w-1 cursor-ew-resize' },
    { dir: 'e', cls: 'right-0 top-3 bottom-3 w-1 cursor-ew-resize' },
    { dir: 'nw', cls: 'top-0 left-0 w-3 h-3 cursor-nwse-resize' },
    { dir: 'se', cls: 'bottom-0 right-0 w-3 h-3 cursor-nwse-resize' },
    { dir: 'ne', cls: 'top-0 right-0 w-3 h-3 cursor-nesw-resize' },
    { dir: 'sw', cls: 'bottom-0 left-0 w-3 h-3 cursor-nesw-resize' },
];

export const BottomPanel = ({ isOpen, onClose }: BottomPanelProps) => {
    const [activeTab, setActiveTab] = useState<PanelTab>('TERMINAL');
    const [floating, setFloating] = useState(
        () => localStorage.getItem('portfolio_terminal_floating') === 'true'
    );
    const [dockHeight, setDockHeight] = useState(() => {
        const saved = Number(localStorage.getItem('portfolio_terminal_height'));
        if (Number.isFinite(saved) && saved > 0) return clampDockHeight(saved);
        return clampDockHeight(window.innerWidth >= 768 ? 320 : 220);
    });
    const [winRect, setWinRect] = useState<WinRect>(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('portfolio_terminal_window') || 'null');
            if (saved && typeof saved.x === 'number' && typeof saved.w === 'number') {
                return clampWinRect(saved);
            }
        } catch {
            /* corrupted storage → fresh default */
        }
        return defaultWinRect();
    });

    useEffect(() => {
        localStorage.setItem('portfolio_terminal_floating', String(floating));
    }, [floating]);
    useEffect(() => {
        localStorage.setItem('portfolio_terminal_height', String(dockHeight));
    }, [dockHeight]);
    useEffect(() => {
        localStorage.setItem('portfolio_terminal_window', JSON.stringify(winRect));
    }, [winRect]);

    /** Generic press-and-drag: reports the cursor delta until mouseup. */
    const startDrag = (e: React.MouseEvent, onMove: (dx: number, dy: number) => void) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const sx = e.clientX;
        const sy = e.clientY;
        const move = (ev: MouseEvent) => onMove(ev.clientX - sx, ev.clientY - sy);
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    };

    const startDockResize = (e: React.MouseEvent) => {
        const h0 = dockHeight;
        startDrag(e, (_dx, dy) => setDockHeight(clampDockHeight(h0 - dy)));
    };

    const startWinMove = (e: React.MouseEvent) => {
        const start = winRect;
        startDrag(e, (dx, dy) => setWinRect(clampWinRect({ ...start, x: start.x + dx, y: start.y + dy })));
    };

    const startWinResize = (e: React.MouseEvent, dir: string) => {
        const start = winRect;
        startDrag(e, (dx, dy) => {
            let { x, y, w, h } = start;
            if (dir.includes('e')) w = start.w + dx;
            if (dir.includes('s')) h = start.h + dy;
            if (dir.includes('w')) {
                w = start.w - dx;
                x = start.x + Math.min(dx, start.w - MIN_WIN_W);
            }
            if (dir.includes('n')) {
                h = start.h - dy;
                y = start.y + Math.min(dy, start.h - MIN_WIN_H);
            }
            setWinRect(clampWinRect({ x, y, w, h }));
        });
    };

    if (!isOpen) return null;

    // One stable root for both modes so the games keep their state when the
    // panel docks/undocks — only the wrapper geometry and chrome change.
    return (
        <div
            style={
                floating
                    ? { left: winRect.x, top: winRect.y, width: winRect.w, height: winRect.h }
                    : { height: dockHeight }
            }
            className={
                floating
                    ? 'fixed z-[101] bg-[var(--bg-activity)] border border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5 flex flex-col'
                    : 'relative bg-[var(--bg-activity)] border-t border-[var(--border)] z-20 flex flex-col'
            }
        >
            {floating ? (
                /* WINDOW TITLE BAR — drag to move */
                <div
                    className="h-8 shrink-0 bg-[var(--bg-activity)] border-b border-[var(--border)] flex justify-between items-center pl-3 select-none"
                    onMouseDown={startWinMove}
                >
                    <div className="flex items-center gap-2 text-[11px] font-sans text-[var(--text-secondary)] pointer-events-none">
                        <Terminal size={13} />
                        <span className="font-medium text-[var(--text-primary)] opacity-80">TERMINAL — PANEL</span>
                    </div>
                    <div className="flex items-center h-full" onMouseDown={e => e.stopPropagation()}>
                        <button
                            onClick={() => setFloating(false)}
                            title="Dock to bottom"
                            className="w-10 h-full flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <PanelBottom size={14} />
                        </button>
                        <button
                            onClick={onClose}
                            title="Close"
                            className="w-10 h-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[#e81123] hover:text-white transition-colors"
                        >
                            <X size={15} />
                        </button>
                    </div>
                </div>
            ) : (
                /* DOCKED — grab the top edge to resize vertically */
                <div
                    onMouseDown={startDockResize}
                    className="absolute -top-0.5 left-0 right-0 h-1.5 cursor-ns-resize z-30 hover:bg-[var(--accent)]/50 transition-colors"
                />
            )}

            <div className="h-8 bg-[var(--bg-activity)] flex justify-between items-center px-2 md:px-4 select-none flex-shrink-0">
                {/* TABS - Responsive scrolling */}
                <div className="flex items-center gap-4 md:gap-6 h-full overflow-x-auto custom-scrollbar no-scrollbar whitespace-nowrap scrollbar-hide">
                    {PANEL_TABS.map(tab => (
                        <span
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-[10px] md:text-[11px] font-sans cursor-pointer py-1 border-b transition-colors shrink-0 ${
                                activeTab === tab
                                    ? 'text-[var(--text-primary)] border-[var(--accent)] font-medium'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-transparent hover:border-[var(--text-secondary)]'
                            }`}
                        >
                            {tab}
                        </span>
                    ))}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 md:gap-3 ml-2">
                    <span className="text-[9px] text-[var(--text-secondary)] font-mono hidden lg:inline mr-2">node ➜ v20.1.0</span>
                    {!floating && (
                        <>
                            <button
                                onClick={() => setFloating(true)}
                                title="Detach into floating window"
                                className="p-1 hover:bg-[var(--bg-panel)] rounded hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors hidden md:block"
                            >
                                <PictureInPicture2 size={13} />
                            </button>
                            <button onClick={onClose} className="p-1 hover:bg-[var(--bg-panel)] rounded hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors">
                                <X size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-1 min-h-0 bg-[var(--bg-activity)] overflow-hidden">
                {activeTab === 'PROBLEMS' ? (
                    <ProblemsPuzzle />
                ) : activeTab === 'OUTPUT' ? (
                    <OutputPuzzle />
                ) : activeTab === 'DEBUG CONSOLE' ? (
                    <DebugConsole />
                ) : (
                    <Dungeon />
                )}
            </div>

            {/* RESIZE HANDLES — floating window only */}
            {floating &&
                RESIZE_HANDLES.map(({ dir, cls }) => (
                    <div
                        key={dir}
                        className={`absolute z-50 ${cls}`}
                        onMouseDown={e => startWinResize(e, dir)}
                    />
                ))}
        </div>
    );
};
