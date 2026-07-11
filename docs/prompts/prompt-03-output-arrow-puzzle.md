# Prompt Claude Code — Onglet OUTPUT : puzzle de chaînes de flèches emmêlées

## Contexte

Composant existant de référence : `src/components/BottomPanel/games/ProblemsPuzzle.tsx` (+ `ProblemsPuzzle.logic.ts`), branché dans `src/components/BottomPanel/BottomPanel.tsx` sous `activeTab === 'PROBLEMS'`.

Ce prompt implémente le mini-jeu de l'onglet `OUTPUT` uniquement. Ne pas toucher aux onglets `PROBLEMS`, `DEBUG CONSOLE`, `TERMINAL`.

**Contrainte forte : reprendre le même design et le même emplacement des contrôles que `ProblemsPuzzle`** (cf. capture jointe au prompt précédent) :
- rail gauche vertical : sélecteur de difficulté (`EASY` / `NORMAL` / `HARD`), même style de boutons.
- zone centrale : le plateau de jeu (SVG), centré, occupant l'espace restant.
- rail droit vertical : boutons d'action avec leur raccourci clavier affiché au-dessus (`esc` → `Reset`, `space` → `New`), même style de boutons.

Réutiliser les classes/structure de `ProblemsPuzzle.tsx` (`ACTION_BUTTON_CLASS`, rail de difficulté, `tabIndex`/`onKeyDown` sur le conteneur, focus au montage) plutôt que réinventer un style différent.

**Suggestion facultative** : si cela reste simple, envisager d'extraire les rails difficulté/actions en composants partagés (ex: `DifficultyRail`, `ActionsRail`) dans `src/components/BottomPanel/games/` pour éviter la duplication entre `ProblemsPuzzle` et ce nouveau jeu. Ne pas le faire si ça complexifie inutilement ce prompt — dans ce cas, dupliquer comme pour Problems.

## Le jeu

Grille de cellules. Les cellules sont regroupées en **chaînes** (suites de cellules adjacentes, façon serpent), chaque chaîne ayant une couleur/identifiant propre. Chaque cellule d'une chaîne affiche une flèche indiquant le sens de progression vers la sortie de la chaîne.

- Une chaîne peut être **extraite** (cliquée) si le chemin entre son extrémité de sortie et le bord de la grille est entièrement dégagé de toute autre chaîne. Dans ce cas, la chaîne glisse hors de la grille et disparaît (l'« output »).
- Si une autre chaîne bloque le passage, la chaîne cliquée reste bloquée : afficher un feedback visuel clair et bref (ex. léger flash/secousse) sans la faire disparaître.
- Libérer une chaîne peut dégager le passage d'autres chaînes qui étaient bloquées derrière elle (effet de cascade).
- **Condition de victoire** : toutes les chaînes ont été extraites.

## Génération du puzzle (garantir la résolvabilité)

Ne pas placer les chaînes au hasard puis espérer qu'une solution existe. Générer **à l'envers** :
1. Partir d'une grille vide.
2. Construire un ordre d'extraction cible, puis « remplir » la grille chaîne par chaîne dans l'ordre inverse de cet ordre : chaque nouvelle chaîne est ajoutée dans une position/forme (marche aléatoire de cellules adjacentes libres) qui n'obstrue aucune chaîne déjà placée sur leur propre chemin de sortie déjà validé.
3. Une fois toutes les chaînes placées, mélanger uniquement l'ordre d'affichage (pas la géométrie) — la solvabilité est garantie par construction.

Adapter la difficulté sur le nombre de chaînes et la taille de grille, dans le même esprit que `DIFFICULTY_CONFIG` de `ProblemsPuzzle.logic.ts` (des constantes `rows`/`cols`/nombre de chaînes par palier, calibrées empiriquement plutôt que théoriques) :
- `easy` : peu de chaînes, grille petite, chemins de sortie courts.
- `normal` : intermédiaire.
- `hard` : plus de chaînes, grille plus grande, chemins plus longs/emmêlés.

## Interaction

- Clic sur une cellule d'une chaîne : tente l'extraction (cf. règles ci-dessus).
- Navigation clavier : à minima, permettre de sélectionner une chaîne au clavier si c'est raisonnable à implémenter (sinon, souris/tactile uniquement est acceptable pour ce jeu — contrairement à Problems, la mécanique n'est pas un tracé de chemin séquentiel).
- Bouton **Reset** (raccourci `esc`) : restaure l'état initial du puzzle courant (annule toutes les extractions faites).
- Bouton **New** (raccourci `space`) : génère un nouveau puzzle aléatoire pour la difficulté sélectionnée.
- Changer de difficulté régénère un nouveau puzzle (comme `changeDifficulty` dans `ProblemsPuzzle.tsx`).

## Style

- Utiliser les variables CSS de thème existantes (`--accent`, `--border`, `--text-primary`, `--text-secondary`, `--bg-main`, `--success`, etc.) — pas de couleurs codées en dur, sauf éventuellement une couleur d'alerte ponctuelle comme `FAIL_RED` dans `ProblemsPuzzle.tsx`.
- Chaque chaîne doit être visuellement distincte (teinte différente), en dérivant les couleurs proceduralement (cf. usage de `hsl(...)` avec un angle de teinte variable dans `ProblemsPuzzle.tsx`) plutôt qu'une palette codée en dur à taille fixe, pour supporter un nombre variable de chaînes selon la difficulté.
- Rendu en SVG, dimensionné pour tenir dans le panneau (`h-48 md:h-64`).
- Le jeu ne doit tourner (génération, timers) que lorsque l'onglet `OUTPUT` est actif.

## Organisation du code

- `src/components/BottomPanel/games/OutputPuzzle.tsx` (composant).
- `src/components/BottomPanel/games/OutputPuzzle.logic.ts` (génération, détection de blocage, extraction, cascade).
- Brancher dans `BottomPanel.tsx` : `activeTab === 'OUTPUT'` → `<OutputPuzzle />`, à la place du placeholder `// Coming soon`.

## Vérification attendue

- Build/lint passe sans erreur.
- Une grille de chaînes emmêlées s'affiche à l'ouverture de l'onglet OUTPUT.
- Cliquer une chaîne dont la sortie est dégagée la fait disparaître ; une chaîne bloquée reste en place avec un feedback visuel.
- Un puzzle généré est toujours entièrement résolvable (il existe un ordre d'extraction qui vide la grille).
- Reset restaure l'état initial, New génère un puzzle différent.
- Changement de difficulté cohérent avec le rail gauche existant (même style que Problems).
