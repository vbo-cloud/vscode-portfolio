# Prompt Claude Code — TERMINAL (Wumpus) : Wumpus qui bouge + correction anti-exploit manquante

## Contexte

Fichier concerné : `src/components/BottomPanel/games/Wumpus.logic.ts` (fonctions `executeCommand`, `enterRoom`, `createGame`, type `GameState`).

Deux corrections à apporter, indépendantes mais dans la même zone de code.

## 1. Le Wumpus doit réagir aux tirs ratés (règle manquante du prompt d'origine)

Actuellement, dans `executeCommand`, la branche `shoot` : si `rooms.includes(state.wumpus)` c'est la victoire, sinon la flèche est simplement perdue (`arrows - 1`) et le Wumpus reste immobile pour toujours. C'est une règle du jeu original (1972) qui manque : **un tir raté fait du bruit et réveille le Wumpus**, qui se déplace alors. Sans ça, une fois qu'on sent son odeur, il suffit de tirer sur chacun des voisins connus (au maximum 3) pour gagner à coup sûr sans aucun risque — ce qui vide le tir final de tout enjeu.

Règle à implémenter, avec une probabilité de **100%** (pas de tirage aléatoire à faire, le réveil est systématique à chaque tir raté) :

- Quand une flèche tirée via `shoot` ne touche pas le Wumpus, celui-ci se déplace immédiatement vers une pièce adjacente choisie aléatoirement parmi `state.cave[state.wumpus]`.
- Si sa nouvelle position correspond à la pièce actuelle du joueur (`state.player`) → défaite immédiate : le Wumpus surgit et dévore le joueur, même si le joueur avait encore des flèches. Message clair et distinct des autres défaites, par exemple : `"Le Wumpus surgit, affolé par le bruit, et te tombe dessus !"`, suivi du message `GAME OVER` habituel.
- Ce contrôle a lieu **avant** ou **indépendamment** de la vérification "plus de flèches" : même sur la toute dernière flèche, si elle rate, il faut d'abord vérifier si le Wumpus atterrit sur le joueur (défaite par le Wumpus) avant d'annoncer la défaite par épuisement des flèches — les deux ne doivent pas se chevaucher dans le message affiché, choisir le message le plus pertinent (Wumpus qui tue > flèches épuisées, si les deux surviennent au même tir).
- Mettre à jour `state.wumpus` dans le nouvel état retourné. Aucun autre système n'a besoin de changement : `senseLines`/`describeRoom` lisent déjà `state.wumpus` en direct, donc les indices resteront corrects automatiquement au tour suivant.
- Le Wumpus peut atterrir dans une pièce qui contient aussi un puits ou des chauves-souris : pas de règle spéciale à ajouter, ces dangers restent indépendants.

## 2. Réappliquer la règle anti-exploit sur `shoot` (spécifiée mais absente du code actuel)

En relisant `Wumpus.logic.ts`, la validation d'un chemin de tir (`if (!state.cave[from].includes(r))`) vérifie la connectivité contre `state.cave`, c'est-à-dire **le graphe complet caché** de la caverne — pas contre ce que le joueur a réellement découvert en jouant. C'est exactement la faille identifiée précédemment (prompt `prompt-06-terminal-hunt-the-wumpus.md`, section "Règle anti-exploit") : un joueur peut sonder des séquences arbitraires sans bouger, gratuitement (un chemin invalide ne coûte pas de flèche), et reconstruire toute la topologie de la caverne sans le moindre risque. Cette correction n'a apparemment pas été appliquée — à corriger maintenant.

À implémenter :

- Ajouter à `GameState` un suivi des pièces effectivement visitées par le joueur au cours de la partie (ex. `visited: number[]` ou une structure équivalente), initialisé dans `createGame` avec la pièce de départ, et mis à jour dans `enterRoom` à chaque pièce réellement traversée (y compris les pièces intermédiaires lors d'une chaîne de chauves-souris).
- Une connexion entre deux pièces `u` et `v` est considérée "connue" si **au moins une** des deux (`u` ou `v`) a été visitée — se tenir dans une pièce révèle ses tunnels, ce qui révèle la connexion dans les deux sens.
- Dans la validation du chemin de `shoot` (la boucle `for (const r of rooms)` dans `executeCommand`), pour chaque segment `from → r` où `from !== state.player` (donc pas le tout premier segment, qui part toujours de la pièce courante et est donc toujours connu), vérifier que la connexion `from-r` est "connue" au sens ci-dessus. Si ce n'est pas le cas, rejeter avec un message générique, par exemple `"Tu ne connais pas ce chemin."` — **que la connexion existe réellement ou non** dans `state.cave`. Ne jamais laisser deviner, via le message ou le comportement, si la connexion testée est réelle.
- Le tout premier segment (de la pièce courante vers la première pièce visée) reste validé normalement contre `state.cave[state.player]`, comme aujourd'hui — le joueur connaît toujours les tunnels de sa pièce actuelle.

## Vérification attendue

- Un tir raté déplace systématiquement le Wumpus vers une pièce adjacente aléatoire ; s'il atterrit sur le joueur, défaite immédiate avec un message distinct des autres cas de défaite.
- Les indices (`look`, arrivée dans une pièce) reflètent bien la position à jour du Wumpus après qu'il ait bougé.
- Une séquence `shoot` utilisant une connexion non découverte par exploration réelle est toujours rejetée avec le même message générique, qu'elle soit ou non valide dans le graphe caché — vérifier en particulier qu'aucune différence de comportement ou de message ne permette de distinguer les deux cas.
- Le premier segment d'un tir (depuis la pièce courante) continue de fonctionner normalement sans exiger de visite préalable.
- Build/lint passe sans erreur ; aucune régression sur les autres commandes (`move`, `look`, `arrows`, `help`, `new`).
