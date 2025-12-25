resource "aws_ecs_cluster" "nexus_cluster" {
  name = "${var.resource_prefix}-ecs-cluster"

  tags = {
    "Name"         = "${var.resource_prefix}-ecs-cluster"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_ecs_task_definition" "api_task" {
  family = "${var.resource_prefix}-api"
  network_mode = "awsvpc"
  cpu = 512
  memory = 1024
  requires_compatibilities = ["FARGATE"] 
  
  runtime_platform {
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name = "${var.resource_prefix}-api"
      image = var.api_image
      essential = true
      portMappings = [
        {
          containerPort = 5000,
          hostPort = 5000
        }
      ]
    }
  ])
}