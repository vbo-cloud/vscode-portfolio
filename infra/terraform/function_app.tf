# Storage account required by any Function App (internal state, triggers) —
# not for application data. No tiret, <=24 chars, LRS is plenty for this
# volume of traffic.
resource "azurerm_storage_account" "function" {
  name                     = "stvbofrc"
  resource_group_name      = azurerm_resource_group.this.name
  location                 = azurerm_resource_group.this.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = local.common_tags
}

# Consumption plan (Y1): usage is a personal contact form, not sustained
# traffic — pay-per-execution is the right shape here, and it's the simpler,
# more battle-tested model over the newer Flex Consumption resource type.
resource "azurerm_service_plan" "function" {
  name                = "asp-vbo-contact-frc"
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  os_type             = "Linux"
  sku_name            = "Y1"

  tags = local.common_tags
}

resource "azurerm_linux_function_app" "contact" {
  name                = "func-vbo-contact-frc"
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  service_plan_id     = azurerm_service_plan.function.id

  storage_account_name       = azurerm_storage_account.function.name
  storage_account_access_key = azurerm_storage_account.function.primary_access_key

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      node_version = "22"
    }

    # Only this list, extended later, is what makes this Function "the
    # portfolio's contact backend" rather than a fully generic email relay —
    # see Context in docs/prompts/prompt-09-contact-form-azure-function.md.
    # 5173 is Vite's default dev port (vite.config.ts sets no override).
    cors {
      allowed_origins = [
        "https://vincentboutin.dev",
        "http://localhost:5173",
      ]
    }
  }

  app_settings = {
    ZOHO_USER = "contact@vincentboutin.dev"
    # Key Vault Reference, not a literal secret value — resolved by the
    # platform at runtime from the Function App's own managed identity.
    # versionless_id (vs. .id) means secret rotations don't require a
    # Terraform change to pick up.
    ZOHO_PASS = "@Microsoft.KeyVault(SecretUri=${data.azurerm_key_vault_secret.zoho_smtp_password.versionless_id})"
  }

  tags = local.common_tags
}

# Lets the Function's own managed identity resolve the ZOHO_PASS Key Vault
# Reference above.
resource "azurerm_role_assignment" "function_secrets_user" {
  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_linux_function_app.contact.identity[0].principal_id
}
