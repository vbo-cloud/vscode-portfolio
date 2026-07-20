import {
  Lock, GitBranch, FileText, Server, FileJson, Atom, FileCode2, Info, Mail
} from 'lucide-react';

/* --- FILE CONTENT CONSTANTS --- */
export const FILE_CONTENTS = {
  env: `
# Environment Variables
# CAUTION: Do not expose these!

API_KEY=hunter2
SECRET_SAUCE=caffeine_and_dreams
NODE_ENV=production
NEXT_PUBLIC_HIRE_ME=true
DB_HOST=localhost:5432
REDIS_URL=redis://cache:6379

# portfolio runtime flags
PORTFOLIO_MODE=maximum_effort
COFFEE_LEVEL=critical
SANITY_CHECK=skipped
`,
  package_json: `
{
  "name": "vincent-boutin-portfolio",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.292.0",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/node": "^20.9.0",
    "eslint": "^8.53.0",
    "prettier": "^3.1.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
`
  ,
  gitignore: `
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build
/dist

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# bad vibes
/bugs
/imposter_syndrome

# emotional damage
/burnout
`,
};

/* --- UNIFIED FILE SYSTEM CONFIGURATION --- */
export const FILE_SYSTEM_CONFIG = {
  filenames: {
    ".env": { icon: Lock, color: "text-amber-400" },
    ".gitignore": { icon: GitBranch, color: "text-orange-600" },
    "package.json": { icon: FileJson, color: "text-yellow-400" },
    "readme.md": { icon: Info, color: "text-blue-400" },
    "license": { icon: FileText, color: "text-yellow-600" },
    "dockerfile": { icon: Server, color: "text-blue-500" },
    "contact.dev": { icon: Mail, color: "text-pink-400" },
  },
  extensions: {
    tsx: { icon: Atom, color: "text-cyan-400" }, // React Blue
    ts: { icon: FileCode2, color: "text-blue-500" }, // TS Blue
    jsx: { icon: Atom, color: "text-yellow-400" },
    js: { icon: FileCode2, color: "text-yellow-400" },
    json: { icon: FileJson, color: "text-yellow-400" },
    html: { icon: FileCode2, color: "text-orange-500" },
    css: { icon: FileCode2, color: "text-blue-400" },
    md: { icon: FileText, color: "text-slate-400" },
    txt: { icon: FileText, color: "text-slate-400" },
    env: { icon: Lock, color: "text-amber-400" },
    py: { icon: FileCode2, color: "text-green-500" },
    go: { icon: FileCode2, color: "text-sky-400" },
    cpp: { icon: FileCode2, color: "text-blue-600" },
    c: { icon: FileCode2, color: "text-slate-400" },
    pdf: { icon: FileText, color: "text-red-400" },
  },
  default: { icon: FileText, color: "text-slate-400" }
};

export const getFileIcon = (filename: string) => {
  if (!filename) return FILE_SYSTEM_CONFIG.default;
  const lowerName = filename.toLowerCase();
  // @ts-ignore
  if (FILE_SYSTEM_CONFIG.filenames[lowerName]) return FILE_SYSTEM_CONFIG.filenames[lowerName];
  const ext = lowerName.split('.').pop();
  // @ts-ignore
  if (ext && FILE_SYSTEM_CONFIG.extensions[ext]) return FILE_SYSTEM_CONFIG.extensions[ext];
  return FILE_SYSTEM_CONFIG.default;
};
