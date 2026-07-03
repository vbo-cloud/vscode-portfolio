import { placeholderImage } from "../../utils/helpers";

export const pescalera = {
    id: "pescalera",
    category: "games",
    title: "Pescalera",
    subtitle: "Wacky FPS where a fisherman defends his town from invading seagulls",
    description:
        "Pescalera is a wacky FPS where you play a fisherman protecting his coastal town from invading seagulls, using a harpoon to capture fish that double as weapons and ammunition.",
    longDescription: `
Pescalera is a two-month student project built with a large team at IIM (5 programmers, 3 artists, 4 designers, 3 producers, 3 sound designers): a wacky first-person shooter where a fisherman defends his coastal town from waves of invading seagulls using a fish-launching harpoon.

As Lead Programmer, I built player/camera movement, input handling, weapon and ammunition management, the boid-based enemy flocking and spawning, the wave system, gamefeel tuning, UI animations (dash-ready, next-wave), and VFX. I was also the team's Git referent and took an active role in game and level design and in shaping the overall architecture.
`,
    type: "First-Person Shooter",
    tech: ["Unity", "C#", "Git"],
    links: {
        live: "https://antxn.itch.io/pescalera"
    },
    image: placeholderImage("Pescalera", "#0ea5e9"),
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — 2 months",
    role: "Lead Programmer",
    highlights: [
        "Player/camera movement and input handling",
        "Weapon and ammunition management",
        "Boid-based enemy flocking, spawning and wave system",
        "Gamefeel tuning and UI animations (dash-ready, next-wave)",
        "VFX implementation",
        "Team's Git referent, active in game/level design and architecture"
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
    ],
    snippet: `// Boid-based seagull flocking
Vector3 Flock(Boid self, List<Boid> neighbors)
{
    var separation = Separation(self, neighbors);
    var alignment = Alignment(neighbors);
    var cohesion = Cohesion(self, neighbors);
    return (separation * 1.5f + alignment + cohesion).normalized;
}
`,
    architecture: `
[ Wave Spawner ]
          |
          v
[ Boid Flocking System ] -- seagull enemies
          |
          v
[ Player Controller ]
  - Camera / Movement
  - Harpoon weapon + ammo (captured fish)
          |
          v
[ Gamefeel & UI Layer ] -- dash-ready, next-wave
`
};
