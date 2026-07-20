# Backend config cannot use Terraform variables — these must be literal strings.
# Reuses job-finder's existing state storage account (stjftfstatefrc /
# rg-jf-tfstate-frc) with its own container and key, so this repo doesn't need
# a second state storage account just for one small resource set.
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-jf-tfstate-frc"
    storage_account_name = "stjftfstatefrc"
    container_name       = "vbo-tfstates"
    key                  = "vbo.tfstate"
    use_azuread_auth     = true
  }
}
