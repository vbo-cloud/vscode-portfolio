import { withBasePath } from "../../utils/helpers";

export const saveThem = {
    id: "save-them",
    category: "games",
    title: "Save Them",
    subtitle: "Solo puzzle project — free your fellow captives with the help of the dead",
    description: {
        en: "Control a group of humans captured by a psychopath, who will let them leave if they reach the exit of his detention center — with help from their... dead friends.",
        fr: "Contrôlez un groupe d'humains capturés par un psychopathe, qui les laissera partir s'ils atteignent la sortie de son centre de détention — avec l'aide de leurs... amis morts."
    },
    longDescription: {
        en: `
A solo personal project built at IIM: a small puzzle game where you guide captured humans to the exit of a detention center, relying on the help of their dead friends to solve the way out.
`,
        fr: `
Un projet personnel solo réalisé à l'IIM : un petit jeu de puzzle où vous guidez des humains capturés vers la sortie d'un centre de détention, en vous appuyant sur l'aide de leurs amis morts pour résoudre le chemin.
`
    },
    type: "Personal Project — Puzzle",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unity", "C#"],
    links: {
        live: "https://unrealitygames.itch.io/save-them"
    },
    image: withBasePath("/projects/games/save-them/cover.png"),
    video: { title: "Save Them", url: "https://www.youtube.com/watch?v=d-7r1DhlkYA" },
    gallery: [
        withBasePath("/projects/games/save-them/gallery-1.png"),
        withBasePath("/projects/games/save-them/gallery-2.png")
    ],
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — Personal project",
    role: "Solo Developer",
    highlights: [
        "Solo-developed puzzle mechanics end-to-end",
        "Unity / C#"
    ],
    featured: false,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "v1.0",
            msg: "Playable build released on itch.io",
            time: "IIM",
            status: "success"
        }
    ]
};
