# Prompt Claude Code — OUTPUT : corriger le trou de remplissage + casser l'effet de motif répété

## Contexte

Suite à `prompt-03c-output-turn-bias-fix.md` : le zigzag est maintenant fréquent, mais deux problèmes apparaissent sur le résultat observé (`partitionGrid` dans `OutputPuzzle.logic.ts`) :

1. **Régression de couverture** : une zone de cellules reste non assignée à une chaîne (visible en bas à droite du plateau généré). Le plafond dur de virage a dû introduire des cas où la marche/le backtracking abandonne avant d'avoir couvert toutes les cellules libres, ou le mécanisme de fusion des résidus ne rattrape plus ces poches.
2. **Motif trop mécanique** : le plafond fixe (~2 cases avant virage forcé) produit un rythme identique répété en boucle (dents de peigne toutes semblables, presque exclusivement horizontales). La référence a un aspect plus organique : mélange de méandres de tailles différentes, équilibre entre segments horizontaux et verticaux, et quelques segments occasionnels un peu plus longs (4-6 cases) qui cassent la régularité.

## Corrections à apporter

### 1. Remplissage à 100% non négociable

Le remplissage complet du plateau (aucune cellule orpheline) est une exigence déjà posée dans les prompts précédents et ne doit pas régresser. Pistes :
- Si le biais anti-ligne-droite empêche de finir de couvrir une zone (plus de voisin "qui tourne" disponible), autoriser explicitement la marche à continuer tout droit dans ce cas précis plutôt que d'abandonner la chaîne — la priorité absolue est de couvrir toutes les cellules, le style de virage est secondaire.
- Vérifier/renforcer le mécanisme de rattrapage des poches résiduelles en fin de génération (fusion de stubs, ou nouvelle passe qui rattache toute cellule encore libre à une chaîne adjacente) pour qu'aucune cellule ne puisse rester sans chaîne, quelle que soit la difficulté.
- Ajouter un contrôle explicite après génération (assertion / vérification en dev) que le nombre total de cellules couvertes par les chaînes == `cols * rows`, et déclencher un nouvel essai sinon (le mécanisme de retry existe déjà dans `generatePuzzle`, s'assurer qu'il couvre bien ce cas).

### 2. Variété du motif

Remplacer le plafond dur uniforme par une longueur de segment **variable et aléatoire** :
- Avant chaque virage, tirer aléatoirement une longueur de segment cible (par exemple entre 1 et 5 cases, avec une distribution qui favorise les valeurs courtes sans les rendre systématiques — ex. 60% de chances d'obtenir 1-2 cases, 40% de chances d'obtenir 3-5 cases), plutôt qu'un plafond fixe identique partout.
- Équilibrer le choix d'axe : quand plusieurs directions perpendiculaires sont disponibles, ne pas favoriser systématiquement une direction (éviter le biais horizontal observé) — alterner ou tirer aléatoirement entre les axes disponibles plutôt que d'appliquer un ordre de préférence fixe dans `DIRS`.
- Le résultat recherché : un aspect de méandres irrégulier et varié comme la référence, pas un motif répétitif reconnaissable en boucle.

### 3. Non-régression

- 100% des cellules couvertes, sans exception.
- `peelDirections` doit continuer à trouver un ordre d'extraction valide (indépendant de la forme des chaînes, rien à changer ici).
- Pas de dégradation visible du temps de génération (le nombre de tentatives dans `generatePuzzle` peut être ajusté si nécessaire).

## Vérification attendue

- Générer plusieurs plateaux en `hard` et vérifier visuellement : aucun trou, motif varié (pas de rythme identique répété), bon mélange horizontal/vertical, quelques segments plus longs qui cassent la régularité — dans l'esprit de la capture de référence.
