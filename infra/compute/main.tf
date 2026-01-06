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
  cpu                      = 256
  memory                   = 512
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
      healthCheck = {
        command = [ "CMD-SHELL", "curl -f http://localhost:5000/health || exit 1" ]
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
    target_group_arn = aws_lb_target_group.api_lb_target_group.arn
    container_name = "${var.resource_prefix}-api"
    container_port = 5000
  }

  tags = {
    "Name"         = "${var.resource_prefix}-api-service"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}


resource "aws_lb" "api_load_balancer" {
  name = "${var.resource_prefix}-api-lb"
  load_balancer_type = "application"
  security_groups = [var.api_lb_security_group_id]
  subnets = var.web_subnet_ids

  tags = {
    "Name"         = "${var.resource_prefix}-api-lb"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_lb_listener" "api_lb_http_listener" {
  load_balancer_arn = aws_lb.api_load_balancer.arn
  port = 80
  protocol = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.api_lb_target_group.arn
  }
}

# resource "aws_lb_listener" "api_lb_http_listener" {
#   load_balancer_arn = aws_lb.api_load_balancer.arn
#   port = 443
#   protocol = "HTTPS"

#   default_action {
#     type = "forward"
#     target_group_arn = aws_lb_target_group.api_lb_target_group.arn
#   }
# }

resource "aws_lb_target_group" "api_lb_target_group" {
  name = "${var.resource_prefix}-api-lb-tg"
  port = 80
  protocol = "HTTP"
  target_type = "ip"
  vpc_id = var.vpc_id

  health_check {
    path = "/health"
  }

  tags = {
    "Name"         = "${var.resource_prefix}-api-lb-tg"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}