# External Load Balancer (ALB)

resource "aws_lb" "public_load_balancer" {
  name               = "${var.resource_prefix}-public-lb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.public_alb_security_group.id]
  subnets            = [for subnet in aws_subnet.web_subnets : subnet.id]

  tags = {
    "Name"         = "${var.resource_prefix}-public-lb"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_lb_target_group" "frontend_target_group" {
  name        = "${var.resource_prefix}-public-lb-web-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.vpc.id

  health_check {
    path = "/"
  }

  tags = {
    "Name"         = "${var.resource_prefix}-public-lb-web-tg"
    "Project"      = var.project_name
    "ResourceType" = "Compute"
  }
}

resource "aws_lb_listener" "frontend_http_listener" {
  load_balancer_arn = aws_lb.public_load_balancer.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_target_group.arn
  }
}

resource "aws_lb_listener" "frontend_https_listener" {
  count = var.custom_domain != "" ? 1 : 0
  load_balancer_arn = aws_lb.public_load_balancer.arn
  certificate_arn = aws_acm_certificate_validation.atelier_tls_cert_validation[0].certificate_arn
  port              = 443
  protocol          = "HTTPS"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_target_group.arn
  }
}


# Internal Load Balancer (ALB)

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