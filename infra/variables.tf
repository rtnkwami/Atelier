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
  default     = "docker.io/weaverofinfinity/atelier"
}

variable "vpc_cidr_range" {
  type = string
  default = "10.16.0.0/16"
}

#----------------- Sensitive Variables ------------------#

variable "database_url" {
  type      = string
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