import { placeholderImage } from "../../utils/helpers";

export const lsGroup = {
    id: "ls-group",
    category: "companies",
    title: "LS Group — XRTwin",
    subtitle: "VR industrial application developed in partnership with the CEA",
    description:
        "Developed and enhanced a VR industrial application (XRTwin) in collaboration with the CEA, using Unity, over a two-year work-study program.",
    longDescription: `
Two-year work-study program (alternance) at LS Group, Suresnes, working on XRTwin — a VR industrial application built in partnership with the CEA (French Alternative Energies and Atomic Energy Commission).

The work centered on improving UX and performance while following an MVC-inspired architecture, inside an Agile team running Scrum/Kanban and using GitFlow with CI/CD for delivery.
`,
    type: "VR / Industrial Software",
    tech: ["Unity", "C#", "Git", "CI/CD", "Agile Methods"],
    links: {},
    image: placeholderImage("XRTwin", "#22d3ee"),
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "2022 — 2024",
    role: "VR Developer",
    highlights: [
        "Developed and enhanced a VR industrial application (XRTwin) in collaboration with the CEA, using Unity",
        "Improved UX and performance following an MVC-inspired architecture",
        "Worked with GitFlow and CI/CD, contributing within Agile (Scrum/Kanban) teams"
    ],
    featured: false,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "Alternance",
            msg: "XRTwin VR industrial application — UX & performance improvements",
            time: "2022 - 2024",
            status: "success"
        }
    ],
    snippet: `// MVC-inspired VR interaction controller
public class XRInteractionController : MonoBehaviour
{
    [SerializeField] private XRModel model;
    [SerializeField] private XRView view;

    private void OnGrab(XRControllerEventArgs args)
    {
        model.Update(args.InteractionState);
        view.Render(model.CurrentState);
    }
}
`,
    architecture: `
[ VR Headset / Controllers ]
          |
          v
[ Unity Runtime ]
          |
          v
[ MVC-inspired layer ]
  - Model  (industrial twin state)
  - View   (VR rendering)
  - Controller (interactions)
          |
          v
[ XRTwin data / CEA industrial models ]
`
};
