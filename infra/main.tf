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

  # sslmode=no-verify is used in the database url because the Prisma ORM expects ssl for database connections in production.
  # Within this IaC, there is no ssl configured for database connections between the api tasks and the database
  # adding sslmode=no-verify removes any encryption errors from Prisma ORM that comes along with this.
  #
  # In addition, due to the database being locked down via its security group, and by being in a private subnet, ssl was not configured
  # for connections between it and the backend api tasks.
  database_url = "postgresql://${var.database_user}:${var.database_password}@${aws_rds_cluster.db_cluster.endpoint}/${var.database_name}?sslmode=no-verify"
}