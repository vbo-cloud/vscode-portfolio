# Prompt Claude Code — rm -rf : tout sur le graphe, navigation par chemin, historique

## Contexte

Fichiers concernés : `src/components/BottomPanel/games/RmRf.tsx` (rendu, journal, champ de commande) et `RmRf.logic.ts` (commande `cd`). Trois changements demandés après test de la version actuelle.

## 1. Supprimer le journal texte défilant — tout doit être lisible sur le graphe

Actuellement, `RmRf.tsx` affiche un petit journal défilant (`log`, `LogLine[]`) sous l'arbre. À retirer entièrement : plus de zone de scrollback.

- Garder au maximum **une ligne de statut unique, non défilante** (remplacée à chaque commande, pas d'historique visuel empilé) pour les messages qui ne peuvent pas être portés par le graphe lui-même (ex. `cd: chemin introuvable`, `rm *: aucun joker en stock`). Cette ligne n'est pas un journal, juste le dernier résultat.
- Tout ce qui peut être représenté visuellement sur l'arbre doit l'être plutôt que d'apparaître en texte : état découvert/non découvert, fichiers restants, jauge d'urgence par dossier, dossier courant, validation — c'est déjà globalement le cas (`renderNode`), à conserver et étendre (cf. point 2).
- `executeCommand`/`CommandResult` peuvent continuer à retourner des `lines`, c'est le composant qui doit n'en garder que la dernière pour l'affichage (au lieu de tout accumuler dans `log`).

## 2. Afficher le nom des fichiers directement sur le graphe

Dans `renderNode` (`RmRf.tsx`), les fichiers d'un dossier découvert n'affichent aujourd'hui qu'une icône (`File`/`Sparkles`), sans leur nom. Ajouter le nom de chaque fichier à côté de son icône (texte compact, cohérent avec la taille déjà utilisée pour le nom du dossier), pour que l'arbre soit auto-suffisant sans avoir besoin d'un `ls` textuel séparé pour connaître le contenu.

## 3. `cd` doit accepter un chemin complet, pas juste un saut d'un niveau

Actuellement, `cd` ne gère que `<nom d'un enfant direct>` ou `..`. Le joueur doit pouvoir taper un chemin complet en une seule commande, mélangeant remontées et descentes, par exemple `cd ../../core/docs/public`.

Dans `executeCommand` (branche `cd`) :

- Découper l'argument sur `/` en segments (ignorer les segments vides, ex. doubles slashs).
- Résoudre les segments un par un à partir du dossier courant :
  - `..` est **toujours valide** (le parent est toujours connu), comme aujourd'hui.
  - Un segment nommé n'est valide que si le dossier **où on se trouve à cette étape de la résolution** a déjà été révélé par `ls` **et** que ce nom correspond à un de ses enfants. Sinon, rejeter toute la commande (pas de déplacement partiel) avec un message clair indiquant à quel segment ça bloque, par exemple `cd: docs/public: chemin introuvable ou pas encore exploré`.
- Si tous les segments se résolvent, déplacer `cwd` directement vers la destination finale en une seule commande (donc un seul tick consommé pour tout le trajet, pas un par segment — cohérent avec l'esprit "chaque commande valide coûte un tick").
- Le comportement actuel `cd <enfant direct>` et `cd ..` reste un cas particulier de cette résolution générale (chemin à un seul segment).

## 4. Historique des commandes (flèche du haut / du bas), comme un vrai shell

Dans `RmRf.tsx`, le champ de saisie doit se comporter comme une vraie console :

- Conserver la liste des commandes effectivement soumises (texte brut tel que tapé), dans l'ordre chronologique — état local du composant, pas besoin de le mettre dans `GameState`.
- Flèche du haut (`ArrowUp`) dans le champ : remonte vers la commande précédente (la plus récente d'abord), en remplaçant le contenu du champ.
- Flèche du bas (`ArrowDown`) : avance vers une commande plus récente, jusqu'à revenir à un champ vide une fois la fin de l'historique dépassée.
- Taper à nouveau librement après avoir rappelé une ligne doit permettre de la modifier avant de valider, sans casser la navigation ultérieure dans l'historique.
- Comportement standard attendu : soumettre une commande l'ajoute à la fin de l'historique et réinitialise le curseur de navigation.

## Vérification attendue

- Plus aucune zone de journal défilant visible ; au plus une ligne de statut unique pour le dernier résultat.
- Les fichiers affichent leur nom en plus de leur icône sur le graphe.
- `cd ../../core/docs/public` (et toute combinaison de `..`/noms) fonctionne en une seule commande si chaque segment est déjà connu, sinon rejeté proprement sans déplacement partiel.
- `ArrowUp`/`ArrowDown` naviguent dans l'historique des commandes tapées comme dans un vrai shell.
- Build/lint passe sans erreur ; aucune régression sur `ls`, `rm`, `rm *`, jokers, échéances par dossier, `help`, `new`.
