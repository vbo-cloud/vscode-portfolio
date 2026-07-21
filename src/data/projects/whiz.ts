import { withBasePath } from "../../utils/helpers";

export const whiz = {
    id: "whiz",
    category: "games",
    title: "Whiz",
    subtitle: "Grappling-hook speedrun game — beat your own ghost",
    description: {
        en: "Speed is your nindō. Using grappling hooks, propel yourself through varied levels, find the best trajectories, and improve your times to beat your own ghost.",
        fr: "La vitesse est votre nindō. À l'aide de grappins, propulsez-vous à travers des niveaux variés, trouvez les meilleures trajectoires, et améliorez vos temps pour battre votre propre fantôme."
    },
    longDescription: {
        en: `
Whiz is a 10-day speedrunning game built with a small team (1 designer, 1 artist, 2 programmers) in Unreal: players use grappling hooks to chain momentum through levels, chasing better times against a recorded ghost of their own best run.

I built player and camera movement (boost, brake, grappling-hook swings, a supersonic state), player death, and the UI: timer, end-of-race screen, a high-score system saving both time and ghost replay, a retry button, and cursor feedback showing whether a hook can be thrown. On the art/feel side, I researched and implemented speed-adaptive sound design, the player/ghost shader and its animation, particle systems for speed sensation, dynamic field-of-view during reel-in, the ghost trail, fog, and a scale-safe shader material. I also designed supersonic walls/zones, "grappable" surface states, and the end zone — and heavily contributed to the game design, building level 4 (the one featured in the trailer) and its minimalist visual style.
`,
        fr: `
Whiz est un jeu de speedrun de 10 jours réalisé avec une petite équipe (1 designer, 1 artiste, 2 programmeurs) sous Unreal : les joueurs utilisent des grappins pour enchaîner du momentum à travers les niveaux, à la recherche de meilleurs temps face à un fantôme enregistré de leur propre meilleure run.

J'ai développé le déplacement joueur et caméra (boost, frein, balancements au grappin, un état supersonique), la mort du joueur, et l'UI : chronomètre, écran de fin de course, un système de meilleur score sauvegardant à la fois le temps et le replay fantôme, un bouton de retry, et un retour visuel du curseur indiquant si un grappin peut être lancé. Côté art/feel, j'ai recherché et implémenté un sound design adaptatif à la vitesse, le shader joueur/fantôme et son animation, des systèmes de particules pour la sensation de vitesse, un champ de vision dynamique pendant l'enroulement, la traînée du fantôme, le brouillard, et un matériau shader résistant à l'échelle. J'ai aussi conçu les murs/zones supersoniques, les états de surface "accrochables", et la zone de fin — et fortement contribué au game design, en construisant le niveau 4 (celui présenté dans la bande-annonce) et sa direction artistique minimaliste.
`
    },
    type: "Speedrunning Platformer",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unreal", "C++", "Git"],
    links: {
        live: "https://unrealitygames.itch.io/whiz"
    },
    image: withBasePath("/projects/games/whiz/cover.png"),
    video: { title: "Whiz", url: "https://www.youtube.com/watch?v=s1sdixXM5aU" },
    gallery: [
        withBasePath("/projects/games/whiz/gallery-1.png"),
        withBasePath("/projects/games/whiz/gallery-2.png"),
        withBasePath("/projects/games/whiz/gallery-3.png")
    ],
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — 10 days",
    role: "Programmer",
    highlights: [
        "Movement: boost, brake, grappling hooks, supersonic state",
        "Timer, high-score system (time + ghost replay), retry flow",
        "Speed-adaptive sound design",
        "Player/ghost shader, speed particles, dynamic FOV, ghost trail, fog",
        "Supersonic walls/zones and \"grappable\" surface states",
        "Designed and built level 4 (featured in the trailer) with a minimalist art direction"
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
    ]
};
