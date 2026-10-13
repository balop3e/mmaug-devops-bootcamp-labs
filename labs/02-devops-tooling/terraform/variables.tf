variable "external_port" {
  description = "Local browser port. The application still listens on 3000 inside its container."
  type        = number
  default     = 3000
  validation {
    condition     = var.external_port >= 1024 && var.external_port <= 65535
    error_message = "Choose an unprivileged port from 1024 to 65535."
  }
}

variable "app_message" {
  description = "A harmless message displayed by the application. Do not put secrets here."
  type        = string
  default     = "Hello from Terraform"
}
