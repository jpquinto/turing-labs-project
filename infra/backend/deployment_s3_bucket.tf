# This will create the bucket for the lambda deployment packages

module "lambda_deployment_bucket" {
    source = "../modules/s3_bucket"
    name = "turing-labs-project-lambda-deployments"

    context = var.context

    force_destroy = true

    enable_bucket_versioning      = false
    enable_server_side_encryption = false

    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true

    enable_website_configuration = false
}