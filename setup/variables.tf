variable "deployment_region" {
  type = string
  default = "us-east-1"
}

variable "github_repo" {
  type = string
}

variable "s3_state_bucket_name" {
  type = string
  default = "CICDBucket"
}