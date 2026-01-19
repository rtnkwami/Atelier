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


# ------------ Module Configuration -------------- #
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  availability_zones =  toset(slice(data.aws_availability_zones.available.names, 0, 3))
  database_url = "postgresql://${var.database_user}:${var.database_password}@${module.database.db_cluster_endpoint}/${var.database_name}?sslmode=no-verify"
}

module "database" {
  source = "./database"
  
  database_user = var.database_user
  database_name = var.database_name
  database_password = var.database_password
  resource_prefix = var.resource_prefix
  project_name = var.project_name
  db_subnet_ids = [for subnet in aws_subnet.db_subnets : subnet.id]
  database_cluster_security_group_id = aws_security_group.database_cluster_security_group.id
}

module "compute" {
  source = "./compute"

  resource_prefix          = var.resource_prefix
  project_name             = var.project_name
  api_image                = var.api_image
  frontend_image           = var.frontend_image

  # Required networking inputs
  web_subnet_ids           = [for subnet in aws_subnet.web_subnets : subnet.id]
  app_subnet_ids           = [for subnet in aws_subnet.app_subnets : subnet.id]
  api_security_group_id     = aws_security_group.api_security_group.id
  public_alb_security_group_id = aws_security_group.public_alb_security_group.id
  private_alb_security_group_id = aws_security_group.private_alb_security_group.id
  frontend_security_group_id = aws_security_group.frontend_security_group.id
  vpc_id = aws_vpc.vpc.id

  # Required api task variables
  database_url             = local.database_url
  issuer_base_url          = var.issuer_base_url
  audience                 = var.audience

  # Required frontend task variables
  auth0_audience = var.auth0_audience
  auth0_client_id = var.auth0_client_id
  auth0_client_secret = var.auth0_client_secret
  auth0_domain = var.auth0_domain
  auth0_secret = var.auth0_secret
}