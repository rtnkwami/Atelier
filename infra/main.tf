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
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 3)
  database_url = "postgresql://${var.database_user}:${var.database_password}@${module.database.db_cluster_endpoint}/${var.database_name}?sslmode=no-verify"
}

module "network" {
  source = "./network"

  availability_zones = local.availability_zones
  project_name       = var.project_name
  resource_prefix    = var.resource_prefix
  vpc_cidr_block     = var.vpc_cidr_range
}

module "database" {
  source = "./database"
  
  database_user = var.database_user
  database_name = var.database_name
  database_password = var.database_password
  resource_prefix = var.resource_prefix
  project_name = var.project_name
  db_subnet_ids = module.network.db_subnet_ids
  database_cluster_security_group_id = module.network.database_cluster_security_group_id
}

module "compute" {
  source = "./compute"

  resource_prefix          = var.resource_prefix
  project_name             = var.project_name
  api_image                = var.api_image
  frontend_image           = var.frontend_image
  cloudmap_namepsace       = var.cloudmap_namepsace

  # Required networking inputs
  web_subnet_ids           = module.network.web_subnet_ids
  app_subnet_ids           = module.network.app_subnet_ids
  api_security_group_id     = module.network.api_security_group_id
  public_alb_security_group_id = module.network.public_alb_security_group_id
  frontend_security_group_id = module.network.frontend_security_group_id
  vpc_id = module.network.vpc_id

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
  app_base_url = var.app_base_url
  backend_url = var.backend_url
}