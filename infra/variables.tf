variable "s3_state_bucket" {
  type = string
  default = "niovial-sandbox-terraform-state"
}

variable "s3_state_file_key" {
  type = string
  default = "Sandbox/Atelier/terraform.tfstate"
}

variable "deployment_region" {
type = string
default = "us-east-1"
}

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
  default     = "docker.io/weaverofinfinity/atelier-api"
}

variable "frontend_image" {
  type        = string
  description = "Container image URI for api service"
  default     = "docker.io/weaverofinfinity/atelier-web"
}

variable "vpc_cidr_range" {
  type    = string
  default = "10.16.0.0/16"
}