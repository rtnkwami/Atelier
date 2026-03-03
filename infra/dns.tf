data "aws_route53_zone" "personal_hosted_zone" {
  count = var.custom_domain != "" ? 1 : 0
  name  = var.custom_domain
}

resource "aws_acm_certificate" "atelier_tls_certificate" {
  domain_name = "atelier.${var.custom_domain}"
  validation_method = "DNS"

  tags = {
    "Name"         = "${var.resource_prefix}-tls-cert"
    "Project"      = var.project_name
    "ResourceType" = "DNS"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "atelier_cert_validation_records" {
  for_each = {
    for dvo in aws_acm_certificate.atelier_tls_certificate.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.personal_hosted_zone[0].zone_id
}

resource "aws_acm_certificate_validation" "atelier_tls_cert_validation" {
  certificate_arn = aws_acm_certificate.atelier_tls_certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.atelier_cert_validation_records : record.fqdn]
}

resource "aws_route53_record" "atelier_dns_record" {
  count   = var.custom_domain != "" ? 1 : 0
  zone_id = data.aws_route53_zone.personal_hosted_zone[0].zone_id
  name    = "atelier.${var.custom_domain}"
  type    = "A"

  alias {
    name                   = aws_lb.public_load_balancer.dns_name
    zone_id                = aws_lb.public_load_balancer.zone_id
    evaluate_target_health = true
  }  
}