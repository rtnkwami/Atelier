variable "github_repo" {
  type = string
}

variable "s3_state_bucket_name" {
  type = string
  default = "CICDBucket"
}

variable "state_file_region" {
  type = string
  default = "us-east-1"
}