# Prompt Claude Code — OUTPUT : augmenter densité et emmêlement des chaînes

## Contexte

Fichier concerné : `src/components/BottomPanel/games/OutputPuzzle.logic.ts`, fonction `partitionGrid` (+ réglages `DIFFICULTY_CONFIG`).

Le rendu actuel est trop simple par rapport à la référence visée (jeu officiel de ce type de puzzle) : les chaînes sont courtes (`minLen`/`maxLen` actuels : 3 à 7 cellules selon la difficulté) et peu sinueuses. Résultat : des flèches courtes et plutôt droites, avec un aspect épars, alors que la référence montre une grille quasi entièrement tissée de **quelques chaînes très longues** (15-30+ cellules), qui serpentent avec de nombreux virages serrés, au point qu'une chaîne peut presque former une boucle et englober 1-2 autres chaînes sur son passage (voir capture jointe : la chaîne surlignée en rose fait ce genre de repli en U très marqué).

## Objectif

Rapprocher visuellement le résultat de la référence, sans casser la garantie de résolvabilité déjà en place (`peelDirections` + retry + `fallbackChains`).

## Pistes concrètes

1. **Longueur des chaînes** : la contrainte actuelle `target = minLen + random(maxLen - minLen)` borne beaucoup trop tôt. Remplacer par une croissance **gloutonne quasi illimitée** : chaque chaîne continue de s'étendre tant qu'il reste une cellule libre adjacente, et ne s'arrête que quand elle est réellement bloquée (ou éventuellement un plafond haut genre 60-80% des cellules totales, pour éviter qu'une seule chaîne n'avale toute la grille). Le nombre de chaînes obtenu doit naturellement chuter à quelques-unes par plateau (contre beaucoup de petites actuellement).

2. **Éviter les arrêts prématurés (dead-ends)** : avec une croissance gloutonne, le risque est de coincer une chaîne trop tôt (peu de cellules libres autour) et d'obtenir plein de petits résidus courts. La heuristique actuelle (choisir le voisin libre au degré de liberté le plus faible) aide à serpenter dans les recoins mais n'a pas de retour en arrière. Ajouter un minimum de **backtracking** : si un voisin choisi mène à une impasse totale peu après, revenir en arrière de quelques cellules et tenter une autre direction avant d'abandonner la chaîne — plutôt que de la clore immédiatement et de fusionner un résidu trop court comme c'est fait actuellement (`isAdj`/fusion des stubs). Le mécanisme de fusion des stubs peut rester en filet de sécurité, mais ne devrait plus être le cas général.

3. **Taille de grille** : augmenter `rows`/`maxCols` dans `DIFFICULTY_CONFIG`, en particulier pour `normal` et `hard`, pour laisser la place à des chaînes de cette longueur sans que ça sature trop vite (une chaîne de 25 cellules a besoin d'un plateau nettement plus grand que 7x38). Ajuster empiriquement en gardant un œil sur la lisibilité dans le panneau (`h-48 md:h-64`) — quitte à réduire légèrement la taille de cellule (`CELL`) dans `OutputPuzzle.tsx` si besoin pour que tout tienne visuellement.

4. **Garder la sécurité existante** : `peelDirections` (assignation de sortie garantissant la résolvabilité) et `fallbackChains` (filet de secours) ne doivent pas être supprimés — seulement moins sollicités. Vérifier que le nombre de tentatives (`120` actuellement dans `generatePuzzle`) reste suffisant avec les nouveaux réglages ; l'augmenter si le taux d'échec constaté augmente trop.

5. **Non-régression** : le résultat doit rester à 100% de cellules occupées (pas de trous), avec un ordre d'extraction toujours valide par construction (aucun changement requis côté `peelDirections`, qui reste correct quelle que soit la forme des chaînes).

## Vérification attendue

- Sur `hard`, la majorité des chaînes générées font au moins ~15 cellules, avec des virages fréquents (viser un rendu visuellement proche de la capture de référence : grille dense, peu de chaînes distinctes mais longues et repliées sur elles-mêmes).
- Toujours 100% de cellules couvertes, aucun trou.
- Le puzzle généré reste toujours résolvable (peel réussit ou fallback, comme avant).
- Pas de dégradation notable du temps de génération perçu (pas de freeze visible à l'ouverture de l'onglet ou au clic sur "New").
