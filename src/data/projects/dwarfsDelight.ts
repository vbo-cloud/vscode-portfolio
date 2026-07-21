import { withBasePath } from "../../utils/helpers";

export const dwarfsDelight = {
    id: "dwarfs-delight",
    category: "games",
    title: "Dwarfs Delight",
    subtitle: "Local multiplayer couch brawler for 2-4 players, selected for the Pégases",
    description: {
        en: "A frantic local multiplayer game for 2 to 4 players where humor, strategy and action collide in a fantasy world of dwarves. Selected by IIM to be submitted to the Pégases awards.",
        fr: "Un jeu multijoueur local endiablé pour 2 à 4 joueurs où humour, stratégie et action se percutent dans un monde fantastique de nains. Sélectionné par l'IIM pour concourir aux Pégases."
    },
    longDescription: {
        en: `
Dwarfs Delight is my final year project at IIM: a local multiplayer couch game for 2-4 players blending humor, strategy and action in a fantasy dwarven world. It was selected by the school to be submitted to the Pégases awards.

I was Lead Programmer on a large cross-discipline team (2 programmers, 3 artists, 2 designers, 3 producers, 2 sound designers, 1 compositor). My work spanned player/camera movement, the bomb-throw and explosion feature, physical interactions (punch, bump between players, stun), UI animations for scoring and the leaderboard, a full sound implementation pass (plus a custom tool to import and sort sounds faster), VFX, and a scale-safe shader material. I also acted as the team's Git referent and took an active role in game/level design and the overall game architecture.
`,
        fr: `
Dwarfs Delight est mon projet de fin d'études à l'IIM : un jeu multijoueur local en canapé pour 2 à 4 joueurs mêlant humour, stratégie et action dans un monde fantastique de nains. Il a été sélectionné par l'école pour concourir aux Pégases.

J'étais Lead Programmer sur une grande équipe pluridisciplinaire (2 programmeurs, 3 artistes, 2 designers, 3 producteurs, 2 sound designers, 1 compositeur). Mon travail a couvert le déplacement joueur/caméra, la fonctionnalité de lancer de bombe et d'explosion, les interactions physiques (coup de poing, bousculade entre joueurs, étourdissement), les animations d'UI pour le score et le classement, une passe complète d'implémentation sonore (plus un outil personnalisé pour importer et trier les sons plus rapidement), les VFX, et un matériau shader résistant à l'échelle. J'ai aussi été le référent Git de l'équipe et pris un rôle actif dans le game/level design et l'architecture globale du jeu.
`
    },
    type: "Local Multiplayer Game",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unity", "C#", "Git"],
    links: {
        live: "https://dwarfsdelight.itch.io/dwarfs-delight"
    },
    image: withBasePath("/projects/games/dwarfs-delight/cover-logo.png"),
    gallery: [
        withBasePath("/projects/games/dwarfs-delight/gallery-1-home.png"),
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
    ]
};
