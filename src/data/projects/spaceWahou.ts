import { withBasePath } from "../../utils/helpers";

export const spaceWahou = {
    id: "space-wahou",
    category: "games",
    title: "Space Wahou",
    subtitle: "C++/SFML mothership shooter — survive and grow your firepower",
    description:
        "Control a mothership that must survive and destroy its enemies: collect small blue ships to boost defense and firepower, green pills to heal, and yellow ones to charge an ultimate weapon.",
    longDescription: `
A 12-day student project built with a team of 3 programmers, in raw C++ and SFML — no game engine, just the graphics library and hand-rolled game logic.

I built player movement, the system that attaches collected blue ships to the player and has them follow its motion, the pause menu sound toggle, sound design (researched and implemented the music), weapon fire, a player shield feature, and map boundaries. I also contributed to the game design.
`,
    type: "Arcade Shooter — C++/SFML",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["C++", "SFML"],
    links: {
        live: "https://unrealitygames.itch.io/space-wahou"
    },
    image: withBasePath("/projects/games/space-wahou/cover.png"),
    video: { title: "Space Wahou", url: "https://www.youtube.com/watch?v=Xz0Q9cr38qE" },
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — 12 days",
    role: "Programmer",
    highlights: [
        "Player movement and follower ships (collected blue ships)",
        "Sound design: research and implementation of music and weapon fire",
        "Player shield feature and map boundary limits",
        "Pause menu sound toggle",
        "Contribution to game design"
    ],
    featured: false,
    languages: [
        { name: "C++", percent: 100, color: "#00599C" }
    ],
    deployHistory: [
        {
            version: "v1.0",
            msg: "Playable build released on itch.io",
            time: "IIM",
            status: "success"
        }
    ],
    snippet: `// Follower ships trailing the player mothership
void FollowerShip::update(const sf::Vector2f& leaderPos, float dt) {
    sf::Vector2f dir = (targetOffset + leaderPos) - position;
    position += dir * followSpeed * dt;
}
`,
    architecture: `
[ SFML Render/Update Loop ]
          |
          v
[ Player Mothership ]
  - Movement
  - Shield
  - Weapon fire
          |
          v
[ Follower Ships ] -- collected blue ships
          |
          v
[ Pickups ] -- green (heal) / yellow (ultimate charge)
`
};
