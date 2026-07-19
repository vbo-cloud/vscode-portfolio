import { withBasePath } from "../../utils/helpers";

export const whiz = {
    id: "whiz",
    category: "games",
    title: "Whiz",
    subtitle: "Grappling-hook speedrun game — beat your own ghost",
    description:
        "Speed is your nindō. Using grappling hooks, propel yourself through varied levels, find the best trajectories, and improve your times to beat your own ghost.",
    longDescription: `
Whiz is a 10-day speedrunning game built with a small team (1 designer, 1 artist, 2 programmers) in Unreal: players use grappling hooks to chain momentum through levels, chasing better times against a recorded ghost of their own best run.

I built player and camera movement (boost, brake, grappling-hook swings, a supersonic state), player death, and the UI: timer, end-of-race screen, a high-score system saving both time and ghost replay, a retry button, and cursor feedback showing whether a hook can be thrown. On the art/feel side, I researched and implemented speed-adaptive sound design, the player/ghost shader and its animation, particle systems for speed sensation, dynamic field-of-view during reel-in, the ghost trail, fog, and a scale-safe shader material. I also designed supersonic walls/zones, "grappable" surface states, and the end zone — and heavily contributed to the game design, building level 4 (the one featured in the trailer) and its minimalist visual style.
`,
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
    ],
    snippet: `// Ghost trail + high-score save (time + replay)
void ASpeedrunGameMode::OnRaceFinished(float time, const TArray<FGhostFrame>& replay)
{
    if (time < BestTime)
    {
        BestTime = time;
        SaveGame->GhostReplay = replay;
        UGameplayStatics::SaveGameToSlot(SaveGame, TEXT("Whiz"), 0);
    }
}
`,
    architecture: `
[ Player Controller ]
  - Boost / Brake / Grapple / Supersonic
          |
          v
[ Timer & Ghost System ] -- records + replays best run
          |
          v
[ Shader & VFX Layer ] -- player/ghost shader, speed particles, FOV
          |
          v
[ Level Geometry ] -- supersonic walls/zones, grappable surfaces
`
};
