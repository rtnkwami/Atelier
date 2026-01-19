terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket  = "niovial-sandbox-terraform-state"
    key     = "Sandbox/Atelier/terraform.tfstate"
    encrypt = true
    use_lockfile = true
    region  = "us-east-1"
  }
}

provider "aws" {
  region  = "us-east-1"
}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  availability_zones =  toset(slice(data.aws_availability_zones.available.names, 0, 3))
  database_url = "postgresql://${var.database_user}:${var.database_password}@${aws_rds_cluster.db_cluster.endpoint}/${var.database_name}?sslmode=no-verify"
}