export const getTechColorStyles = (tech: string) => {
    const map: Record<string, string> = {
        "React": "text-cyan-400 border-cyan-400/30 bg-cyan-950/30",
        "Vue": "text-emerald-400 border-emerald-400/30 bg-emerald-950/30",
        "Next.js": "text-slate-200 border-slate-400/30 bg-slate-900/40",
        "Tailwind": "text-cyan-300 border-cyan-400/30 bg-cyan-950/20",
        "HTML": "text-orange-400 border-orange-400/30 bg-orange-950/30",
        "CSS": "text-blue-300 border-blue-400/30 bg-blue-950/30",
        "Chart.js": "text-pink-400 border-pink-400/30 bg-pink-950/30",
        "Node.js": "text-green-500 border-green-500/30 bg-green-950/30",
        "Express": "text-lime-400 border-lime-400/30 bg-lime-950/30",
        "TypeScript": "text-blue-400 border-blue-400/30 bg-blue-950/30",
        "Python": "text-yellow-400 border-yellow-400/30 bg-yellow-950/30",
        "Go": "text-sky-400 border-sky-400/30 bg-sky-950/30",
        "Java": "text-red-400 border-red-400/30 bg-red-950/30",
        "MongoDB": "text-green-400 border-green-400/30 bg-green-950/30",
        "PostgreSQL": "text-indigo-400 border-indigo-400/30 bg-indigo-950/30",
        "MySQL": "text-blue-400 border-blue-400/30 bg-blue-950/30",
        "Redis": "text-red-400 border-red-400/30 bg-red-950/30",
        "Git": "text-orange-400 border-orange-400/30 bg-orange-950/30",
        "GitHub": "text-slate-200 border-slate-400/30 bg-slate-800/40",
        "Linux": "text-yellow-300 border-yellow-400/30 bg-yellow-950/20",
        "Docker": "text-sky-400 border-sky-400/30 bg-sky-950/30",
        "Azure": "text-sky-300 border-sky-400/30 bg-sky-950/30",
        "Terraform": "text-violet-400 border-violet-400/30 bg-violet-950/30",
        "Bicep": "text-sky-300 border-sky-400/30 bg-sky-950/20",
        "ARM Templates": "text-sky-300 border-sky-400/30 bg-sky-950/20",
        "C#": "text-violet-300 border-violet-400/30 bg-violet-950/20",
        "C++": "text-blue-500 border-blue-500/30 bg-blue-950/30",
        "FastAPI": "text-emerald-400 border-emerald-400/30 bg-emerald-950/30",
        "OpenAI": "text-teal-300 border-teal-400/30 bg-teal-950/30",
        "Claude": "text-orange-300 border-orange-400/30 bg-orange-950/30",
        "Service Bus": "text-indigo-300 border-indigo-400/30 bg-indigo-950/30",
        "Oracle Database": "text-red-500 border-red-500/30 bg-red-950/30",
        "Azure DevOps": "text-sky-400 border-sky-400/30 bg-sky-950/30",
        "Azure OpenAI": "text-teal-300 border-teal-400/30 bg-teal-950/30",
        "GitHub Actions": "text-slate-200 border-slate-400/30 bg-slate-800/40",
        "Agile Methods": "text-lime-400 border-lime-400/30 bg-lime-950/30",
        "GitFlow": "text-orange-400 border-orange-400/30 bg-orange-950/30",
        "Unity": "text-slate-200 border-slate-400/30 bg-slate-800/40",
        "Unreal": "text-slate-200 border-slate-500/30 bg-slate-900/40",
        "Enet": "text-slate-300 border-slate-600/30 bg-slate-800/30",
        "SFML": "text-red-400 border-red-400/30 bg-red-950/30",
        "PhysX": "text-cyan-300 border-cyan-400/30 bg-cyan-950/30",
        "Mixamo": "text-pink-300 border-pink-400/30 bg-pink-950/30",
    };
    return map[tech] || "text-slate-300 border-slate-600/30 bg-slate-800/30";
};

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
