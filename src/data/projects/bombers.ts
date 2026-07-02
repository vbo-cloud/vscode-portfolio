import { placeholderImage } from "../../utils/helpers";

export const bombers = {
    id: "bombers",
    category: "games",
    title: "Bombers",
    subtitle: "Solo first-year project — stop a machine city's uncontrolled expansion",
    description:
        "In a machine city built by men and now run by deadly independent robots, your quest is to find humans and end the city's uncontrollable expansion.",
    longDescription: `
Bombers is my first-year final project at IIM, developed entirely solo: every feature was built by me, using Mixamo for models and some animations, while I modeled the robots and the boss animations myself with 3DS Max.
`,
    type: "Personal Project — Action",
    tech: ["Unity", "C#"],
    links: {
        live: "https://unrealitygames.itch.io/bombers"
    },
    image: placeholderImage("Bombers", "#475569"),
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "IIM — First year final project",
    role: "Solo Developer",
    highlights: [
        "Solo-developed every gameplay feature",
        "Used Mixamo for models/animation",
        "Modeled robots and boss animations in 3DS Max"
    ],
    featured: false,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "v1.0",
            msg: "Playable build released on itch.io",
            time: "IIM first year",
            status: "success"
        }
    ],
    snippet: `// Robot expansion controller
public class RobotExpansionController : MonoBehaviour
{
    public void ClaimSector(Sector sector) => sector.SetOwner(RobotFaction.Instance);
}
`,
    architecture: `
[ Machine City Simulation ]
          |
          v
[ Robot AI ] -- expansion & defense
          |
          v
[ Player Controller ] -- find humans, stop expansion
`
};
