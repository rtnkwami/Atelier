variable "project_name" {
  type        = string
  description = "Project name for resource tagging"
  default     = "Atelier"
}

variable "resource_prefix" {
  type        = string
  description = "Prefix for resource names"
  default     = "atelier"
}

variable "api_image" {
  type        = string
  description = "Container image URI for api service"
  default = "docker.io/weaverofinfinity/atelier-api"
}

variable "frontend_image" {
  type        = string
  description = "Container image URI for api service"
  default = "docker.io/weaverofinfinity/atelier-web"
}

variable "vpc_cidr_range" {
  type = string
  default = "10.16.0.0/16"
}

variable "cloudmap_namepsace" {
  type = string
}

#----------------- Sensitive Variables ------------------#

variable "database_user" {
  type = string
  sensitive = true
}

variable "database_name" {
  type = string
  sensitive = true
}

variable "database_password" {
  type = string
  sensitive = true
}

variable "issuer_base_url" {
  type      = string
  sensitive = true
}

variable "audience" {
  type      = string
  sensitive = true
}

variable "app_base_url" {
  type = string
}

variable "backend_url" {
  type = string
}

variable "auth0_domain" {
  type = string
}

variable "auth0_client_id" {
  type = string
}

variable "auth0_client_secret" {
  type = string
}

variable "auth0_secret" {
  type = string
}

variable "auth0_audience" {
  type = string
}