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
  source             = "./network"
  availability_zones = local.availability_zones
}