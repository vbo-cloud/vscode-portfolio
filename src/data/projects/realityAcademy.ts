import { withBasePath } from "../../utils/helpers";

export const realityAcademy = {
    id: "reality-academy",
    category: "companies",
    title: "Reality Academy — VR Training Tools",
    subtitle: "QA tooling and visual authoring system for VR e-learning content",
    description: {
        en: "Six-month internship at Reality Academy: QA'd their VR training platform end-to-end, built a custom Behavior Tree authoring tool and a handful of others that cut testing time dramatically, and shipped two client VR/AR experiences for Reality Agency.",
        fr: "Stage de six mois chez Reality Academy : QA de bout en bout de leur plateforme de formation VR, création d'un outil d'édition Behavior Tree personnalisé et de plusieurs autres réduisant drastiquement le temps de test, et livraison de deux expériences VR/AR clients pour Reality Agency."
    },
    descriptionSections: [
        {
            title: { en: "Reality Academy, part of the Reality VR studio", fr: "Reality Academy, une division du studio Reality VR" },
            text: {
                en: `Six-month internship (stage) at Reality, an immersive-content studio split into two divisions: Reality Agency, producing bespoke VR/AR/360° experiences for brands like Givenchy, Chanel, Nespresso, Amazon and DS Automobiles, and Reality Academy, an edtech division publishing a VR training catalog spanning cybersecurity, sales, workplace inclusion, management, mobility and HSE. I worked mainly for Reality Academy, under the technical director and product lead, alongside the team's four developers, and picked up two Reality Agency client projects along the way.`,
                fr: `Stage de six mois chez Reality, un studio de contenu immersif divisé en deux divisions : Reality Agency, qui produit des expériences VR/AR/360° sur mesure pour des marques comme Givenchy, Chanel, Nespresso, Amazon et DS Automobiles, et Reality Academy, une division edtech publiant un catalogue de formations VR couvrant la cybersécurité, la vente, l'inclusion au travail, le management, la mobilité et l'HSE. J'ai principalement travaillé pour Reality Academy, sous la direction du directeur technique et du product lead, aux côtés des quatre développeurs de l'équipe, et j'ai repris au passage deux projets clients pour Reality Agency.`
            }
        },
        {
            title: { en: "Testing the SaaS, the VR app, and the training catalog", fr: "Tester le SaaS, l'application VR et le catalogue de formations" },
            heading: { en: "Quality Analysis, about 75% of the internship", fr: "Analyse qualité, environ 75% du stage" },
            text: {
                en: `My role was to catch anything that shouldn't ship — UI issues, broken buttons, account-permission mistakes, licensing edge cases — across four areas: the SaaS admin platform (with its GOD / trainer-admin / trainer / learner / demo account hierarchy), the VR headset app, the VR and e-learning trainings themselves, and a tablet-streaming feature letting trainers watch what learners see live in their headset. The workflow was straightforward: developers built on a dev branch, I tested and either validated it for the test branch or sent a detailed report back, and the product lead did a final pass before production.`,
                fr: `Mon rôle était de repérer tout ce qui ne devait pas partir en production — problèmes d'UI, boutons cassés, erreurs de permissions de compte, cas limites de licence — sur quatre périmètres : la plateforme d'administration SaaS (avec sa hiérarchie de comptes GOD / trainer-admin / trainer / learner / démo), l'application VR sur casque, les formations VR et e-learning elles-mêmes, et une fonctionnalité de streaming vers tablette permettant aux formateurs de voir en direct ce que les apprenants voient dans leur casque. Le workflow était simple : les développeurs codaient sur une branche dev, je testais puis validais pour la branche test ou renvoyais un rapport détaillé, et le product lead faisait une dernière passe avant la production.`
            },
            images: [withBasePath("/projects/companies/reality-academy/gallery-1-hub.png")]
        },
        {
            title: { en: "A 250+ item checklist across four VR headsets", fr: "Une checklist de plus de 250 points sur quatre casques VR" },
            text: {
                en: `For the VR app specifically, I built dedicated QA accounts covering every account type and put together a test/acceptance checklist (parcours de tests) of more than 250 individual checks to run before any release could go to production — validated across four headset models (Pico G2 4K, Pico Neo 3, Oculus Quest, HTC Vive), with the Pico G2 4K as the daily driver and the others reserved for headset-specific quirks. I logged every issue on Monday.com and leaned on OBS's Replay Buffer to instantly save the last 30 seconds whenever a hard-to-reproduce bug showed up.`,
                fr: `Pour l'application VR en particulier, j'ai créé des comptes de QA dédiés couvrant chaque type de compte et construit un parcours de tests de plus de 250 vérifications individuelles à effectuer avant toute mise en production — validé sur quatre modèles de casques (Pico G2 4K, Pico Neo 3, Oculus Quest, HTC Vive), le Pico G2 4K servant de casque quotidien et les autres réservés aux particularités propres à chaque matériel. Je consignais chaque problème sur Monday.com et m'appuyais sur le Replay Buffer d'OBS pour sauvegarder instantanément les 30 dernières secondes dès qu'un bug difficile à reproduire apparaissait.`
            },
            images: [withBasePath("/projects/companies/reality-academy/gallery-2-test-checklist.png")]
        },
        {
            title: { en: "Moving testing out of the headset", fr: "Sortir les tests du casque" },
            heading: { en: "Tools built to speed up QA and training production", fr: "Des outils construits pour accélérer la QA et la production des formations" },
            text: {
                en: `Testing every change directly in a headset was slow: no skipping between modules mid-training, no easy way to screenshot, physically tiring over a full day, and no way to speed anything up. Since most of the bugs I found in-headset also reproduced in the Unity Editor, I moved the bulk of my testing there instead — solving three of those four problems immediately — and built a dedicated Editor Mode with a standard mouse-driven camera and clickable buttons (replacing the fixed, controller-only input the project shipped with), in its own scene so I could experiment without risking my colleagues' setups.`,
                fr: `Tester chaque changement directement dans un casque était lent : impossible de sauter entre les modules en cours de formation, pas de moyen simple de faire une capture d'écran, physiquement fatigant sur une journée complète, et aucun moyen d'accélérer quoi que ce soit. Comme la plupart des bugs trouvés en casque se reproduisaient aussi dans l'éditeur Unity, j'ai déplacé l'essentiel de mes tests là-bas — résolvant immédiatement trois de ces quatre problèmes — et construit un Editor Mode dédié avec une caméra pilotée à la souris et des boutons cliquables (remplaçant l'input fixe, uniquement à la manette, livré avec le projet), dans sa propre scène pour pouvoir expérimenter sans risquer les setups de mes collègues.`
            }
        },
        {
            title: { en: "Accelerator: 5x speed on 360° training videos", fr: "Accélérateur : vitesse x5 sur les vidéos de formation 360°" },
            text: {
                en: `Re-watching the same 2-3 minute 360° video for the tenth time while re-testing a fix was the single biggest time sink in QA. I wrote a small script to play training videos at up to 5x speed — a short build for a very large, immediate time saving on every re-test pass.`,
                fr: `Revisionner pour la dixième fois la même vidéo 360° de 2-3 minutes en re-testant un correctif était de loin la plus grosse perte de temps en QA. J'ai écrit un petit script pour lire les vidéos de formation jusqu'à 5x plus vite — court à développer, pour un gain de temps immédiat et considérable à chaque passe de re-test.`
            }
        },
        {
            title: { en: "A custom Behavior Tree for authoring VR trainings", fr: "Un Behavior Tree personnalisé pour créer les formations VR" },
            text: {
                en: `Training logic was scattered across scripts, Awake-time event registrations, button click handlers and animation events, which made it hard to tell what triggered the next step in a training or who "owned" a given interaction. I built a node-based Behavior Tree editor (inspired by Unreal's) using Unity's UI Builder, giving each training one clear, linear timeline instead of objects wired together every which way. At runtime a single BehaviorTree GameObject instantiates only the prefabs a given node needs and disables them once done, instead of populating the whole hierarchy upfront — the before/after on one of our trainings speaks for itself.`,
                fr: `La logique des formations était éparpillée entre scripts, enregistrements d'événements au Awake, gestionnaires de clic de bouton et événements d'animation, ce qui rendait difficile de savoir ce qui déclenchait l'étape suivante d'une formation ou qui "possédait" une interaction donnée. J'ai construit un éditeur de Behavior Tree à base de nœuds (inspiré de celui d'Unreal) avec l'UI Builder d'Unity, donnant à chaque formation une timeline linéaire et claire au lieu d'objets reliés dans tous les sens. Au runtime, un unique GameObject BehaviorTree n'instancie que les prefabs dont un nœud donné a besoin et les désactive une fois terminé, au lieu de peupler toute la hiérarchie dès le départ — le avant/après sur l'une de nos formations parle de lui-même.`
            },
            images: [
                withBasePath("/projects/companies/reality-academy/gallery-3-behaviortree-before.png"),
                withBasePath("/projects/companies/reality-academy/gallery-4-behaviortree-after.png")
            ]
        },
        {
            title: { en: "A camera-relative tool for positioning objects in 360° space", fr: "Un outil relatif à la caméra pour positionner des objets dans un espace 360°" },
            text: {
                en: `360° video is played on a skybox, so moving through the scene gives no visual feedback and there are no landmarks to place objects against — the built-in Unity tools, all based on world-space coordinates, weren't built for that. I wrote a placement tool driven by the player camera instead: distance, horizontal angle and vertical angle relative to where the camera is looking, which matches how these objects actually need to be positioned relative to the viewer.`,
                fr: `La vidéo 360° est jouée sur une skybox, donc se déplacer dans la scène ne donne aucun retour visuel et il n'y a aucun repère pour positionner des objets — les outils natifs d'Unity, tous basés sur des coordonnées en espace monde, n'étaient pas conçus pour ça. J'ai écrit à la place un outil de positionnement piloté par la caméra du joueur : distance, angle horizontal et angle vertical relatifs à la direction du regard de la caméra, ce qui correspond à la façon dont ces objets doivent réellement être positionnés par rapport au spectateur.`
            }
        },
        {
            title: { en: "Andra, a controller-free VR safety experience", fr: "Andra, une expérience VR de sécurité sans manette" },
            heading: { en: "Client projects for Reality Agency", fr: "Projets clients pour Reality Agency" },
            text: {
                en: `For Andra (the French national radioactive waste management agency), I built a VR experience with an intro and 3-4 video-360 modules, launchable individually or back-to-back, navigable without a controller, matching an exact XD menu design, with audio fade, an automatic return to the intro when the headset comes off, and a look-down gesture surfacing a HOME button. It shipped clean — no client feedback needed after the first version.`,
                fr: `Pour l'Andra (l'agence nationale française de gestion des déchets radioactifs), j'ai construit une expérience VR avec une intro et 3-4 modules vidéo 360°, lançables individuellement ou à la suite, navigable sans manette, respectant fidèlement une maquette de menu XD, avec fondu audio, un retour automatique à l'intro quand le casque est retiré, et un geste de regard vers le bas faisant apparaître un bouton HOME. Elle est partie sans accroc — aucun retour client nécessaire après la première version.`
            }
        },
        {
            title: { en: "Wimbledon, an AR feature and an asset-photography tool", fr: "Wimbledon, une fonctionnalité AR et un outil de photographie d'assets" },
            text: {
                en: `For Wimbledon, I imported 3D assets into Unity, built an AR feature that plays a video on tap (my first time touching AR, and much less painful than expected), and put together a particle system. Since Wimbledon wanted product shots of every asset against ten different backgrounds, I curated a matching color palette with coolors.co and wrote a small in-editor tool that captures the camera view at a target resolution and swaps the background automatically, instead of repositioning and re-exporting by hand for every combination.`,
                fr: `Pour Wimbledon, j'ai importé des assets 3D dans Unity, construit une fonctionnalité AR qui lance une vidéo au tap (ma première fois avec l'AR, et bien moins pénible que prévu), et assemblé un système de particules. Comme Wimbledon voulait des photos produit de chaque asset sur dix fonds différents, j'ai composé une palette de couleurs assortie avec coolors.co et écrit un petit outil dans l'éditeur qui capture la vue caméra à une résolution cible et change le fond automatiquement, au lieu de repositionner et réexporter à la main pour chaque combinaison.`
            }
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
    ]
};
