variable "resource_prefix" {
  type        = string
  description = "Prefix for resource names"
}

variable "project_name" {
  type        = string
  description = "Project name for resource tagging"
}

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

variable "db_subnet_ids" {
  type = list(string)
  description = "IDs of database subnets to deploy database cluster in"
}

variable "database_cluster_security_group_id" {
  type = string
}