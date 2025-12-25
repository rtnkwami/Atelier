variable "project_name" {
  type        = string
  description = "Project name for resource tagging"
  default = "Atelier"
}

variable "resource_prefix" {
  type        = string
  description = "Prefix for resource names"
  default = "atelier"
}

variable "api_image" {
  type = string
  description = "Container image URI for api service"
  default = "docker.io/weaverofinfinity/atelier"
}