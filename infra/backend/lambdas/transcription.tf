module "transcription_packager" {
  source = "../../modules/util_packager/python"

  entry_file_path = "${var.backend_api_root_dir}/transcription/handler.py"
  export_dir      = "${path.root}/dist/backend-api/transcription/transcription/"
  sys_paths       = [var.backend_api_root_dir]
  no_reqs         = true
}

module "transcription_lambda" {
  source  = "../../modules/lambda"
  context = module.label_transcription.context

  name = "transcription_lambda"

  handler         = "handler.handler"
  source_dir      = module.transcription_packager.result.build_directory
  build_path      = "${path.root}/dist/backend-api/transcription/handler.zip"
  runtime         = "python3.12"
  memory          = var.memory
  time_limit      = 900  # 15 minutes for transcription jobs
  deployment_type = "zip"
  zip_project     = true
  s3_bucket       = var.deploy_s3_bucket
  s3_key          = "backend-api/transcription_lambda.zip"

  enable_vpc_access = false

  environment_variables = {
    VOICE_MEMO_BUCKET      = var.voice_memo_bucket
    SUBMISSIONS_TABLE_NAME = var.submission_table_name
  }
}

# IAM Policy for Transcribe access
resource "aws_iam_role_policy" "transcription_lambda_transcribe" {
  name = "${module.label_transcription.id}-transcribe-policy"
  role = module.transcription_lambda.role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "transcribe:StartTranscriptionJob",
          "transcribe:GetTranscriptionJob",
          "transcribe:DeleteTranscriptionJob"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Policy for S3 access (read voice memos)
resource "aws_iam_role_policy" "transcription_lambda_s3" {
  name = "${module.label_transcription.id}-s3-policy"
  role = module.transcription_lambda.role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = [
          "${var.voice_memo_bucket_arn}/*"
        ]
      }
    ]
  })
}

# IAM Policy for DynamoDB access (update submissions)
resource "aws_iam_role_policy" "transcription_lambda_dynamodb" {
  name = "${module.label_transcription.id}-dynamodb-policy"
  role = module.transcription_lambda.role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:UpdateItem",
          "dynamodb:GetItem"
        ]
        Resource = [
          var.submission_table_arn,
          "${var.submission_table_arn}/*"
        ]
      }
    ]
  })
}

