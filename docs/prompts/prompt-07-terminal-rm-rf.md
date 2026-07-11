# Prompt Claude Code — Onglet TERMINAL : rm -rf

> Remplace Hunt the Wumpus (`prompt-06-terminal-hunt-the-wumpus.md` + `prompt-06b-wumpus-corrections.md`). Ces fichiers restent comme historique, ne plus les exécuter.

## Étape 0 — retirer Hunt the Wumpus

- Supprimer `src/components/BottomPanel/games/Wumpus.tsx` et `src/components/BottomPanel/games/Wumpus.logic.ts`.
- Dans `src/components/BottomPanel/BottomPanel.tsx`, retirer l'import de `Wumpus` et son usage (branche `activeTab === 'TERMINAL'`).

## Contexte

Composants de référence déjà en place dans `src/components/BottomPanel/games/` : `GameRails.tsx` (`DifficultyRail`, `ActionsRail` — ce dernier accepte déjà `resetHint`/`newHint` optionnels à `null` pour masquer un raccourci clavier non pertinent, cf. usage dans l'ancien `Wumpus.tsx`), et les autres jeux du panneau pour le pattern général (composant + logique séparée, `DIFFICULTY_CONFIG` par palier, focus clavier sur le conteneur).

## Le jeu — rm -rf

Le joueur incarne celui qui exécute un `rm -rf` sur une arborescence de dossiers, en tapant de vraies commandes shell dans un champ de saisie (comme l'ancien Wumpus, mais avec de vraies commandes Unix cette fois : `ls`, `cd`, `rm`).

### Concept central : un budget de commandes, pas une horloge

**Pas de temps réel.** La ligne rouge (bord droit du panneau) ne bouge pas ; c'est la représentation visuelle de l'arborescence qui se rapproche d'elle, d'un cran fixe, à **chaque commande valide exécutée** (peu importe laquelle : `ls`, `cd`, `cd ..`, `rm`). Une commande invalide/mal formée ne consomme pas de cran.

Cela revient en pratique à un **budget global de commandes** fixé à la génération de la partie : le joueur dispose d'un nombre fini de commandes valides avant qu'un élément non supprimé n'atteigne la ligne rouge (défaite). Le jeu est donc un problème d'**efficacité de parcours** — trouver un enchaînement de commandes qui nettoie toute l'arborescence dans le budget imparti — pas un jeu de réflexes. C'est ce budget serré qui crée le challenge, pas une interdiction arbitraire d'outils.

### Monde du jeu

- Une arborescence de dossiers générée aléatoirement (profondeur et largeur variables selon la difficulté), point de départ = dossier racine.
- Chaque dossier contient un nombre variable de fichiers et de sous-dossiers.
- Certains dossiers sont des feuilles (aucun sous-dossier) : une fois vidés, il faut remonter (`cd ..`) pour explorer une autre branche.
- Quelques fichiers spéciaux **joker** sont disséminés dans l'arborescence (icône distincte), en nombre limité selon la difficulté.

### Commandes disponibles

- `ls` — révèle le contenu du dossier courant (fichiers et sous-dossiers). Nécessaire avant de pouvoir cibler quoi que ce soit dedans (cf. règle de découverte ci-dessous). Si le dossier a déjà été listé une fois, un nouvel `ls` reste valide (et coûte quand même un cran) mais n'apporte rien de nouveau.
- `cd <dossier>` — descendre dans un sous-dossier **déjà révélé par un `ls` dans le dossier courant**. Refuser sinon, avec un message clair.
- `cd ..` — remonter dans le dossier parent.
- `rm <fichier>` — supprimer un fichier **déjà révélé par un `ls`** dans le dossier courant. Refuser sinon.
- `rm *` — supprimer **tous les fichiers du dossier courant** en une seule commande (donc un seul cran de rapprochement au lieu d'un par fichier). **Nécessite un joker disponible** (voir plus bas) ; refuser avec un message clair si aucun joker n'est en stock.
- `help` — liste des commandes.
- `new` — nouvelle arborescence (voir aussi le bouton `ActionsRail`).

Toute commande ciblant un élément non découvert (pas de `ls` préalable dans le dossier concerné) doit être refusée avec un message générique — pas la peine de faire un système anti-exploit aussi poussé que pour Wumpus ici (il n'y a pas d'info à fuiter sur un graphe cassé, juste une contrainte logique : il faut regarder avant d'agir), mais garder le principe "on ne peut agir que sur ce qu'on a vu".

### Jokers (`rm *`)

- Un fichier joker, une fois supprimé via `rm <nom>` (coûte un cran comme un fichier normal), ajoute **+1 charge** de `rm *` à la réserve du joueur.
- Utiliser `rm *` consomme une charge et vide tous les fichiers du dossier courant (mais pas les sous-dossiers) pour un seul cran de rapprochement, quel que soit le nombre de fichiers concernés.
- Afficher clairement le nombre de charges disponibles (dans le journal via une commande dédiée type `jokers`, à ajouter à la liste des commandes et au `help`, ou en affichage permanent à côté du plateau).

### Affichage de progression / condition de victoire

- Un dossier affiche une **icône de validation** dès que : (a) tous ses fichiers propres sont supprimés, **et** (b) tous ses sous-dossiers affichent eux-mêmes cette icône (condition récursive, propagée du bas vers le haut de l'arbre).
- **Victoire** : le dossier racine affiche l'icône de validation (toute l'arborescence est nettoyée) avant épuisement du budget.
- **Défaite** : le budget de commandes atteint zéro alors que la racine n'est pas encore validée.

### Difficulté et calibrage du budget (fairness)

Comme les autres jeux du panneau, une partie générée doit rester **toujours réalisable** par un joueur qui joue efficacement, et rester un vrai défi pour ne pas être triviale (le point soulevé en amont : si le budget est trop large, il n'y a plus d'enjeu). Approche recommandée dans `RmRf.logic.ts` :

1. Générer l'arbre (nombre de dossiers, fichiers par dossier, profondeur, position des jokers) selon un `DIFFICULTY_CONFIG` par palier.
2. Calculer (au moins approximativement) le coût d'un parcours optimal : un `ls` par dossier visité, un `rm` par fichier (réduit à 1 par dossier là où un joker est utilisé stratégiquement sur les dossiers les plus chargés), plus le coût de déplacement (`cd`) d'un parcours en profondeur qui minimise les allers-retours — grossièrement, deux fois le nombre d'arêtes de l'arbre moins la profondeur de la dernière branche explorée (puisqu'il n'est pas nécessaire de revenir à la racine une fois celle-ci validée). Une approximation empirique est acceptable si le calcul exact est trop complexe à produire proprement — dans le même esprit que le calibrage empirique déjà utilisé dans les autres jeux du panneau (cf. commentaires dans `ProblemsPuzzle.logic.ts`/`OutputPuzzle.logic.ts`).
3. Fixer le budget total = ce coût optimal + une marge dépendant de la difficulté (`easy` = marge confortable, `hard` = marge serrée, proche du minimum théorique).
4. Changer de difficulté relance une nouvelle arborescence avec sa propre configuration.

## Rails et contrôles

- Même contrainte que pour l'ancien Wumpus : le champ de commande utilise la touche `espace` en saisie normale, donc pas de raccourci clavier global sur `space`/`esc`. Réutiliser `ActionsRail` avec `newHint={null}` (voir usage déjà fait dans l'ancien `Wumpus.tsx`), bouton `New` uniquement (la commande `new` fait déjà ce rôle).
- `DifficultyRail` pilote la taille/complexité de l'arborescence et la marge de budget (cf. section précédente).

## Style

- Champ de saisie + journal défilant façon terminal (même base que l'ancien Wumpus : police monospace `'Consolas', 'Monaco', 'Courier New', monospace`, variables de thème existantes).
- En complément du journal texte, une **représentation visuelle de l'arborescence** doit être affichée (dossiers/fichiers avec indentation ou lignes de connexion, dossier courant mis en évidence, icônes de validation sur les dossiers nettoyés) qui se rapproche visuellement d'une ligne verticale fixe à droite du panneau au fil des commandes — traduire la baisse du budget restant par un déplacement visuel (ex. translation horizontale) de cette représentation, proportionnel au budget consommé.
- Icônes cohérentes avec la taille de cellule/texte (dossier, fichier, joker, validation) — `lucide-react` a de quoi couvrir ça (`Folder`, `File`, `CheckCircle`, etc.), à choisir librement du moment que c'est cohérent visuellement.
- Le jeu ne doit tourner (état) que lorsque l'onglet `TERMINAL` est actif.

## Organisation du code

- `src/components/BottomPanel/games/RmRf.tsx` (composant : champ de saisie, journal, rendu de l'arborescence, branchement rails).
- `src/components/BottomPanel/games/RmRf.logic.ts` (génération de l'arbre, placement des jokers, suivi des dossiers découverts/nettoyés, calcul du budget et de sa consommation, parsing/validation des commandes, détection victoire/défaite).
- Brancher dans `BottomPanel.tsx` : `activeTab === 'TERMINAL'` → `<RmRf />` (remplace `Wumpus`, cf. Étape 0).

## Vérification attendue

- Build/lint passe sans erreur ; aucune référence résiduelle à `Wumpus`.
- Chaque commande valide (`ls`/`cd`/`cd ..`/`rm`/`rm *`) consomme exactement un cran de budget ; une commande invalide n'en consomme aucun.
- Impossible de `cd` ou `rm` un élément non révélé par un `ls` préalable dans le dossier courant.
- `rm *` refusé sans joker en stock ; consomme bien une charge et vide tous les fichiers du dossier courant en un seul cran quand utilisé.
- L'icône de validation d'un dossier n'apparaît que si lui-même **et** tous ses sous-dossiers sont validés (propagation récursive jusqu'à la racine).
- Une arborescence générée reste toujours réalisable dans le budget imparti par un parcours efficace, tout en restant un vrai défi (pas de marge excessive) — vérifier notamment que la difficulté `hard` punit réellement les détours inutiles.
- Défaite si le budget est épuisé avant validation de la racine ; victoire sinon.
- Taper dans le champ de commande (y compris des espaces) ne déclenche aucun raccourci global involontaire.
- Changer de difficulté relance une arborescence cohérente avec le palier choisi.
