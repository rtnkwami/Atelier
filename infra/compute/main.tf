resource "aws_ecs_cluster" "cluster" {
  name = "${var.resource_prefix}-ecs-cluster"

  tags = {
    "Name"         = "${var.resource_prefix}-ecs-cluster"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_lb" "api_load_balancer" {
  name = "${var.resource_prefix}-lb"
  load_balancer_type = "application"
  security_groups = [var.alb_security_group_id]
  subnets = var.web_subnet_ids

  tags = {
    "Name"         = "${var.resource_prefix}-lb"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_lb_listener" "alb_http_listener" {
  load_balancer_arn = aws_lb.api_load_balancer.arn
  port = 80
  protocol = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.alb_target_group.arn
  }
}

# resource "aws_lb_listener" "alb_http_listener" {
#   load_balancer_arn = aws_lb.api_load_balancer.arn
#   port = 443
#   protocol = "HTTPS"

#   default_action {
#     type = "forward"
#     target_group_arn = aws_lb_target_group.alb_target_group.arn
#   }
# }

resource "aws_lb_target_group" "alb_target_group" {
  name = "${var.resource_prefix}-alb-tg"
  port = 80
  protocol = "HTTP"
  target_type = "ip"
  vpc_id = var.vpc_id

  health_check {
    path = "/health"
  }

  tags = {
    "Name"         = "${var.resource_prefix}-alb-tg"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}


# ------ Required Task Execution Role for Logs ----------- #

resource "aws_cloudwatch_log_group" "api_service_logs" {
  name              = "/ecs/${var.resource_prefix}-api"
  retention_in_days = 1
}

resource "aws_cloudwatch_log_group" "frontend_service_logs" {
  name = "/ecs/${var.resource_prefix}-web"
  retention_in_days = 1
}

data "aws_iam_policy_document" "ecs_task_execution_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "ecs-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_assume_role.json
}

data "aws_iam_policy" "ecs_task_execution_policy" {
  name = "AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = data.aws_iam_policy.ecs_task_execution_policy.arn
}

# ------ Required Task Execution Role for Logs ----------- #

resource "aws_ecs_task_definition" "api_task" {
  family                   = "${var.resource_prefix}-api"
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  requires_compatibilities = ["FARGATE"]
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

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
      healthCheck = {
        command = [ "CMD-SHELL", "curl -f http://localhost:5000/health || exit 1" ]
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

resource "aws_ecs_service" "api_service" {
  name            = "${var.resource_prefix}-api-service"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.api_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    assign_public_ip = true
    subnets          = var.app_subnet_ids
    security_groups  = [var.api_security_group_id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb_target_group.arn
    container_name = "${var.resource_prefix}-api"
    container_port = 5000
  }

  tags = {
    "Name"         = "${var.resource_prefix}-api-service"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_ecs_task_definition" "frontend_task" {
  family                   = "${var.resource_prefix}-web"
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  requires_compatibilities = ["FARGATE"]
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

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
        { "name" : "APP_BASE_URL", "value" : var.app_base_url },
        { "name" : "AUTH0_AUDIENCE", "value" : var.auth0_audience },
        { "name" : "BACKEND_URL", "value" : var.backend_url }
      ]
      portMappings = [
        {
          containerPort = 3000,
          hostPort      = 3000
        }
      ]
      healthCheck = {
        command = [ "CMD-SHELL", "curl -f http://localhost:3000 || exit 1" ]
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

resource "aws_ecs_service" "frontend_service" {
  name            = "${var.resource_prefix}-web-service"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.api_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    assign_public_ip = true
    subnets          = var.app_subnet_ids
    security_groups  = [var.frontend_security_group_id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb_target_group.arn
    container_name = "${var.resource_prefix}-web"
    container_port = 3000
  }

  tags = {
    "Name"         = "${var.resource_prefix}-web-service"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

# ------------ Configure Service Auto Scaling -----------------#

resource "aws_appautoscaling_target" "api_service_autoscaling" {
  min_capacity = 1
  max_capacity = 5
  resource_id = "service/${aws_ecs_cluster.cluster.name}/${aws_ecs_service.api_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace = "ecs"

  tags = {
    "Name"         = "${var.resource_prefix}-api-service-autoscaling-target"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_appautoscaling_policy" "api_service_cpu_autoscaling_policy" {
  name = "${aws_ecs_service.api_service.name}-cpu-autoscaling"
  policy_type = "TargetTrackingScaling"
  resource_id = aws_appautoscaling_target.api_service_autoscaling.id
  scalable_dimension = aws_appautoscaling_target.api_service_autoscaling.scalable_dimension
  service_namespace = aws_appautoscaling_target.api_service_autoscaling.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = 50
  }
}

resource "aws_appautoscaling_policy" "api_service_memory_autoscaling_policy" {
  name = "${aws_ecs_service.api_service.name}-memory-autoscaling"
  policy_type = "TargetTrackingScaling"
  resource_id = aws_appautoscaling_target.api_service_autoscaling.resource_id
  scalable_dimension = aws_appautoscaling_target.api_service_autoscaling.scalable_dimension
  service_namespace = aws_appautoscaling_target.api_service_autoscaling.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    
    target_value = 70
  }
}

resource "aws_appautoscaling_target" "frontend_service_autoscaling" {
  min_capacity = 1
  max_capacity = 5
  resource_id = "service/${aws_ecs_cluster.cluster.name}/${aws_ecs_service.frontend_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace = "ecs"

  tags = {
    "Name"         = "${var.resource_prefix}-web-service-autoscaling-target"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_appautoscaling_policy" "frontend_service_cpu_autoscaling_policy" {
  name = "${aws_ecs_service.frontend_service.name}-cpu-autoscaling"
  policy_type = "TargetTrackingScaling"
  resource_id = aws_appautoscaling_target.frontend_service_autoscaling.id
  scalable_dimension = aws_appautoscaling_target.frontend_service_autoscaling.scalable_dimension
  service_namespace = aws_appautoscaling_target.frontend_service_autoscaling.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = 50
  }
}

resource "aws_appautoscaling_policy" "frontend_service_memory_autoscaling_policy" {
  name = "${aws_ecs_service.frontend_service.name}-memory-autoscaling"
  policy_type = "TargetTrackingScaling"
  resource_id = aws_appautoscaling_target.frontend_service_autoscaling.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend_service_autoscaling.scalable_dimension
  service_namespace = aws_appautoscaling_target.frontend_service_autoscaling.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    
    target_value = 70
  }
}