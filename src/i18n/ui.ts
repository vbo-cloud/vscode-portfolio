import type { Language } from '../context/LanguageContext';

/** Chrome/UI copy — static app strings, as opposed to per-project content (see src/data/projects). */
export const UI_STRINGS = {
    'breadcrumb.home': { en: 'Home', fr: 'Accueil' },
    'breadcrumb.projects': { en: 'Projects', fr: 'Projets' },
    'breadcrumb.contact': { en: 'Contact', fr: 'Contact' },
    'breadcrumb.resume': { en: 'Resume', fr: 'CV' },

    // Home — shared
    'home.greeting': { en: "Hello, I'm", fr: 'Bonjour, je suis' },
    'home.currentRole': { en: 'Current Role', fr: 'Poste actuel' },
    'home.status': { en: 'Status', fr: 'Statut' },
    'home.statusValue': { en: 'Looking for a new opportunity', fr: "À la recherche d'une nouvelle opportunité" },
    'home.whatIWorkOn': { en: 'What I Work On', fr: 'Sur quoi je travaille' },
    'home.coreStack': { en: 'Core Stack', fr: 'Stack principale' },
    'home.pinnedDeployments': { en: 'Pinned Deployments', fr: 'Déploiements épinglés' },
    'home.exploreProjects': { en: 'Explore Projects', fr: 'Explorer les projets' },
    'home.exploreAllProjects': { en: 'Explore All Projects', fr: 'Explorer tous les projets' },
    'home.recentActivity': { en: 'Recent Activity', fr: 'Activité récente' },
    'home.codeContributions': { en: 'Code Contributions', fr: 'Contributions de code' },
    'home.codeContributionsDesc': { en: 'Consistent activity throughout the year across various engineering domains.', fr: "Une activité soutenue tout au long de l'année, à travers différents domaines d'ingénierie." },
    'home.easySubtitle': { en: 'A Cloud Engineer (Azure) automating infrastructure and orchestrating AI pipelines — from a background in VR/game development to cloud architecture.', fr: "Ingénieur Cloud (Azure), j'automatise l'infrastructure et j'orchestre des pipelines IA — venu du développement VR/jeu vidéo vers l'architecture cloud." },
    'home.initializing': { en: '// Initializing Portfolio System...', fr: '// Initialisation du système Portfolio...' },
    'home.currentRoleCode': { en: 'current_role:', fr: 'role_actuel:' },
    'home.statusCode': { en: 'status:', fr: 'statut:' },

    // Home — vscode layout
    'home.portfolioTitle': { en: "Vincent Boutin's Portfolio", fr: 'Portfolio de Vincent Boutin' },
    'home.portfolioSubtitle': { en: 'Cloud Engineer (Azure) — from game dev to cloud engineering', fr: 'Ingénieur Cloud (Azure) — du jeu vidéo à l\'ingénierie cloud' },
    'home.start': { en: 'Start', fr: 'Démarrer' },
    'home.readOverview': { en: 'Read Portfolio Overview', fr: "Lire l'aperçu du portfolio" },
    'home.openTerminal': { en: 'Open Integrated Terminal', fr: 'Ouvrir le terminal intégré' },
    'home.recentProjects': { en: 'Recent Projects', fr: 'Projets récents' },
    'home.skillsExpertise': { en: 'Skills & Expertise', fr: 'Compétences & Expertise' },
    'home.featuredWalkthrough': { en: 'Featured Walkthrough', fr: 'Présentation en vedette' },
    'home.spotlight': { en: 'Spotlight:', fr: 'À la une :' },
    'home.flagshipProject': { en: 'Flagship Project', fr: 'Projet phare' },
    'home.spotlightDesc': { en: 'A deep dive into my most sophisticated work. Click to see the architecture and implementation.', fr: "Une plongée dans mon travail le plus abouti. Cliquez pour voir l'architecture et l'implémentation." },
    'home.openSource': { en: 'Open Source Contributions', fr: 'Contributions Open Source' },
    'home.openSourceDesc': { en: 'Check out how I contribute back to the community and collaborate on scalable systems.', fr: 'Découvrez comment je contribue à la communauté et collabore sur des systèmes scalables.' },
    'home.availableForProjects': { en: 'Currently available for projects', fr: 'Actuellement disponible pour des projets' },
    'home.lastIndexed': { en: 'Last indexed:', fr: 'Dernière indexation :' },

    // Projects page
    'projects.explorerTitle': { en: 'PROJECTS EXPLORER', fr: 'EXPLORATEUR DE PROJETS' },
    'projects.explorerTitleShort': { en: 'PROJECTS', fr: 'PROJETS' },
    'projects.listView': { en: 'List View', fr: 'Vue liste' },
    'projects.gridView': { en: 'Grid View', fr: 'Vue grille' },
    'projects.filter': { en: 'Filter', fr: 'Filtrer' },
    'projects.filters': { en: 'Filters', fr: 'Filtres' },
    'projects.title': { en: 'Project Portfolio', fr: 'Portfolio de projets' },
    'projects.subtitle': { en: 'A curated collection of my most significant engineering projects, ranging from immersive web experiences to low-level system internal tools.', fr: "Une sélection de mes projets d'ingénierie les plus significatifs, des expériences web immersives aux outils internes bas niveau." },
    'projects.techStack': { en: 'Tech Stack', fr: 'Stack technique' },
    'projects.coreLanguages': { en: 'Core Languages', fr: 'Langages principaux' },
    'projects.filterByTech': { en: 'Filter by Technology', fr: 'Filtrer par technologie' },
    'projects.filterByLang': { en: 'Filter by Language', fr: 'Filtrer par langage' },
    'projects.viewCaseStudy': { en: 'View Case Study', fr: "Voir l'étude de cas" },
    'projects.flagship': { en: 'Flagship', fr: 'Phare' },
    'projects.noResults': { en: 'No extensions found matching your criteria.', fr: 'Aucune extension trouvée correspondant à vos critères.' },

    // Project sections (all_projects grouping)
    'sections.cloud.title': { en: 'Cloud Engineering', fr: 'Ingénierie Cloud' },
    'sections.cloud.description': { en: 'Flagship cloud & AI systems — Azure infrastructure, multi-agent pipelines, and end-to-end platform work.', fr: "Systèmes cloud & IA phares — infrastructure Azure, pipelines multi-agents et travail de plateforme de bout en bout." },
    'sections.companies.title': { en: 'Companies', fr: 'Entreprises' },
    'sections.videogames.title': { en: 'Video Games', fr: 'Jeux vidéo' },
    'sections.technical.title': { en: 'Technical Projects', fr: 'Projets techniques' },
    'sections.games.title': { en: 'Games', fr: 'Jeux' },

    // Detail page
    'detail.technologies': { en: 'Technologies', fr: 'Technologies' },
    'detail.resources': { en: 'Resources', fr: 'Ressources' },
    'detail.lastUpdate': { en: 'Last Update', fr: 'Dernière mise à jour' },
    'detail.recently': { en: 'Recently', fr: 'Récemment' },
    'detail.license': { en: 'License', fr: 'Licence' },
    'detail.backToAssignments': { en: 'Back to Assignments', fr: 'Retour aux projets' },
    'detail.launchApplication': { en: 'Launch Application', fr: "Lancer l'application" },
    'detail.sourceCode': { en: 'Source Code', fr: 'Code source' },
    'detail.runProject': { en: 'Run Project', fr: 'Lancer le projet' },
    'detail.repository': { en: 'Repository', fr: 'Dépôt' },
    'detail.narrative': { en: 'Narrative', fr: 'Récit' },
    'detail.video': { en: 'Video', fr: 'Vidéo' },
    'detail.gallery': { en: 'Gallery', fr: 'Galerie' },
    'detail.userJourney': { en: 'User Journey', fr: 'Parcours utilisateur' },
    'detail.systemArchitecture': { en: 'System Architecture', fr: 'Architecture système' },
    'detail.workflow': { en: 'Workflow', fr: 'Workflow' },
    'detail.coreImplementation': { en: 'Core Implementation', fr: 'Implémentation principale' },
    'detail.logsAnalytics': { en: 'Logs Analytics', fr: 'Analyse des logs' },
    'detail.workingOnIt': { en: 'Working on it', fr: 'Travail en cours' },
    'detail.tabDescription': { en: 'Description', fr: 'Description' },
    'detail.tabArchitecture': { en: 'Architecture', fr: 'Architecture' },

    // PDF / Resume
    'pdf.resume': { en: 'RESUME', fr: 'CV' },
    'pdf.iframeTitle': { en: 'Vincent Boutin — Interactive Resume', fr: 'Vincent Boutin — CV interactif' },

    // Contact
    'contact.header': { en: 'CONTACT_FORM', fr: 'FORMULAIRE_CONTACT' },
    'contact.letsTalk': { en: "Let's talk", fr: 'Discutons' },
    'contact.subtitle': { en: "A question, an opportunity, or just want to say hi — drop a message and I'll get back to you.", fr: "Une question, une opportunité, ou juste envie de dire bonjour — laissez un message, je vous répondrai." },
    'contact.name': { en: 'Name', fr: 'Nom' },
    'contact.namePlaceholder': { en: 'Your name', fr: 'Votre nom' },
    'contact.email': { en: 'Email', fr: 'Email' },
    'contact.subject': { en: 'Subject', fr: 'Sujet' },
    'contact.subjectPlaceholder': { en: "What's this about?", fr: 'De quoi voulez-vous parler ?' },
    'contact.message': { en: 'Message', fr: 'Message' },
    'contact.messagePlaceholder': { en: "What's on your mind?", fr: 'Qu\'avez-vous en tête ?' },
    'contact.sending': { en: 'Sending…', fr: 'Envoi…' },
    'contact.sendMessage': { en: 'Send message', fr: 'Envoyer le message' },
    'contact.wakingBackend': { en: 'First message after a while can take a couple seconds to wake up the backend.', fr: "Le premier message après un moment d'inactivité peut prendre quelques secondes le temps que le serveur se réveille." },
    'contact.sent': { en: "Message sent — I'll get back to you soon.", fr: 'Message envoyé — je vous répondrai bientôt.' },
    'contact.error': { en: 'Something went wrong — please try again.', fr: "Une erreur s'est produite — veuillez réessayer." },
    'contact.directChannels': { en: 'Direct channels', fr: 'Canaux directs' },

    // Sidebar navigation (Easy Mode bookmarks)
    'nav.bookmarks': { en: 'Bookmarks', fr: 'Favoris' },
    'nav.homeOverview': { en: 'Home Overview', fr: "Aperçu de l'accueil" },
    'nav.featuredProjects': { en: 'Featured Projects', fr: 'Projets en vedette' },
    'nav.getInTouch': { en: 'Get in Touch', fr: 'Me contacter' },

    // Settings panel
    'settings.title': { en: 'Settings', fr: 'Paramètres' },
    'settings.search': { en: 'Search settings', fr: 'Rechercher un paramètre' },
    'settings.workbench': { en: 'Workbench', fr: 'Espace de travail' },
    'settings.colorTheme': { en: 'Color Theme', fr: 'Thème de couleurs' },
    'settings.installThemes': { en: 'Install Additional Color Themes...', fr: 'Installer des thèmes de couleurs supplémentaires...' },
    'settings.portfolio': { en: 'Portfolio', fr: 'Portfolio' },
    'settings.authenticLayout': { en: 'Authentic VS Code Layout', fr: 'Mise en page VS Code authentique' },
    'settings.authenticLayoutDesc': { en: 'Toggle between high-fidelity VS Code and Stylish home layouts.', fr: 'Bascule entre la mise en page VS Code fidèle et la mise en page Stylée.' },
    'settings.language': { en: 'Language', fr: 'Langue' },
    'settings.languageDesc': { en: 'Choose the display language for the portfolio and the embedded resume.', fr: "Choisissez la langue d'affichage du portfolio et du CV intégré." },
    'settings.openSettingsJson': { en: 'Open settings.json', fr: 'Ouvrir settings.json' },
    'settings.configureThemes': { en: 'Configure Themes', fr: 'Configurer les thèmes' },
} satisfies Record<string, { en: string; fr: string }>;

export type UIKey = keyof typeof UI_STRINGS;

export const t = (key: UIKey, lang: Language): string => UI_STRINGS[key][lang];
