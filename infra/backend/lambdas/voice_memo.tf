module "voice_memo_packager" {
  source = "../../modules/util_packager/python"

  entry_file_path = "${var.backend_api_root_dir}/voice_memo/handler.py"
  export_dir      = "${path.root}/dist/backend-api/voice_memo/voice_memo/"
  sys_paths       = [var.backend_api_root_dir]
  no_reqs         = true
}

module "voice_memo_lambda" {
  source  = "../../modules/lambda"
  context = module.label_voice_memo.context

  name = "voice_memo_lambda"

  handler         = "handler.handler"
  source_dir      = module.voice_memo_packager.result.build_directory
  build_path      = "${path.root}/dist/backend-api/voice_memo/handler.zip"
  runtime         = "python3.12"
  memory          = var.memory
  time_limit      = var.time_limit
  deployment_type = "zip"
  zip_project     = true
  s3_bucket       = var.deploy_s3_bucket
  s3_key          = "backend-api/voice_memo_lambda.zip"

  enable_vpc_access           = false

  environment_variables = {
    VOICE_MEMO_BUCKET : var.voice_memo_bucket
  }
}

# IAM Policy for S3 access
resource "aws_iam_role_policy" "voice_memo_lambda_s3" {
  name = "${module.label_voice_memo.id}-s3-policy"
  role = module.voice_memo_lambda.role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
        ]
        Resource = [
          "${var.voice_memo_bucket_arn}/*",
          var.voice_memo_bucket_arn
        ]
      }
    ]
  })
}