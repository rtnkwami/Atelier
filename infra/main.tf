terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket       = var.s3_state_bucket
    key          = var.s3_state_file_key
    encrypt      = true
    use_lockfile = true
    region       = var.deployment_region
  }
}

provider "aws" {
  region = var.deployment_region
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ssm_parameter" "database_name" {
  name = "/atelier/database/name"
}

data "aws_ssm_parameter" "database_user" {
  name = "/atelier/database/user"
}

data "aws_secretsmanager_secret" "database_password" {
  name = "/atelier/database/password"
}

data "aws_secretsmanager_secret_version" "database_password" {
  secret_id = data.aws_secretsmanager_secret.database_password.id
}

locals {
  availability_zones = toset(slice(data.aws_availability_zones.available.names, 0, 3))
  database_url = "postgresql://${data.aws_ssm_parameter.database_user.value}:${data.aws_secretsmanager_secret_version.database_password.secret_string}@${aws_rds_cluster.db_cluster.endpoint}/${data.aws_ssm_parameter.database_name.value}?sslmode=require"
}