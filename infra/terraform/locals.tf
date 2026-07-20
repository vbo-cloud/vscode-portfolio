# Single environment (prod) for this whole resource set — no dev/prod split,
# see Context in docs/prompts/prompt-09-contact-form-azure-function.md.
locals {
  common_tags = {
    environment = "prod"
    project     = "vbo"
    owner       = "vincentboutin.dev@gmail.com"
  }
}
