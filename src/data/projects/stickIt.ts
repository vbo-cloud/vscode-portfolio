import { withBasePath } from "../../utils/helpers";

export const stickIt = {
    id: "stick-it",
    category: "games",
    title: "Stick It",
    subtitle: "2-4 player slime brawler with sticky-wall physics",
    description: {
        en: "From a 2-player duel to a 4-player melee, brawl with tiny slimes that jump and stick to walls — but never for long, so you always have to keep moving.",
        fr: "D'un duel à 2 joueurs à une mêlée à 4, bagarrez-vous avec de petits slimes qui sautent et collent aux murs — mais jamais très longtemps, il faut donc toujours rester en mouvement."
    },
    longDescription: {
        en: `
Stick It is a 2-month student project (3 designers, 2 artists, 4 programmers, 2 sound designers, 4 producers) built around a simple, physical core: slimes that jump in a chosen direction and stick to walls temporarily, forcing constant movement.

My work covered directional jump preview and physics (stickiness/slipping, collisions between players, a mass system that reshapes the rules of collision, jump and stickiness), the multiplayer hub and a player manager handling respawn, map transitions, scoring and mass, plus FX work: an appear/disappear shader for walls and mushrooms, and a particle behavior for the "musical chairs" maps (particles turn red and eliminate all remaining players when the countdown ends). I also heavily contributed to the game design.
`,
        fr: `
Stick It est un projet étudiant de 2 mois (3 designers, 2 artistes, 4 programmeurs, 2 sound designers, 4 producteurs) construit autour d'un socle physique simple : des slimes qui sautent dans une direction choisie et collent temporairement aux murs, forçant un mouvement constant.

Mon travail a couvert l'aperçu directionnel de saut et la physique (adhérence/glissement, collisions entre joueurs, un système de masse qui redéfinit les règles de collision, de saut et d'adhérence), le hub multijoueur et un gestionnaire de joueurs s'occupant du respawn, des transitions de map, du score et de la masse, ainsi que du travail FX : un shader d'apparition/disparition pour les murs et les champignons, et un comportement de particules pour les maps "chaises musicales" (les particules deviennent rouges et éliminent tous les joueurs restants à la fin du compte à rebours). J'ai aussi fortement contribué au game design.
`
    },
    type: "Local Multiplayer Brawler",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unity", "C#", "Git"],
    links: {},
    image: withBasePath("/projects/games/stick-it/cover.png"),
    video: { title: "Stick It - Official Launch Trailer", url: "https://www.youtube.com/watch?v=imdtWzWj024" },
    gallery: [
        withBasePath("/projects/games/stick-it/gallery-1.gif"),
        withBasePath("/projects/games/stick-it/gallery-2.gif"),
        withBasePath("/projects/games/stick-it/gallery-3.gif")
    ],
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
    ]
};
