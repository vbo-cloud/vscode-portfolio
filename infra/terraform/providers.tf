terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# This repo has no GitHub Actions (deployment is already 100% manual — see
# package.json's `deploy` script and the absence of .github/). Reproducing
# job-finder's OIDC + service principal pattern for a single Function would be
# disproportionate at this scale, so `terraform apply` is run locally by
# Vincent, authenticated via his own `az login` — no ARM_* env vars, no
# use_oidc. Revisit if this infra grows enough to justify CI.
provider "azurerm" {
  features {}
}

# Needed for the Key Vault's tenant_id.
data "azurerm_client_config" "current" {}
