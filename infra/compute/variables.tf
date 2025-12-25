variable "resource_prefix" {
  type        = string
  description = "Prefix for resource names"
}

variable "project_name" {
  type        = string
  description = "Project name for resource tagging"
}

variable "api_image" {
  type = string
  description = "Container image URI for api service"
}