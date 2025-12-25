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
locals {
  availability_zones = ["a", "b", "c"]
}

module "network" {
  source = "./network"

  availability_zones = local.availability_zones
}