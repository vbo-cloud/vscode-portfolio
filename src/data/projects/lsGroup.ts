import { withBasePath } from "../../utils/helpers";

export const lsGroup = {
    id: "ls-group",
    category: "companies",
    title: "LS Group — XRTwin",
    subtitle: "VR industrial application developed in partnership with the CEA",
    description: {
        en: "Two-year VR/industrial software alternance at LS Group, in a small XR Twin team: rebuilt the navigation system from scratch, shipped the multiplayer front-end alongside a teammate, and helped cut project load times by up to 70%.",
        fr: "Alternance de deux ans en logiciel VR/industriel chez LS Group, dans une petite équipe XR Twin : reconstruction du système de navigation depuis zéro, livraison du front-end multijoueur avec un coéquipier, et contribution à une réduction des temps de chargement allant jusqu'à 70%."
    },
    descriptionSections: [
        {
            title: { en: "XR Twin, in partnership with the CEA", fr: "XR Twin, en partenariat avec le CEA" },
            text: {
                en: `Two-year work-study program (alternance) at LS Group (Suresnes), embedded in the small XR Twin team, on a VR/AR industrial visualization software built with the CEA (French Alternative Energies and Atomic Energy Commission) for clients including Airbus, Dassault Aviation, Renault, Stellantis, Saint-Gobain and ITER. XR Twin imports CAD models (.3ds, .fbx, .step), images, video and point clouds into editable, analyzable industrial simulations, navigable with a VR headset, full-body trackers and haptic controllers.`,
                fr: `Alternance de deux ans chez LS Group (Suresnes), intégré à la petite équipe XR Twin, sur un logiciel de visualisation industrielle VR/AR développé avec le CEA (Commissariat à l'énergie atomique et aux énergies alternatives) pour des clients tels qu'Airbus, Dassault Aviation, Renault, Stellantis, Saint-Gobain et ITER. XR Twin importe des modèles CAO (.3ds, .fbx, .step), des images, des vidéos et des nuages de points dans des simulations industrielles éditables et analysables, navigables avec un casque VR, des trackers corps entier et des contrôleurs haptiques.`
            }
        },
        {
            title: { en: "Fixing the Copy/Paste system", fr: "Corriger le système de Copier/Coller" },
            heading: { en: "Year one, a sample of what has been done", fr: "Année 1, un aperçu du travail réalisé" },
            text: {
                en: `A Copy/Paste bug in the AppearanceComponent, reviewed by the team's tech lead like every change that year, turned out to trace back to an architecture violation: the component was pulling color data through Unity-specific types instead of raw values. I decoupled it, then found the same underlying issue independently duplicated — and broken — in every other component's own Copy/Paste. I centralized all of it into a single ClipBoard system with two methods, copy a Behavior and paste it onto the matching component, fixing every component's Copy/Paste at once instead of patching each one separately.`,
                fr: `Un bug de Copier/Coller dans l'AppearanceComponent, revu par le tech lead de l'équipe comme chaque changement cette année-là, s'est avéré remonter à une violation d'architecture : le composant récupérait les données de couleur via des types spécifiques à Unity plutôt que des valeurs brutes. Je l'ai découplé, puis j'ai trouvé le même problème sous-jacent dupliqué indépendamment — et cassé — dans le Copier/Coller de chaque autre composant. J'ai tout centralisé dans un système ClipBoard unique avec deux méthodes, copier un Behavior et le coller sur le composant correspondant, corrigeant le Copier/Coller de tous les composants d'un coup plutôt que de corriger chacun séparément.`
            }
        },
        {
            title: { en: "Inspector and Hierarchy UX fixes", fr: "Corrections UX de l'Inspector et de la Hierarchy" },
            text: {
                en: `Working closely with the UX/UI team, I fixed a cluster of Inspector and Hierarchy bugs: scene selection not highlighting in the Hierarchy, decimal fields showing an inconsistent number of digits instead of a fixed display precision, fields staying editable in contexts where they shouldn't be, and Inspector/Hierarchy elements not respecting the colors they were assigned. I also worked through layout issues the UX/UI team had flagged in the Inspector's design — misaligned fields, incorrect sizing, missing responsiveness.`,
                fr: `En collaboration étroite avec l'équipe UX/UI, j'ai corrigé un ensemble de bugs de l'Inspector et de la Hierarchy : la sélection de scène qui ne se surlignait pas dans la Hierarchy, des champs décimaux affichant un nombre incohérent de chiffres au lieu d'une précision d'affichage fixe, des champs restant éditables dans des contextes où ils ne devraient pas l'être, et des éléments de l'Inspector/Hierarchy ne respectant pas les couleurs qui leur étaient assignées. J'ai aussi traité des problèmes de mise en page signalés par l'équipe UX/UI dans le design de l'Inspector — champs mal alignés, tailles incorrectes, absence de responsivité.`
            }
        },
        {
            title: { en: "Debugging the VR ergonomic assessment module", fr: "Déboguer le module d'évaluation ergonomique VR" },
            text: {
                en: `I also debugged XR Twin's VR ergonomic simulation (User Ergo) after a core update broke it: motion-sensor calibration had drifted out of sync with the new architecture, VR teleportation locomotion no longer worked, and the Ergo Inspector component had lost its binding to the right entity, showing incorrect or missing data. Testing this one meant putting on the headset and trackers myself to reproduce and validate each fix.`,
                fr: `J'ai aussi débogué la simulation ergonomique VR d'XR Twin (User Ergo) après qu'une mise à jour du cœur l'a cassée : le calibrage des capteurs de mouvement s'était désynchronisé de la nouvelle architecture, la locomotion par téléportation VR ne fonctionnait plus, et le composant Ergo Inspector avait perdu sa liaison avec la bonne entité, affichant des données incorrectes ou manquantes. Tester cela impliquait de mettre moi-même le casque et les trackers pour reproduire et valider chaque correctif.`
            },
            images: [withBasePath("/projects/companies/ls-group/gallery-3-ergo-user.png")]
        },
        {
            title: { en: "Rebuilding navigation from scratch", fr: "Reconstruire la navigation depuis zéro" },
            heading: { en: "Year two, a sample of what has been done", fr: "Année 2, un aperçu du travail réalisé" },
            text: {
                en: `The second year centered on a full rewrite of XR Twin's navigation, a task entrusted to me individually within the team: the existing system was rigid, imprecise on small industrial parts, and inconsistent across contexts. I studied Unity's own navigation internals to understand its camera-target model, then designed an abstract system on Unity's Input System where per-mode "Handler" classes compute position/rotation deltas and wire/unwire inputs based on context — letting the app ship swappable navigation presets matching Unity, Catia, SolidWorks, Inventor, Revit and SketchUp, plus a distance-adaptive "focus" camera that keeps movement feeling consistent whether you're circling a 1mm bolt or a 100m assembly.`,
                fr: `La deuxième année s'est concentrée sur une réécriture complète de la navigation d'XR Twin, une tâche qui m'a été confiée individuellement au sein de l'équipe : le système existant était rigide, imprécis sur les petites pièces industrielles, et incohérent selon les contextes. J'ai étudié le fonctionnement interne de la navigation d'Unity pour comprendre son modèle caméra-cible, puis conçu un système abstrait sur l'Input System d'Unity où des classes "Handler" par mode calculent les deltas de position/rotation et branchent/débranchent les inputs selon le contexte — permettant à l'application de proposer des préréglages de navigation interchangeables imitant Unity, Catia, SolidWorks, Inventor, Revit et SketchUp, plus une caméra "focus" adaptative à la distance qui garde une sensation de mouvement cohérente qu'on tourne autour d'un boulon de 1mm ou d'un assemblage de 100m.`
            },
            images: [
                withBasePath("/projects/companies/ls-group/gallery-1-navigation-translation.png"),
                withBasePath("/projects/companies/ls-group/gallery-2-navigation-rotation.png")
            ]
        },
        {
            title: { en: "Multiplayer front-end on Netcode", fr: "Front-end multijoueur sur Netcode" },
            text: {
                en: `Multiplayer was a team effort spanning several sprints: while a teammate built the lobby foundations and netcode backbone, I owned the front-end — session creation/joining, a connection-state UI, and a lobby with player cards, chat and audio settings, all built to fit the constraints of our shared Netcode architecture.`,
                fr: `Le multijoueur fut un effort d'équipe s'étalant sur plusieurs sprints : pendant qu'un coéquipier construisait les fondations du lobby et l'ossature netcode, j'ai pris en charge le front-end — création/connexion à une session, une UI d'état de connexion, et un lobby avec cartes joueurs, chat et réglages audio, le tout construit pour s'intégrer aux contraintes de notre architecture Netcode partagée.`
            }
        },
        {
            title: { en: "Centralizing the color system", fr: "Centraliser le système de couleurs" },
            text: {
                en: `In parallel, I centralized XR Twin's color system into an ID-based "Tint" architecture: every colored element resolves its color from a shared palette by name, and pushes a refresh callback whenever that name changes. It replaced a tangle of components independently mutating colors — a frequent source of conflicting-color bugs — and turned light/dark theming into a config change instead of a rewrite.`,
                fr: `En parallèle, j'ai centralisé le système de couleurs d'XR Twin dans une architecture "Tint" basée sur des identifiants : chaque élément coloré résout sa couleur depuis une palette partagée par son nom, et déclenche un callback de rafraîchissement dès que ce nom change. Cela a remplacé un enchevêtrement de composants modifiant indépendamment les couleurs — une source fréquente de bugs de couleurs en conflit — et a transformé le passage du thème clair/sombre en un simple changement de config plutôt qu'une réécriture.`
            }
        },
        {
            title: { en: "Profiling and fixing Save/Load performance", fr: "Profiler et corriger les performances de Sauvegarde/Chargement" },
            text: {
                en: `Performance was another team sprint: after load times crept up to 5 minutes on large projects, a colleague profiled the application with Superluminal and flagged the costliest call stacks, and together we diagnosed and fixed around fifteen issues — splitting metadata into its own file to avoid full-project reads (handled by a second teammate), parallelizing independent work, replacing costly recursive calls with iteration, and cutting reflection from hot paths — for a 50-70% reduction in load times across projects.`,
                fr: `La performance fut un autre sprint d'équipe : après que les temps de chargement aient grimpé jusqu'à 5 minutes sur les gros projets, un collègue a profilé l'application avec Superluminal et repéré les piles d'appels les plus coûteuses, et ensemble nous avons diagnostiqué et corrigé une quinzaine de problèmes — séparer les métadonnées dans leur propre fichier pour éviter des lectures complètes du projet (pris en charge par un second coéquipier), paralléliser des traitements indépendants, remplacer des appels récursifs coûteux par de l'itération, et retirer la réflexion des chemins critiques — pour une réduction de 50 à 70% des temps de chargement sur l'ensemble des projets.`
            },
            images: [withBasePath("/projects/companies/ls-group/gallery-4-superluminal-profiling.png")]
        }
    ],
    type: "VR / Industrial Software",
    showArchitectureTab: false,
    showWorkflowTab: true,
    tech: ["Unity", "C#", "Netcode", "Git", "CI/CD", "Agile Methods"],
    links: {},
    image: withBasePath("/projects/companies/ls-group/cover.png"),
    video: { title: "XR Twin : Simplicity for your Reality", url: "https://www.youtube.com/watch?v=7_1Ufyg3mHM" },
    pdfs: [
        { label: "Work-study Report — Master 1 (FR)", path: withBasePath("/projects/companies/ls-group/work-study-report-master1.pdf") },
        { label: "Work-study Report — Master 2 (FR)", path: withBasePath("/projects/companies/ls-group/work-study-report-master2.pdf") }
    ],
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "2022 — 2024",
    role: "VR Developer",
    highlights: [
        "Individually entrusted with rebuilding XR Twin's navigation system on Unity's Input System, with swappable presets matching Unity, Catia, SolidWorks, Inventor, Revit and SketchUp",
        "Distance-adaptive 'focus' camera for consistent navigation feel across scene scales from millimeters to hundreds of meters",
        "Team sprint with a colleague profiling via Superluminal: fixed ~15 issues together, cutting project load times by 50-70%",
        "Centralized a fragmented color system into an ID-based 'Tint' architecture enabling one-config light/dark theme switching",
        "Owned the front-end for XR Twin's Netcode-based multiplayer (session create/join, connection-state UI, lobby) while a teammate built the backend",
        "Decoupled AppearanceComponent from Unity-specific types and centralized a broken per-component Copy/Paste into a single ClipBoard system, reviewed and merged by the tech lead",
        "Worked with the UX/UI team to debug the VR ergonomic simulation module: motion-sensor calibration, teleportation locomotion, Inspector-to-entity data binding"
    ],
    featured: false,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "Alternance",
            msg: "XRTwin VR industrial application — UX & performance improvements",
            time: "2022 - 2024",
            status: "success"
        }
    ],
    workflow: [
        {
            icon: "Users",
            title: { en: "A small team, Agile cadence", fr: "Une petite équipe, une cadence Agile" },
            description: {
                en: "XR Twin was built by a small, close-knit team under a technical director, running Scrum sprints with a Kanban board for day-to-day flow — small enough that everyone's work stayed visible and cross-reviewed.",
                fr: "XR Twin était construit par une petite équipe soudée sous un directeur technique, avec des sprints Scrum et un tableau Kanban pour le flux quotidien — assez petite pour que le travail de chacun reste visible et revu par les autres."
            },
            items: {
                en: [
                    "JIRA for sprint planning (Scrum) and day-to-day task tracking (Kanban)",
                    "Close collaboration with the UX/UI team on every interface-facing task",
                    "Microsoft Teams for daily sync, screen-shares and quick design questions"
                ],
                fr: [
                    "JIRA pour la planification des sprints (Scrum) et le suivi quotidien des tâches (Kanban)",
                    "Collaboration étroite avec l'équipe UX/UI sur chaque tâche liée à l'interface",
                    "Microsoft Teams pour la synchro quotidienne, le partage d'écran et les questions de design rapides"
                ]
            }
        },
        {
            icon: "Users",
            title: { en: "Feature-first sprints, estimated as a team", fr: "Des sprints centrés fonctionnalité, estimés en équipe" },
            description: {
                en: "A year-one retrospective flagged a real problem: everyone worked solo on unrelated features with no way to estimate task duration, so sprints routinely had to be extended. Year two replaced that with feature-first planning and team-wide estimation.",
                fr: "Une rétrospective en fin d'année 1 a pointé un vrai problème : chacun travaillait seul sur des fonctionnalités sans lien, sans moyen d'estimer la durée des tâches, si bien que les sprints devaient régulièrement être prolongés. L'année 2 a remplacé cela par une planification centrée fonctionnalité et une estimation collective."
            },
            items: {
                en: [
                    "Each sprint planning session, the Product Owner and the whole team agreed on one client-facing feature to build together — e.g. multiplayer's host/client session flow, spread across three sprints from login UI to a working lobby",
                    "The Product Owner broke that feature into concrete tasks (host login popup -> GUI, network connection, interface wiring, error handling); the team then estimated each task's difficulty/duration on a 0-100 scale before picking tasks by comfort and preference",
                    "Calibrating on our real velocity (~39-40 points per two-week sprint) made estimates far more reliable and gave clear visibility into both progress and priorities"
                ],
                fr: [
                    "À chaque planification de sprint, le Product Owner et toute l'équipe se mettaient d'accord sur une fonctionnalité client à construire ensemble — par exemple le flux de session hôte/client du multijoueur, étalé sur trois sprints, de l'UI de connexion à un lobby fonctionnel",
                    "Le Product Owner découpait cette fonctionnalité en tâches concrètes (popup de connexion hôte -> GUI, connexion réseau, câblage de l'interface, gestion des erreurs) ; l'équipe estimait ensuite la difficulté/durée de chaque tâche sur une échelle de 0 à 100 avant de choisir les tâches selon affinité et préférence",
                    "Se caler sur notre vélocité réelle (~39-40 points par sprint de deux semaines) a rendu les estimations bien plus fiables et donné une visibilité claire sur l'avancement comme sur les priorités"
                ]
            }
        },
        {
            icon: "GitBranch",
            title: { en: "Protected `dev`, short-lived branches", fr: "`dev` protégée, branches éphémères" },
            description: {
                en: "Every change shipped on an individual `feature/xxx` or `fix/xxx` branch. The `dev` branch was protected against direct pushes, so integrating work always went through the same gate.",
                fr: "Chaque changement partait sur une branche individuelle `feature/xxx` ou `fix/xxx`. La branche `dev` était protégée contre les push directs, si bien que l'intégration du travail passait toujours par la même porte."
            },
            items: {
                en: [
                    "GitLab hosts the repo; GitFork as the graphical client for day-to-day Git work",
                    "`dev` cannot be pushed to directly — only merged into via reviewed merge requests",
                    "Branches kept small and scoped to a single feature or fix"
                ],
                fr: [
                    "GitLab héberge le repo ; GitFork comme client graphique pour le Git au quotidien",
                    "`dev` ne peut pas recevoir de push direct — uniquement des merges via des merge requests revues",
                    "Des branches gardées petites et limitées à une seule fonctionnalité ou correction"
                ]
            }
        },
        {
            icon: "GitPullRequest",
            title: { en: "Every merge reviewed", fr: "Chaque merge revu" },
            description: {
                en: "No branch reached `dev` without a merge request approved by a teammate — usually the technical director for architecture-sensitive changes, or the colleague who owned the adjacent part of a shared feature.",
                fr: "Aucune branche n'atteignait `dev` sans une merge request approuvée par un coéquipier — généralement le directeur technique pour les changements sensibles à l'architecture, ou le collègue possédant la partie adjacente d'une fonctionnalité partagée."
            },
            items: {
                en: [
                    "Merge requests reviewed and approved before merging, even for solo-owned tasks",
                    "Multiplayer front-end and lobby backend built on separate branches by two developers, integrated through shared merge requests",
                    "Performance fixes reviewed together with the colleague who ran the Superluminal profiling"
                ],
                fr: [
                    "Merge requests revues et approuvées avant tout merge, même pour des tâches possédées en solo",
                    "Front-end multijoueur et backend du lobby construits sur des branches séparées par deux développeurs, intégrés via des merge requests partagées",
                    "Corrections de performance revues avec le collègue ayant réalisé le profilage Superluminal"
                ]
            }
        },
        {
            icon: "Code2",
            title: { en: "Shared C# conventions", fr: "Conventions C# partagées" },
            description: {
                en: "XR Twin enforced a consistent C# naming and architecture policy so a multi-developer codebase stayed navigable, with reusable logic extracted into packages shared across other LS Group products.",
                fr: "XR Twin appliquait une politique de nommage et d'architecture C# cohérente pour qu'une base de code à plusieurs développeurs reste navigable, avec la logique réutilisable extraite en packages partagés avec d'autres produits LS Group."
            },
            items: {
                en: [
                    "PascalCase classes, camelCase fields prefixed by scope (m_/p_/l_)",
                    "No public fields — properties or `protected` only, to control cross-script access",
                    "DataModel / Manager / Controller split; cross-cutting code shared as DLL packages"
                ],
                fr: [
                    "Classes en PascalCase, champs en camelCase préfixés par portée (m_/p_/l_)",
                    "Aucun champ public — uniquement des properties ou du `protected`, pour contrôler l'accès entre scripts",
                    "Séparation DataModel / Manager / Controller ; code transversal partagé sous forme de packages DLL"
                ]
            }
        }
    ]
};
