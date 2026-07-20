import { withBasePath } from "../../utils/helpers";

export const lsGroup = {
    id: "ls-group",
    category: "companies",
    title: "LS Group — XRTwin",
    subtitle: "VR industrial application developed in partnership with the CEA",
    description:
        "Two-year VR/industrial software alternance at LS Group, in a small XR Twin team: rebuilt the navigation system from scratch, shipped the multiplayer front-end alongside a teammate, and helped cut project load times by up to 70%.",
    descriptionSections: [
        {
            title: "XR Twin, in partnership with the CEA",
            text: `Two-year work-study program (alternance) at LS Group (Suresnes), embedded in the small XR Twin team, on a VR/AR industrial visualization software built with the CEA (French Alternative Energies and Atomic Energy Commission) for clients including Airbus, Dassault Aviation, Renault, Stellantis, Saint-Gobain and ITER. XR Twin imports CAD models (.3ds, .fbx, .step), images, video and point clouds into editable, analyzable industrial simulations, navigable with a VR headset, full-body trackers and haptic controllers.`
        },
        {
            title: "Fixing the Copy/Paste system",
            heading: "Year one, a sample of what has been done",
            text: `A Copy/Paste bug in the AppearanceComponent, reviewed by the team's tech lead like every change that year, turned out to trace back to an architecture violation: the component was pulling color data through Unity-specific types instead of raw values. I decoupled it, then found the same underlying issue independently duplicated — and broken — in every other component's own Copy/Paste. I centralized all of it into a single ClipBoard system with two methods, copy a Behavior and paste it onto the matching component, fixing every component's Copy/Paste at once instead of patching each one separately.`
        },
        {
            title: "Inspector and Hierarchy UX fixes",
            text: `Working closely with the UX/UI team, I fixed a cluster of Inspector and Hierarchy bugs: scene selection not highlighting in the Hierarchy, decimal fields showing an inconsistent number of digits instead of a fixed display precision, fields staying editable in contexts where they shouldn't be, and Inspector/Hierarchy elements not respecting the colors they were assigned. I also worked through layout issues the UX/UI team had flagged in the Inspector's design — misaligned fields, incorrect sizing, missing responsiveness.`
        },
        {
            title: "Debugging the VR ergonomic assessment module",
            text: `I also debugged XR Twin's VR ergonomic simulation (User Ergo) after a core update broke it: motion-sensor calibration had drifted out of sync with the new architecture, VR teleportation locomotion no longer worked, and the Ergo Inspector component had lost its binding to the right entity, showing incorrect or missing data. Testing this one meant putting on the headset and trackers myself to reproduce and validate each fix.`,
            images: [withBasePath("/projects/companies/ls-group/gallery-3-ergo-user.png")]
        },
        {
            title: "Rebuilding navigation from scratch",
            heading: "Year two, a sample of what has been done",
            text: `The second year centered on a full rewrite of XR Twin's navigation, a task entrusted to me individually within the team: the existing system was rigid, imprecise on small industrial parts, and inconsistent across contexts. I studied Unity's own navigation internals to understand its camera-target model, then designed an abstract system on Unity's Input System where per-mode "Handler" classes compute position/rotation deltas and wire/unwire inputs based on context — letting the app ship swappable navigation presets matching Unity, Catia, SolidWorks, Inventor, Revit and SketchUp, plus a distance-adaptive "focus" camera that keeps movement feeling consistent whether you're circling a 1mm bolt or a 100m assembly.`,
            images: [
                withBasePath("/projects/companies/ls-group/gallery-1-navigation-translation.png"),
                withBasePath("/projects/companies/ls-group/gallery-2-navigation-rotation.png")
            ]
        },
        {
            title: "Multiplayer front-end on Netcode",
            text: `Multiplayer was a team effort spanning several sprints: while a teammate built the lobby foundations and netcode backbone, I owned the front-end — session creation/joining, a connection-state UI, and a lobby with player cards, chat and audio settings, all built to fit the constraints of our shared Netcode architecture.`
        },
        {
            title: "Centralizing the color system",
            text: `In parallel, I centralized XR Twin's color system into an ID-based "Tint" architecture: every colored element resolves its color from a shared palette by name, and pushes a refresh callback whenever that name changes. It replaced a tangle of components independently mutating colors — a frequent source of conflicting-color bugs — and turned light/dark theming into a config change instead of a rewrite.`
        },
        {
            title: "Profiling and fixing Save/Load performance",
            text: `Performance was another team sprint: after load times crept up to 5 minutes on large projects, a colleague profiled the application with Superluminal and flagged the costliest call stacks, and together we diagnosed and fixed around fifteen issues — splitting metadata into its own file to avoid full-project reads (handled by a second teammate), parallelizing independent work, replacing costly recursive calls with iteration, and cutting reflection from hot paths — for a 50-70% reduction in load times across projects.`,
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
            title: "A small team, Agile cadence",
            description:
                "XR Twin was built by a small, close-knit team under a technical director, running Scrum sprints with a Kanban board for day-to-day flow — small enough that everyone's work stayed visible and cross-reviewed.",
            items: [
                "JIRA for sprint planning (Scrum) and day-to-day task tracking (Kanban)",
                "Close collaboration with the UX/UI team on every interface-facing task",
                "Microsoft Teams for daily sync, screen-shares and quick design questions"
            ]
        },
        {
            icon: "Users",
            title: "Feature-first sprints, estimated as a team",
            description:
                "A year-one retrospective flagged a real problem: everyone worked solo on unrelated features with no way to estimate task duration, so sprints routinely had to be extended. Year two replaced that with feature-first planning and team-wide estimation.",
            items: [
                "Each sprint planning session, the Product Owner and the whole team agreed on one client-facing feature to build together — e.g. multiplayer's host/client session flow, spread across three sprints from login UI to a working lobby",
                "The Product Owner broke that feature into concrete tasks (host login popup -> GUI, network connection, interface wiring, error handling); the team then estimated each task's difficulty/duration on a 0-100 scale before picking tasks by comfort and preference",
                "Calibrating on our real velocity (~39-40 points per two-week sprint) made estimates far more reliable and gave clear visibility into both progress and priorities"
            ]
        },
        {
            icon: "GitBranch",
            title: "Protected `dev`, short-lived branches",
            description:
                "Every change shipped on an individual `feature/xxx` or `fix/xxx` branch. The `dev` branch was protected against direct pushes, so integrating work always went through the same gate.",
            items: [
                "GitLab hosts the repo; GitFork as the graphical client for day-to-day Git work",
                "`dev` cannot be pushed to directly — only merged into via reviewed merge requests",
                "Branches kept small and scoped to a single feature or fix"
            ]
        },
        {
            icon: "GitPullRequest",
            title: "Every merge reviewed",
            description:
                "No branch reached `dev` without a merge request approved by a teammate — usually the technical director for architecture-sensitive changes, or the colleague who owned the adjacent part of a shared feature.",
            items: [
                "Merge requests reviewed and approved before merging, even for solo-owned tasks",
                "Multiplayer front-end and lobby backend built on separate branches by two developers, integrated through shared merge requests",
                "Performance fixes reviewed together with the colleague who ran the Superluminal profiling"
            ]
        },
        {
            icon: "Code2",
            title: "Shared C# conventions",
            description:
                "XR Twin enforced a consistent C# naming and architecture policy so a multi-developer codebase stayed navigable, with reusable logic extracted into packages shared across other LS Group products.",
            items: [
                "PascalCase classes, camelCase fields prefixed by scope (m_/p_/l_)",
                "No public fields — properties or `protected` only, to control cross-script access",
                "DataModel / Manager / Controller split; cross-cutting code shared as DLL packages"
            ]
        }
    ],
    snippet: `// Abstract navigation: each preset wires inputs to reusable handlers
public class OrbitNavigationPreset : NavigationPreset
{
    [SerializeField] private TranslationHandler m_translation;
    [SerializeField] private RotationHandler m_rotation;

    protected override void OnActivate(InputActionMap p_map)
    {
        p_map["Translate"].performed += m_translation.Apply;
        p_map["Orbit"].performed += m_rotation.Apply;
    }

    protected override float GetFocusSpeed(float p_distanceToTarget)
    {
        // Movement feels the same whether the target is 1mm or 100m away
        return p_distanceToTarget * k_focusSpeedFactor;
    }
}
`,
    architecture: `
[ Unity Input System ]
          |
          v
[ Navigation Preset (Unity / Catia / SolidWorks / Revit / SketchUp) ]
  - wires/unwires inputs based on context
          |
          v
[ Handlers ]
  - TranslationHandler   -> position delta
  - RotationHandler      -> rotation delta
  - FocusHandler         -> distance-adaptive camera speed
          |
          v
[ Player / Camera transform ]

Cross-cutting: centralized "Tint" color system (ID-based palette + refresh
callbacks) - Netcode multiplayer front-end - Superluminal-profiled Save/Load
(50-70% faster)
`
};
