output "ci_cd_role_arn" {
  value = aws_iam_role.ci_cd_role.arn
}

output "s3_state_bucket" {
  value = aws_s3_bucket.s3_state_bucket.bucket
}