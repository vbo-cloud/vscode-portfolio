# No default and not marked with a CHANGE_ME placeholder — unlike job-finder's
# templated variables, this repo has a single real consumer (Vincent), so the
# value is supplied directly via a local, gitignored terraform.tfvars.
variable "zoho_smtp_password" {
  type        = string
  description = "Zoho Mail app-specific password for contact@vincentboutin.dev, used as the SMTP auth secret."
  sensitive   = true
}
