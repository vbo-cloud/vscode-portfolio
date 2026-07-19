import { withBasePath } from "../../utils/helpers";

export const dwarfsDelight = {
    id: "dwarfs-delight",
    category: "games",
    title: "Dwarfs Delight",
    subtitle: "Local multiplayer couch brawler for 2-4 players, selected for the Pégases",
    description:
        "A frantic local multiplayer game for 2 to 4 players where humor, strategy and action collide in a fantasy world of dwarves. Selected by IIM to be submitted to the Pégases awards.",
    longDescription: `
Dwarfs Delight is my final year project at IIM: a local multiplayer couch game for 2-4 players blending humor, strategy and action in a fantasy dwarven world. It was selected by the school to be submitted to the Pégases awards.

I was Lead Programmer on a large cross-discipline team (2 programmers, 3 artists, 2 designers, 3 producers, 2 sound designers, 1 compositor). My work spanned player/camera movement, the bomb-throw and explosion feature, physical interactions (punch, bump between players, stun), UI animations for scoring and the leaderboard, a full sound implementation pass (plus a custom tool to import and sort sounds faster), VFX, and a scale-safe shader material. I also acted as the team's Git referent and took an active role in game/level design and the overall game architecture.
`,
    type: "Local Multiplayer Game",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unity", "C#", "Git"],
    links: {
        live: "https://dwarfsdelight.itch.io/dwarfs-delight"
    },
    image: withBasePath("/projects/games/dwarfs-delight/gallery-1-home.png"),
    gallery: [
        withBasePath("/projects/games/dwarfs-delight/gallery-2-gameplay.png"),
        withBasePath("/projects/games/dwarfs-delight/gallery-3-leaderboard.png")
    ],
    video: { title: "Dwarfs Delight", url: "https://www.youtube.com/watch?v=mlVmQVqUZ7E" },
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — 6 weeks",
    role: "Lead Programmer",
    highlights: [
        "Player & camera movement, bomb throw + explosion feature",
        "Physical interactions: punch, bump between players, stun",
        "UI animations for scoring and leaderboard",
        "Full sound design pass + custom sound import/sort tool",
        "VFX and player animation implementation, scale-safe shader material",
        "Team's Git referent, active in game/level design and architecture",
        "Selected by IIM for submission to the Pégases awards"
    ],
    featured: true,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "v1.0",
            msg: "Final build submitted for the Pégases awards",
            time: "IIM final year",
            status: "success"
        }
    ],
    snippet: `// Bomb throw + explosion feature
public class BombThrow : MonoBehaviour
{
    [SerializeField] private float force;

    public void Throw(Vector3 direction)
    {
        var bomb = Instantiate(bombPrefab, transform.position, Quaternion.identity);
        bomb.GetComponent<Rigidbody>().AddForce(direction * force, ForceMode.Impulse);
        bomb.GetComponent<Bomb>().OnExplode += HandleExplosion;
    }
}
`,
    architecture: `
[ Local Input (2-4 players) ]
          |
          v
[ Player Controller ]
  - Movement / Camera
  - Punch / Bump / Stun
          |
          v
[ Bomb System ] -- throw, physics, explosion
          |
          v
[ Scoring & Leaderboard UI ]
          |
          v
[ Sound Manager ] -- custom import/sort tooling
`
};
