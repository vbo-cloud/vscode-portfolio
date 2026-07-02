import { placeholderImage } from "../../utils/helpers";

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
    image: placeholderImage("Job Finder", "#38bdf8"),
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
