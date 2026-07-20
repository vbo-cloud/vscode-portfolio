# Backend config cannot use Terraform variables — these must be literal strings.
# Dedicated state storage account in rg-vbo-frc — the same resource group as
# the rest of the vbo infra. Originally pointed at job-finder's tfstate
# storage account, but that's the same "borrowing a jf-named resource for
# something unrelated" inconsistency already fixed for rg-vbo-frc/kv-vbo-frc,
# so it moved here instead. No vbo- prefix needed on the container itself —
# the whole storage account is already vbo-dedicated.
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-vbo-frc"
    storage_account_name = "stvbotfstatefrc"
    container_name       = "tfstate"
    key                  = "vbo.tfstate"
    use_azuread_auth     = true
  }
}
