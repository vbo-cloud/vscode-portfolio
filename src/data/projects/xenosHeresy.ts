import { withBasePath } from "../../utils/helpers";

export const xenosHeresy = {
    id: "xenos-heresy",
    category: "games",
    title: "Xenos Heresy",
    subtitle: "Turn-based tactics mobile game, published on the Play Store",
    description:
        "A mercenary and an elite trooper take revenge on an alien race that has invaded their planets, in a turn-based tactics game built for mobile and published on the Play Store.",
    longDescription: `
Xenos Heresy is a turn-based tactics game built over one month with a small team (2 designers, 1 artist, 3 programmers) at IIM, later published on the Google Play Store.

I owned the project's architecture: tile-selection tooling for movement and attacks (and iterated on it until it fit the design), the full turn-based system, gameplay UI, enemy AI, two distinct dialogue systems, and a scripted tutorial. I also contributed to the menu and sound systems, and — perhaps most usefully — built tools that let the game designers create heroes, enemies and attacks, and iterate on level design, without touching code.
`,
    type: "Mobile Tactics Game",
    tech: ["Unity", "C#", "Git"],
    links: {
        live: "https://play.google.com/store/apps/details?id=com.iimjv24T1.xenosHeresy"
    },
    image: withBasePath("/projects/games/xenos-heresy/cover.png"),
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — 1 month",
    role: "Programmer",
    highlights: [
        "Owned the project architecture",
        "Tile-selection tooling for movement and attacks",
        "Turn-based system and gameplay UI",
        "Enemy AI and two distinct dialogue systems",
        "Scripted tutorial, menu and sound system contributions",
        "Designer-facing tools for heroes/enemies/attacks and fast level design",
        "Published on the Google Play Store"
    ],
    featured: true,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "v1.0",
            msg: "Published to Google Play Store",
            time: "IIM",
            status: "success"
        }
    ],
    snippet: `// Turn-based tile selection tooling
public IEnumerable<Tile> GetReachableTiles(Unit unit, int range)
{
    return grid.Tiles
        .Where(t => Pathfinder.Distance(unit.Tile, t) <= range)
        .Where(t => !t.IsOccupied);
}
`,
    architecture: `
[ Turn Manager ]
          |
          v
[ Tile Selection Tooling ] -- movement / attack ranges
          |
          v
[ Unit / AI Layer ]
  - Player units
  - Enemy AI
          |
          v
[ Dialogue & Tutorial Systems ]
          |
          v
[ Designer Tools ] -- heroes, enemies, attacks, levels
`
};
