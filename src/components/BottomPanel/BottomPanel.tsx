import { useState } from 'react';
import { X } from 'lucide-react';

const PANEL_TABS = ['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL'] as const;
type PanelTab = typeof PANEL_TABS[number];

interface BottomPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BottomPanel = ({ isOpen, onClose }: BottomPanelProps) => {
    const [activeTab, setActiveTab] = useState<PanelTab>('TERMINAL');

    if (!isOpen) return null;

    return (
        <div className="relative h-48 md:h-64 bg-[var(--bg-activity)] border-t border-[var(--border)] z-20 flex flex-col transition-all duration-300">
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
                    <button onClick={onClose} className="p-1 hover:bg-[var(--bg-panel)] rounded hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>
            <div
                style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}
                className="flex-1 flex items-center justify-center bg-[var(--bg-activity)] text-[11px] md:text-sm"
            >
                <span className="text-[var(--text-secondary)] italic opacity-80">// Coming soon</span>
            </div>
        </div>
    );
};
