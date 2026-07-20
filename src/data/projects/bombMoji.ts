import { withBasePath } from "../../utils/helpers";

export const bombMoji = {
    id: "bomb-moji",
    category: "games",
    title: "Bomb'Moji",
    subtitle: "Emoji-themed rogue-like arcade shooter — game jam entry",
    description: {
        en: "A rogue-like arcade game where a sharpshooter's emotions change how they fight. Defeat every enemy in record time — but don't slip on the ice.",
        fr: "Un jeu d'arcade rogue-like où les émotions d'un tireur d'élite changent sa façon de combattre. Battez tous les ennemis en un temps record — mais ne glissez pas sur la glace."
    },
    longDescription: {
        en: `
Built in 4.5 days for a game jam themed around emojis, with a team of 2 designers, 1 artist and 3 developers, in Unity.

I built the controls (ground/ice movement, dash, weapon recoil), the interface (kill counter, dash ability), sound design (music and weapon/dash sound implementation), art work (dash effects, hit-flash on the background, explosion particles), a door system for entering/exiting zones, enemy-spawn activation tied to the kill counter, and bug fixes around enemy movement and health. I also heavily contributed to game and level design.
`,
        fr: `
Développé en 4,5 jours pour un game jam sur le thème des emojis, avec une équipe de 2 designers, 1 artiste et 3 développeurs, sous Unity.

J'ai développé les contrôles (déplacement sol/glace, dash, recul des armes), l'interface (compteur de kills, capacité de dash), le sound design (musique et intégration des sons d'armes/dash), le travail artistique (effets de dash, flash d'impact sur le fond, particules d'explosion), un système de portes pour entrer/sortir des zones, l'activation du spawn d'ennemis liée au compteur de kills, et des corrections de bugs autour du déplacement et de la santé des ennemis. J'ai aussi fortement contribué au game design et au level design.
`
    },
    type: "Game Jam — Arcade Rogue-like",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unity", "C#", "Git"],
    links: {
        live: "https://unrealitygames.itch.io/bombmoji"
    },
    image: withBasePath("/projects/games/bomb-moji/cover.png"),
    video: { title: "Bomb'Moji", url: "https://www.youtube.com/watch?v=dVJFuEFkYZU" },
    gallery: [
        withBasePath("/projects/games/bomb-moji/gallery-1.png"),
        withBasePath("/projects/games/bomb-moji/gallery-2.png"),
        withBasePath("/projects/games/bomb-moji/gallery-3.png")
    ],
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "Game Jam — 4.5 days",
    role: "Programmer",
    highlights: [
        "Ground/ice movement, dash, weapon recoil",
        "Kill counter and dash-ability UI",
        "Sound design and implementation (music, weapons, dash)",
        "Hit-flash background and explosion particle systems",
        "Door system and kill-counter-driven enemy spawn activation",
        "Heavy contribution to game and level design"
    ],
    featured: false,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "Jam build",
            msg: "Submitted for the Emoji-themed game jam",
            time: "4.5 days",
            status: "success"
        }
    ]
};
