import { withBasePath } from "../../utils/helpers";

export const onlineFPS = {
    id: "online-fps",
    category: "technical",
    title: "Online FPS",
    subtitle: "Custom networked multiplayer FPS built with Enet, C++ and Unity",
    description: {
        en: "An online multiplayer game built with a custom C++/Enet networking layer for the online components and Unity for local gameplay, reusing visual assets from Pescalera.",
        fr: "Un jeu multijoueur en ligne construit avec une couche réseau C++/Enet personnalisée pour les composants online et Unity pour le gameplay local, en réutilisant les assets visuels de Pescalera."
    },
    longDescription: {
        en: `
A 3-week, 2-programmer project exploring low-level networked multiplayer: a full custom online architecture built with Enet and C++, driving Unity on the client side, reusing visual assets from our earlier game Pescalera.

I set up the entire network architecture: Enet integration, binary packet serialization/deserialization, client-side prediction and server reconciliation for player movement, and prediction for shots. On the server, I extracted collider data from Unity and reconstructed it with PhysX to run authoritative physics server-side. I also used Avaturn to generate 3D avatars of our classmates and Mixamo to animate them, and added a text chat system.
`,
        fr: `
Un projet de 3 semaines à 2 programmeurs explorant le multijoueur en réseau bas niveau : une architecture online entièrement personnalisée construite avec Enet et C++, pilotant Unity côté client, en réutilisant les assets visuels de notre précédent jeu Pescalera.

J'ai mis en place toute l'architecture réseau : intégration d'Enet, sérialisation/désérialisation de paquets binaires, prédiction côté client et réconciliation serveur pour le déplacement du joueur, ainsi que la prédiction des tirs. Côté serveur, j'ai extrait les données de collider d'Unity et je les ai reconstruites avec PhysX pour faire tourner une physique faisant autorité côté serveur. J'ai aussi utilisé Avaturn pour générer des avatars 3D de nos camarades de classe et Mixamo pour les animer, et ajouté un système de chat texte.
`
    },
    type: "Networked Multiplayer FPS",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["C++", "Enet", "Unity", "C#"],
    links: {
        live: "https://antxn.itch.io/pescalera"
    },
    image: withBasePath("/projects/technical/online-fps/cover.png"),
    video: { title: "OnlineFPS Project", url: "https://www.youtube.com/watch?v=gOHP8Xui4ig" },
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — 3 weeks",
    role: "Network & Gameplay Programmer",
    highlights: [
        "Full network architecture: Enet, binary packet serialization/deserialization",
        "Client-side prediction and server reconciliation for movement",
        "Shot prediction",
        "Server-authoritative physics: Unity collider extraction reconstructed with PhysX",
        "3D classmate avatars via Avaturn, animated with Mixamo",
        "Text chat system"
    ],
    featured: false,
    languages: [
        { name: "C++", percent: 60, color: "#00599C" },
        { name: "C#", percent: 40, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "v1.0",
            msg: "Playable networked build with prediction/reconciliation",
            time: "IIM",
            status: "success"
        }
    ]
};
