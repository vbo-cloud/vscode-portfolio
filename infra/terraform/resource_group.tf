resource "azurerm_resource_group" "this" {
  name     = "rg-vbo-frc"
  location = "francecentral"

  tags = local.common_tags

  lifecycle {
    prevent_destroy = true
  }
}
