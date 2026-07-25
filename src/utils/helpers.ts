/**
 * Accent colors for technologies that fall outside the CV's world entirely
 * (game-dev/web libraries used only in individual project pages — the CV
 * has no opinion on these). Hand-picked "in the same spirit" as the CV's own
 * brand colors. Anything the CV *does* track goes through the tier system
 * below instead, not this map.
 */
export const TECH_COLORS: Record<string, string> = {
    "Bicep": "#7dd3fc",
    "ARM Templates": "#7dd3fc",
    "SQL": "#e38c00",
    "TypeScript": "#3178c6",
    "React": "#22d3ee",
    "Vue": "#34d399",
    "Tailwind": "#67e8f9",
    "HTML": "#fb923c",
    "CSS": "#93c5fd",
    "Chart.js": "#f472b6",
    "Node.js": "#22c55e",
    "Express": "#a3e635",
    "Go": "#38bdf8",
    "Java": "#f87171",
    "MongoDB": "#4ade80",
    "MySQL": "#60a5fa",
    "Redis": "#f87171",
    "Linux": "#fde047",
    "Enet": "#898e99",
    "SFML": "#898e99",
    "Mixamo": "#f9a8d4",
};

const DEFAULT_TECH_COLOR = "#94a3b8";

export const getTechColor = (tech: string) => TECH_COLORS[tech] || DEFAULT_TECH_COLOR;

/**
 * Badge color is not decorative — it encodes how much a tech should stand
 * out, mirroring the CV's own tier system (vbo-interactive-resume,
 * src/data/tech-registry.ts, commit 412aed9 — the source of truth this stays
 * in sync with). Only technologies the CV actually tracks get tiered;
 * anything else falls to 'other' and keeps its own TECH_COLORS entry.
 */
export type TechTier = 'brand' | 'workflow' | 'support' | 'muted' | 'other';

/**
 * Raw brand colors for CV-tracked technologies, copied verbatim from the
 * CV's tech-registry.ts. Only meaningful for the 'brand' and 'support'
 * tiers below — 'workflow' and 'muted' ignore color entirely.
 */
const CV_BRAND_COLORS: Record<string, string> = {
    "Azure": "#0078D4",
    "Terraform": "#7B42BC",
    "Python": "#FFD43B",
    "Service Bus": "#CA8A04",
    "OpenAI": "#412991",
    "Azure OpenAI": "#412991",
    "Claude": "#DA7756",
    "pgvector": "#2F6F9F",
    "Docker": "#2496ED",
    "Agile Methods": "#16A34A",
    "FastAPI": "#009688",
    "PostgreSQL": "#4169E1",
    "C#": "#512BD4",
};

// Brand tier — the actual sales pitch for a DevOps / Cloud Engineer (Azure)
// role. Full brand color + tinted outline: what should catch the eye first.
const BRAND_TECHS = new Set([
    "Azure", "Terraform", "Python", "Service Bus", "OpenAI", "Azure OpenAI",
    "Claude", "pgvector", "Docker", "Agile Methods",
]);

// Workflow tier — the versioning/CI-CD substrate, read as one object rather
// than distinct tools: flat, shared, no brand colors.
const WORKFLOW_TECHS = new Set(["Git", "CI/CD", "GitHub", "GitLab", "Azure DevOps"]);

// Support tier — genuinely used, real second-plan credibility, not the pitch.
// Desaturated so it reads as "also true" without competing with brand tier.
const SUPPORT_TECHS = new Set(["FastAPI", "PostgreSQL", "C#"]);

// Muted-on-CV — technologies that do appear on the CV but fall to its
// default muted tier there (historical/off-trajectory skills): visible and
// factual, never salient. GitHub Actions is deliberately here, not
// workflow — the CV doesn't badge it as its own tool (it shows plain
// "GitHub" instead), so it gets no special treatment either.
const MUTED_ON_CV_TECHS = new Set([
    "Unity", "Unreal", "C++", "Netcode", "AR", "Oracle Database", "Next.js", "GitHub Actions",
]);

export function getTechTier(tech: string): TechTier {
    if (BRAND_TECHS.has(tech)) return 'brand';
    if (WORKFLOW_TECHS.has(tech)) return 'workflow';
    if (SUPPORT_TECHS.has(tech)) return 'support';
    if (MUTED_ON_CV_TECHS.has(tech)) return 'muted';
    return 'other';
}

/** Relative luminance (WCAG 2.0). 0 = black, 1 = white. */
function getLuminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function lightenColor(hex: string, amount: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.round(r + (255 - r) * amount);
    const lg = Math.round(g + (255 - g) * amount);
    const lb = Math.round(b + (255 - b) * amount);
    return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

function mixColors(a: string, b: string, t: number): string {
    const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
    const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
    const mr = Math.round(ar + (br - ar) * t);
    const mg = Math.round(ag + (bg - ag) * t);
    const mb = Math.round(ab + (bb - ab) * t);
    return `#${mr.toString(16).padStart(2, '0')}${mg.toString(16).padStart(2, '0')}${mb.toString(16).padStart(2, '0')}`;
}

/** Progressively lightens a color until it's readable on a dark background. */
function ensureDarkModeReadable(hex: string): string {
    let color = hex;
    let luminance = getLuminance(color);
    let step = 0;
    while (luminance < 0.25 && step < 10) {
        color = lightenColor(color, 0.2);
        luminance = getLuminance(color);
        step++;
    }
    return color;
}

export interface TechTierStyle { bg: string; fg: string; border: string; }

const WORKFLOW_LIGHT_GRAY = "#e5e7eb";
const WORKFLOW_DARK_GRAY = "#374151";
const SUPPORT_SLATE_DARK = "#94a3b8";
const MUTED_TEXT_DARK = "#7d838c";
const MUTED_BG_DARK = "rgba(255, 255, 255, 0.045)";

/**
 * Dark-mode-only port of the CV's resolveTierStyle (the portfolio has no
 * theme genuinely wired to Tailwind's `dark:` variant — its 40+ themes swap
 * CSS custom properties, not a light/dark class — so this covers the
 * default dark themes the portfolio actually ships with).
 */
export function resolveTechTierStyle(tech: string): TechTierStyle {
    const tier = getTechTier(tech);
    switch (tier) {
        case 'brand': {
            const raw = CV_BRAND_COLORS[tech] ?? getTechColor(tech);
            const fg = ensureDarkModeReadable(raw);
            return { bg: `${fg}20`, fg, border: `${fg}59` };
        }
        case 'workflow':
            return { bg: WORKFLOW_LIGHT_GRAY, fg: WORKFLOW_DARK_GRAY, border: 'rgba(0, 0, 0, 0.3)' };
        case 'support': {
            const raw = CV_BRAND_COLORS[tech] ?? getTechColor(tech);
            const fg = mixColors(ensureDarkModeReadable(raw), SUPPORT_SLATE_DARK, 0.7);
            return { bg: `${fg}1f`, fg, border: 'transparent' };
        }
        case 'muted':
            return { bg: MUTED_BG_DARK, fg: MUTED_TEXT_DARK, border: 'transparent' };
        default: {
            // 'other' — outside the CV's world entirely, keeps its own
            // hand-picked accent with a matching tinted border.
            const hex = getTechColor(tech);
            return { bg: `${hex}20`, fg: hex, border: `${hex}59` };
        }
    }
}

/**
 * Generates a lightweight inline SVG placeholder for projects that don't
 * (yet) have a real screenshot, keeping the visual grid consistent instead
 * of showing broken images.
 */
export const placeholderImage = (title: string, accent = "#38bdf8") => {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="625" viewBox="0 0 1000 625">
  <rect width="1000" height="625" fill="#0f172a" />
  <rect width="1000" height="625" fill="url(#grid)" opacity="0.15" />
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${accent}" stroke-width="1" />
    </pattern>
  </defs>
  <text x="50%" y="50%" font-family="monospace" font-size="42" fill="${accent}" text-anchor="middle" dominant-baseline="middle">${title}</text>
</svg>`.trim();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Extracts the video ID from a youtube.com/watch?v= or youtu.be/ URL,
 * so callers only need to store the plain watch URL and can derive
 * both the embed src and the "watch on YouTube" link from it.
 */
export const getYouTubeEmbedId = (url: string): string | null => {
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
        return u.searchParams.get("v");
    } catch {
        return null;
    }
};

/**
 * Prefixes a public/-relative asset path with Vite's configured base
 * (this app is deployed under /ide-portfolio/, not domain root), so
 * project media keeps resolving correctly wherever it's hosted.
 */
export const withBasePath = (path: string): string =>
    `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
