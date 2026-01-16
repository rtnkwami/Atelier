output "vpc_id" {
  value = aws_vpc.vpc.id
}

output "web_subnet_ids" {
  description = "IDs of the public web subnets"
  value       = [for subnet in aws_subnet.web_subnets : subnet.id]
}

output "app_subnet_ids" {
  description = "IDs of the private app subnets"
  value       = [for subnet in aws_subnet.app_subnets : subnet.id]
}

output "db_subnet_ids" {
  description = "IDs of the private database subnets"
  value       = [for subnet in aws_subnet.db_subnets : subnet.id]
}

output "reserved_subnet_ids" {
  description = "IDs of the private reserved subnets"
  value       = [for subnet in aws_subnet.reserved_subnets : subnet.id]
}

output "api_security_group_id" {
  value = aws_security_group.api_security_group.id
}

output "frontend_security_group_id" {
  value = aws_security_group.frontend_security_group.id
}

output "database_cluster_security_group_id" {
  value = aws_security_group.database_cluster_security_group.id
}

output "public_alb_security_group_id" {
  value = aws_security_group.public_alb_security_group.id
}

output "private_alb_security_group_id" {
  value = aws_security_group.private_alb_security_group.id
}