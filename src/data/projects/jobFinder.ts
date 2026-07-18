import { withBasePath } from "../../utils/helpers";

export const jobFinder = {
    id: "job-finder",
    category: "cloud",
    title: "Job Finder",
    subtitle: "Multi-agent AI pipeline on Azure that automates job hunting",
    description:
        "A multi-agent AI system that fetches job offers, matches them against CVs via semantic search, and reviews CVs against the best matches — built solo end-to-end (infra, backend, AI pipeline, frontend) and documented PR by PR.",
    longDescription: `
Job Finder is a personal portfolio project built during my career transition from Unity/game development to Azure cloud and AI engineering. It automates the tedious parts of job hunting: fetching offers on a schedule, embedding CVs and offers into a shared vector space, matching them by semantic similarity, and reviewing CVs against the strongest matches.

The infrastructure follows a two-layer landing zone pattern (platform + application) built with reusable Terraform modules for networking, compute, data, AI, messaging, and monitoring, each with remote state. CI/CD runs on GitHub Actions with OIDC federated credentials — no cloud credentials are ever stored, \`terraform plan\` runs on every PR and \`apply\` runs on merge.

The AI pipeline itself is a set of Python agents (offer-fetching, CV analysis, matching, CV review, cleanup) orchestrated through Azure Service Bus queues and Container App Jobs, using pgvector for cosine-similarity search and Azure OpenAI (GPT-4o-mini + text-embedding-3-small) for semantic matching and scoring.

The backend is FastAPI with JWT auth via Microsoft Entra External ID, paired with a Next.js 14 frontend. Everything is secured end-to-end: VNet with private endpoints and private DNS, Key Vault for secrets, least-privilege RBAC, and managed/workload identities. Observability runs on Application Insights and Log Analytics with KQL-based alerts, and every technical decision is documented in a running PR-by-PR journal (130+ merged PRs so far).

Development itself leans on an AI-assisted workflow: up to 4 Claude Code agents running implementation in parallel, Claude for architecture/planning discussions, and an autonomous Claude-based reviewer agent wired into CI/CD to review every PR automatically.
`,
    type: "Cloud / AI Engineering",
    tech: [
        "Azure",
        "Terraform",
        "Python",
        "FastAPI",
        "PostgreSQL",
        "OpenAI",
        "Claude",
        "Service Bus",
        "GitHub Actions",
        "Docker"
    ],
    links: {
        github: "https://github.com/vbo-cloud/job-finder"
    },
    image: withBasePath("/projects/cloud/job-finder/logo/logo.jpg"),
    htmlEmbed: {
        title: "Job Finder — Architecture Diagram",
        path: withBasePath("/projects/cloud/job-finder/architecture-diagram.html")
    },
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "2025 — Present",
    role: "Solo Cloud, Backend & AI Engineer",
    highlights: [
        "Two-layer Azure landing zone (platform + application) with reusable Terraform modules and remote state",
        "Secretless CI/CD with GitHub Actions and OIDC federated credentials — zero stored cloud credentials",
        "Python multi-agent pipeline (offer-fetching, CV analysis, matching, CV review, cleanup) on Service Bus + Container App Jobs",
        "Semantic matching with pgvector (cosine similarity) and Azure OpenAI (GPT-4o-mini + text-embedding-3-small)",
        "FastAPI backend (JWT via Microsoft Entra External ID) and Next.js 14 frontend, secured with private networking, Key Vault, and least-privilege RBAC",
        "Observability via Application Insights, Log Analytics, and KQL-based alerts",
        "PR-by-PR engineering journal documenting every technical decision (130+ merged PRs)",
        "AI-assisted dev workflow: parallel Claude Code agents, Claude for architecture, and an autonomous CI/CD reviewer agent"
    ],
    featured: true,
    languages: [
        { name: "Python", percent: 45, color: "#3572A5" },
        { name: "Terraform", percent: 25, color: "#844FBA" },
        { name: "TypeScript", percent: 20, color: "#3178c6" },
        { name: "HCL/YAML", percent: 10, color: "#94a3b8" }
    ],
    deployHistory: [
        {
            version: "v0.1",
            msg: "Two-layer Azure landing zone: networking, RBAC, policies, remote state",
            time: "Early",
            status: "success"
        },
        {
            version: "v0.5",
            msg: "Multi-agent pipeline live: offer-fetching, matching via pgvector, Azure OpenAI scoring",
            time: "Mid",
            status: "success"
        },
        {
            version: "v1.0",
            msg: "FastAPI + Next.js frontend shipped with Entra External ID auth and full observability",
            time: "Latest",
            status: "success"
        }
    ],
    userJourney: [
        {
            title: "Drop a CV, no sign-up wall",
            description:
                "The journey starts on a plain map of France. There's no form to fill in first — you just drop your CV (or click to browse for it) and the app takes it from there.",
            image: withBasePath("/projects/cloud/job-finder/journey/01-home.jpg")
        },
        {
            title: "Narrow the search to specific areas",
            description:
                "The map doubles as a filter: draw over any region, city, or cluster of towns to restrict matches to exactly those areas — no postcode list to type in, just a shape drawn by hand.",
            image: withBasePath("/projects/cloud/job-finder/journey/02-zone-selection.jpg")
        },
        {
            title: "Your CV, scored and reviewed",
            description:
                "The CV lands in a personal library with a compatibility score, a short written summary of the profile, what's working well, what's holding it back, and concrete suggestions to improve it.",
            image: withBasePath("/projects/cloud/job-finder/journey/03-library.jpg")
        },
        {
            title: "Matches, ranked and explained",
            description:
                "Every job offer in the pool gets compared against the CV and comes back as a ranked list with a match percentage and the specific skills that pushed the score up or down for that offer.",
            image: withBasePath("/projects/cloud/job-finder/journey/04-matches.jpg")
        },
        {
            title: "See exactly why an offer fits — or doesn't",
            description:
                "Opening an offer surfaces a full breakdown: the mission in plain language, why it matches from both sides, the strengths it rewards, the gaps to work on, and even likely interview questions for that specific role.",
            image: withBasePath("/projects/cloud/job-finder/journey/05-offer-detail.jpg")
        },
        {
            title: "Fine-tune the profile anytime",
            description:
                "Experience level and a few free-text notes can be adjusted at any time to steer future matches, alongside a simple view of remaining analysis credits.",
            image: withBasePath("/projects/cloud/job-finder/journey/06-profile.jpg")
        }
    ],
    workflow: [
        {
            icon: "Bot",
            title: "Two Claude roles, one CLAUDE.md",
            description:
                "A single CLAUDE.md governs two Claude instances with distinct permissions: Claude Cowork handles design and pedagogy — explaining trade-offs and turning decisions into detailed task prompts — while Claude Code owns the full feature lifecycle (branch, implement, PR) with exclusive write access to Terraform, Python, and PowerShell.",
            items: [
                "Claude Cowork — read-only elsewhere, writes only docs/, memory/, CLAUDE.md, and docs/prompts/*.md task briefs",
                "Claude Code — owns Terraform/Python/PowerShell end-to-end and opens the PR",
                "The role boundary is instruction-only — no reliable signal lets a hook tell the two sessions apart"
            ]
        },
        {
            icon: "ShieldCheck",
            title: "Hooks as hard guardrails, not just docs",
            description:
                "Two hooks wired in .claude/settings.json turn the git flow from documentation into mechanical enforcement, locally and inside CI.",
            items: [
                "PreToolUse on Bash (pre_bash_guard.py) — blocks direct push to main/dev, force-push without --force-with-lease, merge instead of rebase, local terraform apply/destroy, and mutating az / New-Az* commands",
                "Same hook gates gh pr create — blocked until docs/JOURNAL.md is updated, commits follow Conventional Commits with no WIP markers, doc-writer has run, and every touched layer has an APPROUVÉ verdict from its reviewer subagent",
                "PostToolUse on Edit/Write (post_edit_format.py) — best-effort terraform fmt / eslint --fix after every edit, never blocking"
            ]
        },
        {
            icon: "Code2",
            title: "Skills: one convention file per stack",
            description:
                "Domain conventions live in .claude/skills/ instead of being duplicated in CLAUDE.md — consulted before any edit in that domain, by Claude Code locally and by the CI reviewer bot alike.",
            items: [
                "conventions-terraform, conventions-python, conventions-sql, conventions-frontend",
                "The CI reviewer bot loads the same skill file server-side, picked by which files a given PR actually touches"
            ]
        },
        {
            icon: "Users",
            title: "Subagents: one job each, mostly read-only",
            description:
                "Four subagents, each scoped to a single responsibility and read-only apart from one exception, live in .claude/agents/.",
            items: [
                "explorer — Read/Grep/Glob only, scouts relevant files and existing patterns before a non-trivial feature starts, so the main session's context doesn't fill up with exploratory reads",
                "doc-writer — the only one with Edit/Write, fixes docstrings/WHY-comments and writes the docs/JOURNAL.md entry before review",
                "reviewer-frontend / reviewer-backend / reviewer-infra — one per layer, checked against the matching skill, report a verdict + file:line and never fix anything themselves",
                "reviewer-infra's Bash access is scoped by instruction to terraform plan/validate/fmt -check — apply stays blocked by the hook regardless"
            ]
        },
        {
            icon: "Terminal",
            title: "Parallel terminals, one worktree each",
            description:
                "Independent features are worked in parallel: up to 4 Claude Code instances run in separate terminals, each checked out in its own git worktree/branch, so they never collide on the same working copy.",
            items: [
                "/new (a custom slash command) turns a feature idea into a docs/prompts/prompt-<slug>.md brief — checks the relevant skills and docs/, proposes a plan, discusses it, then writes the file",
                "That prompt file is the handoff artifact from a planning session to a fresh Claude Code terminal picking up the task",
                "Disposable worktrees also double as a sandbox for one-off checks — e.g. confirming a terraform provider upgrade drift on a clean origin/dev checkout without touching the main clone"
            ]
        },
        {
            icon: "GitBranch",
            title: "Git flow, rebased and gated",
            description:
                "Gitflow with feature/* and hotfix/* branches, dev as the integration branch, and main as the tagged, production-representing branch.",
            items: [
                "PR-only merges into dev/main, Conventional Commits, rebase (never merge) to catch up with the base branch, force-push only with --force-with-lease",
                "A PR never mixes platform (lz_dev) and app (dev) Terraform changes — split into two PRs, platform first",
                "Mechanically enforced by pre_bash_guard.py above, not just written down"
            ]
        },
        {
            icon: "GitPullRequest",
            title: "CI/CD: five workflows, one review bot",
            description:
                "Five GitHub Actions workflows cover the pipeline end-to-end, from plan to a live Container App rollout.",
            items: [
                "terraformPlan.yml — path-filtered per layer (platform lz_dev / app dev), runs fmt -check + validate + plan on every PR behind a single gate check",
                "unitTests.yml — same path-filter/gate pattern for pytest (backend) and tsc + Jest (frontend)",
                "terraformApply.yml — applies lz_dev then dev sequentially on push to dev",
                "buildAgents.yml — builds & pushes Docker images for all 5 agents + frontend to ACR, smoke-tests the webapp image, then rolls it out to each Container App / Container App Job",
                "reviewerAgent.yml — fires once Terraform Plan completes, feeds Claude the PR diff, CLAUDE.md, the relevant skill(s), and the plan logs, then posts a real GitHub review (APPROVE / REQUEST_CHANGES)",
                "claudeCodeAction.yml — manual-only, triggered by a human typing @claude on a PR; the same pre_bash_guard.py hook still applies inside the action, so it can't be talked into running terraform apply either"
            ]
        }
    ],
    snippet: `# Multi-agent pipeline step, triggered by a Service Bus message
async def handle_match_ready(message: ServiceBusMessage):
    offer, cv = await fetch_offer_and_cv(message)

    offer_vec = await embed(offer.text)  # text-embedding-3-small
    score = cosine_similarity(offer_vec, cv.vector)  # pgvector

    if score >= MATCH_THRESHOLD:
        review = await review_with_llm(offer, cv)  # GPT-4o-mini
        await notify_candidate(cv.owner, offer, score, review)
`,
    architecture: `
[ Timer / Queue Trigger ]
          |
          v
[ Container App Jobs (Python agents) ]
  - offer-fetching
  - cv-analysis
  - matching (pgvector cosine similarity)
  - cv-review (Azure OpenAI)
  - cleanup
          |
          v
[ Azure Service Bus ]  <-->  [ PostgreSQL + pgvector ]
          |
          v
[ FastAPI backend ]  --  Entra External ID (JWT)
          |
          v
[ Next.js 14 frontend ]

Cross-cutting: Terraform landing zone (VNet, private endpoints/DNS,
Key Vault, RBAC) · GitHub Actions + OIDC · App Insights / Log Analytics / KQL
`
};
