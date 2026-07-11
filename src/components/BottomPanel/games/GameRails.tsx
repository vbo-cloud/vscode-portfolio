// Shared rails for the BottomPanel mini-games: difficulty selector on the
// left, keyboard-hinted action buttons on the right.

export type Difficulty = 'easy' | 'normal' | 'hard';

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

export const ACTION_BUTTON_CLASS =
    'text-[9px] md:text-[10px] uppercase tracking-wider px-2 py-1 border border-[var(--border)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors';

interface DifficultyRailProps {
    difficulty: Difficulty;
    onChange: (level: Difficulty) => void;
}

export const DifficultyRail = ({ difficulty, onChange }: DifficultyRailProps) => (
    <div className="flex flex-col justify-center gap-1 md:gap-1.5 shrink-0">
        {DIFFICULTIES.map(level => (
            <button
                key={level}
                onClick={() => onChange(level)}
                className={`text-[8px] md:text-[9px] uppercase tracking-wider px-1.5 py-0.5 border rounded transition-colors ${
                    difficulty === level
                        ? 'border-[var(--accent)] text-[var(--text-primary)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
                }`}
            >
                {level}
            </button>
        ))}
    </div>
);

interface ActionsRailProps {
    /** omit to hide the Reset button (the rail keeps New centered) */
    onReset?: () => void;
    onNew: () => void;
    /** keyboard hint shown above Reset — null hides it */
    resetHint?: string | null;
    /** keyboard hint shown above New — null hides it */
    newHint?: string | null;
}

export const ActionsRail = ({ onReset, onNew, resetHint = 'esc', newHint = 'space' }: ActionsRailProps) => (
    <div className="flex flex-col justify-center gap-2 md:gap-3 shrink-0">
        {onReset && (
            <div className="flex flex-col items-center gap-0.5">
                {resetHint !== null && (
                    <span className="text-[8px] md:text-[9px] lowercase text-[var(--text-secondary)] opacity-75">{resetHint}</span>
                )}
                <button onClick={onReset} className={ACTION_BUTTON_CLASS}>
                    Reset
                </button>
            </div>
        )}
        <div className="flex flex-col items-center gap-0.5">
            {newHint !== null && (
                <span className="text-[8px] md:text-[9px] lowercase text-[var(--text-secondary)] opacity-75">{newHint}</span>
            )}
            <button onClick={onNew} className={ACTION_BUTTON_CLASS}>
                New
            </button>
        </div>
    </div>
);
