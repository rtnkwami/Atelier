data "aws_route53_zone" "personal_hosted_zone" {
  count = var.custom_domain != "" ? 1 : 0
  name  = var.custom_domain
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