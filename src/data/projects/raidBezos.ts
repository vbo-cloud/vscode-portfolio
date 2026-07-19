import { withBasePath } from "../../utils/helpers";

export const raidBezos = {
    id: "raid-bezos",
    category: "games",
    title: "Raid Bezos",
    subtitle: "Christmas-themed game jam: protect Santa's elves from Big Corp",
    description:
        "A 5-day, Christmas-themed game jam entry: as the Security General of the North Pole, stop Big Corporations from enslaving Santa's elves, armed with unpredictable \"special gifts\".",
    longDescription: `
Built in 5 days for a Christmas-themed game jam with a team of 3 designers, 2 artists, 4 programmers and 1 producer, in Unreal.

The pitch: Big Corporations have come to enslave Santa's elves the day before Christmas, and you're the Security General of the North Pole tasked with stopping them — using "special gifts" whose contents stay hidden until unwrapped.
`,
    type: "Game Jam — Unreal",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unreal", "C++", "Git"],
    links: {
        live: "https://unrealitygames.itch.io/raid-bezos"
    },
    image: withBasePath("/projects/games/raid-bezos/cover.png"),
    video: { title: "Raid Bezos", url: "https://www.youtube.com/watch?v=5hqurTxFarU" },
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "Game Jam — 5 days",
    role: "Programmer",
    highlights: [
        "Built in 5 days for a Christmas-themed game jam",
        "Team of 3 designers, 2 artists, 4 programmers, 1 producer",
        "Unreal / C++"
    ],
    featured: false,
    languages: [
        { name: "C++", percent: 100, color: "#00599C" }
    ],
    deployHistory: [
        {
            version: "Jam build",
            msg: "Submitted for the Christmas game jam",
            time: "5 days",
            status: "success"
        }
    ]
};
