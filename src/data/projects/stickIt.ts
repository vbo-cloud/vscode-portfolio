import { placeholderImage } from "../../utils/helpers";

export const stickIt = {
    id: "stick-it",
    title: "Stick It",
    subtitle: "2-4 player slime brawler with sticky-wall physics",
    description:
        "From a 2-player duel to a 4-player melee, brawl with tiny slimes that jump and stick to walls — but never for long, so you always have to keep moving.",
    longDescription: `
Stick It is a 2-month student project (3 designers, 2 artists, 4 programmers, 2 sound designers, 4 producers) built around a simple, physical core: slimes that jump in a chosen direction and stick to walls temporarily, forcing constant movement.

My work covered directional jump preview and physics (stickiness/slipping, collisions between players, a mass system that reshapes the rules of collision, jump and stickiness), the multiplayer hub and a player manager handling respawn, map transitions, scoring and mass, plus FX work: an appear/disappear shader for walls and mushrooms, and a particle behavior for the "musical chairs" maps (particles turn red and eliminate all remaining players when the countdown ends). I also heavily contributed to the game design.
`,
    type: "Local Multiplayer Brawler",
    tech: ["Unity", "C#", "Git"],
    links: {},
    image: placeholderImage("Stick It", "#22c55e"),
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — 2 months",
    role: "Programmer",
    highlights: [
        "Directional jump preview and stickiness/slipping physics",
        "Mass system reshaping collision, jump and stickiness rules",
        "Multiplayer hub and player manager (respawn, transitions, score, mass)",
        "Appear/disappear shader for walls and mushrooms",
        "\"Musical chairs\" elimination particle behavior",
        "Heavy contribution to game design"
    ],
    featured: false,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "v1.0",
            msg: "Playable 2-4 player build",
            time: "IIM",
            status: "success"
        }
    ],
    snippet: `// Mass system reshaping collision/jump/stickiness rules
float StickinessFor(SlimeMass mass) => Mathf.Clamp01(1f - (mass.Value / MaxMass) * 0.5f);
`,
    architecture: `
[ Player Manager ] -- respawn, transitions, score, mass
          |
          v
[ Slime Physics ]
  - Directional jump
  - Stickiness / slipping
  - Mass-based collision rules
          |
          v
[ FX Layer ] -- appear/disappear shader, elimination particles
`
};
