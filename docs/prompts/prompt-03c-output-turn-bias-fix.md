# Prompt Claude Code — OUTPUT : le vrai problème est la fréquence de virage, pas la longueur

## Contexte

Suite au prompt précédent (`prompt-03b-output-density-fix.md`), les chaînes sont maintenant plus longues et la grille reste bien remplie à 100%, mais le résultat visuel reste éloigné de la référence : on obtient de longs couloirs droits (plusieurs cases en ligne) avec seulement quelques poches de zigzag serré (motif "peigne"), alors que la référence a ce motif de zigzag serré **partout, de façon quasi uniforme**, avec très peu de segments droits de plus de 2-3 cases. Le trajet surligné en rose dans la capture de référence illustre ce niveau de virage : la chaîne tourne presque à chaque case.

Le vrai levier n'est donc pas la longueur des chaînes (déjà correcte), c'est **la fréquence de changement de direction** pendant la marche aléatoire de `partitionGrid`.

## Diagnostic

La heuristique actuelle (choisir le voisin libre au degré de liberté le plus faible) ne pénalise pas le fait de continuer tout droit : dans une zone encore peu remplie, aller tout droit ou tourner peuvent avoir le même score, donc l'algorithme file en ligne droite tant qu'il ne rencontre pas d'obstacle. Résultat : de larges couloirs rectilignes dans les zones ouvertes, du zigzag seulement là où l'espace est déjà contraint.

## Correction à apporter

Dans la marche aléatoire de `partitionGrid` (`src/components/BottomPanel/games/OutputPuzzle.logic.ts`) :

1. **Suivre la dernière direction utilisée** pour chaque chaîne en cours de construction.
2. **Pénaliser fortement la continuité** : au moment de choisir la prochaine cellule, donner un score nettement moins bon aux voisins qui prolongent la direction courante par rapport à ceux qui tournent (perpendiculaire), plutôt que de choisir uniquement sur le degré de liberté. Un virage en arrière (demi-tour) reste impossible de toute façon (la cellule est déjà occupée par le corps du serpent).
3. **Plafonner dur le nombre de pas consécutifs dans la même direction** : par exemple 2 cases maximum tout droit avant d'imposer un virage (si un voisin perpendiculaire libre existe — sinon on accepte de continuer tout droit par nécessité, plutôt que d'échouer). Ce plafond doit s'appliquer uniformément, y compris dans les zones encore très ouvertes du plateau (début de génération), pas seulement en fin de remplissage.
4. Garder l'esprit glouton + backtracking mis en place au prompt précédent (croissance longue, retour en arrière en cas d'impasse) — on ajoute juste ce biais de virage par-dessus, on ne revient pas aux petites longueurs cibles d'avant.

## Non-régression

- Toujours 100% de cellules couvertes, aucun trou.
- `peelDirections` doit continuer à trouver un ordre d'extraction valide (rien à changer de ce côté, la fonction est indépendante de la forme des chaînes).
- Pas de dégradation visible du temps de génération.

## Vérification attendue

- Comparer visuellement une grille générée en `hard` à la capture de référence : le motif doit être dense et serré **sur toute la surface du plateau**, pas seulement par endroits. La plupart des segments entre deux virages ne doivent pas dépasser 2-3 cases.
- Aucun long couloir rectiligne de plus de quelques cases ne doit subsister, sauf cas de nécessité ponctuelle (impasse évitée de justesse).
