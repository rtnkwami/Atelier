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
    region  = "us-east-1"
    profile = "sandbox"
  }
}

provider "aws" {
  region  = "us-east-1"
  profile = "sandbox"
}


# ------------ Module Configuration -------------- #
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 3)
}

module "network" {
  source = "./network"

  availability_zones = local.availability_zones
  project_name       = var.project_name
  resource_prefix    = var.resource_prefix
  vpc_cidr_block     = "10.16.0.0/16"
}

module "compute" {
  source = "./compute"

  resource_prefix          = var.resource_prefix
  project_name             = var.project_name
  api_image                = var.api_image
  web_subnet_ids           = module.network.web_subnet_ids
  public_security_group_id = module.network.public_security_group_id
  database_url             = var.database_url
  issuer_base_url          = var.issuer_base_url
  audience                 = var.audience
}