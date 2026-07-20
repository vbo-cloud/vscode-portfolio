import { withBasePath } from "../../utils/helpers";

export const proceduralDungeon = {
    id: "procedural-dungeon-generation",
    category: "technical",
    title: "Procedural Dungeon Generation",
    subtitle: "Procedurally generated dungeon with blocking progression and a secret room",
    description:
        "A procedurally generated dungeon with a blocking situation to resolve before progressing to the next floor (retrieve a key to open a door) and a secret room, built by adapting assets from Dwarfs Delight and Pescalera.",
    longDescription: `
A focused 2-week, 2-programmer exploration of procedural generation: a dungeon crawler where each floor requires solving a blocking situation (find a key, open a door) before progressing, plus a hidden secret room.

Rather than starting from scratch, we adapted "Dwarfs Delight" to the constraints of a dungeon: I stripped out numerous dependencies (the lobby, the "Crown" game mode), reworked the player spawn system, and made abilities acquirable mid-run. I completed the dungeon-generation algorithm my colleague had started, built the room prefabs and their content (everything except enemies and the Wave Function Collapse logic), and wrote the transition logic between rooms based on the algorithm's output.
`,
    type: "Procedural Generation",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unity", "C#", "Git"],
    links: {},
    image: withBasePath("/projects/technical/procedural-dungeon-generation/cover.png"),
    video: { title: "Procedural Dungeon Generation", url: "https://www.youtube.com/watch?v=GX7QeRUCo6g" },
    pdfs: [
        { label: "Report (FR)", path: withBasePath("/projects/technical/procedural-dungeon-generation/report-fr.pdf") }
    ],
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — 2 weeks",
    role: "Programmer",
    highlights: [
        "Adapted an existing game (Dwarfs Delight) to dungeon constraints",
        "Removed lobby and \"Crown\" game mode dependencies, reworked player spawn",
        "Made abilities acquirable mid-run",
        "Completed the dungeon-generation algorithm",
        "Built room prefabs and content (excluding enemies and Wave Function Collapse)",
        "Wrote room-to-room transition logic driven by the generated dungeon data"
    ],
    featured: false,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "v1.0",
            msg: "Playable procedurally generated dungeon build",
            time: "IIM",
            status: "success"
        }
    ]
};
