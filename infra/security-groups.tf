# Load Balancer Security Groups:
# Public
resource "aws_security_group" "public_alb_security_group" {
  name        = "${var.resource_prefix}-public-lb-sg"
  description = "Restrict network access to public load balancer"
  vpc_id      = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "public_alb_https_ingress_ipv4_rule" {
  security_group_id = aws_security_group.public_alb_security_group.id

  description = "Allow IPv4 https traffic from the internet"
  ip_protocol = "tcp"
  from_port   = 443
  to_port     = 443
  cidr_ipv4   = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "public_alb_https_ingress_ipv6_rule" {
  security_group_id = aws_security_group.public_alb_security_group.id

  description = "Allow IPv6 https traffic from the internet"
  ip_protocol = "tcp"
  from_port   = 443
  to_port     = 443
  cidr_ipv6   = "::/0"
}

resource "aws_vpc_security_group_ingress_rule" "public_alb_http_ingress_ipv4_rule" {
  security_group_id = aws_security_group.public_alb_security_group.id

  description = "Allow IPv4 http only traffic from the internet"
  ip_protocol = "tcp"
  from_port   = 80
  to_port     = 80
  cidr_ipv4   = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "public_alb_http_ingress_ipv6_rule" {
  security_group_id = aws_security_group.public_alb_security_group.id

  description = "Allow IPv6 http only traffic from the internet"
  ip_protocol = "tcp"
  from_port   = 80
  to_port     = 80
  cidr_ipv6   = "::/0"
}

resource "aws_vpc_security_group_egress_rule" "public_alb_egress_rule" {
  security_group_id = aws_security_group.public_alb_security_group.id

  referenced_security_group_id = aws_security_group.frontend_security_group.id
  description                  = "Allow traffic to frontend service only"
  ip_protocol                  = "tcp"
  from_port                    = 3000
  to_port                      = 3000
}

# Private
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

# ECS Service Tasks Security Groups
# Frontend (Web)
resource "aws_security_group" "frontend_security_group" {
  name        = "${var.resource_prefix}-web-sg"
  description = "Restrict network access to frontend service"
  vpc_id      = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "frontend_ingress" {
  security_group_id = aws_security_group.frontend_security_group.id

  description                  = "Allow traffic from public load balancer only"
  referenced_security_group_id = aws_security_group.public_alb_security_group.id
  ip_protocol                  = "tcp"
  from_port                    = 3000
  to_port                      = 3000
}

# Allow all egress traffic on Web tasks because frontend needs to connect to both Docker Hub (which has no public IP ranges for whitelisting)
# and Auth0
resource "aws_vpc_security_group_egress_rule" "allow_all_frontend_egress_ipv4" {
  security_group_id = aws_security_group.frontend_security_group.id

  description = "Allow traffic to the internet"
  ip_protocol = "-1"
  cidr_ipv4   = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_frontend_egress_ipv6" {
  security_group_id = aws_security_group.frontend_security_group.id

  description = "Allow traffic to the internet"
  ip_protocol = "-1"
  cidr_ipv6   = "::/0"
}

# Backend (API)
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

# Database Cluster Security Group

resource "aws_security_group" "database_cluster_security_group" {
  name        = "${var.resource_prefix}-database-cluster-sg"
  description = "Allow only traffic from the backend to the database cluster"
  vpc_id      = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "database_ingress_rule" {
  security_group_id = aws_security_group.database_cluster_security_group.id

  description                  = "Allow inbound connections from API to database cluster"
  referenced_security_group_id = aws_security_group.api_security_group.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}

resource "aws_security_group" "valkey_cache_security_group" {
  name = "${var.resource_prefix}-valkey-cache-cluster-sg"
  description = "Allow traffic from the backend to the cache cluster"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "valkey_ingress_rule" {
  security_group_id = aws_security_group.valkey_cache_security_group.id
  
  referenced_security_group_id = aws_security_group.api_security_group.id
  description = "Allow inbound connections to the cache cluster from the backend containers"
  ip_protocol = "tcp"
  from_port = 6379
  to_port = 6379
}