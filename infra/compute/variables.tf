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

variable "web_subnet_ids" {
  type = list(string)
  description = "IDs of web subnets to deploy public tasks in"
}

variable "public_security_group_id" {
  type = string
  description = "ID of security group allowing public internet access to api"
}