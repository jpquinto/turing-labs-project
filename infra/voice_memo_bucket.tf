module "voice_memo_bucket" {
  source = "./modules/s3_bucket"
  name   = "turing-labs-voice-memos"

  context = module.null_label.context

  force_destroy = true

  enable_bucket_versioning      = false
  enable_server_side_encryption = false

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  enable_website_configuration = false
}

# CORS Configuration for voice memo uploads
resource "aws_s3_bucket_cors_configuration" "voice_memo_cors" {
  bucket = module.voice_memo_bucket.bucket_id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}