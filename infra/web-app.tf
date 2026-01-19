# ============================================================================
#  In this file:
#     - Public Load Balancer Security Group
#     - Web Security Groups
#     - Application Load Balancer for accessing web tasks
#     - Frontend web app task tefinition
#     - Frontend web app auto-scaling configuration
# ============================================================================

# --> Security Groups

resource "aws_security_group" "public_alb_security_group" {
  name = "${var.resource_prefix}-public-lb-sg"
  description = "Restrict network access to public load balancer"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "public_alb_https_ingress_ipv4_rule" {
  security_group_id = aws_security_group.public_alb_security_group.id

  description = "Allow IPv4 https traffic from the internet"
  ip_protocol = "tcp"
  from_port = 443
  to_port = 443
  cidr_ipv4 = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "public_alb_https_ingress_ipv6_rule" {
  security_group_id = aws_security_group.public_alb_security_group.id

  description = "Allow IPv6 https traffic from the internet"
  ip_protocol = "tcp"
  from_port = 443
  to_port = 443
  cidr_ipv6 = "::/0"
}

resource "aws_vpc_security_group_ingress_rule" "public_alb_http_ingress_ipv4_rule" {
  security_group_id = aws_security_group.public_alb_security_group.id

  description = "Allow IPv4 http only traffic from the internet"
  ip_protocol = "tcp"
  from_port = 80
  to_port = 80
  cidr_ipv4 = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "public_alb_http_ingress_ipv6_rule" {
  security_group_id = aws_security_group.public_alb_security_group.id

  description = "Allow IPv6 http only traffic from the internet"
  ip_protocol = "tcp"
  from_port = 80
  to_port = 80
  cidr_ipv6 = "::/0"
}

resource "aws_vpc_security_group_egress_rule" "public_alb_egress_rule" {
  security_group_id = aws_security_group.public_alb_security_group.id
  
  referenced_security_group_id = aws_security_group.frontend_security_group.id
  description = "Allow traffic to frontend service only"
  ip_protocol = "tcp"
  from_port = 3000
  to_port = 3000
}

resource "aws_security_group" "frontend_security_group" {
  name = "${var.resource_prefix}-web-sg"
  description = "Restrict network access to frontend service"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "frontend_ingress" {
  security_group_id = aws_security_group.frontend_security_group.id

  description = "Allow traffic from public load balancer only"
  referenced_security_group_id = aws_security_group.public_alb_security_group.id
  ip_protocol = "tcp"
  from_port = 3000
  to_port = 3000
}

# Allow all egress traffic on Web tasks because frontend needs to connect to both Docker Hub (which has no public IP ranges for whitelisting)
# and Auth0
resource "aws_vpc_security_group_egress_rule" "allow_all_frontend_egress_ipv4" {
  security_group_id = aws_security_group.frontend_security_group.id
  
  description = "Allow traffic to the internet"
  ip_protocol = "-1"
  cidr_ipv4 = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_frontend_egress_ipv6" {
  security_group_id = aws_security_group.frontend_security_group.id
  
  description = "Allow traffic to the internet"
  ip_protocol = "-1"
  cidr_ipv6 = "::/0"
}
