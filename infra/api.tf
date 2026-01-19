# ============================================================================
#  In this file:
#     - Private Load Balancer Security Group
#     - API Security Group
#     - Application Load Balancer for accessing API tasks
#     - API Task Definition
#     - API auto-scaling configuration
# ============================================================================

# --> Security Groups

resource "aws_security_group" "private_alb_security_group" {
  name        = "${var.resource_prefix}-private-lb-sg"
  description = "Restrict network access to private load balancer"
  vpc_id      = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "private_alb_ingress_rule" {
  security_group_id = aws_security_group.private_alb_security_group.id

  referenced_security_group_id = aws_security_group.frontend_security_group.id
  description                  = "Allow traffic from the frontend service only"
  ip_protocol                  = "tcp"
  from_port                    = 5000
  to_port                      = 5000
}

resource "aws_vpc_security_group_egress_rule" "private_alb_egress_rule" {
  security_group_id = aws_security_group.private_alb_security_group.id

  referenced_security_group_id = aws_security_group.api_security_group.id
  description                  = "Allow traffic to the backend service only"
  ip_protocol                  = "tcp"
  from_port                    = 5000
  to_port                      = 5000
}

resource "aws_security_group" "api_security_group" {
  name        = "${var.resource_prefix}-api-sg"
  description = "Restrict network access to backend service"
  vpc_id      = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "api_ingress" {
  security_group_id = aws_security_group.api_security_group.id

  referenced_security_group_id = aws_security_group.private_alb_security_group.id
  description                  = "Allow traffic from private load balancer only"
  ip_protocol                  = "tcp"
  from_port                    = 5000
  to_port                      = 5000
}

# Allow all egress traffic on API tasks because API needs to connect to both Docker Hub (which has no public IP ranges for whitelisting)
# and Auth0
resource "aws_vpc_security_group_egress_rule" "allow_all_backend_egress_ipv4" {
  security_group_id = aws_security_group.api_security_group.id

  description = "Allow traffic to the internet"
  ip_protocol = "-1"
  cidr_ipv4   = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_backend_egress_ipv6" {
  security_group_id = aws_security_group.api_security_group.id

  description = "Allow traffic to the internet"
  ip_protocol = "-1"
  cidr_ipv6   = "::/0"
}

# --> Load balancer for backend api

resource "aws_lb" "private_load_balancer" {
  name               = "${var.resource_prefix}-private-lb"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.private_alb_security_group.id]
  subnets            = [for subnet in aws_subnet.app_subnets : subnet.id]

  tags = {
    "Name"         = "${var.resource_prefix}-private-lb"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_lb_target_group" "api_target_group" {
  name        = "${var.resource_prefix}-private-lb-api-tg"
  port        = 5000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.vpc.id

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
  port              = 5000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_target_group.arn
  }
}

# --> Task definition for backend compute

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

# --> Service definition for configuring backend load balancing and networking

resource "aws_ecs_service" "api_service" {
  name            = "${var.resource_prefix}-api-service"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.api_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [for subnet in aws_subnet.app_subnets : subnet.id]
    security_groups = [aws_security_group.api_security_group.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_target_group.arn
    container_name   = "${var.resource_prefix}-api"
    container_port   = 5000

  }

  tags = {
    "Name"         = "${var.resource_prefix}-api-service"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

# --> Backend auto-scaling configuration
#    (scale in or out to keep memory at 70% and cpu at 50%)

resource "aws_appautoscaling_target" "api_service_autoscaling" {
  min_capacity       = 1
  max_capacity       = 5
  resource_id        = "service/${aws_ecs_cluster.cluster.name}/${aws_ecs_service.api_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  tags = {
    "Name"         = "${var.resource_prefix}-api-service-autoscaling-target"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_appautoscaling_policy" "api_service_cpu_autoscaling_policy" {
  name               = "${aws_ecs_service.api_service.name}-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api_service_autoscaling.id
  scalable_dimension = aws_appautoscaling_target.api_service_autoscaling.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api_service_autoscaling.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = 50
  }
}

resource "aws_appautoscaling_policy" "api_service_memory_autoscaling_policy" {
  name               = "${aws_ecs_service.api_service.name}-memory-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api_service_autoscaling.resource_id
  scalable_dimension = aws_appautoscaling_target.api_service_autoscaling.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api_service_autoscaling.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    target_value = 70
  }
}