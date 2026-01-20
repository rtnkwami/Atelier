# State file bucket to store project infra state

resource "aws_s3_bucket" "s3_state_bucket" {
  bucket = var.s3_state_bucket_name
}