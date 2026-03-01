data "aws_route53_zone" "personal_hosted_zone" {
  name = "niovial.com"
}

resource "aws_route53_record" "atelier_dns_record" {
  zone_id = data.aws_route53_zone.personal_hosted_zone.zone_id
  name = "atelier.niovial.com"
  type = "A"

  alias {
    name = aws_lb.public_load_balancer.dns_name
    zone_id = aws_lb.public_load_balancer.zone_id
    evaluate_target_health = true
  }
}