# Prompt Claude Code — Onglet TERMINAL : Donjon (refonte complète de rm -rf)

> Remplace entièrement `rm -rf` (`prompt-07-terminal-rm-rf.md` et ses correctifs `07b`/`07c`). Ces fichiers restent comme historique, ne plus les exécuter. Le thème "nettoyage de fichiers" est abandonné au profit d'un donjon avec combat, sur la même base technique (arborescence de dossiers, commandes tapées, hiérarchie statique).

## Étape 0 — retirer rm -rf

- Supprimer `src/components/BottomPanel/games/RmRf.tsx` et `RmRf.logic.ts`.
- Dans `BottomPanel.tsx`, retirer l'import de `RmRf` et son usage (branche `activeTab === 'TERMINAL'`).

## Concept

Le joueur descend une arborescence de dossiers jusqu'à un dossier final (le boss). Chaque dossier peut contenir un ennemi (bug/virus) qui bloque la suite du chemin tant qu'il n'est pas vaincu. Combat géré par des jets de dés, pas de statistiques cachées à calculer soi-même.

**Version 1 volontairement minimale : seulement 4 commandes, pas d'objets ni d'équipement.** Les armes/améliorations viendront dans une version suivante — ne pas les anticiper dans le code au-delà de structures raisonnablement extensibles.

Beaucoup de mécanique de base (génération d'arbre, résolution de chemin `move`, rendu de la hiérarchie statique, panneau de statut à ligne unique) peut être réutilisée/adaptée de l'implémentation `RmRf` existante avant suppression plutôt que réécrite de zéro — s'en inspirer directement.

## Commandes (V1, uniquement celles-ci)

- `move <chemin>` — se déplacer. Supporte un chemin complet en une seule commande (`..` et noms mélangés, ex. `move ../../core/docs`), résolu segment par segment comme l'ancien `cd` de `RmRf`. Révèle **automatiquement** le contenu du dossier d'arrivée (ennemi, dossiers enfants) — pas de commande `ls` séparée dans cette version. Refusé si le dossier courant contient encore un ennemi vivant et que la destination est un enfant (on ne peut pas contourner un ennemi non vaincu) ; remonter vers le parent reste toujours possible pour battre en retraite.
- `shoot <cible>` — attaque l'ennemi présent dans le dossier courant.
- `load` — met un dé de plus en réserve pour la prochaine attaque.
- `restore` — relance le bouclier à neuf.

Garder aussi `help` et `new` (utilitaires gratuits, sans effet sur les stats/le tour), comme dans les jeux précédents du panneau.

## Combat

### Dés et charges

- Une attaque de base lance **1d6**. `load` ajoute un dé en réserve pour la **prochaine** attaque, répétable une fois (donc 1, 2 ou 3 dés maximum). Les valeurs des dés (attaque de base et dés de charge) sont **inconnues à l'avance** : tout est tiré aléatoirement au moment précis du `shoot`, jamais avant.
- Un `shoot` avec plusieurs dés en réserve les consomme tous d'un coup ; le compteur de charges retombe à 1 dé de base juste après, que l'attaque tue la cible ou non.
- Si le joueur subit des dégâts aux **PV** (pas au bouclier) alors que des charges sont en réserve, elles sont perdues immédiatement (retour à 1 dé de base).
- `load` refusé si déjà à 3 dés en réserve (maximum atteint).

### Résolution d'une attaque

- Dégâts infligés = somme des dés lancés à l'instant du `shoot`, appliqués aux PV de l'ennemi ciblé.
- Ennemi à 0 PV ou moins → vaincu, retiré du dossier (le dossier devient franchissable).
- Ennemi encore en vie → riposte : applique ses dégâts de riposte (valeur fixe par ennemi) au joueur selon la règle de bouclier ci-dessous.

### Bouclier

- Le bouclier **absorbe l'intégralité** d'un coup reçu, qu'il "résiste" ou qu'il "casse" — jamais de dégâts résiduels aux PV le tour où il casse.
- Si les dégâts reçus sont strictement inférieurs à la valeur actuelle du bouclier : il encaisse et **reste inchangé** (pas d'usure progressive).
- Si les dégâts reçus sont supérieurs ou égaux à sa valeur actuelle : le bouclier est détruit (retombe à 0), mais absorbe quand même la totalité du coup ce tour-ci.
- Les PV ne sont entamés que lorsque le bouclier est **déjà à 0** au moment du coup.

### `restore`

- Relance 2d6 et **remplace** entièrement la valeur actuelle du bouclier par ce résultat (2 à 12) — ce n'est pas un ajout. Le nouveau bouclier peut donc être plus faible que l'ancien : un vrai pari, pas un choix systématiquement bénéfique.

### Ordre des opérations sur un tour

Quelle que soit l'action du joueur (`shoot`, `load`, `restore`), si l'ennemi présent est encore vivant après cette action, il riposte **en utilisant l'état du joueur juste après son action** (ex. un `restore` suivi d'une riposte s'applique au bouclier fraîchement relancé, pas à l'ancien).

## Ennemis et boss

- Représentés par des icônes bug/virus (pas de nom de fichier), par palier de couleur indiquant leur puissance relative (faible/moyen/fort) — un repère visuel immédiat sans avoir à lire des chiffres.
- Chaque ennemi a ses propres PV et ses propres dégâts de riposte, indépendants des autres.
- Le boss (dossier final de l'arborescence) a une jauge de PV nettement plus grande et des dégâts de riposte plus élevés, pour un affrontement à plusieurs échanges. Pas de mécanique spéciale au-delà de l'échelle des stats pour cette V1.

## Pas de pression temporelle dans cette V1

La ligne rouge qui avance et scelle des dossiers (mécanique de "fuite mémoire") est **retirée pour cette version** — pas de compteur de tours global, pas de dossiers qui deviennent inaccessibles avec le temps. Le joueur peut explorer et battre en retraite librement. À reconsidérer plus tard une fois la boucle de combat validée.

- **Défaite** : les PV du joueur tombent à 0 (tué par un ennemi ou le boss).
- **Victoire** : le boss est vaincu.

## Calibrage (avec une réserve : il y a désormais du hasard réel)

Contrairement aux jeux précédents du panneau (résolubles avec certitude), le combat aux dés introduit du vrai hasard — on ne peut pas garantir formellement une victoire, seulement calibrer pour de bonnes chances avec un jeu raisonnable. Ajuster empiriquement (PV/dégâts des ennemis, profondeur de l'arbre) plutôt que chercher une preuve de résolubilité stricte comme pour `ProblemsPuzzle`/`OutputPuzzle`. Documenter les valeurs choisies en commentaire, dans le même esprit que les `DIFFICULTY_CONFIG` existants.

## Interface

- Réutiliser la hiérarchie statique horizontale déjà en place (position = profondeur). Pas de ligne rouge dans cette V1.
- PV et bouclier du joueur affichés en évidence (zone dédiée, pas dans le graphe des dossiers).
- Une ligne de statut unique (pas de journal défilant, cf. décision précédente) pour le retour du dernier tour (jets de dés, dégâts infligés/subis).
- `DifficultyRail`/`ActionsRail` : `space` reste indisponible comme raccourci (le joueur tape dans un champ de commande) — garder `newHint={null}` comme pour les jeux précédents de cet onglet.

## Organisation du code

- `src/components/BottomPanel/games/Dungeon.tsx` (composant).
- `src/components/BottomPanel/games/Dungeon.logic.ts` (génération de l'arbre/ennemis/boss, résolution des 4 commandes, résolution de combat).
- Brancher dans `BottomPanel.tsx` : `activeTab === 'TERMINAL'` → `<Dungeon />`.

## Vérification attendue

- Build/lint passe sans erreur ; aucune référence résiduelle à `RmRf`.
- `move` avec chemin multi-segments fonctionne, révèle automatiquement le contenu du dossier d'arrivée, bloque l'accès à un enfant si un ennemi non vaincu est présent, autorise toujours la remontée.
- Les dés (attaque et charges) sont bien tirés au moment du `shoot`, jamais avant.
- `load` plafonne à 3 dés, se réinitialise après usage, et se perd si le joueur encaisse des dégâts aux PV entretemps.
- Le bouclier absorbe toujours l'intégralité d'un coup, se casse (retombe à 0) uniquement si le coup égale/dépasse sa valeur, sans jamais laisser fuiter de dégâts aux PV ce tour-là.
- `restore` remplace bien le bouclier (peut le diminuer), jamais un simple ajout.
- Un ennemi vaincu libère l'accès à ses enfants ; le boss demande plusieurs `shoot` pour tomber.
- Aucune ligne rouge, aucun compteur de tours global, aucun système d'objet/équipement présent dans cette V1.
