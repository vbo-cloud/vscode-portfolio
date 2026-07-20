# Named vbo, not portfolio: this Key Vault is scoped to "personal projects",
# not to the portfolio site specifically. JobFinder (or any future vbo
# project) can read from it later without duplicating infra — see Context in
# docs/prompts/prompt-09-contact-form-azure-function.md.
resource "azurerm_key_vault" "this" {
  name                       = "kv-vbo-frc"
  location                   = azurerm_resource_group.this.location
  resource_group_name        = azurerm_resource_group.this.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  rbac_authorization_enabled = true
  purge_protection_enabled   = true
  soft_delete_retention_days = 90

  tags = merge(local.common_tags, {
    protect = "true"
  })

  lifecycle {
    prevent_destroy = true
  }
}

# RBAC-mode Key Vault grants no implicit data-plane access, not even to the
# deploying identity (Owner/Contributor cover the management plane only) —
# without this, the secret write below 403s on a first-ever `terraform apply`.
# `data.azurerm_client_config.current.object_id` is whoever is authenticated
# via `az login` when applying, i.e. Vincent himself (see providers.tf: no
# OIDC/service principal here).
resource "azurerm_role_assignment" "deployer_secrets_officer" {
  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}

resource "azurerm_key_vault_secret" "zoho_smtp_password" {
  name         = "zoho-smtp-password"
  value        = var.zoho_smtp_password
  key_vault_id = azurerm_key_vault.this.id

  depends_on = [azurerm_role_assignment.deployer_secrets_officer]
}
