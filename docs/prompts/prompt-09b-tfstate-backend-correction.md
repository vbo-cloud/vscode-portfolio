# Prompt — Correction : backend Terraform dédié (plus de partage avec job-finder)

## Contexte / décisions actées avec Vincent le 2026-07-20

Suite du prompt `docs/prompts/prompt-09-contact-form-azure-function.md`. Ce prompt-là faisait pointer le
backend Terraform de ce repo vers le storage account de `job-finder` (`stjftfstatefrc`, dans
`rg-jf-tfstate-frc`), avec un container dédié (`vbo-tfstates`) pour isoler le state. En relisant, même
logique que pour `rg-vbo-frc`/`kv-vbo-frc` : faire porter le state d'une infra sans rapport avec JobFinder par
une resource group nommée `jf` est la même incohérence qu'on a déjà corrigée ailleurs.

Vincent a donc créé manuellement, via le portail Azure, un storage account dédié dans `rg-vbo-frc` (le même
resource group que le reste de l'infra `vbo`) : **`stvbotfstatefrc`** (nom corrigé — le storage account
initialement créé s'appelait `rgvbotfstatefrc`, préfixe incohérent avec la convention `st` des storage
accounts ; si Vincent a gardé ce nom plutôt que de le recréer, adapte simplement la valeur ci-dessous).

**Le Key Vault (`kv-vbo-frc`) contient déjà le secret `zoho-smtp-password`** (Vincent l'a ajouté à la main
via le portail, cf. `data "azurerm_key_vault_secret" "zoho_smtp_password"` dans `keyvault.tf`). Un
`terraform apply` complet (sans `-target`) peut donc suivre juste après la migration du backend — plus besoin
de rester sur l'apply ciblé du rôle RBAC.

## Tâche unique — `infra/terraform/backend.tf`

Remplacer la configuration du backend :

- `resource_group_name` : `"rg-jf-tfstate-frc"` → `"rg-vbo-frc"`
- `storage_account_name` : `"stjftfstatefrc"` → `"stvbotfstatefrc"`
- `container_name` : `"vbo-tfstates"` → `"tfstate"` (plus besoin de préfixer par `vbo-` à l'intérieur du
  container — le storage account entier est maintenant dédié à `vbo`, cette redondance n'a plus de raison
  d'être)
- `key` : garder `"vbo.tfstate"`
- `use_azuread_auth = true` : inchangé

Ne touche à aucun autre fichier `.tf` dans cette correction — seul `backend.tf` change.

## Vérification

- `terraform fmt -check` sur `infra/terraform/`.
- Ne lance ni `terraform init`, ni `plan`, ni `apply` toi-même sur ce changement de backend — c'est un geste
  que Vincent doit faire à la main (voir Action manuelle), parce que `terraform init` va lui poser une
  question interactive à laquelle lui seul peut répondre en connaissance de cause.

## Action manuelle Vincent (hors périmètre Claude Code)

Termine ta synthèse en rappelant ces étapes, dans l'ordre :

1. Depuis `infra/terraform/`, lance `terraform init`. Terraform va détecter que la configuration du backend a
   changé et demander : *"Do you want to copy existing state to the new backend? Enter a value: yes"* —
   répondre **yes**, pour migrer ce qui a éventuellement déjà été créé (le role assignment RBAC en
   particulier) plutôt que de perdre la trace de son état et risquer une erreur "already exists" au prochain
   apply. Si l'apply ciblé précédent n'a jamais abouti, cette étape est un no-op sans risque.
2. `terraform plan` depuis `infra/terraform/` — relire (le secret étant déjà dans le Key Vault, ce plan
   devrait maintenant inclure la Function App et le reste, plus seulement le role assignment).
3. `terraform apply` une fois le plan relu.

## Git

Même branche que le prompt 09 (`feature/contact-form-azure-function`) si elle est encore ouverte — c'est une
correction du même changement, pas un nouveau sujet. Un seul commit supplémentaire, pas une nouvelle PR.
