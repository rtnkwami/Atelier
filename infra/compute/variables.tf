variable "resource_prefix" {
  type        = string
  description = "Prefix for resource names"
}

variable "project_name" {
  type        = string
  description = "Project name for resource tagging"
}

variable "api_image" {
  type        = string
  description = "Container image URI for api service"
}

variable "vpc_id" {
  type = string
}

variable "web_subnet_ids" {
  type        = list(string)
  description = "IDs of web subnets to deploy load balancers in"
}

variable "app_subnet_ids" {
  type        = list(string)
  description = "IDs of web subnets to deploy api tasks in"
}

variable "api_security_group_id" {
  type        = string
  description = "ID of security group allowing public internet access to api"
}

variable "api_lb_security_group_id" {
  type = string
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
