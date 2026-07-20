import { withBasePath } from "../../utils/helpers";

export const onlineFPS = {
    id: "online-fps",
    category: "technical",
    title: "Online FPS",
    subtitle: "Custom networked multiplayer FPS built with Enet, C++ and Unity",
    description:
        "An online multiplayer game built with a custom C++/Enet networking layer for the online components and Unity for local gameplay, reusing visual assets from Pescalera.",
    longDescription: `
A 3-week, 2-programmer project exploring low-level networked multiplayer: a full custom online architecture built with Enet and C++, driving Unity on the client side, reusing visual assets from our earlier game Pescalera.

I set up the entire network architecture: Enet integration, binary packet serialization/deserialization, client-side prediction and server reconciliation for player movement, and prediction for shots. On the server, I extracted collider data from Unity and reconstructed it with PhysX to run authoritative physics server-side. I also used Avaturn to generate 3D avatars of our classmates and Mixamo to animate them, and added a text chat system.
`,
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
