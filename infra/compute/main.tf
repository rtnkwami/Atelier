resource "aws_ecs_cluster" "cluster" {
  name = "${var.resource_prefix}-ecs-cluster"

  tags = {
    "Name"         = "${var.resource_prefix}-ecs-cluster"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_ecs_task_definition" "api_task" {
  family                   = "${var.resource_prefix}-api"
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  requires_compatibilities = ["FARGATE"]

  runtime_platform {
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = "${var.resource_prefix}-api"
      image     = var.api_image
      essential = true
      environment = [
        { "name" : "DATABASE_URL", "value" : var.database_url },
        { "name" : "ISSUER_BASE_URL", "value" : var.issuer_base_url },
        { "name" : "AUDIENCE", "value" : var.audience }
      ]
      portMappings = [
        {
          containerPort = 5000,
          hostPort      = 5000
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "api_service" {
  name            = "${var.resource_prefix}-api-service"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.api_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    assign_public_ip = true
    subnets          = var.web_subnet_ids
    security_groups  = [var.public_security_group_id]
  }
}