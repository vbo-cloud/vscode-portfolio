import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    Zap, ExternalLink, Terminal, GitBranch, Filter, LayoutGrid, List,
    FileText, Github, Globe, FileCode, Linkedin, Code2, ArrowLeft,
    Bot, ShieldCheck, Users, GitPullRequest, Cloud, Building2, Gamepad2, Cpu,
    Mail, Send, User as UserIcon, MessageSquare, CheckCircle2, Tag
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { PROJECTS_DATA } from '../../data/projects';
import { getYouTubeEmbedId, getTechColor } from '../../utils/helpers';
import { sendContactEmail } from '../../services/contact';
// @ts-ignore
import FONT_5x7 from '../../data/font5x7';
import { Breadcrumbs } from '../UI/Breadcrumbs';
import { RealMinimap } from './Minimap';
import { CanvasContributionMap } from '../Widgets/ContributionMap';
import { TypingEffect } from '../UI/TypingEffect';
import { TypewriterWords } from '../UI/TypewriterWords';
import { TechTag } from '../UI/TechTag';

const TRANSITION_TEXT = "Transitioning from VR/game development into cloud architecture and AI-assisted automation.";

const WORK_ON_TEXT = 'I design Azure landing zones with Terraform, build secretless CI/CD with GitHub Actions and OIDC, and orchestrate Python multi-agent pipelines with Azure OpenAI/Claude. My flagship project, "Job Finder", is a solo, end-to-end cloud + AI system documented PR by PR. Before cloud, I spent years shipping VR and gameplay systems in Unity and Unreal.';

/**
 * Mirrors the sidebar's `projects/` folder structure (cloud, companies, video games
 * -> games / technical) so the "All Projects" page groups cards the same way the
 * file tree does, with Cloud surfaced first and visually featured.
 */
type ProjectSection = {
    key: string;
    title: string;
    description?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    categories: string[];
    featured?: boolean;
};

type ProjectSectionGroup = {
    key: string;
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    sections: ProjectSection[];
};

const PROJECT_SECTIONS: (ProjectSection | ProjectSectionGroup)[] = [
    {
        key: 'cloud',
        title: 'Cloud Engineering',
        description: 'Flagship cloud & AI systems — Azure infrastructure, multi-agent pipelines, and end-to-end platform work.',
        icon: Cloud,
        categories: ['cloud'],
        featured: true,
    },
    {
        key: 'companies',
        title: 'Companies',
        icon: Building2,
        categories: ['companies'],
    },
    {
        key: 'videogames',
        title: 'Video Games',
        icon: Gamepad2,
        sections: [
            { key: 'technical', title: 'Technical Projects', icon: Cpu, categories: ['technical'] },
            { key: 'games', title: 'Games', icon: Gamepad2, categories: ['games'] },
        ],
    },
];

/**
 * Renders a self-contained HTML embed (e.g. an exported architecture diagram)
 * scaled to fit — with the container height matched to the scaled content, so
 * the iframe's own natural size never overflows and no scrollbar ever appears.
 * `section` (the bounding rect of the wider outer section, measured by the
 * caller) grows the display size beyond the narrow column it actually sits in.
 * Centering by an even bleed around the *column's* own center would misalign
 * it whenever that column isn't itself centered on the page (e.g. the left
 * 2/3 of a 3-column grid) — so instead we align the embed's left edge to the
 * section's actual left edge via `marginLeft`, computed from both elements'
 * real viewport positions (`getBoundingClientRect`), not just their widths.
 */
const HtmlEmbedFrame = ({ embed, section }: { embed: { title: string; path: string }; section?: { left: number; width: number } }) => {
    const measureRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [localRect, setLocalRect] = useState({ left: 0, width: 0 });
    const [contentSize, setContentSize] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        const el = measureRef.current;
        if (!el) return;
        const update = () => {
            const rect = el.getBoundingClientRect();
            setLocalRect({ left: rect.left, width: rect.width });
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        window.addEventListener('resize', update);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', update);
        };
    }, []);

    const handleLoad = () => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc?.documentElement) return;

        // Artifact bundles wrap the real content in a shadow-host div that's
        // sized independently of it (often to the parent page's viewport),
        // leaving empty space beside the actual content. Descend through
        // single-child wrappers to find the real content root instead of
        // trusting documentElement.scrollWidth, which measures the host.
        let el: Element | null = doc.body.firstElementChild;
        while (el && el.children.length === 1) el = el.firstElementChild;
        const contentRoot = (el ? [...el.children] : [])
            .find((c): c is HTMLElement => c.tagName !== 'TEMPLATE' && c.getBoundingClientRect().width > 0)
            || doc.documentElement;

        setContentSize({
            width: contentRoot.scrollWidth,
            height: contentRoot.scrollHeight
        });
    };

    const displayWidth = Math.max(section?.width || 0, localRect.width);
    const scale = contentSize && displayWidth ? displayWidth / contentSize.width : 1;
    // Centers the box within `section` (rather than aligning left edges) so it stays
    // centered even when displayWidth ends up narrower than the full section width.
    const offsetLeft = section
        ? (section.left + section.width / 2) - (localRect.left + displayWidth / 2)
        : 0;

    return (
        <div ref={measureRef} className="w-full">
            <div
                className="overflow-hidden rounded-sm border border-[var(--border)] shadow-lg"
                style={{
                    width: displayWidth || '100%',
                    height: contentSize ? contentSize.height * scale : 600,
                    marginLeft: offsetLeft
                }}
            >
                <iframe
                    ref={iframeRef}
                    src={embed.path}
                    title={embed.title}
                    onLoad={handleLoad}
                    style={{
                        width: contentSize ? contentSize.width : '100%',
                        height: contentSize ? contentSize.height : '100%',
                        border: 'none',
                        transform: contentSize ? `scale(${scale})` : undefined,
                        transformOrigin: 'top left'
                    }}
                />
            </div>
        </div>
    );
};

interface WorkflowSection {
    icon: string;
    title: string;
    description: string;
    items?: string[];
}

const WORKFLOW_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Bot, ShieldCheck, Code2, Users, Terminal, GitBranch, GitPullRequest
};

const WORKFLOW_COLORS: Record<string, { icon: string; iconBg: string; title: string; border: string; bullet: string }> = {
    Bot: { icon: 'text-orange-400', iconBg: 'bg-orange-500/10', title: 'text-orange-400', border: 'border-orange-400/30', bullet: 'before:text-orange-400' },
    ShieldCheck: { icon: 'text-rose-400', iconBg: 'bg-rose-500/10', title: 'text-rose-400', border: 'border-rose-400/30', bullet: 'before:text-rose-400' },
    Code2: { icon: 'text-blue-400', iconBg: 'bg-blue-500/10', title: 'text-blue-400', border: 'border-blue-400/30', bullet: 'before:text-blue-400' },
    Users: { icon: 'text-violet-400', iconBg: 'bg-violet-500/10', title: 'text-violet-400', border: 'border-violet-400/30', bullet: 'before:text-violet-400' },
    Terminal: { icon: 'text-cyan-400', iconBg: 'bg-cyan-500/10', title: 'text-cyan-400', border: 'border-cyan-400/30', bullet: 'before:text-cyan-400' },
    GitBranch: { icon: 'text-emerald-400', iconBg: 'bg-emerald-500/10', title: 'text-emerald-400', border: 'border-emerald-400/30', bullet: 'before:text-emerald-400' },
    GitPullRequest: { icon: 'text-pink-400', iconBg: 'bg-pink-500/10', title: 'text-pink-400', border: 'border-pink-400/30', bullet: 'before:text-pink-400' }
};

const WorkflowPanel = ({ sections }: { sections: WorkflowSection[] }) => (
    <div className="space-y-4">
        {sections.map((section) => {
            const Icon = WORKFLOW_ICONS[section.icon] || Code2;
            const colors = WORKFLOW_COLORS[section.icon] || WORKFLOW_COLORS.Code2;
            return (
                <div key={section.title} className={`bg-[var(--bg-activity)]/30 border ${colors.border} rounded-sm p-5`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-sm ${colors.iconBg} flex items-center justify-center shrink-0`}>
                            <Icon size={16} className={colors.icon} />
                        </div>
                        <h4 className={`text-sm font-sans font-bold ${colors.title}`}>{section.title}</h4>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed mb-3">{section.description}</p>
                    {section.items && section.items.length > 0 && (
                        <ul className="space-y-1.5">
                            {section.items.map((item, i) => (
                                <li key={i} className={`text-xs font-mono text-[var(--text-secondary)] leading-relaxed pl-4 relative before:content-['›'] before:absolute before:left-0 ${colors.bullet}`}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            );
        })}
    </div>
);

interface DescriptionSection {
    title: string;
    text: string;
    images?: string[];
    heading?: string;
}

const DescriptionSectionsPanel = ({ sections, projectTitle, easy }: { sections: DescriptionSection[]; projectTitle: string; easy?: boolean }) => (
    <div className="space-y-10">
        {sections.map((section, i) => (
            <div key={section.title}>
                {section.heading && (
                    <h2 className={easy
                        ? `text-2xl font-bold text-[var(--accent)] mb-6 font-sans ${i > 0 ? 'pt-6 border-t border-[var(--border)]' : ''}`
                        : `text-lg font-bold text-[var(--accent)] mb-4 font-sans ${i > 0 ? 'pt-6 border-t border-[var(--border)]' : ''}`
                    }>
                        {section.heading}
                    </h2>
                )}
                <h3 className={easy ? "text-xl font-bold text-[var(--text-primary)] mb-3 font-sans" : "text-base font-bold text-[var(--text-primary)] mb-3 font-sans"}>
                    {section.title}
                </h3>
                <p className={easy
                    ? "text-lg text-[var(--text-secondary)] leading-loose opacity-90 font-medium whitespace-pre-wrap mb-4"
                    : "text-[15px] text-[var(--text-primary)] opacity-90 leading-relaxed whitespace-pre-wrap mb-4"
                }>
                    {section.text.trim()}
                </p>
                {section.images && section.images.length > 0 && (
                    section.images.length > 1 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {section.images.map((src) => (
                                <img
                                    key={src}
                                    src={src}
                                    alt={`${projectTitle} — ${section.title}`}
                                    className="rounded-sm border border-[var(--border)] object-cover w-full aspect-video"
                                />
                            ))}
                        </div>
                    ) : (
                        <img
                            src={section.images[0]}
                            alt={`${projectTitle} — ${section.title}`}
                            className="rounded-sm border border-[var(--border)] w-full h-auto mx-auto"
                        />
                    )
                )}
            </div>
        ))}
    </div>
);

interface JourneyStep {
    title: string;
    description: string;
    image: string;
}

const UserJourneyPanel = ({ steps }: { steps: JourneyStep[] }) => (
    <div className="space-y-12 w-full">
        {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-start">
                <div className="flex items-start gap-3 mb-4 text-left">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                    </div>
                    <div>
                        <h4 className="text-sm font-sans font-bold text-[var(--text-primary)] mb-1">{step.title}</h4>
                        <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">{step.description}</p>
                    </div>
                </div>
                <div className="rounded-sm overflow-hidden border border-[var(--border)] bg-[var(--bg-activity)]/20 shadow-xl w-full">
                    <img src={step.image} alt={step.title} className="w-full h-auto object-cover" />
                </div>
            </div>
        ))}
    </div>
);

const CORE_STACK_ITEMS = [
    { emoji: '☁️', color: 'text-sky-400', label: 'Azure / Terraform / Bicep' },
    { emoji: '🟢', color: 'text-green-500', label: 'FastAPI / PostgreSQL / Service Bus' },
    { emoji: '🤖', color: 'text-orange-400', label: 'OpenAI / Claude / AI orchestration' },
    { emoji: '🔷', color: 'text-violet-400', label: 'C# / C++ / Python' },
    { emoji: '⚙️', color: 'text-slate-300', label: 'Git / Agile / CI/CD / Docker' },
    { emoji: '🎮', color: 'text-cyan-300', label: 'Unity / Unreal (VR & game dev background)' },
];

interface ContentRendererProps {
    type: string;
    data?: any;
    title?: string;
    onOpenFile: (file: any) => void;
    content?: string;
    lang?: string;
    editorSettings: any;
    isNavBarVisible?: boolean;
    onScroll?: (e: React.UIEvent<HTMLElement>) => void;
}

export const ContentRenderer = ({ type, data, title, onOpenFile, content, editorSettings, isNavBarVisible = true, onScroll }: ContentRendererProps) => {
    const { theme, homepageLayout, easyMode } = useContext(ThemeContext);
    const editorScrollRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState('details');
    const [vincentTypingDone, setVincentTypingDone] = useState(false);

    const sectionRef = useRef<HTMLDivElement>(null);
    const [sectionRect, setSectionRect] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const update = () => {
            const rect = el.getBoundingClientRect();
            setSectionRect({ left: rect.left, width: rect.width });
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        window.addEventListener('resize', update);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', update);
        };
    }, []);

    // Logic to get breadcrumb path
    const getPath = () => {
        if (easyMode) {
            if (type === 'home') return 'Home';
            if (type === 'projects') return 'Projects';
            if (type === 'detail' && data) return data.title;
            if (type === 'pdf') return 'Resume';
            if (type === 'contact') return 'Contact';
            return title || '';
        }

        if (type === 'home') return 'README.md';
        if (type === 'projects') return 'Portfolio/pages/all_projects.tsx';
        if (type === 'contact') return 'Portfolio/pages/contact.tsx';

        if (type === 'detail' && data)
            return `Portfolio/projects/${data.title}.tsx`;

        if (type === 'code') {
            // root config files
            if (title?.startsWith('.'))
                return title;

            // components
            if (title?.endsWith('.tsx'))
                return `Portfolio/components/${title}`;

            return title || 'Unknown';
        }

        if (type === 'pdf') return 'RESUME.PDF';

        return '';
    };

    const path = getPath();

    if (type === 'code') {
        const cleanContent = content ? content.trim() : "";
        const lines = cleanContent ? cleanContent.split('\n') : [];

        return (
            <div className={`h-full flex flex-col bg-[var(--bg-main)] overflow-hidden relative`}>
                {!easyMode && (
                    <div className={`absolute md:relative top-9 md:top-0 left-0 w-full z-30 transition-all duration-300 ease-in-out md:translate-y-0 ${!isNavBarVisible ? '-translate-y-[71px] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                        <Breadcrumbs path={path} />
                    </div>
                )}
                <div className="flex-1 flex flex-row overflow-hidden relative pt-[71px] md:pt-0">
                    <div
                        ref={editorScrollRef}
                        onScroll={onScroll}
                        className="flex-1 overflow-auto custom-scrollbar flex flex-col"
                    >
                        <div className="min-w-fit min-h-full py-4">
                            {lines.map((line, i) => (
                                <div key={i} className="flex flex-row hover:bg-[var(--bg-activity)]/30 w-full">

                                    {/* Line Number (Hidden in Easy Mode) */}
                                    {!easyMode && (
                                        <div className="w-12 shrink-0 text-right pr-4 text-[var(--line-number)] font-mono text-sm select-none opacity-40 leading-[1.5]">
                                            {i + 1}
                                        </div>
                                    )}

                                    {/* Code Content */}
                                    <div
                                        className={`
                                            flex-1 pl-2 font-mono text-sm text-[var(--text-primary)] leading-[1.5] min-w-0 pr-4
                                            ${editorSettings.wordWrap
                                                ? "whitespace-pre-wrap break-words break-all"
                                                : "whitespace-pre"
                                            }
                                        `}
                                    >
                                        {line || " "}
                                    </div>
                                </div>
                            ))}

                            {lines.length === 0 && (
                                <div className="pl-14 text-[var(--text-secondary)] italic text-xs">No content.</div>
                            )}
                        </div>
                    </div>

                    {/* REAL MINIMAP */}
                    {editorSettings.minimap && (
                        <RealMinimap
                            content={cleanContent}
                            editorRef={editorScrollRef as React.RefObject<HTMLDivElement>}
                        />
                    )}
                </div>
            </div>
        );
    }

    if (type === 'home') {
        const featuredProjects = PROJECTS_DATA.filter(p => p.featured);
        const recentActivity = [
            { action: "Automating", target: "Azure infrastructure with Terraform", time: "ongoing" },
            { action: "Orchestrating", target: "AI agent pipelines", time: "active" },
            { action: "Hardening", target: "secretless CI/CD with OIDC", time: "constant" },
            { action: "Documenting", target: "every decision, PR by PR", time: "always" },
        ];

        if (easyMode) {
            return (
                <div className="h-full flex flex-col bg-[var(--bg-main)]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar" onScroll={onScroll}>
                        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            <div className="mb-12 px-6 md:px-0">
                                <div className="max-w-4xl">
                                    <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold text-[var(--text-primary)] tracking-tight mb-6 leading-[1.1] md:leading-[1.05]">
                                        Hello, I'm <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--hero-gradient-start)] to-[var(--hero-gradient-end)]">
                                            <TypingEffect text="Vincent" speed={150} onComplete={() => setVincentTypingDone(true)} />
                                        </span>
                                        {!vincentTypingDone && (
                                            <span className="text-[var(--accent)] animate-[blink_1s_steps(1)_infinite]">_</span>
                                        )}
                                    </h1>
                                    <p className="text-base md:text-xl text-[var(--text-secondary)] leading-relaxed mb-10 opacity-90 font-sans max-w-lg">
                                        A Cloud Engineer (Azure) automating infrastructure and orchestrating AI pipelines — from a background in VR/game development to cloud architecture.
                                    </p>

                                    {/* STATUS GRID - INTEGRATED */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-[var(--border)]">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-sans text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[var(--warning)]">
                                                Current Role
                                            </span>
                                            <span className="text-[var(--text-primary)] font-sans text-xs md:text-sm font-medium">
                                                {vincentTypingDone && (
                                                    <TypewriterWords words={["Cloud Engineer", "DevOps", "Orchestrator"]} />
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-sans text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[var(--info)]">
                                                Status
                                            </span>
                                            <span className="text-[var(--text-primary)] font-sans text-xs md:text-sm font-medium">
                                                Looking for a new opportunity
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TRANSITION STATEMENT */}
                            <div className="mb-12 flex items-start gap-4 max-w-3xl">
                                <span className="text-3xl md:text-4xl shrink-0">☁️</span>
                                <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-sans pt-1">
                                    {TRANSITION_TEXT}
                                </p>
                            </div>

                            {/* WHAT I WORK ON */}
                            <div className="mb-12">
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <span>🧠</span> What I Work On
                                </h2>
                                <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed font-sans max-w-3xl">
                                    {WORK_ON_TEXT}
                                </p>
                            </div>

                            {/* CORE STACK */}
                            <div className="mb-12">
                                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                    <span>🛠</span> Core Stack
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
                                    {CORE_STACK_ITEMS.map(item => (
                                        <div key={item.label} className="flex items-center gap-2 bg-[var(--bg-panel)] border border-[var(--border)] p-3 rounded-sm text-sm text-[var(--text-primary)] font-sans">
                                            <span className={item.color}>{item.emoji}</span> {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PINNED PROJECTS - AMAZING IMAGE GRID */}
                            <div className="mb-12">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4">
                                    <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                        <Zap size={22} className="text-[var(--warning)]" />
                                        Pinned Deployments
                                    </h2>
                                    <button
                                        onClick={() => onOpenFile({ id: 'projects_tsx', title: 'all_projects.tsx', type: 'projects' })}
                                        className="text-[var(--accent)] hover:text-[var(--accent)]/80 text-sm font-bold flex items-center gap-2 group transition-all self-start md:self-auto"
                                    >
                                        Explore Projects
                                        <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {featuredProjects.slice(0, 3).map((p, i) => (
                                        <div
                                            key={p.id}
                                            onClick={() => onOpenFile({ id: p.id, title: `${p.title}.tsx`, type: 'detail', data: p })}
                                            className="group relative bg-[var(--bg-panel)] border border-[var(--border)] rounded-sm overflow-hidden cursor-pointer hover:border-[var(--accent)] hover:shadow-2xl hover:shadow-[var(--accent)]/5 transition-all flex flex-col animate-in fade-in slide-in-from-bottom-4"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <div className="aspect-[16/10] relative overflow-hidden bg-[var(--bg-activity)]">
                                                <img
                                                    src={p.image}
                                                    alt={p.title}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute top-4 left-4 flex gap-1">
                                                    {p.tech?.slice(0, 2).map((t: string) => (
                                                        <span key={t} className="px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-sm text-[9px] font-bold uppercase tracking-wider" style={{ color: getTechColor(t) }}>
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">{p.title}</h3>
                                                    <ExternalLink size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
                                                </div>
                                                <p className="text-sm text-[var(--text-secondary)] opacity-80 line-clamp-2 leading-relaxed h-10 font-sans">
                                                    {p.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CONTRIBUTION MAP SECTION */}
                            <div className="mb-12 relative group">
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Code Contributions</h2>
                                            <p className="text-sm text-[var(--text-secondary)] opacity-70">Consistent activity throughout the year across various engineering domains.</p>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden">
                                        <CanvasContributionMap theme={theme} />
                                    </div>
                                </div>
                            </div>

                            {/* RECENT ACTIVITY - FULL WIDTH */}
                            <div className="w-full">
                                <h2 className="text-sm font-bold text-[var(--text-secondary)] mb-6 flex items-center gap-2 font-sans uppercase tracking-[0.2em] opacity-60">
                                    <GitBranch size={14} className="text-[var(--info)]" />
                                    Recent Activity
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {recentActivity.map((act, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between text-sm bg-[var(--bg-panel)] border border-[var(--border)] p-4 rounded-sm hover:border-[var(--accent)] hover:bg-[var(--bg-activity)]/40 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--info)] shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
                                                <span className="text-[var(--text-secondary)] font-sans">
                                                    {act.action} <span className="text-[var(--text-primary)] font-bold group-hover:text-[var(--accent)] transition-colors">{act.target}</span>
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-[var(--text-secondary)] font-mono opacity-50">{act.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            );
        }

        if (homepageLayout === 'vscode') {
            return (
                <div className="h-full flex flex-col bg-[var(--bg-main)]">
                    <Breadcrumbs path={path} />
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-8 md:p-12 max-w-5xl mx-auto animate-in fade-in duration-500">
                            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h1 className="text-4xl text-[var(--text-primary)] font-light mb-2">Vincent Boutin's Portfolio</h1>
                                    <p className="text-lg text-[var(--text-secondary)] opacity-70">Cloud Engineer (Azure) — from game dev to cloud engineering</p>
                                </div>
                                <div className="flex gap-4">
                                    <a href="https://github.com/vbo-cloud" target="_blank" rel="noopener noreferrer" className="p-2 bg-[var(--bg-activity)] hover:bg-[var(--accent)]/20 border border-[var(--border)] rounded-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all">
                                        <Github size={20} />
                                    </a>
                                    <a href="https://www.linkedin.com/in/vincent-boutin/" target="_blank" rel="noopener noreferrer" className="p-2 bg-[var(--bg-activity)] hover:bg-[var(--accent)]/20 border border-[var(--border)] rounded-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all" title="LinkedIn">
                                        <Linkedin size={20} />
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* LEFT COLUMN: START */}
                                <div>
                                    <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4 tracking-wider uppercase opacity-80">Start</h2>
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => onOpenFile({ id: 'projects_tsx', title: 'all_projects.tsx', type: 'projects' })}
                                            className="w-full flex items-center gap-3 text-[var(--accent)] hover:underline text-sm group"
                                        >
                                            <LayoutGrid size={18} className="group-hover:scale-110 transition-transform" />
                                            <span>Explore All Projects</span>
                                        </button>
                                        <button
                                            onClick={() => onOpenFile({ id: 'home.tsx', title: 'README.md', type: 'home' })}
                                            className="w-full flex items-center gap-3 text-[var(--accent)] hover:underline text-sm group"
                                        >
                                            <FileText size={18} className="group-hover:scale-110 transition-transform" />
                                            <span>Read Portfolio Overview</span>
                                        </button>
                                        <button
                                            onClick={() => window.dispatchEvent(new CustomEvent('open-terminal'))}
                                            className="w-full flex items-center gap-3 text-[var(--accent)] hover:underline text-sm group"
                                        >
                                            <Terminal size={18} className="group-hover:scale-110 transition-transform" />
                                            <span>Open Integrated Terminal</span>
                                        </button>
                                    </div>

                                    <h2 className="text-sm font-bold text-[var(--text-primary)] mt-12 mb-4 tracking-wider uppercase opacity-80">Recent Projects</h2>
                                    <div className="space-y-1">
                                        {PROJECTS_DATA.slice(0, 5).map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => onOpenFile({ id: p.id, title: `${p.title}.tsx`, type: 'detail', data: p })}
                                                className="group flex items-center justify-between p-2 rounded hover:bg-[var(--bg-activity)] cursor-pointer transition-all"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FileCode size={16} className="text-[var(--accent)] shrink-0" />
                                                    <span className="text-sm text-[var(--text-primary)] truncate font-sans">{p.title}</span>
                                                </div>
                                                <span className="text-[10px] text-[var(--text-secondary)] opacity-0 group-hover:opacity-60 transition-opacity font-mono whitespace-nowrap ml-4">Portfolio/projects</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: SKILLS & SPOTLIGHT */}
                                <div>
                                    <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4 tracking-wider uppercase opacity-80">Skills & Expertise</h2>
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {['React', 'Next.js', 'Typescript', 'Node.js', 'Go', 'Docker', 'AWS', 'PostgreSQL', 'Python'].map(skill => (
                                            <span key={skill} className="px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border)] rounded-sm text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] cursor-default transition-all">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4 tracking-wider uppercase opacity-80">Featured Walkthrough</h2>
                                    <div className="space-y-4">
                                        <div
                                            onClick={() => {
                                                const p = PROJECTS_DATA.find(p => p.featured);
                                                if (p) onOpenFile({ id: p.id, title: `${p.title}.tsx`, type: 'detail', data: p });
                                            }}
                                            className="p-4 bg-[var(--bg-panel)] border border-[var(--border)] rounded-sm hover:border-[var(--accent)] transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                                                    <Zap size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Spotlight: {PROJECTS_DATA.find(p => p.featured)?.title || 'Flagship Project'}</h3>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">A deep dive into my most sophisticated work. Click to see the architecture and implementation.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-[var(--bg-panel)] border border-[var(--border)] rounded-sm hover:border-[var(--accent)] transition-all cursor-pointer group">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)] shrink-0">
                                                    <GitBranch size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Open Source Contributions</h3>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Check out how I contribute back to the community and collaborate on scalable systems.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 p-4 border border-[var(--border)] border-dashed rounded-sm">
                                            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mb-2">
                                                <div className="w-2 h-2 rounded-full bg-[var(--info)] animate-pulse" />
                                                <span>Currently available for projects</span>
                                            </div>
                                            <div className="text-[10px] text-[var(--text-secondary)] font-mono opacity-60">
                                                Last indexed: {new Date().toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col bg-[var(--bg-main)] relative">
                <div className={`absolute md:relative top-9 md:top-0 left-0 w-full z-30 transition-all duration-300 ease-in-out md:translate-y-0 ${!isNavBarVisible ? '-translate-y-[71px] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                    <Breadcrumbs path={path} />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pt-[71px] md:pt-0" onScroll={onScroll}>
                    <div className="p-4 md:p-12 max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300 pb-20">

                        {/* HERO SECTION */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                            <div>
                                <span className="text-[var(--text-secondary)] font-mono text-sm block mb-2">// Initializing Portfolio System...</span>
                                <h1 className="text-3xl md:text-6xl font-bold text-[var(--text-primary)] tracking-tight mb-4">
                                    <span className="mr-3">Hello, I'm</span>
                                    {/* DYNAMIC THEME GRADIENT */}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--hero-gradient-start)] to-[var(--hero-gradient-end)]">
                                        <TypingEffect text="Vincent" speed={150} onComplete={() => setVincentTypingDone(true)} />
                                    </span>
                                    {!vincentTypingDone && (
                                        <span className="ml-1 text-[var(--accent)] animate-[blink_1s_steps(1)_infinite]">_</span>
                                    )}
                                </h1>
                            </div>
                        </div>

                        {/* STATUS GRID - DYNAMIC COLORS */}
                        <div className="pl-4 md:pl-6 border-l-2 border-[var(--border)] space-y-4 font-mono text-xs md:text-base mb-12">

                            {/* 1. Current Role */}
                            <div className="flex flex-wrap gap-2 md:gap-4 items-center">
                                <span className="text-[var(--warning)] min-w-[80px] md:min-w-[100px]">current_role:</span>
                                <span className="text-[var(--text-primary)]">"{vincentTypingDone && <TypewriterWords words={["Cloud Engineer", "DevOps", "Orchestrator"]} />}"</span>
                            </div>

                            {/* 2. Status */}
                            <div className="flex flex-wrap gap-2 md:gap-4 items-center">
                                <span className="text-[var(--info)] min-w-[80px] md:min-w-[100px]">status:</span>
                                <span className="text-[var(--text-primary)]">"Looking for a new opportunity"</span>
                            </div>

                        </div>

                        {/* TRANSITION STATEMENT */}
                        <div className="mb-8 flex items-start gap-3">
                            <span className="text-2xl md:text-3xl shrink-0">☁️</span>
                            <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed font-sans pt-1">
                                {TRANSITION_TEXT}
                            </p>
                        </div>

                        {/* WHAT I WORK ON */}
                        <div className="mb-8">
                            <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2 font-sans">
                                <span>🧠</span> What I Work On
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                                {WORK_ON_TEXT}
                            </p>
                        </div>

                        {/* CORE STACK */}
                        <div className="mb-8">
                            <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2 font-sans">
                                <span>🛠</span> Core Stack
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {CORE_STACK_ITEMS.map(item => (
                                    <div key={item.label} className="flex items-center gap-2 bg-[var(--bg-panel)] border border-[var(--border)] p-3 rounded-sm text-sm text-[var(--text-primary)] font-sans">
                                        <span className={item.color}>{item.emoji}</span> {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PINNED PROJECTS */}
                        <div className="mb-8">
                            <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2 font-sans">
                                <Zap size={18} className="text-[var(--warning)]" /> Pinned Deployments
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredProjects.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() =>
                                            onOpenFile({
                                                id: p.id,
                                                title: `${p.title}.tsx`,
                                                type: 'detail',
                                                data: p
                                            })
                                        }
                                        className="bg-[var(--bg-panel)] border border-[var(--border)] hover:border-[var(--accent)] rounded-lg p-5 cursor-pointer hover:-translate-y-1 transition-all group shadow-lg"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <FileCode size={16} className="text-[var(--accent)]" />
                                                <span className="text-[var(--text-primary)] font-sans text-sm font-semibold truncate max-w-[150px]">
                                                    {p.title}
                                                </span>
                                            </div>
                                            <ExternalLink size={12} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                                        </div>
                                        <p className="text-[var(--text-secondary)] text-xs line-clamp-2 mb-4 h-8 font-sans">
                                            {p.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ACTION BUTTON */}
                        <div className="mb-12 flex flex-wrap gap-4">
                            <button
                                onClick={() =>
                                    onOpenFile({
                                        id: 'projects_tsx',
                                        title: 'all_projects.tsx',
                                        type: 'projects'
                                    })
                                }
                                className="group flex items-center gap-3 px-6 py-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-md hover:bg-[var(--accent)]/90 transition-all font-sans text-sm font-medium shadow-md"
                            >
                                <Terminal size={16} className="text-[var(--accent-fg)]" />
                                <span className="tracking-wide">Explore All Projects</span>
                            </button>
                        </div>

                        {/* CONTRIBUTION MAP - THEME AWARE */}
                        <CanvasContributionMap theme={theme} />
                        {/* RECENT ACTIVITY */}
                        <div className="mb-12">
                            <h2 className="text-sm font-bold text-[var(--text-secondary)] mb-4 flex items-center gap-2 font-sans uppercase tracking-wider">
                                <GitBranch size={14} className="text-[var(--info)]" /> Recent Activity
                            </h2>
                            <div className="space-y-2">
                                {recentActivity.map((act, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm bg-[var(--bg-panel)] border border-[var(--border)] p-3 rounded hover:border-[var(--accent)] hover:bg-[var(--bg-activity)] transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--info)]" />
                                            <span className="text-[var(--text-secondary)] font-sans">{act.action} <span className="text-[var(--text-primary)] font-bold group-hover:text-[var(--accent)] cursor-pointer decoration-dotted underline-offset-4">{act.target}</span></span>
                                        </div>
                                        <span className="text-xs text-[var(--text-secondary)] font-sans opacity-70">{act.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    if (type === 'projects') {
        const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
            const saved = localStorage.getItem('projects_view_mode');
            return (saved === 'grid' || saved === 'list') ? saved : (easyMode ? 'grid' : 'list');
        });

        useEffect(() => {
            localStorage.setItem('projects_view_mode', viewMode);
        }, [viewMode]);

        const [showFilters, setShowFilters] = useState(false);
        const [techFilters, setTechFilters] = useState<string[]>([]);
        const [langFilters, setLangFilters] = useState<string[]>([]);

        const allTech = Array.from(new Set(PROJECTS_DATA.flatMap(p => p.tech || []))).sort();
        const allLanguages = Array.from(new Set(PROJECTS_DATA.flatMap(p => (p.languages || []).map(l => l.name)))).sort();

        const filteredProjects = PROJECTS_DATA.filter(p => {
            const techMatch = techFilters.length === 0 || p.tech?.some(t => techFilters.includes(t));
            const langMatch = langFilters.length === 0 || p.languages?.some(l => langFilters.includes(l.name));
            return techMatch && langMatch;
        });

        const toggleFilter = (value: string, setFn: React.Dispatch<React.SetStateAction<string[]>>) => {
            setFn(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
        };

        const getCategoryProjects = (categories: string[]) =>
            filteredProjects.filter(p => categories.includes(p.category));

        const sectionHasResults = (section: ProjectSection | ProjectSectionGroup): boolean =>
            'sections' in section
                ? section.sections.some(sectionHasResults)
                : getCategoryProjects(section.categories).length > 0;

        const SectionHeading = ({ icon: Icon, title, description, featured }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description?: string; featured?: boolean }) => (
            <div className={`flex items-start gap-4 ${featured ? 'pb-6 border-b-2 border-[var(--accent)]/40' : ''}`}>
                <div className={`shrink-0 rounded-sm p-2.5 ${featured ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-activity)] text-[var(--accent)] border border-[var(--border)]'}`}>
                    <Icon size={featured ? 20 : 16} />
                </div>
                <div>
                    <h2 className={`font-bold text-[var(--text-primary)] tracking-tight ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>{title}</h2>
                    {description && <p className="text-[var(--text-secondary)] opacity-70 text-sm mt-1 max-w-2xl">{description}</p>}
                </div>
            </div>
        );

        if (easyMode) {
            return (
                <div className="h-full flex flex-col bg-[var(--bg-main)]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-12" onScroll={onScroll}>
                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">Project Portfolio</h1>
                                    <p className="text-[var(--text-secondary)] opacity-80 text-lg max-w-2xl">
                                        A curated collection of my most significant engineering projects, ranging from immersive web experiences to low-level system internal tools.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-sm border transition-all text-sm font-bold
                                            ${showFilters ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-[var(--bg-activity)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                                        `}
                                    >
                                        <Filter size={16} /> Filters
                                    </button>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="mb-12 p-8 bg-[var(--bg-activity)]/40 border border-[var(--border)] rounded-sm animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 opacity-60">Tech Stack</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {allTech.map(t => (
                                                    <button key={t} onClick={() => toggleFilter(t, setTechFilters)}
                                                        className={`px-3 py-1 text-xs rounded-sm border transition-all 
                                                            ${techFilters.includes(t) ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'}`}>
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 opacity-60">Core Languages</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {allLanguages.map(l => (
                                                    <button key={l} onClick={() => toggleFilter(l, setLangFilters)}
                                                        className={`px-3 py-1 text-xs rounded-sm border transition-all
                                                            ${langFilters.includes(l) ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'}`}>
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(() => {
                                const renderEasyCard = (p: any, featured?: boolean) => (
                                    <div
                                        key={p.id}
                                        onClick={() => onOpenFile({ id: p.id, title: `${p.title}.tsx`, type: "detail", data: p })}
                                        className={featured
                                            ? "group relative md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[var(--accent)]/15 via-[var(--bg-activity)]/20 to-transparent border-2 border-[var(--accent)]/50 rounded-sm overflow-hidden cursor-pointer hover:border-[var(--accent)] transition-all flex flex-col md:flex-row"
                                            : "group relative bg-[var(--bg-activity)]/20 border border-[var(--border)] rounded-sm overflow-hidden cursor-pointer hover:border-[var(--accent)] transition-all flex flex-col h-full"
                                        }
                                    >
                                        <div className={featured ? "md:w-2/5 aspect-video md:aspect-auto relative overflow-hidden bg-[var(--bg-activity)]" : "aspect-video relative overflow-hidden bg-[var(--bg-activity)]"}>
                                            <img src={p.image} alt={p.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                            {featured ? (
                                                <div className="absolute top-4 left-4 px-3 py-1 bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm flex items-center gap-1.5 shadow-lg">
                                                    <Cloud size={12} /> Flagship
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                                    <span className="text-white text-xs font-bold flex items-center gap-2">
                                                        View Case Study <ExternalLink size={14} />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={featured ? "md:w-3/5 p-8 flex flex-col justify-center" : "p-6 flex-1 flex flex-col"}>
                                            <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                                {p.tech?.slice(0, featured ? 6 : 3).map((t: string) => (
                                                    <TechTag key={t} label={t} />
                                                ))}
                                            </div>
                                            <h3 className={featured ? "text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors" : "text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors"}>{p.title}</h3>
                                            <p className={featured ? "text-base text-[var(--text-secondary)] leading-relaxed mb-6 opacity-80" : "text-sm text-[var(--text-secondary)] line-clamp-2 md:line-clamp-3 leading-relaxed mb-6 opacity-80"}>{p.description}</p>

                                            {featured && (
                                                <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
                                                    <span className="inline-flex items-center gap-2 text-[var(--accent)] font-bold text-sm">
                                                        View Case Study <ExternalLink size={14} />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );

                                return (
                                    <div className="space-y-16">
                                        {PROJECT_SECTIONS.filter(sectionHasResults).map(section => (
                                            'sections' in section ? (
                                                <div key={section.key}>
                                                    <SectionHeading icon={section.icon} title={section.title} />
                                                    <div className="space-y-12 mt-8">
                                                        {section.sections.filter(sub => getCategoryProjects(sub.categories).length > 0).map(sub => (
                                                            <div key={sub.key}>
                                                                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-5 opacity-70">
                                                                    <sub.icon size={14} className="text-[var(--accent)]" /> {sub.title}
                                                                </h3>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                                    {getCategoryProjects(sub.categories).map(p => renderEasyCard(p))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div key={section.key}>
                                                    <SectionHeading icon={section.icon} title={section.title} description={section.description} featured={section.featured} />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                                                        {getCategoryProjects(section.categories).map(p => renderEasyCard(p, section.featured))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col bg-[var(--bg-main)] relative">
                {!easyMode && (
                    <div className={`absolute md:relative top-9 md:top-0 left-0 w-full z-30 transition-all duration-300 ease-in-out md:translate-y-0 ${!isNavBarVisible ? '-translate-y-[71px] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                        <Breadcrumbs path={path} />
                    </div>
                )}
                <div className="flex-1 overflow-hidden flex flex-col pt-[71px] md:pt-0">
                    <div className="px-4 py-1.5 md:py-2 border-b border-[var(--border)] bg-[var(--bg-panel)] flex flex-row justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="text-[var(--text-secondary)] text-[10px] md:text-xs uppercase tracking-widest font-sans font-bold flex items-center gap-2">
                                <LayoutGrid size={13} className="text-[var(--accent)]" />
                                <span className="hidden sm:inline">PROJECTS EXPLORER</span>
                                <span className="sm:hidden">PROJECTS</span>
                            </div>
                        </div>

                        <div className="flex items-center bg-[var(--bg-activity)] rounded-sm p-0.5 border border-[var(--border)]">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-[var(--bg-main)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                title="List View"
                            >
                                <List size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-main)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                title="Grid View"
                            >
                                <LayoutGrid size={13} />
                            </button>
                            <div className="w-[1px] h-3 bg-[var(--border)] mx-1" />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-1.5 rounded-sm transition-all ${showFilters ? 'bg-[var(--bg-main)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                title="Filter"
                            >
                                <Filter size={14} />
                            </button>
                        </div>
                    </div>

                    {/* FILTERS PANEL */}
                    {showFilters && (
                        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-activity)]/20 shrink-0">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2 font-mono">Filter by Technology</div>
                                    <div className="flex gap-2 flex-wrap">
                                        {allTech.map(t => (
                                            <button key={t} onClick={() => toggleFilter(t, setTechFilters)}
                                                className={`px-2 py-0.5 text-[10px] border rounded-sm font-mono transition-all ${techFilters.includes(t) ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-fg)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'}`}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2 font-mono">Filter by Language</div>
                                    <div className="flex gap-2 flex-wrap">
                                        {allLanguages.map(l => (
                                            <button key={l} onClick={() => toggleFilter(l, setLangFilters)}
                                                className={`px-2 py-0.5 text-[10px] border rounded-sm font-mono transition-all ${langFilters.includes(l) ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-fg)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'}`}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CONTENT AREA */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 pt-0 pb-8" onScroll={onScroll}>
                        <div className="max-w-6xl mx-auto w-full pt-1 md:pt-2 pb-4">
                            {filteredProjects.length === 0 ? (
                                <div className="text-center text-[var(--text-secondary)] mt-20 font-mono text-sm">No extensions found matching your criteria.</div>
                            ) : (() => {
                                const renderIdeCard = (p: any, featured?: boolean) => (
                                    <div
                                        key={p.id}
                                        onClick={() => onOpenFile({ id: p.id, title: `${p.title}.tsx`, type: "detail", data: p })}
                                        className={`
                                        group border cursor-pointer transition-all
                                        ${viewMode === 'grid'
                                                ? (featured
                                                    ? 'md:col-span-2 xl:col-span-3 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--bg-panel)] border-[var(--accent)]/50 hover:border-[var(--accent)] flex flex-col md:flex-row rounded-sm'
                                                    : 'bg-[var(--bg-panel)] border-[var(--border)] flex flex-col h-full rounded-sm hover:border-[var(--accent)]')
                                                : (featured
                                                    ? 'flex flex-row items-stretch gap-4 p-3 rounded-sm border-[var(--accent)]/50 bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10'
                                                    : 'flex flex-row items-stretch gap-4 p-2 rounded-sm border-transparent hover:bg-[var(--bg-activity)]')
                                            }
                                    `}
                                    >
                                        {/* IMAGE / ICON */}
                                        <div className={
                                            viewMode === 'grid'
                                                ? (featured ? "md:w-2/5 h-48 md:h-auto bg-[var(--bg-activity)] relative overflow-hidden shrink-0" : "h-48 w-full bg-[var(--bg-activity)] relative overflow-hidden shrink-0")
                                                : (featured ? "w-16 h-16 md:w-28 md:h-28 bg-[var(--bg-activity)] shrink-0 border border-[var(--accent)]/40" : "w-16 h-16 md:w-24 md:h-24 bg-[var(--bg-activity)] shrink-0 border border-[var(--border)]")
                                        }>
                                            <img
                                                src={p.image}
                                                alt={p.title}
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            />
                                            {featured && viewMode === 'grid' && (
                                                <div className="absolute top-3 left-3 px-2 py-0.5 bg-[var(--accent)] text-white text-[9px] font-bold uppercase tracking-widest rounded-sm flex items-center gap-1">
                                                    <Cloud size={10} /> Flagship
                                                </div>
                                            )}
                                        </div>

                                        {/* CONTENT */}
                                        <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? (featured ? 'p-6 flex flex-col justify-center' : 'p-3') : 'flex flex-col justify-between'}`}>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className={featured && viewMode === 'grid' ? "font-bold text-[var(--text-primary)] text-xl font-sans group-hover:text-[var(--accent)] transition-colors" : "font-bold text-[var(--text-primary)] text-sm md:text-base font-sans group-hover:text-[var(--accent)] transition-colors"}>
                                                            {p.title}
                                                        </h3>
                                                        {featured && viewMode === 'list' && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-[var(--accent)] text-white text-[9px] font-bold uppercase tracking-widest">
                                                                <Cloud size={10} /> Flagship
                                                            </span>
                                                        )}
                                                    </div>
                                                    {viewMode === 'grid' && p.links && 'live' in p.links && <Globe size={12} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />}
                                                </div>

                                                {viewMode === 'grid' && (
                                                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                                                        {p.tech?.slice(0, 3).map((t: string) => (
                                                            <TechTag key={t} label={t} />
                                                        ))}
                                                    </div>
                                                )}

                                                <p className={featured && viewMode === 'grid' ? "text-sm text-[var(--text-secondary)] mb-2 font-sans opacity-80" : "text-xs text-[var(--text-secondary)] line-clamp-2 md:line-clamp-1 mb-2 font-sans opacity-80"}>
                                                    {p.description}
                                                </p>
                                            </div>

                                            {viewMode === 'list' && (
                                                <div className="flex gap-1.5 mt-1 flex-wrap">
                                                    {p.tech?.map((t: string) => (
                                                        <TechTag key={t} label={t} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );

                                return (
                                    <div className="space-y-14">
                                        {PROJECT_SECTIONS.filter(sectionHasResults).map(section => (
                                            'sections' in section ? (
                                                <div key={section.key}>
                                                    <SectionHeading icon={section.icon} title={section.title} />
                                                    <div className="space-y-10 mt-6">
                                                        {section.sections.filter(sub => getCategoryProjects(sub.categories).length > 0).map(sub => (
                                                            <div key={sub.key}>
                                                                <h3 className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3 opacity-70">
                                                                    <sub.icon size={13} className="text-[var(--accent)]" /> {sub.title}
                                                                </h3>
                                                                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-1"}>
                                                                    {getCategoryProjects(sub.categories).map(p => renderIdeCard(p))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div key={section.key}>
                                                    <SectionHeading icon={section.icon} title={section.title} description={section.description} featured={section.featured} />
                                                    <div className={`mt-6 ${viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-1"}`}>
                                                        {getCategoryProjects(section.categories).map(p => renderIdeCard(p, section.featured))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'detail' && data) {
        if (easyMode) {
            return (
                <div className="h-full flex flex-col bg-[var(--bg-main)]">
                    <div ref={sectionRef} className="flex-1 overflow-y-auto custom-scrollbar" onScroll={onScroll}>
                        {/* Immersive Detail Header */}
                        <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
                            <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                                <div className="max-w-5xl mx-auto">
                                    <div className="flex flex-wrap items-center gap-2 mb-6">
                                        {data.tech?.slice(0, 6).map((t: string) => (
                                            <span key={t} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm text-[10px] font-bold uppercase tracking-widest" style={{ color: getTechColor(t) }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight animate-in slide-in-from-left-4 duration-700">{data.title}</h1>
                                    <div className="flex flex-wrap gap-4">
                                        {data.links?.live && (
                                            <a href={data.links.live} target="_blank" rel="noopener noreferrer"
                                                className="px-8 py-3 bg-[var(--accent)] text-white text-sm font-bold rounded-sm shadow-xl shadow-[var(--accent)]/30 hover:scale-105 transition-transform flex items-center gap-2">
                                                Launch Application <Globe size={18} />
                                            </a>
                                        )}
                                        {data.links?.github && (
                                            <a href={data.links.github} target="_blank" rel="noopener noreferrer"
                                                className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold rounded-sm hover:bg-white/20 transition-all flex items-center gap-2">
                                                <Github size={18} /> Source Code
                                            </a>
                                        )}
                                        {data.pdfs?.map((pdf: { label: string; path: string }) => (
                                            <a key={pdf.path} href={pdf.path} target="_blank" rel="noopener noreferrer"
                                                className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold rounded-sm hover:bg-white/20 transition-all flex items-center gap-2">
                                                <FileText size={18} /> {pdf.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-5xl mx-auto px-8 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                            <div className="lg:col-span-2 space-y-12">
                                <section>
                                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                                        <div className="w-2 h-8 bg-[var(--accent)] rounded-sm" /> Narrative
                                    </h2>
                                    {data.descriptionSections ? (
                                        <DescriptionSectionsPanel sections={data.descriptionSections} projectTitle={data.title} easy />
                                    ) : (
                                        <p className="text-lg text-[var(--text-secondary)] leading-loose opacity-90 font-medium">
                                            {data.longDescription || data.description}
                                        </p>
                                    )}
                                </section>

                                {data.htmlEmbed && (
                                    <section>
                                        <HtmlEmbedFrame embed={data.htmlEmbed} section={sectionRect} />
                                    </section>
                                )}

                                {data.video && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                                            <div className="w-2 h-8 bg-[var(--accent)] rounded-sm" /> Video
                                        </h2>
                                        <div className="aspect-video w-full rounded-sm overflow-hidden border border-[var(--border)] shadow-lg">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${getYouTubeEmbedId(data.video.url)}`}
                                                title={data.video.title}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    </section>
                                )}

                                {!data.descriptionSections && data.gallery && data.gallery.length > 0 && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                                            <div className="w-2 h-8 bg-[var(--accent)] rounded-sm" /> Gallery
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {data.gallery.map((src: string, i: number) => (
                                                <img
                                                    key={src}
                                                    src={src}
                                                    alt={`${data.title} screenshot ${i + 2}`}
                                                    className="rounded-sm border border-[var(--border)] object-cover w-full aspect-video"
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {data.userJourney && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                                            <div className="w-2 h-8 bg-[var(--accent)] rounded-sm" /> User Journey
                                        </h2>
                                        <UserJourneyPanel steps={data.userJourney} />
                                    </section>
                                )}

                                {data.showArchitectureTab && data.architecture && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">System Architecture</h2>
                                        <div className="bg-[var(--bg-activity)] border border-[var(--border)] rounded-sm p-8 overflow-hidden relative">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Code2 size={120} />
                                            </div>
                                            <pre className="relative z-10 font-mono text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                                                {data.architecture}
                                            </pre>
                                        </div>
                                    </section>
                                )}

                                {data.showWorkflowTab && (data.workflow || data.snippet) && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{data.workflow ? 'Workflow' : 'Core Implementation'}</h2>
                                        {data.workflow ? (
                                            <WorkflowPanel sections={data.workflow} />
                                        ) : (
                                            <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-sm overflow-hidden shadow-lg">
                                                <div className="bg-[var(--bg-activity)] px-4 py-2 border-b border-[var(--border)] flex justify-between items-center">
                                                    <span className="text-xs font-mono text-[var(--text-secondary)]">implementation.ts</span>
                                                    <div className="flex gap-1.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                                                    </div>
                                                </div>
                                                <div className="p-6 overflow-x-auto custom-scrollbar">
                                                    <pre className="font-mono text-xs text-[var(--success)] leading-relaxed">{data.snippet}</pre>
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                )}
                            </div>

                            <div className="space-y-12">
                                <div className="p-8 bg-[var(--bg-activity)]/40 border border-[var(--border)] rounded-sm sticky top-8">
                                    {/* Switched to standard VS Code like Project Details to match authentic look */}
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-xs uppercase font-bold text-[var(--text-secondary)] mb-4 tracking-wider font-sans">Technologies</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {data.tech?.map((t: string) => (
                                                    <TechTag key={t} label={t} />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs uppercase font-bold text-[var(--text-secondary)] mb-4 tracking-wider font-sans">Resources</h3>
                                            <div className="text-xs space-y-3 text-[var(--text-primary)] font-sans">
                                                <div className="flex justify-between py-1.5 border-b border-[var(--border)] border-dashed">
                                                    <span>Last Update</span>
                                                    <span className="text-[var(--text-secondary)]">Recently</span>
                                                </div>
                                                <div className="flex justify-between py-1.5">
                                                    <span>License</span>
                                                    <span className="text-[var(--text-secondary)] font-mono">MIT</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onOpenFile({ id: 'projects.tsx', title: 'all_projects.tsx', type: 'projects' })}
                                        className="w-full mt-12 py-4 bg-[var(--bg-activity)] border border-[var(--border)] rounded-sm text-[var(--text-primary)] text-sm font-bold hover:bg-[var(--bg-panel)] transition-all flex items-center justify-center gap-2"
                                    >
                                        Back to Assignments
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col bg-[var(--bg-main)] relative">
                {!easyMode && (
                    <div className={`absolute md:relative top-9 md:top-0 left-0 w-full z-30 transition-all duration-300 ease-in-out md:translate-y-0 ${!isNavBarVisible ? '-translate-y-[71px] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                        <Breadcrumbs path={path} />
                    </div>
                )}
                <div ref={sectionRef} className="flex-1 overflow-y-auto custom-scrollbar pt-[71px] md:pt-0" onScroll={onScroll}>
                    {/* EXTENSION HEADER */}
                    <div className={`px-4 md:px-12 mx-auto w-full py-8 ${data.userJourney ? 'max-w-[88rem]' : 'max-w-5xl'}`}>
                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                            <div className="w-32 h-32 bg-[var(--bg-activity)] border border-[var(--border)] shrink-0 shadow-sm relative overflow-hidden">
                                <img
                                    src={data.image}
                                    alt={data.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h1 className="text-3xl font-sans font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
                                    {data.title}
                                </h1>
                                <p className="text-base text-[var(--text-primary)] mb-4 font-sans max-w-2xl leading-relaxed">
                                    {data.description}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {data.links?.live && (
                                        <a href={data.links.live} target="_blank" rel="noopener noreferrer"
                                            className="px-4 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--accent-fg)] text-sm font-medium rounded-sm transition-all shadow-sm flex items-center gap-2">
                                            Run Project <Globe size={14} />
                                        </a>
                                    )}
                                    {data.links?.github && (
                                        <a href={data.links.github} target="_blank" rel="noopener noreferrer"
                                            className="px-4 py-1.5 bg-[var(--bg-activity)] hover:bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium rounded-sm transition-all flex items-center gap-2">
                                            <Github size={14} /> Repository
                                        </a>
                                    )}
                                    {data.pdfs?.map((pdf: { label: string; path: string }) => (
                                        <a key={pdf.path} href={pdf.path} target="_blank" rel="noopener noreferrer"
                                            className="px-4 py-1.5 bg-[var(--bg-activity)] hover:bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium rounded-sm transition-all flex items-center gap-2">
                                            <FileText size={14} /> {pdf.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* TECHNOLOGIES */}
                        <div className="mb-6">
                            <h3 className="text-xs uppercase font-bold text-[var(--text-secondary)] mb-4 tracking-wider font-sans">Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.tech?.map((t: string) => (
                                    <TechTag key={t} label={t} />
                                ))}
                            </div>
                        </div>

                        {data.video && (
                            <div className="mb-6 aspect-video max-w-2xl w-full mx-auto rounded-sm overflow-hidden border border-[var(--border)] shadow-xl">
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYouTubeEmbedId(data.video.url)}`}
                                    title={data.video.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {/* TABS */}
                        <div className="flex items-center gap-6 border-b border-[var(--border)] mt-1">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-1 py-3 text-sm font-sans border-b-2 font-medium transition-colors ${activeTab === 'details' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                Description
                            </button>
                            {data.showArchitectureTab && (data.architecture || data.htmlEmbed) && (
                                <button
                                    onClick={() => setActiveTab('architecture')}
                                    className={`px-1 py-3 text-sm font-sans border-b-2 font-medium transition-colors ${activeTab === 'architecture' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    Architecture
                                </button>
                            )}
                            {data.showWorkflowTab && (data.workflow || data.snippet) && (
                                <button
                                    onClick={() => setActiveTab('implementation')}
                                    className={`px-1 py-3 text-sm font-sans border-b-2 font-medium transition-colors ${activeTab === 'implementation' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    Workflow
                                </button>
                            )}
                        </div>

                        <div className="mt-6">
                            {/* MAIN CONTENT AREA */}
                            <div className="min-w-0">
                                {/* DETAILS TAB */}
                                {activeTab === 'details' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {data.descriptionSections ? (
                                            <div className="mb-6">
                                                <DescriptionSectionsPanel sections={data.descriptionSections} projectTitle={data.title} />
                                            </div>
                                        ) : (
                                            <div className="text-[var(--text-primary)] opacity-90 font-sans leading-7 mb-6">
                                                <p className="whitespace-pre-wrap text-[15px] leading-relaxed mt-0 pt-0">
                                                    {data.longDescription?.trim()}
                                                </p>
                                            </div>
                                        )}

                                        {!data.descriptionSections && data.gallery && data.gallery.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full">
                                                {data.gallery.map((src: string, i: number) => (
                                                    <img
                                                        key={src}
                                                        src={src}
                                                        alt={`${data.title} screenshot ${i + 2}`}
                                                        className="rounded-sm border border-[var(--border)] object-cover w-full aspect-video"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {data.userJourney && (
                                            <div className="mt-20 w-full">
                                                <h3 className="text-xs uppercase font-bold text-[var(--text-secondary)] mb-4 tracking-wider font-sans text-center">User Journey</h3>
                                                <UserJourneyPanel steps={data.userJourney} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ARCHITECTURE TAB */}
                                {activeTab === 'architecture' && data.showArchitectureTab && (data.htmlEmbed || data.architecture) && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {data.htmlEmbed ? (
                                            <div className="w-full mx-auto">
                                                <HtmlEmbedFrame embed={data.htmlEmbed} section={sectionRect} />
                                            </div>
                                        ) : (
                                            <div className="bg-[var(--bg-activity)]/30 border border-[var(--border)] rounded-sm p-6 overflow-x-auto custom-scrollbar">
                                                <pre className="font-mono text-xs text-[var(--text-secondary)] leading-relaxed">{data.architecture}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* WORKFLOW TAB */}
                                {activeTab === 'implementation' && data.showWorkflowTab && (data.workflow || data.snippet) && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {data.workflow ? (
                                            <WorkflowPanel sections={data.workflow} />
                                        ) : (
                                            <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-sm overflow-hidden shadow-lg">
                                                <div className="bg-[var(--bg-activity)] px-4 py-2 border-b border-[var(--border)] flex justify-between items-center">
                                                    <span className="text-xs font-mono text-[var(--text-secondary)]">implementation.ts</span>
                                                    <div className="flex gap-1.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                                                    </div>
                                                </div>
                                                <div className="p-6 overflow-x-auto custom-scrollbar">
                                                    <pre className="font-mono text-xs text-[var(--success)] leading-relaxed">{data.snippet}</pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'pdf') {
        return (
            <div className="h-full flex flex-col bg-[var(--bg-main)] relative">
                {!easyMode && (
                    <div className={`absolute md:relative top-9 md:top-0 left-0 w-full z-30 transition-all duration-300 ease-in-out md:translate-y-0 ${!isNavBarVisible ? '-translate-y-[71px] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                        <Breadcrumbs path={path} />
                    </div>
                )}
                <div className="flex-1 flex flex-col min-h-0 pt-[71px] md:pt-0">
                    <div className="flex items-center gap-2 px-4 py-1.5 border-b border-[var(--border)] bg-[var(--bg-panel)] text-[var(--accent)] font-mono font-bold text-[11px]">
                        <FileText size={14} />
                        <span>RESUME</span>
                    </div>
                    <div className="flex-1 bg-[#1e1e1e] overflow-hidden">
                        <iframe
                            src="https://cv.vincentboutin.dev/"
                            className="w-full h-full border-none"
                            style={{ minHeight: 'calc(100vh - 120px)' }}
                            title="Vincent Boutin — Interactive Resume"
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'contact') {
        const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
        const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
        const [errorMsg, setErrorMsg] = useState('');

        const updateField = (key: 'name' | 'email' | 'subject' | 'message' | 'website') => (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => setForm(prev => ({ ...prev, [key]: e.target.value }));

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setStatus('loading');
            setErrorMsg('');
            const result = await sendContactEmail(form);
            if (result.ok) {
                setStatus('sent');
                setForm({ name: '', email: '', subject: '', message: '', website: '' });
            } else {
                setStatus('error');
                setErrorMsg(result.error);
            }
        };

        const directChannels = [
            { icon: Mail, label: 'contact@vincentboutin.dev', href: 'mailto:contact@vincentboutin.dev' },
            { icon: Linkedin, label: 'linkedin.com/in/vincent-boutin', href: 'https://www.linkedin.com/in/vincent-boutin/' },
            { icon: Github, label: 'github.com/vbo-cloud', href: 'https://github.com/vbo-cloud' },
        ];

        return (
            <div className="h-full flex flex-col bg-[var(--bg-main)] relative">
                {!easyMode && (
                    <div className={`absolute md:relative top-9 md:top-0 left-0 w-full z-30 transition-all duration-300 ease-in-out md:translate-y-0 ${!isNavBarVisible ? '-translate-y-[71px] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                        <Breadcrumbs path={path} />
                    </div>
                )}
                <div className="flex-1 flex flex-col min-h-0 pt-[71px] md:pt-0">
                    {!easyMode && (
                        <div className="flex items-center gap-2 px-4 py-1.5 border-b border-[var(--border)] bg-[var(--bg-panel)] text-[var(--accent)] font-mono font-bold text-[11px]">
                            <Mail size={14} />
                            <span>CONTACT_FORM</span>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-10" onScroll={onScroll}>
                        <div className="max-w-3xl mx-auto">
                            <h1 className={`font-bold text-[var(--text-primary)] tracking-tight mb-3 ${easyMode ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
                                Let's talk
                            </h1>
                            <p className="text-[var(--text-secondary)] opacity-80 mb-10 max-w-xl">
                                A question, an opportunity, or just want to say hi — drop a message and I'll get back to you.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <form onSubmit={handleSubmit} className="relative md:col-span-2 space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Name</label>
                                        <div className="flex items-center gap-2 bg-[var(--bg-activity)] border border-[var(--border)] rounded-sm px-3 focus-within:border-[var(--accent)] transition-colors">
                                            <UserIcon size={14} className="text-[var(--text-secondary)] shrink-0" />
                                            <input
                                                required
                                                value={form.name}
                                                onChange={updateField('name')}
                                                placeholder="Your name"
                                                className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] py-2.5 font-sans"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Email</label>
                                        <div className="flex items-center gap-2 bg-[var(--bg-activity)] border border-[var(--border)] rounded-sm px-3 focus-within:border-[var(--accent)] transition-colors">
                                            <Mail size={14} className="text-[var(--text-secondary)] shrink-0" />
                                            <input
                                                required
                                                type="email"
                                                value={form.email}
                                                onChange={updateField('email')}
                                                placeholder="you@example.com"
                                                className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] py-2.5 font-sans"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Subject</label>
                                        <div className="flex items-center gap-2 bg-[var(--bg-activity)] border border-[var(--border)] rounded-sm px-3 focus-within:border-[var(--accent)] transition-colors">
                                            <Tag size={14} className="text-[var(--text-secondary)] shrink-0" />
                                            <input
                                                required
                                                value={form.subject}
                                                onChange={updateField('subject')}
                                                placeholder="What's this about?"
                                                className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] py-2.5 font-sans"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Message</label>
                                        <div className="flex items-start gap-2 bg-[var(--bg-activity)] border border-[var(--border)] rounded-sm px-3 focus-within:border-[var(--accent)] transition-colors">
                                            <MessageSquare size={14} className="text-[var(--text-secondary)] shrink-0 mt-3" />
                                            <textarea
                                                required
                                                rows={6}
                                                value={form.message}
                                                onChange={updateField('message')}
                                                placeholder="What's on your mind?"
                                                className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] py-2.5 font-sans resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Honeypot — hidden from real visitors, left in the a11y/DOM tree so basic bots that auto-fill every field still catch it. The API silently drops submissions that fill this in. */}
                                    <div className="absolute -left-[9999px]" aria-hidden="true">
                                        <label htmlFor="website">Leave this field empty</label>
                                        <input
                                            id="website"
                                            name="website"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={form.website}
                                            onChange={updateField('website')}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-[var(--accent-fg)] rounded-sm text-sm font-bold hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <Send size={14} />
                                        {status === 'loading' ? 'Sending…' : 'Send message'}
                                    </button>

                                    {status === 'loading' && (
                                        <div className="text-[var(--text-secondary)] text-xs pt-1 opacity-70">
                                            First message after a while can take a couple seconds to wake up the backend.
                                        </div>
                                    )}

                                    {status === 'sent' && (
                                        <div className="flex items-center gap-2 text-[var(--success)] text-xs pt-1">
                                            <CheckCircle2 size={14} />
                                            <span>Message sent — I'll get back to you soon.</span>
                                        </div>
                                    )}

                                    {status === 'error' && (
                                        <div className="text-red-400 text-xs pt-1">
                                            {errorMsg || 'Something went wrong — please try again.'}
                                        </div>
                                    )}
                                </form>

                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60 mb-1">Direct channels</h3>
                                    {directChannels.map(c => (
                                        <a
                                            key={c.href}
                                            href={c.href}
                                            target={c.href.startsWith('http') ? '_blank' : undefined}
                                            rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            className="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--bg-activity)] border border-[var(--border)] rounded-sm text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-all text-xs"
                                        >
                                            <c.icon size={14} className="shrink-0" />
                                            <span className="truncate">{c.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
