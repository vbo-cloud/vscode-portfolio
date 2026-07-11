# Prompt Claude Code — rm -rf : refonte de la tension (budget par nœud) + interface

## Contexte

Fichiers concernés : `src/components/BottomPanel/games/RmRf.logic.ts` et `RmRf.tsx`. Tout reste **exclusivement piloté par la ligne de commande** — pas de clic pour agir sur un fichier/dossier, seulement pour naviguer/consulter si besoin. Trois problèmes constatés à l'usage sur la version actuelle, traités ci-dessous.

## 1. Fiabiliser `cd ..`

Le code actuel (`executeCommand`, branche `cd`) ne reconnaît que `arg === '..'` exactement. Accepter aussi les variantes courantes `../` et `..` avec un `/` final, pour éviter un rejet surprenant sur une habitude de frappe classique. La remontée vers le parent doit rester **toujours valide** (jamais soumise à la règle "il faut avoir fait `ls` ici"), comme c'est déjà le cas — juste élargir la reconnaissance de l'argument.

## 2. Le vrai problème : un budget global partagé ne crée aucune tension

Actuellement (`applyCost`, `GameState.budget`), toute l'arborescence dérive comme un seul bloc vers une ligne rouge partagée. Conséquence : aucune branche n'est jamais plus urgente qu'une autre, il n'y a qu'un problème d'optimisation abstrait (minimiser le nombre total de commandes) — pas de sensation de jeu, pas de dilemme de priorité perceptible.

### Nouveau modèle : un compte à rebours indépendant par dossier découvert

- Garder un compteur global de coups joués (`tick`, incrémenté à chaque commande **valide**, comme l'actuel `budget` mais qui ne décroît plus directement — il sert de référence temporelle).
- Chaque dossier obtient sa propre échéance (`deadline`) au moment où il est découvert par un `ls` (pas avant — un dossier non exploré n'est pas en danger). Cette échéance est indépendante de celle de ses parents/enfants.
- Calibrer l'échéance de chaque dossier sur son propre contenu (ex. une base fixe + un coût proportionnel à son nombre de fichiers propres), par palier de difficulté — dans le même esprit empirique que `DIFFICULTY_CONFIG`/`planCost` existants.
- **Défaite** : dès qu'un dossier découvert et pas encore "propre" (ses fichiers à lui, pas ceux de ses enfants) atteint son échéance (`tick >= deadline`) → ligne rouge franchie pour cette branche, game over.
- Une fois les fichiers propres d'un dossier supprimés, son échéance n'a plus lieu d'être (il n'est plus en danger, peu importe que ses enfants soient encore sales ou non — chaque enfant a sa propre échéance indépendante, démarrée à sa propre découverte).
- **Victoire** : la racine est entièrement propre (`isClean`, déjà en place, récursif) avant qu'une échéance n'expire.
- Conséquence voulue : explorer beaucoup de branches d'un coup (plusieurs `ls` dans des sous-dossiers différents avant de revenir nettoyer) fait courir plusieurs horloges en parallèle — un vrai dilemme de priorité apparaît (laquelle traiter en premier, laquelle peut attendre). C'est ça qui doit remplacer la sensation de "corvée sans enjeu".
- Adapter `planCost` (ou une nouvelle fonction de vérification) pour s'assurer qu'un ordre de jeu raisonnable (même stratégie de référence : sous-arbres les moins profonds d'abord, jokers banqués, `rm *` sur les dossiers chargés) ne laisse jamais une échéance expirer, sur toutes les difficultés. Un calibrage empirique (ajuster les constantes jusqu'à ce que la simulation de référence passe systématiquement) est acceptable si une preuve formelle est trop complexe à produire.

### Pourquoi pas un déplacement physique de tout l'arbre

Avec ce nouveau modèle, chaque dossier a sa propre échéance — mais l'arbre affiché reste une hiérarchie fixe (position horizontale = profondeur, cf. section suivante), donc on ne peut pas physiquement faire glisser chaque dossier indépendamment sans casser la lisibilité de la hiérarchie. À la place : représenter l'urgence de chaque dossier découvert par un **indicateur individuel** sur sa propre ligne (ex. une mini-jauge ou un liseré qui vire progressivement du neutre au rouge à mesure que `tick` se rapproche de sa `deadline`), plutôt qu'un déplacement de la position. La ligne rouge globale (cf. section 3) devient un élément d'ambiance fixe plutôt qu'une frontière qui se rapproche physiquement.

## 3. Interface : arbre horizontal statique et plus grand, ligne à gauche

L'affichage actuel confine l'arbre dans une colonne étroite (`w-52 md:w-64`) séparée du journal, très éloigné de ce qui était souhaité. À la place :

- Afficher l'arborescence comme un **diagramme horizontal statique** occupant la majeure partie du panneau (racine à gauche, profondeur croissante vers la droite, branches reliées par des traits, façon organigramme) — la position horizontale d'un nœud reflète sa profondeur dans l'arbre, elle ne bouge pas dans le temps.
- Une ligne verticale rouge fixe, cette fois **à gauche** du diagramme (juste après la racine), comme élément d'ambiance associé au thème "danger" — elle ne se déplace plus physiquement (cf. section 2, l'urgence réelle est maintenant portée par l'indicateur individuel de chaque dossier, pas par la position de cette ligne).
- Garder les icônes déjà en place (`Folder`/`FolderOpen`/`File`/`CheckCircle2`/`Sparkles`) et la mise en évidence du dossier courant.
- Le journal de commandes + le champ de saisie peuvent occuper une bande plus compacte (en dessous ou à côté), l'arbre devenant l'élément visuel principal plutôt qu'un encart secondaire.
- `DifficultyRail`/`ActionsRail` restent en place comme sur les autres jeux.

## 4. Réduire la corvée de frappe initiale

Pour que la tension soit sensible plus tôt (retour utilisateur : "trop de choses à taper avant de sentir le moindre challenge") : réduire légèrement les bornes de fichiers par dossier dans `DIFFICULTY_CONFIG` (notamment `easy`/`normal`), pour que les premiers dossiers se nettoient en peu de commandes et que le joueur ressente vite le fonctionnement des échéances individuelles, plutôt que d'enchaîner de nombreux `rm` à faible enjeu avant que quoi que ce soit ne devienne critique.

## Vérification attendue

- `cd ../` et `cd ..` fonctionnent identiquement, toujours valides même sans `ls` préalable.
- Un dossier exploré puis délaissé trop longtemps expire indépendamment des autres, sans faire perdre toute la partie si le reste de l'arbre est encore dans les temps — sauf s'il s'agissait du dernier dossier non nettoyé, auquel cas c'est une défaite normale.
- Une simulation de jeu raisonnable (parcours efficace) ne déclenche jamais une expiration prématurée, sur les trois difficultés.
- L'arbre s'affiche en organigramme horizontal statique, plus large que l'ancien encart, avec la ligne rouge fixe à gauche.
- Chaque dossier découvert affiche un indicateur individuel d'urgence qui évolue avec le temps qui passe, distinct des autres dossiers.
- Build/lint passe sans erreur ; aucune régression sur les commandes existantes (`ls`, `cd`, `rm`, `rm *`, jokers, `help`, `new`).
