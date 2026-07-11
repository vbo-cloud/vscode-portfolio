# Prompt Claude Code — Onglet PROBLEMS : puzzle points noir/blanc (façon The Witness)

## Contexte

Composant : `src/components/BottomPanel/BottomPanel.tsx`.

Le panneau bas a 4 onglets (`PROBLEMS`, `OUTPUT`, `DEBUG CONSOLE`, `TERMINAL`), la navigation entre onglets est déjà en place (`activeTab` state). Le contenu affiché est pour l'instant un placeholder générique `// Coming soon` quel que soit l'onglet actif.

Ce prompt implémente le mini-jeu easter egg de l'onglet `PROBLEMS` uniquement. Les 3 autres onglets gardent leur placeholder actuel — ne pas y toucher.

## Le jeu

Puzzle inspiré du mécanisme de séparation de points de *The Witness* :

- Une grille de **cases**, chacune pouvant contenir un point noir ou un point blanc (pas toutes les cases n'ont un point).
- Le joueur trace un **chemin** sur les **sommets** de la grille (pas les cases), d'un point d'entrée à un point de sortie situés sur le bord de la grille.
- Le chemin se construit en cliquant sur des sommets adjacents (haut/bas/gauche/droite) au dernier sommet posé, ou via les flèches du clavier — un sommet déjà utilisé ne peut pas être repris (pas d'auto-intersection).
- Une fois le chemin complété (entrée → sortie), on calcule les régions délimitées par ce chemin + les bords de la grille (remplissage par zones/flood-fill sur les cases).
- **Condition de victoire** : chaque région ne contient que des points d'une seule couleur (aucune région ne mélange noir et blanc). Une case sans point n'a pas de contrainte de couleur.
- En cas d'échec (chemin complet mais régions mixtes), afficher un état d'erreur clair et permettre de recommencer (reset du chemin).

## Comportement attendu

1. Génération d'une grille aléatoire résolvable au chargement de l'onglet `PROBLEMS` (ou premier clic dessus) — taille raisonnable pour tenir dans le panneau (ex. 4x4 ou 5x5 cases, ajustable si besoin de lisibilité).
   - Pour garantir la résolvabilité : générer d'abord une solution (un chemin valide arbitraire de l'entrée à la sortie), puis placer les points en respectant les régions ainsi découpées, plutôt que générer les points au hasard et espérer qu'une solution existe.
2. Affichage : grille en SVG ou Canvas (au choix, SVG probablement plus simple pour des points + lignes), taille adaptée à la hauteur du panneau (`h-48 md:h-64`, cf. `BottomPanel.tsx`).
3. Interaction : clic sur un sommet valide (adjacent au dernier point du chemin tracé, non déjà utilisé) l'ajoute au chemin. Un bouton ou raccourci pour réinitialiser le chemin en cours.
4. Une fois la sortie atteinte : évaluation immédiate, message de succès (ex. "Solved" discret) ou d'échec avec possibilité de reset.
5. Bouton "Nouveau puzzle" pour régénérer une nouvelle grille aléatoire.
6. Style : cohérent avec le thème existant, utiliser les variables CSS déjà en place dans le projet (`--bg-activity`, `--border`, `--accent`, `--text-primary`, `--text-secondary`) plutôt que des couleurs codées en dur, pour que le jeu suive automatiquement le thème actif (cf. `src/data/themes.ts` et `ThemeMarketplace`).
7. Le jeu ne doit se monter/tourner que quand l'onglet `PROBLEMS` est actif (éviter de faire tourner une logique de génération inutilement quand un autre onglet est affiché).

## Organisation du code

- Créer un composant dédié, ex. `src/components/BottomPanel/games/ProblemsPuzzle.tsx` (ou dossier équivalent si une convention différente existe déjà dans `BottomPanel/`).
- La logique de génération de grille / résolution / flood-fill peut être isolée dans un fichier utilitaire séparé (ex. `ProblemsPuzzle.logic.ts`) pour rester testable et lisible.
- Brancher ce composant dans `BottomPanel.tsx` : quand `activeTab === 'PROBLEMS'`, afficher `<ProblemsPuzzle />` à la place du placeholder ; les autres onglets gardent `// Coming soon`.

## Vérification attendue

- Build/lint passe sans erreur.
- Chargement de l'onglet PROBLEMS : une grille apparaît avec des points noir/blanc distincts visuellement.
- Un chemin invalide (auto-intersection) est impossible à tracer.
- Un puzzle résolu correctement déclenche un état de succès visible.
- Le bouton "Nouveau puzzle" génère une grille différente et toujours résolvable.
- Changer d'onglet puis revenir sur PROBLEMS ne casse pas l'état (comportement au choix : soit on garde le puzzle en cours, soit on le régénère — préciser le choix retenu dans le PR).
