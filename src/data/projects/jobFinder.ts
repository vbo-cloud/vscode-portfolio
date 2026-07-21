import { withBasePath } from "../../utils/helpers";

export const jobFinder = {
    id: "job-finder",
    category: "cloud",
    title: "Job Finder",
    subtitle: "Multi-agent AI pipeline on Azure that automates job hunting",
    description: {
        en: "A multi-agent AI system that fetches job offers, matches them against CVs via semantic search, and reviews CVs against the best matches — built solo end-to-end (infra, backend, AI pipeline, frontend) and documented PR by PR.",
        fr: "Un système IA multi-agents qui récupère des offres d'emploi, les compare à des CV par recherche sémantique, et évalue les CV face aux meilleures correspondances — construit en solo de bout en bout (infra, backend, pipeline IA, frontend) et documenté PR par PR."
    },
    longDescription: {
        en: `
Job Finder is a personal portfolio project built during my career transition from Unity/game development to Azure cloud and AI engineering. It automates the tedious parts of job hunting: fetching offers on a schedule, embedding CVs and offers into a shared vector space, matching them by semantic similarity, and reviewing CVs against the strongest matches.

The infrastructure follows a two-layer landing zone pattern (platform + application) built with reusable Terraform modules for networking, compute, data, AI, messaging, and monitoring, each with remote state. CI/CD runs on GitHub Actions with OIDC federated credentials — no cloud credentials are ever stored, \`terraform plan\` runs on every PR and \`apply\` runs on merge.

The AI pipeline itself is a set of Python agents (offer-fetching, CV analysis, matching, CV review, cleanup) orchestrated through Azure Service Bus queues and Container App Jobs, using pgvector for cosine-similarity search and Azure OpenAI (GPT-4o-mini + text-embedding-3-small) for semantic matching and scoring.

The backend is FastAPI with JWT auth via Microsoft Entra External ID, paired with a Next.js 14 frontend. Everything is secured end-to-end: VNet with private endpoints and private DNS, Key Vault for secrets, least-privilege RBAC, and managed/workload identities. Observability runs on Application Insights and Log Analytics with KQL-based alerts, and every technical decision is documented in a running PR-by-PR journal (130+ merged PRs so far).

Development itself leans on an AI-assisted workflow: up to 4 Claude Code agents running implementation in parallel, Claude for architecture/planning discussions, and an autonomous Claude-based reviewer agent wired into CI/CD to review every PR automatically.
`,
        fr: `
Job Finder est un projet de portfolio personnel construit pendant ma transition de carrière du développement Unity/jeu vidéo vers le cloud Azure et l'ingénierie IA. Il automatise les tâches fastidieuses de la recherche d'emploi : récupération planifiée des offres, vectorisation des CV et des offres dans un espace vectoriel partagé, mise en correspondance par similarité sémantique, et évaluation des CV face aux meilleures correspondances.

L'infrastructure suit un modèle de landing zone à deux couches (plateforme + application), construit avec des modules Terraform réutilisables pour le réseau, le compute, la donnée, l'IA, la messagerie et le monitoring, chacun avec son état distant. Le CI/CD tourne sur GitHub Actions avec des identifiants fédérés OIDC — aucun identifiant cloud n'est jamais stocké, \`terraform plan\` s'exécute à chaque PR et \`apply\` au merge.

Le pipeline IA lui-même est un ensemble d'agents Python (récupération des offres, analyse de CV, matching, revue de CV, nettoyage) orchestrés via des files Azure Service Bus et des Container App Jobs, utilisant pgvector pour la recherche par similarité cosinus et Azure OpenAI (GPT-4o-mini + text-embedding-3-small) pour le matching sémantique et le scoring.

Le backend est en FastAPI avec authentification JWT via Microsoft Entra External ID, associé à un frontend Next.js 14. Tout est sécurisé de bout en bout : VNet avec endpoints privés et DNS privé, Key Vault pour les secrets, RBAC au moindre privilège, et identités managées/workload. L'observabilité repose sur Application Insights et Log Analytics avec des alertes basées sur KQL, et chaque décision technique est documentée dans un journal PR par PR (130+ PR mergées à ce jour).

Le développement lui-même s'appuie sur un workflow assisté par IA : jusqu'à 4 agents Claude Code exécutant l'implémentation en parallèle, Claude pour les discussions d'architecture/planification, et un agent réviseur autonome basé sur Claude intégré au CI/CD pour relire automatiquement chaque PR.
`
    },
    type: "Cloud / AI Engineering",
    showArchitectureTab: true,
    showWorkflowTab: true,
    showLogsAnalyticsTab: true,
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
            title: { en: "Drop a CV, no sign-up wall", fr: "Déposez un CV, sans inscription" },
            description: {
                en: "The journey starts on a plain map of France. There's no form to fill in first — you just drop your CV (or click to browse for it) and the app takes it from there.",
                fr: "Le parcours démarre sur une simple carte de France. Pas de formulaire à remplir d'abord — vous déposez votre CV (ou cliquez pour le parcourir) et l'application prend le relais."
            },
            image: withBasePath("/projects/cloud/job-finder/journey/01-home.jpg")
        },
        {
            title: { en: "Narrow the search to specific areas", fr: "Ciblez des zones précises" },
            description: {
                en: "The map doubles as a filter: draw over any region, city, or cluster of towns to restrict matches to exactly those areas — no postcode list to type in, just a shape drawn by hand.",
                fr: "La carte fait aussi office de filtre : dessinez sur n'importe quelle région, ville ou groupe de communes pour restreindre les correspondances à ces zones exactes — pas de liste de codes postaux à saisir, juste une forme tracée à la main."
            },
            image: withBasePath("/projects/cloud/job-finder/journey/02-zone-selection.jpg")
        },
        {
            title: { en: "Your CV, scored and reviewed", fr: "Votre CV, noté et évalué" },
            description: {
                en: "The CV lands in a personal library with a compatibility score, a short written summary of the profile, what's working well, what's holding it back, and concrete suggestions to improve it.",
                fr: "Le CV atterrit dans une bibliothèque personnelle avec un score de compatibilité, un résumé écrit du profil, ce qui fonctionne bien, ce qui le pénalise, et des suggestions concrètes d'amélioration."
            },
            image: withBasePath("/projects/cloud/job-finder/journey/03-library.jpg")
        },
        {
            title: { en: "Matches, ranked and explained", fr: "Des correspondances classées et expliquées" },
            description: {
                en: "Every job offer in the pool gets compared against the CV and comes back as a ranked list with a match percentage and the specific skills that pushed the score up or down for that offer.",
                fr: "Chaque offre du pool est comparée au CV et revient sous forme de liste classée avec un pourcentage de correspondance et les compétences précises qui ont fait monter ou baisser le score pour cette offre."
            },
            image: withBasePath("/projects/cloud/job-finder/journey/04-matches.jpg")
        },
        {
            title: { en: "See exactly why an offer fits — or doesn't", fr: "Voyez précisément pourquoi une offre correspond — ou non" },
            description: {
                en: "Opening an offer surfaces a full breakdown: the mission in plain language, why it matches from both sides, the strengths it rewards, the gaps to work on, and even likely interview questions for that specific role.",
                fr: "Ouvrir une offre révèle une analyse complète : la mission en langage clair, pourquoi elle correspond des deux côtés, les points forts qu'elle valorise, les lacunes à travailler, et même des questions d'entretien probables pour ce poste précis."
            },
            image: withBasePath("/projects/cloud/job-finder/journey/05-offer-detail.jpg")
        },
        {
            title: { en: "Fine-tune the profile anytime", fr: "Ajustez le profil à tout moment" },
            description: {
                en: "Experience level and a few free-text notes can be adjusted at any time to steer future matches, alongside a simple view of remaining analysis credits.",
                fr: "Le niveau d'expérience et quelques notes libres peuvent être ajustés à tout moment pour orienter les futures correspondances, avec une vue simple des crédits d'analyse restants."
            },
            image: withBasePath("/projects/cloud/job-finder/journey/06-profile.jpg")
        }
    ],
    workflow: [
        {
            icon: "Bot",
            title: { en: "Two Claude roles, one CLAUDE.md", fr: "Deux rôles Claude, un seul CLAUDE.md" },
            description: {
                en: "A single CLAUDE.md governs two Claude instances with distinct permissions: Claude Cowork handles design and pedagogy — explaining trade-offs and turning decisions into detailed task prompts — while Claude Code owns the full feature lifecycle (branch, implement, PR) with exclusive write access to Terraform, Python, and PowerShell.",
                fr: "Un seul CLAUDE.md régit deux instances Claude aux permissions distinctes : Claude Cowork gère la conception et la pédagogie — expliquer les compromis et transformer les décisions en prompts de tâche détaillés — tandis que Claude Code possède le cycle de vie complet d'une feature (branche, implémentation, PR) avec un accès en écriture exclusif à Terraform, Python et PowerShell."
            },
            items: {
                en: [
                    "Claude Cowork — read-only elsewhere, writes only docs/, memory/, CLAUDE.md, and docs/prompts/*.md task briefs",
                    "Claude Code — owns Terraform/Python/PowerShell end-to-end and opens the PR",
                    "The role boundary is instruction-only — no reliable signal lets a hook tell the two sessions apart"
                ],
                fr: [
                    "Claude Cowork — lecture seule partout ailleurs, écrit uniquement docs/, memory/, CLAUDE.md, et les briefs docs/prompts/*.md",
                    "Claude Code — possède Terraform/Python/PowerShell de bout en bout et ouvre la PR",
                    "La frontière entre les rôles n'est qu'une instruction — aucun signal fiable ne permet à un hook de distinguer les deux sessions"
                ]
            }
        },
        {
            icon: "ShieldCheck",
            title: { en: "Hooks as hard guardrails, not just docs", fr: "Des hooks comme garde-fous stricts, pas juste de la doc" },
            description: {
                en: "Two hooks wired in .claude/settings.json turn the git flow from documentation into mechanical enforcement, locally and inside CI.",
                fr: "Deux hooks câblés dans .claude/settings.json transforment le git flow, d'une simple documentation en une application mécanique, en local comme en CI."
            },
            items: {
                en: [
                    "PreToolUse on Bash (pre_bash_guard.py) — blocks direct push to main/dev, force-push without --force-with-lease, merge instead of rebase, local terraform apply/destroy, and mutating az / New-Az* commands",
                    "Same hook gates gh pr create — blocked until docs/JOURNAL.md is updated, commits follow Conventional Commits with no WIP markers, doc-writer has run, and every touched layer has an APPROUVÉ verdict from its reviewer subagent",
                    "PostToolUse on Edit/Write (post_edit_format.py) — best-effort terraform fmt / eslint --fix after every edit, never blocking"
                ],
                fr: [
                    "PreToolUse sur Bash (pre_bash_guard.py) — bloque le push direct sur main/dev, le force-push sans --force-with-lease, le merge à la place du rebase, le terraform apply/destroy local, et les commandes az / New-Az* mutantes",
                    "Le même hook conditionne gh pr create — bloqué tant que docs/JOURNAL.md n'est pas à jour, que les commits ne suivent pas Conventional Commits sans marqueurs WIP, que doc-writer n'a pas tourné, et que chaque couche touchée n'a pas un verdict APPROUVÉ de son subagent réviseur",
                    "PostToolUse sur Edit/Write (post_edit_format.py) — terraform fmt / eslint --fix en best-effort après chaque édition, jamais bloquant"
                ]
            }
        },
        {
            icon: "Code2",
            title: { en: "Skills: one convention file per stack", fr: "Skills : un fichier de convention par stack" },
            description: {
                en: "Domain conventions live in .claude/skills/ instead of being duplicated in CLAUDE.md — consulted before any edit in that domain, by Claude Code locally and by the CI reviewer bot alike.",
                fr: "Les conventions de chaque domaine vivent dans .claude/skills/ plutôt que d'être dupliquées dans CLAUDE.md — consultées avant toute édition dans ce domaine, aussi bien par Claude Code en local que par le bot réviseur en CI."
            },
            items: {
                en: [
                    "conventions-terraform, conventions-python, conventions-sql, conventions-frontend",
                    "The CI reviewer bot loads the same skill file server-side, picked by which files a given PR actually touches"
                ],
                fr: [
                    "conventions-terraform, conventions-python, conventions-sql, conventions-frontend",
                    "Le bot réviseur CI charge le même fichier de skill côté serveur, choisi selon les fichiers réellement touchés par la PR"
                ]
            }
        },
        {
            icon: "Users",
            title: { en: "Subagents: one job each, mostly read-only", fr: "Subagents : une tâche chacun, en lecture seule pour la plupart" },
            description: {
                en: "Four subagents, each scoped to a single responsibility and read-only apart from one exception, live in .claude/agents/.",
                fr: "Quatre subagents, chacun limité à une seule responsabilité et en lecture seule à une exception près, vivent dans .claude/agents/."
            },
            items: {
                en: [
                    "explorer — Read/Grep/Glob only, scouts relevant files and existing patterns before a non-trivial feature starts, so the main session's context doesn't fill up with exploratory reads",
                    "doc-writer — the only one with Edit/Write, fixes docstrings/WHY-comments and writes the docs/JOURNAL.md entry before review",
                    "reviewer-frontend / reviewer-backend / reviewer-infra — one per layer, checked against the matching skill, report a verdict + file:line and never fix anything themselves",
                    "reviewer-infra's Bash access is scoped by instruction to terraform plan/validate/fmt -check — apply stays blocked by the hook regardless"
                ],
                fr: [
                    "explorer — uniquement Read/Grep/Glob, repère les fichiers pertinents et les patterns existants avant qu'une feature non triviale ne démarre, pour que le contexte de la session principale ne se remplisse pas de lectures exploratoires",
                    "doc-writer — le seul avec Edit/Write, corrige les docstrings/commentaires WHY et écrit l'entrée docs/JOURNAL.md avant la revue",
                    "reviewer-frontend / reviewer-backend / reviewer-infra — un par couche, vérifié par rapport au skill correspondant, rapporte un verdict + file:line et ne corrige jamais rien lui-même",
                    "l'accès Bash de reviewer-infra est limité par instruction à terraform plan/validate/fmt -check — apply reste bloqué par le hook dans tous les cas"
                ]
            }
        },
        {
            icon: "Terminal",
            title: { en: "Parallel terminals, one worktree each", fr: "Terminaux parallèles, un worktree chacun" },
            description: {
                en: "Independent features are worked in parallel: up to 4 Claude Code instances run in separate terminals, each checked out in its own git worktree/branch, so they never collide on the same working copy.",
                fr: "Les features indépendantes sont travaillées en parallèle : jusqu'à 4 instances Claude Code tournent dans des terminaux séparés, chacune sur son propre worktree/branche git, pour qu'elles ne se percutent jamais sur la même copie de travail."
            },
            items: {
                en: [
                    "/new (a custom slash command) turns a feature idea into a docs/prompts/prompt-<slug>.md brief — checks the relevant skills and docs/, proposes a plan, discusses it, then writes the file",
                    "That prompt file is the handoff artifact from a planning session to a fresh Claude Code terminal picking up the task",
                    "Disposable worktrees also double as a sandbox for one-off checks — e.g. confirming a terraform provider upgrade drift on a clean origin/dev checkout without touching the main clone"
                ],
                fr: [
                    "/new (une commande slash personnalisée) transforme une idée de feature en brief docs/prompts/prompt-<slug>.md — vérifie les skills et docs/ pertinents, propose un plan, en discute, puis écrit le fichier",
                    "Ce fichier de prompt est l'artefact de passation d'une session de planification vers un nouveau terminal Claude Code qui reprend la tâche",
                    "Les worktrees jetables servent aussi de bac à sable pour des vérifications ponctuelles — par exemple confirmer une dérive de mise à jour d'un provider terraform sur un checkout origin/dev propre sans toucher au clone principal"
                ]
            }
        },
        {
            icon: "GitBranch",
            title: { en: "Git flow, rebased and gated", fr: "Git flow, rebasé et contrôlé" },
            description: {
                en: "Gitflow with feature/* and hotfix/* branches, dev as the integration branch, and main as the tagged, production-representing branch.",
                fr: "Gitflow avec des branches feature/* et hotfix/*, dev comme branche d'intégration, et main comme branche taguée représentant la production."
            },
            items: {
                en: [
                    "PR-only merges into dev/main, Conventional Commits, rebase (never merge) to catch up with the base branch, force-push only with --force-with-lease",
                    "A PR never mixes platform (lz_dev) and app (dev) Terraform changes — split into two PRs, platform first",
                    "Mechanically enforced by pre_bash_guard.py above, not just written down"
                ],
                fr: [
                    "Merges uniquement via PR dans dev/main, Conventional Commits, rebase (jamais de merge) pour rattraper la branche de base, force-push uniquement avec --force-with-lease",
                    "Une PR ne mélange jamais les changements Terraform plateforme (lz_dev) et application (dev) — scindés en deux PR, plateforme en premier",
                    "Appliqué mécaniquement par pre_bash_guard.py ci-dessus, pas juste écrit quelque part"
                ]
            }
        },
        {
            icon: "GitPullRequest",
            title: { en: "CI/CD: five workflows, one review bot", fr: "CI/CD : cinq workflows, un bot réviseur" },
            description: {
                en: "Five GitHub Actions workflows cover the pipeline end-to-end, from plan to a live Container App rollout.",
                fr: "Cinq workflows GitHub Actions couvrent le pipeline de bout en bout, du plan jusqu'au déploiement live sur Container App."
            },
            items: {
                en: [
                    "terraformPlan.yml — path-filtered per layer (platform lz_dev / app dev), runs fmt -check + validate + plan on every PR behind a single gate check",
                    "unitTests.yml — same path-filter/gate pattern for pytest (backend) and tsc + Jest (frontend)",
                    "terraformApply.yml — applies lz_dev then dev sequentially on push to dev",
                    "buildAgents.yml — builds & pushes Docker images for all 5 agents + frontend to ACR, smoke-tests the webapp image, then rolls it out to each Container App / Container App Job",
                    "reviewerAgent.yml — fires once Terraform Plan completes, feeds Claude the PR diff, CLAUDE.md, the relevant skill(s), and the plan logs, then posts a real GitHub review (APPROVE / REQUEST_CHANGES)",
                    "claudeCodeAction.yml — manual-only, triggered by a human typing @claude on a PR; the same pre_bash_guard.py hook still applies inside the action, so it can't be talked into running terraform apply either"
                ],
                fr: [
                    "terraformPlan.yml — filtré par chemin selon la couche (plateforme lz_dev / app dev), lance fmt -check + validate + plan à chaque PR derrière une unique gate check",
                    "unitTests.yml — même pattern de filtre/gate pour pytest (backend) et tsc + Jest (frontend)",
                    "terraformApply.yml — applique lz_dev puis dev séquentiellement au push sur dev",
                    "buildAgents.yml — build & push des images Docker pour les 5 agents + le frontend vers l'ACR, smoke-test de l'image webapp, puis déploiement sur chaque Container App / Container App Job",
                    "reviewerAgent.yml — se déclenche une fois le Terraform Plan terminé, fournit à Claude le diff de la PR, CLAUDE.md, le(s) skill(s) pertinent(s), et les logs du plan, puis poste une vraie review GitHub (APPROVE / REQUEST_CHANGES)",
                    "claudeCodeAction.yml — manuel uniquement, déclenché par un humain tapant @claude sur une PR ; le même hook pre_bash_guard.py s'applique toujours dans l'action, impossible donc de le convaincre de lancer terraform apply"
                ]
            }
        }
    ]
};
