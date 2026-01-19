# ============================================================================
#  In this file:
#     - Private Load Balancer Security Group
#     - API Security Groups
#     - Application Load Balancer for accessing API tasks
#     - API Task Definition
#     - API auto-scaling configuration
# ============================================================================

# --> Security Groups

resource "aws_security_group" "private_alb_security_group" {
  name = "${var.resource_prefix}-private-lb-sg"
  description = "Restrict network access to private load balancer"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "private_alb_ingress_rule" {
  security_group_id = aws_security_group.private_alb_security_group.id

  referenced_security_group_id = aws_security_group.frontend_security_group.id
  description = "Allow traffic from the frontend service only"
  ip_protocol = "tcp"
  from_port = 5000
  to_port = 5000
}

resource "aws_vpc_security_group_egress_rule" "private_alb_egress_rule" {
  security_group_id = aws_security_group.private_alb_security_group.id
  
  referenced_security_group_id = aws_security_group.api_security_group.id
  description = "Allow traffic to the backend service only"
  ip_protocol = "tcp"
  from_port = 5000
  to_port = 5000
}

resource "aws_security_group" "api_security_group" {
  name = "${var.resource_prefix}-api-sg"
  description = "Restrict network access to backend service"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "api_ingress" {
  security_group_id = aws_security_group.api_security_group.id
  
  referenced_security_group_id = aws_security_group.private_alb_security_group.id
  description = "Allow traffic from private load balancer only"
  ip_protocol = "tcp"
  from_port = 5000
  to_port = 5000
}

# Allow all egress traffic on API tasks because API needs to connect to both Docker Hub (which has no public IP ranges for whitelisting)
# and Auth0
resource "aws_vpc_security_group_egress_rule" "allow_all_backend_egress_ipv4" {
  security_group_id = aws_security_group.api_security_group.id
  
  description = "Allow traffic to the internet"
  ip_protocol = "-1"
  cidr_ipv4 = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_backend_egress_ipv6" {
  security_group_id = aws_security_group.api_security_group.id
  
  description = "Allow traffic to the internet"
  ip_protocol = "-1"
  cidr_ipv6 = "::/0"
}