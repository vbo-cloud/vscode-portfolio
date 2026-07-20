import { withBasePath } from "../../utils/helpers";

export const bombers = {
    id: "bombers",
    category: "games",
    title: "Bombers",
    subtitle: "Solo first-year project — stop a machine city's uncontrolled expansion",
    description:
        "In a machine city built by men and now run by deadly independent robots, your quest is to find humans and end the city's uncontrollable expansion.",
    longDescription: `
Bombers is my first-year final project at IIM, developed entirely solo: every feature was built by me, using Mixamo for models and some animations, while I modeled the robots and the boss animations myself with 3DS Max.
`,
    type: "Personal Project — Action",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unity", "C#"],
    links: {
        live: "https://unrealitygames.itch.io/bombers"
    },
    image: withBasePath("/projects/games/bombers/cover.png"),
    video: { title: "Bombers", url: "https://www.youtube.com/watch?v=oIfwBok9Bec" },
    gallery: [
        withBasePath("/projects/games/bombers/gallery-1-menu.png"),
        withBasePath("/projects/games/bombers/gallery-2.png"),
        withBasePath("/projects/games/bombers/gallery-3.png")
    ],
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — First year final project",
    role: "Solo Developer",
    highlights: [
        "Solo-developed every gameplay feature",
        "Used Mixamo for models/animation",
        "Modeled robots and boss animations in 3DS Max"
    ],
    featured: false,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "v1.0",
            msg: "Playable build released on itch.io",
            time: "IIM first year",
            status: "success"
        }
    ]
};
