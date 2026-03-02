# Required Parameters and Secrets for Task Startup

data "aws_ssm_parameter" "auth0_domain" {
  name = "/atelier/auth0/domain"
}

data "aws_ssm_parameter" "auth0_client_id" {
  name = "/atelier/auth0/client-id"
}

data "aws_ssm_parameter" "auth0_audience" {
  name = "/atelier/auth0/audience"
}

data "aws_secretsmanager_secret" "auth0_secret" {
  name = "/atelier/auth0/secret"
}

data "aws_secretsmanager_secret" "auth0_client_secret" {
  name = "/atelier/auth0/client-secret"
}


# Frontend (Web) Task Definition

resource "aws_ecs_task_definition" "frontend_task" {
  family                   = "${var.resource_prefix}-web"
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn

  runtime_platform {
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = "${var.resource_prefix}-web"
      image     = "${var.frontend_image}:${var.image_tag}"
      essential = true
      secrets = [
        { "name" : "AUTH0_CLIENT_SECRET", "valueFrom" : data.aws_secretsmanager_secret.auth0_client_secret.arn },
        { "name" : "AUTH0_SECRET", "valueFrom" : data.aws_secretsmanager_secret.auth0_secret.arn }
      ]
      environment = [
        { "name" : "AUTH0_DOMAIN", "value" : data.aws_ssm_parameter.auth0_domain.value },
        { "name" : "AUTH0_CLIENT_ID", "value" : data.aws_ssm_parameter.auth0_client_id.value },
        { "name" : "AUTH0_AUDIENCE", "value" : data.aws_ssm_parameter.auth0_audience.value },
        { "name" : "API_BASE_URL", "value" : "http://${aws_lb.private_load_balancer.dns_name}:5000" },
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
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn

  runtime_platform {
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = "${var.resource_prefix}-api"
      image     = "${var.backend_image}:${var.image_tag}"
      essential = true
      environment = [
        { "name" : "DATABASE_URL", "value" : local.database_url },
        { "name" : "ISSUER_BASE_URL", "value" : data.aws_ssm_parameter.auth0_domain.value },
        { "name" : "AUDIENCE", "value" : data.aws_ssm_parameter.auth0_audience.value },
        { "name" : "REDIS_ENDPOINT", "value" : "redis://${aws_elasticache_replication_group.valkey_cluster.primary_endpoint_address}:6379" }
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
          "awslogs-region"        = "${var.deployment_region}"
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