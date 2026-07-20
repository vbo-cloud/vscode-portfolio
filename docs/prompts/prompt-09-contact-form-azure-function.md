# Prompt — Formulaire de contact : Azure Function + Key Vault (SMTP Zoho)

## Contexte / décisions actées avec Vincent le 2026-07-20

Le site (`vincentboutin.dev`, custom domain via `CNAME`, déployé manuellement par `npm run deploy` →
`gh-pages -d dist`, aucun workflow GitHub Actions dans ce repo — voir `package.json:11` et absence de
`.github/`) doit gagner un formulaire de contact qui envoie un email sans passer par un widget tiers
(Formspree/EmailJS). Un navigateur ne peut ni ouvrir de connexion SMTP brute, ni cacher des identifiants côté
client — il faut donc un point de calcul serveur, que ce repo statique n'a pas. Décision : une Azure Function
HTTP-triggered, appelée en `fetch()` depuis le frontend, qui ouvre elle-même la connexion SMTP.

Compte email : `contact@vincentboutin.dev`, hébergé sur un compte Zoho Mail payant. Host SMTP `smtp.zoho.com`,
port `465`, TLS implicite (`secure: true`). Si la double authentification est activée sur ce compte Zoho
(probable), le mot de passe à utiliser est un **mot de passe d'application** généré depuis les paramètres de
sécurité Zoho — pas le mot de passe du compte. Vincent s'en charge lui-même (voir Action manuelle en fin de
prompt).

**Décision d'emplacement (actée après plusieurs allers-retours) :** cette infra vit dans **ce repo
(`portfolio`)**, pas dans `job-finder` — aucun rapport fonctionnel avec JobFinder, et ce repo n'a aucun
Terraform existant ni de convention de nommage `jf` à respecter (celle de `job-finder`, vérifiée par son
`reviewer-infra`, ne s'applique pas ici, différent repo).

**Décision de nommage (important, deuxième correction après relecture avec Vincent) : rien de ce qui est créé
ici n'est "portfolio-spécifique", à une exception près.** Le Key Vault doit rester lisible par JobFinder plus
tard. Et en y regardant de plus près, la Function elle-même est tout aussi générique : elle ne fait que
recevoir `{name, email, message}` et l'envoyer via Zoho — rien ne la lie au portfolio spécifiquement. La
**seule** chose réellement propre au portfolio dans toute cette tâche, c'est le code frontend
(`src/services/contact.ts` + le composant qui l'appelle) et l'entrée CORS `https://vincentboutin.dev`. Le
jour où JobFinder veut son propre formulaire de contact, il appellera cette même Function — ajouter son
origine à la liste CORS suffira, pas besoin de dupliquer l'infra.

En conséquence, nomme **toutes** les ressources Azure (resource group, Key Vault, Function App, son storage
account, son service plan) avec le code personnel `vbo` plutôt que `portfolio` — ça reflète honnêtement leur
portée réelle (partagée entre projets perso), pas leur premier consommateur : `rg-vbo-frc`, `kv-vbo-frc`,
`func-vbo-contact-frc`, `stvbofrc` (vérifier la disponibilité globale de ces deux derniers noms — Key Vault et
Function App exigent un nom unique au niveau mondial, ajuster si pris). Reste dans la même subscription Azure
que JobFinder (un seul compte perso, pas de raison de multiplier les subscriptions à ce stade — cf.
discussion sur les landing zones).

**Décision CI/CD : pas de CI pour cette première version.** Ce repo n'a jamais eu de GitHub Actions ; son
déploiement est déjà 100% manuel/local. Reproduire le pattern OIDC + service principal de `job-finder`
(`sp-jf-github`) serait disproportionné pour une seule Function — ça peut venir plus tard si le besoin se
confirme. `terraform apply` sera donc lancé **localement par Vincent**, authentifié via son propre `az login`
(pas de `use_oidc`, pas de `ARM_*` — utiliser `data.azurerm_client_config.current` pour le `tenant_id` comme
le fait déjà `job-finder`). Documente-le clairement dans le Terraform (commentaire) pour que ce ne soit pas
pris pour un oubli.

**État Terraform :** réutilise le storage account existant de `job-finder` (`stjftfstatefrc`, resource group
`rg-jf-tfstate-frc`) avec un **nouveau container** dédié (`vbo-tfstates`) et une clé `vbo.tfstate` —
isolation complète du state JobFinder (containers Blob séparés), sans avoir à créer un second storage account
juste pour ça.

**Point d'implémentation important, différent de l'exemple pédagogique donné à Vincent plus tôt dans la
conversation :** l'exemple de code montré pour expliquer le concept lisait les identifiants via un appel SDK
explicite. En implémentation réelle, utilise plutôt une **Key Vault Reference** en App Setting
(`@Microsoft.KeyVault(SecretUri=...)`, construite depuis `azurerm_key_vault_secret.zoho_password.versionless_id`
pour suivre automatiquement les rotations) — c'est le pattern recommandé par Azure, il évite d'ajouter
`@azure/identity`/`@azure/keyvault-secrets` comme dépendances Function, et le code applicatif continue de lire
`process.env.ZOHO_USER`/`process.env.ZOHO_PASS` normalement, résolu par la plateforme.

**Hors périmètre de ce prompt, à signaler à Vincent sans y toucher :** `src/services/gemini.ts:3` inline
`VITE_GEMINI_API_KEY` dans le bundle client — exactement le problème d'exposition qu'on vient de résoudre ici
pour le mot de passe SMTP, mais pour la clé Gemini. Mentionne-le dans ton résumé de fin de tâche comme un
sujet séparé, ne le corrige pas dans cette PR.

## Étape 0 — Vérifier l'état réel avant de toucher à quoi que ce soit

1. `git fetch origin && git checkout dev && git merge --ff-only origin/dev`.
2. Ce repo n'a pas de skill `conventions-terraform` comme `job-finder` — tu pars d'une page blanche. Inspire-
   toi du style de `job-finder` (séparateurs de section, tags obligatoires `environment`/`project`/`owner`,
   `prevent_destroy` sur les ressources à état) sans copier son nommage `jf`.
3. Explore `src/components/` (`BottomPanel/`, `Widgets/`, `Sidebar/`, `CommandPalette/`, etc. — portfolio à
   thème "faux IDE") pour trouver où un élément de contact s'intégrerait le plus naturellement dans
   l'existant. N'invente pas un nouveau pattern d'UI si un composant approprié existe déjà (un panneau, un
   widget). Regarde aussi `src/services/gemini.ts` comme modèle direct pour la structure du nouveau service
   `contact.ts` (même repo, même convention d'appel API depuis le frontend).
4. Vérifie la doc du provider `azurerm` (pinné `~> 4.0` si tu reprends la même contrainte que job-finder, à
   toi de choisir la version pour ce nouveau repo) pour la syntaxe exacte de `azurerm_linux_function_app`,
   son bloc `site_config.cors`, et la syntaxe actuelle des Key Vault References — ne pas deviner depuis une
   version antérieure connue, la syntaxe évolue entre versions du provider.

## Tâche 1 — Terraform : fondations (`infra/terraform/`, nouveau dossier)

Nouveau root Terraform unique (pas de split landing-zone/app — inutile à cette échelle, un seul petit
ensemble de ressources, toutes génériques — voir Contexte).

- `provider "azurerm"` : `features {}`, authentification locale (pas d'OIDC — voir Contexte).
- Backend `azurerm` : storage account `stjftfstatefrc`, resource group `rg-jf-tfstate-frc`, container
  `vbo-tfstates`, key `vbo.tfstate`, `use_azuread_auth = true` (même pattern que job-finder).
- `azurerm_resource_group` : `rg-vbo-frc`, région `francecentral` (cohérence avec le reste de la
  subscription), `lifecycle { prevent_destroy = true }`. Tags `environment = "prod"` (pas de split dev/prod
  ici — un seul environnement), `project = "vbo"`, `owner = "vincentboutin.dev@gmail.com"`.
- `azurerm_key_vault` : `kv-vbo-frc` (vérifier disponibilité globale du nom), `rbac_authorization_enabled =
  true`, `purge_protection_enabled = true`, `soft_delete_retention_days = 90`,
  `lifecycle { prevent_destroy = true }`, tag `protect = "true"` en plus des tags standards (bonne pratique
  reprise de job-finder — pas de policy auto-lock à mettre en place ici, juste le tag et le
  `prevent_destroy`).
- Variable sensible `zoho_smtp_password` (`sensitive = true`, pas de défaut), fournie via un
  `terraform.tfvars` **local, gitignored, jamais committé** (ajouter la règle au `.gitignore` de ce repo si
  elle n'y est pas déjà — vérifier, ne pas dupliquer si présente).
- `azurerm_key_vault_secret` "zoho-smtp-password" : valeur = `var.zoho_smtp_password`.

## Tâche 2 — Terraform : Function App

- Storage account requis par toute Function App (état interne, triggers) : `stvbofrc` (sans tiret, ≤24
  caractères, vérifier disponibilité), `Standard_LRS`.
- `azurerm_service_plan` : SKU Consumption (`Y1`) ou Flex Consumption si tu préfères le nouveau modèle — à
  ton appréciation selon la doc provider actuelle, les deux conviennent pour ce volume de trafic (usage
  perso, pas de charge soutenue).
- `azurerm_linux_function_app` `func-vbo-contact-frc` (vérifier disponibilité globale — c'est un FQDN public
  `*.azurewebsites.net`), runtime Node.js LTS actuel, `identity { type = "SystemAssigned" }`.
- App settings : `ZOHO_USER` = `contact@vincentboutin.dev` (en clair, ce n'est pas un secret), `ZOHO_PASS` =
  la Key Vault Reference construite depuis `azurerm_key_vault_secret.zoho_password.versionless_id` (voir
  Contexte ci-dessus).
- `site_config.cors.allowed_origins` : `["https://vincentboutin.dev", "http://localhost:5173"]` (port Vite
  par défaut, pour tester en local — vérifie le port réel dans `vite.config.ts` avant de le coder en dur).
  C'est cette liste, et uniquement elle, qui sera étendue le jour où JobFinder consomme la même Function.
- `azurerm_role_assignment` : scope = l'ID du Key Vault, rôle `Key Vault Secrets User`, principal =
  `azurerm_linux_function_app.this.identity[0].principal_id`.
- Outputs : `default_hostname` de la Function App, `vault_uri` du Key Vault — utile si JobFinder les
  référence plus tard via un `data` block dans son propre Terraform.

## Tâche 3 — Code de la Function (`api/` ou `functions/` à la racine — choisis le nom le plus standard pour
le tooling Azure Functions actuel, vérifie la doc)

- Modèle de programmation Node.js v4 (`@azure/functions`), dépendance `nodemailer`.
- Une seule fonction HTTP `sendContactEmail`, méthode `POST`, `authLevel: 'anonymous'` (endpoint public par
  design — protège par validation, pas par clé d'API, qui n'aurait aucun sens pour un formulaire public).
  Générique par conception — ne pas coder en dur de logique spécifique au portfolio dans la Function
  elle-même (voir Contexte : seule la config CORS et le frontend appelant sont portfolio-spécifiques).
- Validation des champs (`name`, `email`, `message` non vides) + un **champ honeypot** simple (champ caché
  côté formulaire, rejeter silencieusement si rempli) pour filtrer les bots basiques sans imposer de captcha
  à un vrai visiteur — endpoint public + plan Consumption facturé à l'exécution, ça vaut le coup d'un filtre
  gratuit.
- `nodemailer.createTransport` : `host: 'smtp.zoho.com'`, `port: 465`, `secure: true`, `auth: { user:
  process.env.ZOHO_USER, pass: process.env.ZOHO_PASS }`.
- `sendMail` : `from`/`to` = `contact@vincentboutin.dev`, `replyTo` = l'email du visiteur, sujet incluant son
  nom, corps = son message.
- Réponse JSON `{ ok: true }` (200) ou `{ error: "..." }` (400 validation / 500 échec d'envoi), jamais de
  détail d'erreur SMTP brut renvoyé au client (log-le côté `context.error`, pas dans la réponse).

## Tâche 4 — Frontend (la seule partie réellement "portfolio-spécifique" de cette tâche)

- Nouveau `src/services/contact.ts`, même style que `src/services/gemini.ts` (voir Étape 0.3) : une fonction
  exportée qui fait le `fetch()` POST vers l'URL de la Function.
- URL de la Function via variable d'environnement Vite `VITE_CONTACT_API_URL` (même pattern que
  `VITE_GEMINI_API_KEY`, ce n'est pas un secret — l'URL d'une Function HTTP publique n'a pas besoin d'être
  cachée). Ajouter la ligne correspondante dans `.env.example`.
- Composant/formulaire de contact intégré au point d'accroche identifié en Étape 0.3 — état de chargement
  pendant l'`await` (bouton désactivé, cf. la discussion sur les cold starts Azure Function Consumption : la
  première requête après une pause peut prendre 1-2 secondes), confirmation ou message d'erreur affiché selon
  la réponse.

## Vérification avant de considérer la tâche terminée

- `terraform fmt -check` / `terraform validate` sur `infra/terraform/`.
- `terraform plan` (ne PAS `apply` — c'est un geste manuel de Vincent, voir Action manuelle ci-dessous) et
  partager le plan dans ta synthèse finale pour qu'il puisse le relire avant d'exécuter.
- Build du frontend (`npm run build`) pour confirmer qu'il compile avec le nouveau service et composant.
- Test local de la Function si l'environnement le permet (`func start` ou équivalent) avec des identifiants
  Zoho factices/de test, sinon documenter clairement que le test réel ne peut se faire qu'après déploiement
  et configuration du vrai mot de passe.

## Action manuelle Vincent (hors périmètre Claude Code, à documenter, pas à exécuter)

Termine par un résumé clair listant, dans l'ordre :
1. Générer un mot de passe d'application Zoho (paramètres de sécurité du compte Zoho Mail, si la double
   authentification est active).
2. Créer `infra/terraform/terraform.tfvars` (gitignored) avec `zoho_smtp_password = "<le mot de passe généré>"`.
3. `az login` localement, puis `terraform init && terraform plan` dans `infra/terraform/` — relire le plan.
4. `terraform apply` localement une fois le plan validé.
5. Récupérer l'URL de la Function (`terraform output default_hostname`) et l'ajouter à `.env` local
   (`VITE_CONTACT_API_URL`), puis `npm run deploy` pour publier le frontend mis à jour.
6. Rappel : `src/services/gemini.ts` a le même type de problème d'exposition que celui qu'on vient de
   corriger ici — sujet séparé, à traiter dans un futur prompt si Vincent le souhaite.

## Git

Nouvelle branche `feature/contact-form-azure-function` depuis `dev` à jour. Un seul type de changement
(Terraform + Function + frontend, cohérents entre eux, pas de raison de séparer en plusieurs PR ici — ce
n'est pas job-finder, pas de règle "jamais mélanger plateforme et app"). Merge `dev` avec `--no-ff` une fois
prêt. Pas de release vers `main` dans ce prompt — Vincent taguera une nouvelle version (`MINOR`, nouvelle
capacité) quand il le décidera, après avoir testé en conditions réelles.
