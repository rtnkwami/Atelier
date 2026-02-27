# Frontend (Web) Task Definition

resource "aws_ecs_task_definition" "frontend_task" {
  family                   = "${var.resource_prefix}-web"
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  runtime_platform {
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = "${var.resource_prefix}-web"
      image     = var.frontend_image
      essential = true
      environment = [
        { "name" : "AUTH0_DOMAIN", "value" : var.auth0_domain },
        { "name" : "AUTH0_CLIENT_ID", "value" : var.auth0_client_id },
        { "name" : "AUTH0_CLIENT_SECRET", "value" : var.auth0_client_secret },
        { "name" : "AUTH0_SECRET", "value" : var.auth0_secret },
        { "name" : "APP_BASE_URL", "value" : "http://${aws_lb.public_load_balancer.dns_name}" },
        { "name" : "AUTH0_AUDIENCE", "value" : var.auth0_audience },
        { "name" : "BACKEND_URL", "value" : "http://${aws_lb.private_load_balancer.dns_name}:5000" },
        { "name" : "HOSTNAME", "value" : "0.0.0.0" }
      ]
      portMappings = [
        {
          containerPort = 3000, # with awsvpc network mode, we don't need host port as it's auto-allocated
        }
      ]
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"]
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "${aws_cloudwatch_log_group.frontend_service_logs.name}"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    "Name"         = "${var.resource_prefix}-web-task"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

# Backend (API) Task Definition

resource "aws_ecs_task_definition" "api_task" {
  family                   = "${var.resource_prefix}-api"
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  runtime_platform {
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = "${var.resource_prefix}-api"
      image     = var.api_image
      essential = true
      environment = [
        { "name" : "DATABASE_URL", "value" : aws_rds_cluster.db_cluster.endpoint },
        { "name" : "ISSUER_BASE_URL", "value" : var.issuer_base_url },
        { "name" : "AUDIENCE", "value" : var.audience }
      ]
      portMappings = [
        {
          containerPort = 5000, # with awsvpc network mode, we don't need host port as it's auto-allocated
        }
      ]
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:5000/health || exit 1"]
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "${aws_cloudwatch_log_group.api_service_logs.name}"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    "Name"         = "${var.resource_prefix}-api-task"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}