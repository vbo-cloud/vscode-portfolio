# Prompt Claude Code — Onglet TERMINAL : Hunt the Wumpus (commandes tapées)

> Remplace `prompt-05-terminal-gravity-runner.md`, abandonné (trop de level design nécessaire pour être intéressant). Conservé à titre d'historique, ne plus l'exécuter.

## Étape 0 — retirer le runner abandonné

Le jeu précédemment prévu pour cet onglet (runner à inversion de gravité) est abandonné (trop de level design nécessaire pour rester intéressant). Avant d'implémenter le nouveau jeu :

- Supprimer `src/components/BottomPanel/games/Runner.tsx` et `src/components/BottomPanel/games/Runner.logic.ts`.
- Dans `src/components/BottomPanel/BottomPanel.tsx`, retirer l'import de `Runner` et son usage (actuellement la branche `else` finale du rendu de l'onglet actif).

## Contexte

Composants de référence déjà en place dans `src/components/BottomPanel/games/` : `GameRails.tsx` (rails partagés `DifficultyRail`/`ActionsRail`), `ProblemsPuzzle`, `OutputPuzzle`, `DebugConsole` (composant + logique séparée, `DIFFICULTY_CONFIG` par palier, focus clavier sur le conteneur).

Le faux shell qui existait avant le prompt 1 (message d'accueil, prompt `→ ~`, police monospace `'Consolas', 'Monaco', 'Courier New', monospace`) a été entièrement retiré à ce moment-là. Ce prompt réintroduit une **vraie interface à commandes tapées**, mais cette fois avec un jeu réel derrière plutôt qu'un shell factice — on peut reprendre l'esthétique du prompt/police d'alors comme base visuelle cohérente.

## Le jeu — Hunt the Wumpus

Classique de 1972 (Gregory Yob), l'un des tout premiers jeux conçus pour tourner sur un terminal. Choix assumé de garder une **vraie ligne de commande tapée** (pas de clic sur un graphe) pour rester fidèle à l'esprit du jeu et à la thématique de l'onglet.

### Monde du jeu

- Une caverne = un graphe de pièces numérotées, chaque pièce reliée à 3 autres (topologie classique : dodécaèdre à 20 pièces pour la difficulté la plus haute ; réduire le nombre de pièces pour les difficultés plus faciles, cf. section Difficulté).
- Dangers placés aléatoirement dans des pièces distinctes (jamais dans la pièce de départ du joueur ni superposés entre eux) :
  - **Puits** : entrer dans la pièce = chute, défaite immédiate.
  - **Chauves-souris géantes** : entrer dans la pièce = transportées dans une pièce aléatoire de la caverne (peut déclencher une autre rencontre en chaîne si la nouvelle pièce a aussi des chauves-souris ou un autre danger).
  - **Wumpus** : une seule pièce. Entrer dans sa pièce = défaite immédiate (simplification assumée par rapport à la règle originale plus complexe de réveil probabiliste).
- Le joueur dispose d'un nombre limité de flèches (5, valeur classique) pour tuer le Wumpus à distance.

### Indices sensoriels

À chaque arrivée dans une pièce (déplacement ou transport par chauve-souris), afficher dans le journal les indices correspondant aux pièces **adjacentes** à la pièce courante (pas la pièce elle-même) :
- Wumpus dans une pièce adjacente → `"Tu sens une odeur infecte..."`
- Puits dans une pièce adjacente → `"Tu sens un courant d'air..."`
- Chauves-souris dans une pièce adjacente → `"Tu entends un battement d'ailes..."`

Ces indices sont la seule information dont dispose le joueur pour déduire où se trouvent les dangers avant de s'engager dans une pièce.

### Commandes disponibles (saisies dans un champ texte, validées par Entrée)

- `move <pièce>` (alias `go`) — se déplacer vers une pièce adjacente à la pièce courante. Refuser (message d'erreur dans le journal) si la pièce visée n'est pas adjacente.
- `shoot <pièce1> <pièce2> ...` (alias `s`) — tirer une flèche à travers une séquence de pièces en partant de la pièce courante (jusqu'à 5 pièces). Si le Wumpus se trouve sur le trajet → victoire. Sinon la flèche est perdue (décrémenter le compteur).
- `look` — réafficher la pièce courante, ses connexions, et les indices perçus, sans consommer de tour.
- `arrows` — afficher le nombre de flèches restantes.
- `help` — lister les commandes disponibles (reprendre l'esprit du `help` de l'ancien faux shell).
- `new` — nouvelle caverne (voir aussi le bouton dédié plus bas).

Toute commande invalide ou mal formée affiche un message d'erreur clair dans le journal, sans consommer de tour ni planter.

### Règle anti-exploit : `shoot` ne doit valider que des connexions déjà découvertes par le joueur

**Point critique.** La validité d'une séquence `shoot` ne doit **jamais** être vérifiée contre le graphe complet caché de la caverne. Si c'était le cas, un joueur pourrait sonder des séquences arbitraires (`shoot 2`, `shoot 7`, `shoot 3 9`, etc.) : comme un chemin invalide ne coûte rien (pas de flèche consommée), il suffirait de sonder ainsi en boucle pour reconstruire gratuitement toute la topologie de la caverne sans jamais bouger ni prendre le moindre risque — puis choisir, à tête reposée, quelques chemins de tir couvrant une large part des pièces (le graphe dodécaèdre a un petit diamètre, ~5) pour toucher le Wumpus quasiment à coup sûr en 5 tirs réels, sans avoir utilisé un seul indice ni pris un seul risque de déplacement. Ça viderait le jeu de tout son intérêt.

Pour l'empêcher :
- Maintenir un état de **connexions découvertes par le joueur** (les tunnels effectivement annoncés lors d'une entrée dans une pièce, ou via `look`) — c'est le même état qui alimente le carnet persistant (cf. section Style).
- La validation d'une séquence `shoot` ne doit s'appuyer **que** sur ce sous-ensemble déjà découvert, jamais sur le graphe réel complet.
- Toute séquence utilisant au moins une connexion non encore découverte est refusée avec un message générique du type `"Tu ne connais pas ce chemin."` — **qu'elle soit ou non réellement valide dans le graphe caché**. Le message ne doit jamais laisser deviner si la connexion testée existe réellement ou non : ce serait exactement la même fuite d'information par un autre biais (sondage gratuit bit par bit du graphe caché).
- Conséquence naturelle : un tir à travers plusieurs pièces n'est possible qu'une fois que le joueur a réellement exploré (avec le risque que ça implique) tout le chemin en question au moins une fois. C'est voulu.

### Victoire / défaite

- **Victoire** : le Wumpus est touché par une flèche tirée via `shoot`.
- **Défaite** : le joueur entre dans une pièce à puits, dans la pièce du Wumpus, ou épuise ses flèches sans avoir touché le Wumpus (dans ce dernier cas, laisser la possibilité de continuer à se déplacer mais signaler clairement qu'il ne peut plus gagner — ou considérer la partie perdue immédiatement, au choix, du moment que c'est explicite dans le journal).
- Dans les deux cas, verrouiller les commandes de jeu (`move`/`shoot`) jusqu'à `new`, et afficher un message de fin clair et distinct (victoire vs défaite).

## Difficulté et rails

- `DifficultyRail` (Easy/Normal/Hard) pilote la taille de la caverne et le nombre de dangers, définis dans un `DIFFICULTY_CONFIG` dédié dans `Wumpus.logic.ts` (nombre de pièces, nombre de puits, nombre de nids de chauves-souris, nombre de flèches), calibrés pour rester jouables (assez d'indices disponibles pour déduire raisonnablement, pas une caverne minuscule où tout est mortel dès le départ). Changer de difficulté relance une nouvelle caverne.
- `ActionsRail` : **le raccourci clavier `space` ne peut pas être utilisé ici** — le joueur tape des phrases contenant des espaces dans le champ de commande, un raccourci global sur la touche espace casserait la saisie. Adapter en conséquence :
  - soit rendre le libellé du raccourci configurable dans `GameRails.tsx` (props optionnelles pour le texte affiché au-dessus des boutons, valeur par défaut `esc`/`space` inchangée pour ne pas casser les autres jeux) et ne pas afficher de raccourci pour ce jeu-ci,
  - soit utiliser uniquement les boutons `ActionsRail` à la souris/tactile pour ce jeu, sans raccourci clavier global.
  - Dans tous les cas, s'assurer qu'aucun `keydown` global du jeu n'intercepte des touches pendant que le champ de commande a le focus.
  - Garder simplement le bouton **New** (nouvelle caverne). Pas besoin de bouton Reset distinct ici (`new` via commande texte fait déjà ce rôle).

## Style

- Champ de saisie + journal défilant façon terminal, police monospace (reprendre `'Consolas', 'Monaco', 'Courier New', monospace` comme dans l'ancien placeholder), fond et texte via les variables de thème existantes (`--bg-activity`/`--bg-main`, `--text-primary`, `--text-secondary`, `--accent` pour le prompt, `--success` pour la victoire, une couleur d'alerte pour la défaite dans le même esprit que `FAIL_RED` de `ProblemsPuzzle.tsx` si aucune variable de thème ne convient).
- **Carnet persistant** (obligatoire, pas juste un confort visuel) : une petite zone toujours visible à côté du journal, listant les pièces déjà visitées et leurs tunnels connus. Ce n'est pas qu'un affichage — c'est la même source de données que celle utilisée pour valider les séquences `shoot` (cf. règle anti-exploit ci-dessus), donc ce que le joueur voit dans le carnet correspond exactement à ce qu'il peut légalement viser.
- Auto-scroll du journal vers le bas à chaque nouveau message ; focus permanent sur le champ de saisie quand l'onglet est actif.
- Le jeu ne doit tourner (état, timers éventuels) que lorsque l'onglet `TERMINAL` est actif.

## Organisation du code

- `src/components/BottomPanel/games/Wumpus.tsx` (composant : champ de saisie, journal, rendu, branchement rails).
- `src/components/BottomPanel/games/Wumpus.logic.ts` (génération de la caverne/graphe, placement des dangers, calcul des indices adjacents, suivi des connexions découvertes par le joueur, parsing/validation des commandes — `shoot` validé contre les connexions découvertes uniquement, jamais contre le graphe complet —, résolution de tir, détection victoire/défaite).
- Brancher dans `BottomPanel.tsx` : `activeTab === 'TERMINAL'` → le nouveau composant (remplace `Runner`, cf. Étape 0).

## Vérification attendue

- Build/lint passe sans erreur.
- Aucune référence résiduelle à `Runner` dans le code ou les imports.
- Les 6 commandes fonctionnent comme décrit, avec messages d'erreur clairs sur saisie invalide.
- Les indices affichés correspondent bien aux dangers dans les pièces adjacentes à la pièce courante, recalculés à chaque déplacement.
- **Anti-exploit** : sonder `shoot` avec des séquences arbitraires non découvertes (sans avoir bougé) ne renvoie jamais d'information exploitable — toujours le même message générique "chemin inconnu", que la connexion testée existe réellement ou non dans le graphe caché. Un tir à travers plusieurs pièces n'est acceptable que si le joueur a réellement découvert tout le chemin par exploration.
- Une caverne générée reste toujours jouable (assez d'indices disponibles selon la difficulté choisie).
- Victoire (Wumpus touché) et défaite (puits, Wumpus, ou flèches épuisées) verrouillent le jeu jusqu'à `new` ou clic sur le bouton `New`, avec des messages bien distincts.
- Taper au clavier dans le champ de commande (y compris des espaces) ne déclenche aucun raccourci global involontaire.
- Changer de difficulté (rail gauche) relance une nouvelle caverne cohérente avec le palier choisi.
