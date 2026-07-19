import { withBasePath } from "../../utils/helpers";

export const realityAcademy = {
    id: "reality-academy",
    category: "companies",
    title: "Reality Academy — VR Training Tools",
    subtitle: "QA tooling and visual authoring system for VR e-learning content",
    description:
        "Designed a visual graph system to build VR training content and developed tools to speed up QA and Unity workflows for VR e-learning content.",
    longDescription: `
Internship at Reality Academy, Bagnolet, within a VR e-learning content team.

The core deliverable was a visual graph system letting non-developers author VR training scenarios without touching code, alongside internal tools that sped up QA and Unity workflows for the team. I also contributed directly to QA and to improvements of the VR e-learning content and its companion website, and set up a test/acceptance plan (cahier de recette) to keep production releases smooth.
`,
    type: "VR / Tooling",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unity", "C#", "Git"],
    links: {},
    image: withBasePath("/projects/companies/reality-academy/cover.jpg"),
    pdfs: [
        { label: "Internship Report", path: withBasePath("/projects/companies/reality-academy/internship-report.pdf") }
    ],
    imageStyle: {
        maxWidth: "1000px",
        maxHeight: "800px",
        objectFit: "contain"
    },

    date: "2022",
    role: "QA Tester / Tool Programmer",
    highlights: [
        "Designed a visual graph system to build VR training content",
        "Developed tools to speed up QA and Unity workflows",
        "Contributed to QA and improvements of VR e-learning content and website",
        "Set up and followed a test/acceptance plan (cahier de recette) for smooth production releases"
    ],
    featured: false,
    languages: [
        { name: "C#", percent: 100, color: "#68217A" }
    ],
    deployHistory: [
        {
            version: "Stage",
            msg: "Visual graph authoring tool + QA tooling for VR e-learning content",
            time: "2022",
            status: "success"
        }
    ],
    snippet: `// Visual node graph -> VR training scenario
public class TrainingGraphNode
{
    public string Id;
    public string Instruction;
    public List<TrainingGraphNode> NextSteps = new();

    public void Execute(VRTraineeContext context) => context.Play(Instruction);
}
`,
    architecture: `
[ Visual Graph Editor ] -- authored by non-devs
          |
          v
[ Training Graph Data ]
          |
          v
[ Unity VR Runtime ] -- plays scenario steps
          |
          v
[ QA tooling ] -- speeds up test cycles
`
};
