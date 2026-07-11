# Prompt Claude Code — Onglet DEBUG CONSOLE : Démineur à bugs mobiles

## Contexte

Composants de référence déjà en place dans `src/components/BottomPanel/games/` :
- `GameRails.tsx` : rails partagés `DifficultyRail` (Easy/Normal/Hard, à gauche) et `ActionsRail` (boutons avec raccourci clavier affiché au-dessus, à droite — `onReset` optionnel + `onNew` toujours présent), plus `ACTION_BUTTON_CLASS`.
- `ProblemsPuzzle.tsx` / `ProblemsPuzzle.logic.ts` et `OutputPuzzle.tsx` / `OutputPuzzle.logic.ts` : exemples du pattern à suivre (composant + logique séparée, mesure de la largeur du plateau au montage pour remplir le panneau, `DIFFICULTY_CONFIG` par palier, focus clavier sur le conteneur, état drawing/solved/failed).

Ce prompt implémente le mini-jeu de l'onglet `DEBUG CONSOLE` uniquement. Ne pas toucher aux onglets `PROBLEMS`, `OUTPUT`, `TERMINAL`.

**Reprendre le même layout que les jeux existants** : `DifficultyRail` à gauche, plateau au centre, `ActionsRail` à droite (`Reset` → `esc`, `New` → `space`). Réutiliser `GameRails.tsx` tel quel plutôt que dupliquer.

## Le jeu — démineur, mais les bugs se déplacent

Base : démineur classique où les mines sont des **bugs** (icône `Bug` de `lucide-react`). Variante importante par rapport à un démineur standard : **les bugs se déplacent après chaque action du joueur**. Pas de drapeau dans cette version — la fonctionnalité est volontairement absente (un bug se déplaçant, un marquage de position n'aurait pas de sens).

### Boucle de jeu, à chaque clic du joueur sur une cellule cachée

1. **Révélation** de la cellule cliquée.
   - Si elle contient un bug **au moment du clic** → défaite immédiate (cf. section Défaite). La phase de déplacement ci-dessous n'a pas lieu.
   - Sinon → affiche le nombre de bugs actuellement dans les 8 cellules adjacentes. Si 0, cascade de révélation standard sur les cellules adjacentes (en te basant sur les positions de bugs courantes, avant déplacement).
2. **Phase de déplacement des bugs** (seulement si le clic n'a pas causé de défaite) : pour chaque bug encore sur le plateau,
   - Ses déplacements valides = cellules adjacentes (8 directions) qui sont à la fois **non révélées** et **non occupées par un autre bug**.
   - S'il existe au moins une cellule valide, le bug se déplace vers l'une d'entre elles, choisie aléatoirement.
   - Résoudre les déplacements de façon à ce que **deux bugs ne puissent jamais atterrir sur la même cellule** au même tour (traiter les bugs dans un ordre aléatoire, et retirer une cellule de destination des options dès qu'un autre bug l'a prise ce tour-ci).
   - **Si un bug n'a aucune cellule valide** (encerclé par des cellules déjà révélées et/ou d'autres bugs immobiles) → il est **capturé** : sa cellule est révélée (afficher brièvement l'icône du bug avec un état visuel distinct de la défaite, ex. animation de capture/disparition), puis il est retiré de la liste des bugs actifs. Cette cellule devient une cellule révélée normale pour la suite de la partie.
3. **Recalcul des nombres affichés** : comme les bugs ont bougé, recalculer et rafraîchir le nombre de bugs adjacents pour **toutes** les cellules déjà révélées (pas seulement celle qui vient d'être cliquée) — un chiffre affiché doit toujours refléter la position actuelle des bugs, pas leur position au moment de la révélation.
4. **Vérification de victoire** (cf. section Victoire).

### Premier clic toujours sûr

Ne pas placer les bugs avant le tout premier clic. Générer leur placement seulement après ce premier clic, en excluant la cellule cliquée et ses 8 voisines.

### Victoire

Toutes les cellules qui ne contiennent pas de bug **à l'instant présent** sont révélées. Comme les bugs finissent par se faire coincer et capturer au fil de la partie (cf. phase de déplacement), la partie doit naturellement converger vers un état gagnable au fur et à mesure que le joueur révèle du terrain — ne pas générer un ratio de bugs / taille de grille qui rendrait la capture de tous les bugs pratiquement impossible (calibrer empiriquement par difficulté, comme pour les autres jeux du panneau).

### Défaite

Le joueur révèle une cellule qui contient un bug au moment du clic → révéler tous les bugs restants, geler les interactions, état visuel d'échec clair (réutiliser l'esprit du `STATUS_COLOR`/`FAIL_RED` de `ProblemsPuzzle.tsx`). Bien distinguer visuellement cet état de la simple capture d'un bug encerclé (qui est une bonne nouvelle pour le joueur, pas un échec).

## Comportement des rails

- `DifficultyRail` : Easy/Normal/Hard pilotent la taille de grille et la densité de bugs (définir un `DIFFICULTY_CONFIG` dédié dans `DebugConsole.logic.ts`, dans le même esprit que celui de `ProblemsPuzzle.logic.ts`/`OutputPuzzle.logic.ts`, calibré empiriquement pour bien remplir le panneau `h-48 md:h-64`). Changer de difficulté relance une partie.
- `ActionsRail` :
  - **Reset** (`esc`) : relance la **même** disposition initiale de bugs, cellules révélées réinitialisées.
  - **New** (`space`) : génère une nouvelle disposition aléatoire.
- Victoire : état de succès bref (réutiliser le pattern de `ProblemsPuzzle.tsx` : highlight puis nouvelle partie automatique après ~1.5s).
- Défaite : grille figée jusqu'à ce que l'utilisateur clique Reset/New (ou clique sur le plateau, comme le fait `ProblemsPuzzle` en cas d'échec).

## Style

- Utiliser les variables CSS de thème existantes (`--bg-main`, `--bg-panel`, `--border`, `--accent`, `--text-primary`, `--text-secondary`, `--success`, `--warning`). Une couleur d'alerte codée en dur pour l'état de défaite est acceptable si aucune variable de thème n'existe pour ça (cf. `FAIL_RED` dans `ProblemsPuzzle.tsx`).
- Coloration classique des chiffres (1 bleu, 2 vert, 3 rouge, etc.) façon démineur traditionnel : acceptable en couleurs codées en dur, convention universellement reconnue du jeu — même exception que pour `FAIL_RED`.
- Icône `Bug` de `lucide-react`, taille cohérente avec la taille de cellule. Prévoir un état visuel distinct pour "bug capturé" (encerclement) vs "bug qui explose" (défaite).

## Organisation du code

- `src/components/BottomPanel/games/DebugConsole.tsx` (composant).
- `src/components/BottomPanel/games/DebugConsole.logic.ts` (génération de grille, placement différé des bugs, calcul des nombres adjacents, cascade de révélation, phase de déplacement/capture des bugs, détection victoire/défaite).
- Brancher dans `BottomPanel.tsx` : `activeTab === 'DEBUG CONSOLE'` → `<DebugConsole />`, à la place du placeholder `// Coming soon` (qui doit continuer à s'afficher uniquement pour `TERMINAL`).

## Vérification attendue

- Build/lint passe sans erreur.
- Premier clic jamais perdant, quelle que soit la difficulté.
- Après un clic qui ne cause pas de défaite, tous les bugs mobiles se déplacent d'une cellule (jamais vers une cellule révélée, jamais vers une cellule occupée par un autre bug), et les nombres affichés sur les cellules déjà révélées se mettent à jour en conséquence.
- Un bug totalement encerclé par des cellules révélées est automatiquement capturé (révélé, retiré du jeu), sans déclencher de défaite.
- Deux bugs ne se retrouvent jamais sur la même cellule après une phase de déplacement.
- Cascade de révélation fonctionne correctement sur les cellules à 0 bug adjacent.
- Victoire et défaite déclenchent l'état visuel attendu et bien distinct l'un de l'autre ; `Reset` relance la même grille initiale, `New` en génère une différente.
- Le jeu ne tourne (timers, etc.) que lorsque l'onglet `DEBUG CONSOLE` est actif.
