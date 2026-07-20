/**
 * Per-technology accent colors, kept in sync with the badge colors on the
 * live CV (cv.vincentboutin.dev) for every tech that appears on it, so the
 * portfolio and the CV read as the same design system. Techs outside the CV
 * (game-dev libraries, etc.) get a hand-picked color in the same spirit.
 */
export const TECH_COLORS: Record<string, string> = {
    "Azure": "#3393dd",
    "Terraform": "#aa86d4",
    "Bicep": "#7dd3fc",
    "ARM Templates": "#7dd3fc",
    "C#": "#a692e9",
    "C++": "#978ab5",
    "Python": "#5f91bc",
    "FastAPI": "#33aba0",
    "PostgreSQL": "#6787e7",
    "Service Bus": "#ca8a04",
    "OpenAI": "#9d91c7",
    "Azure OpenAI": "#9d91c7",
    "Claude": "#da7756",
    "Git": "#999da6",
    "Agile Methods": "#16a34a",
    "CI/CD": "#979797",
    "GitHub Actions": "#b4818a",
    "GitHub": "#e2e8f0",
    "Docker": "#2496ed",
    "Unity": "#898e99",
    "Unreal": "#898e99",
    "Oracle Database": "#898e99",
    "Azure DevOps": "#898e99",
    "SQL": "#e38c00",
    "TypeScript": "#3178c6",
    "React": "#22d3ee",
    "Vue": "#34d399",
    "Next.js": "#e2e8f0",
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
