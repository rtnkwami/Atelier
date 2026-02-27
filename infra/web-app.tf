# ============================================================================
#  In this file:
#     - Public Load Balancer Security Group
#     - Web Security Groups
#     - Application Load Balancer for accessing web tasks
#     - Frontend web app task tefinition
#     - Frontend web app auto-scaling configuration
# ============================================================================

# --> Security Groups

# --> Load Balancer for frontend web app


# --> Task definition for frontend compute

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

# --> Service definition for configuring frontend load balancing and networking

resource "aws_ecs_service" "frontend_service" {
  name            = "${var.resource_prefix}-web-service"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.frontend_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [for subnet in aws_subnet.app_subnets : subnet.id]
    security_groups = [aws_security_group.frontend_security_group.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend_target_group.arn
    container_name   = "${var.resource_prefix}-web"
    container_port   = 3000
  }

  tags = {
    "Name"         = "${var.resource_prefix}-web-service"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

# --> Frontend auto-scaling configuration
#    (scale in or out to keep memory at 70% and cpu at 50%)

resource "aws_appautoscaling_target" "frontend_service_autoscaling" {
  min_capacity       = 1
  max_capacity       = 5
  resource_id        = "service/${aws_ecs_cluster.cluster.name}/${aws_ecs_service.frontend_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  tags = {
    "Name"         = "${var.resource_prefix}-web-service-autoscaling-target"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_appautoscaling_policy" "frontend_service_cpu_autoscaling_policy" {
  name               = "${aws_ecs_service.frontend_service.name}-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend_service_autoscaling.id
  scalable_dimension = aws_appautoscaling_target.frontend_service_autoscaling.scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend_service_autoscaling.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = 50
  }
}

resource "aws_appautoscaling_policy" "frontend_service_memory_autoscaling_policy" {
  name               = "${aws_ecs_service.frontend_service.name}-memory-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend_service_autoscaling.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend_service_autoscaling.scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend_service_autoscaling.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    target_value = 70
  }
}