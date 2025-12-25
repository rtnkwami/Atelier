variable "vpc_cidr_block" {
  type        = string
  description = "CIDR block for the VPC"
}

variable "project_name" {
  type        = string
  description = "Project name for resource tagging"
}

variable "resource_prefix" {
  type        = string
  description = "Prefix for resource names"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of availability zone suffixes"
}