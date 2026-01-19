output "ecs_cluster_name" {
  value = aws_ecs_cluster.cluster.name
}

output "api_service_name" {
  value = aws_ecs_service.api_service.name
}

output "web_service_name" {
  value = aws_ecs_service.frontend_service.name
}

output "app_public_endpoint_dns_name" {
  value = aws_lb.public_load_balancer.dns_name
}