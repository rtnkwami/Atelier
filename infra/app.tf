resource "aws_ecs_cluster" "cluster" {
  name = "${var.resource_prefix}-ecs-cluster"

  tags = {
    "Name"         = "${var.resource_prefix}-ecs-cluster"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

#---------------- Private Load Balancer ------------------#

resource "aws_lb" "private_load_balancer" {
  name = "${var.resource_prefix}-private-lb"
  internal = true
  load_balancer_type = "application"
  security_groups = [aws_security_group.private_alb_security_group.id]
  subnets = [for subnet in aws_subnet.app_subnets : subnet.id]

  tags = {
    "Name"         = "${var.resource_prefix}-private-lb"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_lb_target_group" "api_target_group" {
  name = "${var.resource_prefix}-private-lb-api-tg"
  port = 5000
  protocol = "HTTP"
  target_type = "ip"
  vpc_id = aws_vpc.vpc.id

  health_check {
    path = "/health"
  }

  tags = {
    "Name"         = "${var.resource_prefix}-private-lb-api-tg"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_lb_listener" "api_http_listener" {
  load_balancer_arn = aws_lb.private_load_balancer.arn
  port = 5000
  protocol = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.api_target_group.arn
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
        { "name" : "DATABASE_URL", "value" : aws_rds_cluster.db_cluster.endpoint },
        { "name" : "ISSUER_BASE_URL", "value" : var.issuer_base_url },
        { "name" : "AUDIENCE", "value" : var.audience }
      ]
      portMappings = [
        {
          containerPort = 5000,  # with awsvpc network mode, we don't need host port as it's auto-allocated
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
    subnets          = [for subnet in aws_subnet.app_subnets : subnet.id]
    security_groups  = [aws_security_group.api_security_group.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_target_group.arn
    container_name = "${var.resource_prefix}-api"
    container_port = 5000
    
  }

  tags = {
    "Name"         = "${var.resource_prefix}-api-service"
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