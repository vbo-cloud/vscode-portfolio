import { withBasePath } from "../../utils/helpers";

export const realityAcademy = {
    id: "reality-academy",
    category: "companies",
    title: "Reality Academy — VR Training Tools",
    subtitle: "QA tooling and visual authoring system for VR e-learning content",
    description:
        "Six-month internship at Reality Academy: QA'd their VR training platform end-to-end, built a custom Behavior Tree authoring tool and a handful of others that cut testing time dramatically, and shipped two client VR/AR experiences for Reality Agency.",
    descriptionSections: [
        {
            title: "Reality Academy, part of the Reality VR studio",
            text: `Six-month internship (stage) at Reality, an immersive-content studio split into two divisions: Reality Agency, producing bespoke VR/AR/360° experiences for brands like Givenchy, Chanel, Nespresso, Amazon and DS Automobiles, and Reality Academy, an edtech division publishing a VR training catalog spanning cybersecurity, sales, workplace inclusion, management, mobility and HSE. I worked mainly for Reality Academy, under the technical director and product lead, alongside the team's four developers, and picked up two Reality Agency client projects along the way.`
        },
        {
            title: "Testing the SaaS, the VR app, and the training catalog",
            heading: "Quality Analysis, about 75% of the internship",
            text: `My role was to catch anything that shouldn't ship — UI issues, broken buttons, account-permission mistakes, licensing edge cases — across four areas: the SaaS admin platform (with its GOD / trainer-admin / trainer / learner / demo account hierarchy), the VR headset app, the VR and e-learning trainings themselves, and a tablet-streaming feature letting trainers watch what learners see live in their headset. The workflow was straightforward: developers built on a dev branch, I tested and either validated it for the test branch or sent a detailed report back, and the product lead did a final pass before production.`,
            images: [withBasePath("/projects/companies/reality-academy/gallery-1-hub.png")]
        },
        {
            title: "A 250+ item checklist across four VR headsets",
            text: `For the VR app specifically, I built dedicated QA accounts covering every account type and put together a test/acceptance checklist (parcours de tests) of more than 250 individual checks to run before any release could go to production — validated across four headset models (Pico G2 4K, Pico Neo 3, Oculus Quest, HTC Vive), with the Pico G2 4K as the daily driver and the others reserved for headset-specific quirks. I logged every issue on Monday.com and leaned on OBS's Replay Buffer to instantly save the last 30 seconds whenever a hard-to-reproduce bug showed up.`,
            images: [withBasePath("/projects/companies/reality-academy/gallery-2-test-checklist.png")]
        },
        {
            title: "Moving testing out of the headset",
            heading: "Tools built to speed up QA and training production",
            text: `Testing every change directly in a headset was slow: no skipping between modules mid-training, no easy way to screenshot, physically tiring over a full day, and no way to speed anything up. Since most of the bugs I found in-headset also reproduced in the Unity Editor, I moved the bulk of my testing there instead — solving three of those four problems immediately — and built a dedicated Editor Mode with a standard mouse-driven camera and clickable buttons (replacing the fixed, controller-only input the project shipped with), in its own scene so I could experiment without risking my colleagues' setups.`
        },
        {
            title: "Accelerator: 5x speed on 360° training videos",
            text: `Re-watching the same 2-3 minute 360° video for the tenth time while re-testing a fix was the single biggest time sink in QA. I wrote a small script to play training videos at up to 5x speed — a short build for a very large, immediate time saving on every re-test pass.`
        },
        {
            title: "A custom Behavior Tree for authoring VR trainings",
            text: `Training logic was scattered across scripts, Awake-time event registrations, button click handlers and animation events, which made it hard to tell what triggered the next step in a training or who "owned" a given interaction. I built a node-based Behavior Tree editor (inspired by Unreal's) using Unity's UI Builder, giving each training one clear, linear timeline instead of objects wired together every which way. At runtime a single BehaviorTree GameObject instantiates only the prefabs a given node needs and disables them once done, instead of populating the whole hierarchy upfront — the before/after on one of our trainings speaks for itself.`,
            images: [
                withBasePath("/projects/companies/reality-academy/gallery-3-behaviortree-before.png"),
                withBasePath("/projects/companies/reality-academy/gallery-4-behaviortree-after.png")
            ]
        },
        {
            title: "A camera-relative tool for positioning objects in 360° space",
            text: `360° video is played on a skybox, so moving through the scene gives no visual feedback and there are no landmarks to place objects against — the built-in Unity tools, all based on world-space coordinates, weren't built for that. I wrote a placement tool driven by the player camera instead: distance, horizontal angle and vertical angle relative to where the camera is looking, which matches how these objects actually need to be positioned relative to the viewer.`
        },
        {
            title: "Andra, a controller-free VR safety experience",
            heading: "Client projects for Reality Agency",
            text: `For Andra (the French national radioactive waste management agency), I built a VR experience with an intro and 3-4 video-360 modules, launchable individually or back-to-back, navigable without a controller, matching an exact XD menu design, with audio fade, an automatic return to the intro when the headset comes off, and a look-down gesture surfacing a HOME button. It shipped clean — no client feedback needed after the first version.`
        },
        {
            title: "Wimbledon, an AR feature and an asset-photography tool",
            text: `For Wimbledon, I imported 3D assets into Unity, built an AR feature that plays a video on tap (my first time touching AR, and much less painful than expected), and put together a particle system. Since Wimbledon wanted product shots of every asset against ten different backgrounds, I curated a matching color palette with coolors.co and wrote a small in-editor tool that captures the camera view at a target resolution and swaps the background automatically, instead of repositioning and re-exporting by hand for every combination.`
        }
    ],
    type: "VR / Tooling",
    showArchitectureTab: false,
    showWorkflowTab: false,
    tech: ["Unity", "C#", "AR", "Git"],
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
        "Built a 250+ item QA checklist validated across 4 VR headsets (Pico G2 4K, Pico Neo 3, Oculus Quest, HTC Vive) before every production release",
        "Designed and built a custom node-based Behavior Tree editor (Unity UI Builder) to untangle scattered VR training logic into one clear timeline",
        "Wrote an Accelerator tool playing 360° training videos at up to 5x speed, cutting QA re-test time dramatically",
        "Moved the bulk of QA out of the headset into a custom Unity Editor Mode, solving 3 of 4 headset-testing pain points",
        "Built a camera-relative object-placement tool for 360° scenes with no spatial landmarks",
        "Shipped Andra's VR safety experience with zero client feedback after the first release",
        "Built an AR video-playback feature and an automated asset-photography tool for Wimbledon"
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
    snippet: `// Speeds up 360 training video playback for repeated QA passes
public class TimeAccelerator : MonoBehaviour
{
    [SerializeField] private VideoController m_videoController;
    [SerializeField] private float m_speed = 5f;
    private bool m_isAccelerated;

    private void Toggle()
    {
        m_isAccelerated = !m_isAccelerated;
        float factor = m_isAccelerated ? m_speed : 1f;
        m_videoController.Player.playbackSpeed = factor;
        Time.timeScale = factor;
    }
}
`,
    architecture: `
[ BehaviorTree GameObject ]
          |
          v
[ Node graph (UI Builder) ] -- one clear timeline per training
          |
          v
[ Awake() ] -- instantiates INSTANCES_MUSTHAVE + first node's prefabs only
          |
          v
[ Node completes ] -- disables its prefabs, activates next node
          |
          v
[ Training ends ]

Cross-cutting: Editor Mode (headset-free testing) - Accelerator (5x video
speed) - camera-relative object placement for skybox-only 360 scenes
`
};
