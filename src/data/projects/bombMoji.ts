import { placeholderImage } from "../../utils/helpers";

export const bombMoji = {
    id: "bomb-moji",
    category: "games",
    title: "Bomb'Moji",
    subtitle: "Emoji-themed rogue-like arcade shooter — game jam entry",
    description:
        "A rogue-like arcade game where a sharpshooter's emotions change how they fight. Defeat every enemy in record time — but don't slip on the ice.",
    longDescription: `
Built in 4.5 days for a game jam themed around emojis, with a team of 2 designers, 1 artist and 3 developers, in Unity.

I built the controls (ground/ice movement, dash, weapon recoil), the interface (kill counter, dash ability), sound design (music and weapon/dash sound implementation), art work (dash effects, hit-flash on the background, explosion particles), a door system for entering/exiting zones, enemy-spawn activation tied to the kill counter, and bug fixes around enemy movement and health. I also heavily contributed to game and level design.
`,
    type: "Game Jam — Arcade Rogue-like",
    tech: ["Unity", "C#", "Git"],
    links: {
        live: "https://unrealitygames.itch.io/bombmoji"
    },
    image: placeholderImage("Bomb'Moji", "#f97316"),
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
    ],
    snippet: `// Kill-counter-driven enemy spawn activation
void OnEnemyKilled()
{
    killCount++;
    spawner.SetActiveWaves(waveTable.WavesUnlockedAt(killCount));
}
`,
    architecture: `
[ Player Controller ] -- ground/ice movement, dash, recoil
          |
          v
[ Kill Counter ] -- drives spawn activation & UI
          |
          v
[ Enemy Spawner ] -- doors, wave activation
          |
          v
[ FX Layer ] -- hit-flash, explosion particles
`
};
