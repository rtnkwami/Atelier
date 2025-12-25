variable "vpc_cidr_block" {
  type        = string
  description = "CIDR block for the VPC"
  default     = "10.16.0.0/16"
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

variable "availability_zones" {
  type        = list(string)
  description = "List of availability zone suffixes"
  default     = ["a", "b", "c"]
}