resource "aws_ecs_cluster" "nexus_cluster" {
  name = "${var.resource_prefix}-ecs-cluster"

  tags = {
    "Name"         = "${var.resource_prefix}-ecs-cluster"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}