# Both consumable by a future project's Terraform (e.g. JobFinder) via a
# `data` block, without referencing this state directly.
output "function_default_hostname" {
  value       = azurerm_linux_function_app.contact.default_hostname
  description = "Public hostname of the contact Function App (*.azurewebsites.net). The contact endpoint is https://<this>/api/sendContactEmail."
}

output "key_vault_uri" {
  value       = azurerm_key_vault.this.vault_uri
  description = "URI of the shared vbo Key Vault."
}
