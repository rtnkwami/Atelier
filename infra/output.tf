output "ecs_cluster_name" {
  value = aws_ecs_cluster.cluster.name
}

output "api_service_name" {
  value = aws_ecs_service.api_service.name
}

output "web_service_name" {
  value = aws_ecs_service.frontend_service.name
}