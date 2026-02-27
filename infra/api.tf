# ============================================================================
#  In this file:
#     - Private Load Balancer Security Group
#     - API Security Group
#     - Application Load Balancer for accessing API tasks
#     - API Task Definition
#     - API auto-scaling configuration
# ============================================================================

# --> Security Groups


# --> Load balancer for backend api



# --> Task definition for backend compute



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