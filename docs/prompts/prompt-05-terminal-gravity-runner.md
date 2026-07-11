# Prompt Claude Code — Onglet TERMINAL : runner à inversion de gravité

## Contexte

Composants de référence déjà en place dans `src/components/BottomPanel/games/` : `GameRails.tsx` (rails partagés), `ProblemsPuzzle.tsx`/`.logic.ts`, `OutputPuzzle.tsx`/`.logic.ts`, `DebugConsole.tsx`/`.logic.ts`. Tous les trois sont des jeux **au tour par tour** (clic/clavier discret). Celui-ci est différent : c'est le premier jeu **temps réel** du panneau (boucle de jeu, animation continue).

Ce prompt implémente le mini-jeu de l'onglet `TERMINAL` uniquement. Ne pas toucher aux onglets `PROBLEMS`, `OUTPUT`, `DEBUG CONSOLE`.

Rappel de contexte produit : ce panneau est un composant web React (pas un vrai terminal ASCII), donc `<canvas>` + `requestAnimationFrame` sont disponibles sans contrainte particulière — même niveau de rendu que le jeu du dinosaure hors-ligne de Chrome.

## Références de gameplay

- **Chrome Dino (jeu hors-ligne de Chrome)** pour l'esthétique visuelle : silhouette monochrome plate, sol en pointillés qui défile, obstacles simples, ambiance minimaliste. Reprendre ce niveau graphique comme base, adapté aux couleurs du thème actif (cf. section Style).
- **Gravity Guy** (jeu mobile) pour la mécanique centrale : la touche `Espace` **n'ajoute pas un saut**, elle **inverse la gravité**. Le personnage se détache de la surface courante (sol ou plafond) et **tombe** vers la surface opposée sous l'effet de la gravité (accélération progressive, pas une téléportation instantanée) — il y a donc une brève fenêtre de transition pendant laquelle le personnage est en l'air entre les deux surfaces, ce qui demande d'anticiper l'appui sur `Espace` avant l'obstacle, pas au dernier moment.

## Différence structurelle avec un runner infini classique

Ce jeu **n'est pas un mode infini**. Il est découpé en **niveaux distincts, de longueur finie**, chacun se terminant par un **terminus** clairement visible (un portail/une ligne d'arrivée à l'écran, cf. section Visuel). Atteindre le terminus d'un niveau fait passer au niveau suivant, généré aléatoirement, avec une difficulté supérieure (vitesse de défilement plus rapide, obstacles plus fréquents/rapprochés). Percuter un obstacle met fin à la partie (game over), avec possibilité de relancer depuis le niveau 1.

## Mécanique de jeu détaillée

- Le personnage reste à une position horizontale fixe à l'écran ; le décor (sol, plafond, obstacles) défile de droite à gauche.
- Deux surfaces possibles : **sol** (bas de l'écran) et **plafond** (haut de l'écran). Le personnage court sur l'une des deux.
- Appui sur `Espace` : inverse le sens de la gravité. Le personnage quitte la surface courante, accélère vers la surface opposée, puis s'y stabilise (course reprend normalement). Pendant la transition, le personnage est vulnérable aux obstacles des deux surfaces si sa hitbox les croise.
- Obstacles : certains dépassent du **sol** (à éviter en étant au plafond), d'autres pendent du **plafond** (à éviter en étant au sol). À mesure que le niveau progresse, des séquences plus exigeantes peuvent apparaître (obstacles rapprochés demandant un flip rapide, doubles inversions successives).
- Collision détectée par intersection de rectangles (hitbox personnage vs hitbox obstacle), vérifiée à chaque frame.
- **État de démarrage** : au premier affichage de l'onglet (ou après un game over), afficher un écran d'attente "Press SPACE to start". Le premier appui sur `Espace` démarre le défilement (le personnage part au sol, sans inversion) ; ce n'est qu'à partir de l'appui suivant que `Espace` inverse la gravité — éviter toute ambiguïté sur la signification du tout premier appui.
- **Fin de niveau (terminus)** : quand le personnage franchit le repère de fin de niveau, transition brève (ex. flash ou léger ralenti) puis démarrage du niveau suivant, plus difficile.
- **Game over** : à la collision, arrêter le défilement, afficher le niveau atteint (et éventuellement le meilleur niveau atteint depuis l'ouverture de l'onglet, en mémoire — pas besoin de persistance entre sessions).

## Génération procédurale des niveaux — garantir l'équité

Comme pour les autres jeux du panneau, la génération doit garantir qu'un niveau reste **toujours surmontable par un joueur parfait** :
- Calculer, en fonction de la vitesse de défilement courante et du temps de transition d'un flip de gravité, un **espacement minimal** entre deux obstacles consécutifs (assez de temps pour réagir et compléter une transition avant le prochain obstacle).
- Ne jamais générer une séquence qui exigerait un double flip physiquement impossible dans le temps imparti à la vitesse courante.
- La difficulté croissante doit venir de la réduction progressive de cette marge (dans les limites de ce qui reste faisable), de l'augmentation de la vitesse de défilement, et de motifs plus variés (alternance rapprochée sol/plafond) — pas de générer des obstacles injustes.

## Rails et contrôles — adaptation nécessaire

Le pattern `DifficultyRail`/`ActionsRail` de `GameRails.tsx` ne peut pas être repris à l'identique ici : `Espace` est désormais la touche de jeu principale (flip), elle ne peut pas aussi servir de raccourci "New" comme dans les autres jeux.

- **Garder `DifficultyRail`** (Easy/Normal/Hard), mais avec un rôle différent : il fixe la vitesse de défilement de départ et la marge de sécurité initiale entre obstacles (le niveau de difficulté progresse ensuite pendant la partie quelle que soit la sélection). Changer de difficulté relance une partie depuis le niveau 1.
- **Remplacer `ActionsRail`** par un seul bouton **Restart** (raccourci clavier `R`, affiché au-dessus du bouton comme dans les autres jeux), qui relance une partie depuis le niveau 1 à tout moment.
- Le jeu ne doit tourner (boucle `requestAnimationFrame`, timers) que lorsque l'onglet `TERMINAL` est actif ; arrêter proprement la boucle au démontage/changement d'onglet et la reprendre à la réactivation (repartir de l'écran "Press SPACE to start" est acceptable si l'état n'a pas de sens à conserver en pause).

## Visuel

- Rendu en `<canvas>`, dimensionné pour occuper l'espace du panneau (`h-48 md:h-64`), en mesurant le conteneur au montage (même esprit que la mesure de largeur déjà faite dans `ProblemsPuzzle.tsx` pour adapter la grille à la largeur disponible).
- Esthétique façon Chrome Dino : formes plates simples (rectangles/silhouettes), sol et plafond en traits pointillés qui défilent, pas de dégradés ni de textures complexes.
- Utiliser les variables CSS de thème (`--bg-activity` ou `--bg-main` pour le fond, `--text-primary` pour le personnage et les obstacles, `--border`/`--text-secondary` pour les lignes de sol/plafond, `--accent` pour le terminus, `--success`/`--warning` pour les feedbacks) plutôt que des couleurs codées en dur, afin que le jeu suive le thème actif comme les autres.
- Le personnage doit visuellement indiquer clairement son orientation courante (au sol vs au plafond), par exemple une rotation à 180° du sprite lors du flip, pour que l'état de gravité soit toujours lisible d'un coup d'œil.
- Le terminus de fin de niveau doit être clairement identifiable (portail, ligne verticale marquée, ou libellé bref).

## Organisation du code

- `src/components/BottomPanel/games/Runner.tsx` (composant : boucle de jeu, rendu canvas, gestion clavier, montage/démontage).
- `src/components/BottomPanel/games/Runner.logic.ts` (fonctions pures : génération de niveau/obstacles, calcul de collision, calcul de la marge minimale équitable, physique de la chute/transition de gravité) — séparé du rendu pour rester testable, dans le même esprit que les autres jeux du panneau.
- Brancher dans `BottomPanel.tsx` : `activeTab === 'TERMINAL'` → `<Runner />`, en remplacement du placeholder `// Coming soon` (qui ne doit alors plus s'afficher pour aucun onglet, les 4 étant désormais couverts).

## Vérification attendue

- Build/lint passe sans erreur.
- Le jeu ne démarre pas tout seul à l'ouverture de l'onglet : écran "Press SPACE to start" visible d'abord.
- `Espace` inverse bien la gravité après le démarrage (pas un saut), avec une phase de transition visible et cohérente avec la vitesse courante.
- Un niveau généré est toujours surmontable par un joueur qui réagit correctement (pas de séquence d'obstacles physiquement injuste).
- Atteindre le terminus enchaîne sur un niveau suivant plus difficile ; percuter un obstacle déclenche un game over clair, distinct visuellement de la transition de niveau.
- `Restart` (bouton + touche `R`) relance depuis le niveau 1 à tout moment.
- Changer de difficulté (rail gauche) change la vitesse/marge de départ et relance une partie.
- La boucle de jeu s'arrête proprement quand on quitte l'onglet `TERMINAL` (pas de calcul en arrière-plan sur les autres onglets).
