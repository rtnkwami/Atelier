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

variable "frontend_image" {
  type = string
  description = "Container image URI for frontend service"
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
  description = "ID of security group allowing ingress access to api"
}

variable "frontend_security_group_id" {
  type        = string
  description = "ID of security group allowing ingress access to frontend"
}

variable "alb_security_group_id" {
  type = string
}

variable "cloudmap_namepsace" {
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
