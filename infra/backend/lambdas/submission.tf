module "submission_packager" {
  source = "../../modules/util_packager/python"

  entry_file_path = "${var.backend_api_root_dir}/submission/handler.py"
  export_dir      = "${path.root}/dist/backend-api/submission/submission/"
  sys_paths       = [var.backend_api_root_dir]
  no_reqs         = true
}

module "submission_lambda" {
  source  = "../../modules/lambda"
  context = module.label_submission.context

  name = "submission_lambda"

  handler         = "handler.handler"
  source_dir      = module.submission_packager.result.build_directory
  build_path      = "${path.root}/dist/backend-api/submission/handler.zip"
  runtime         = "python3.12"
  memory          = var.memory
  time_limit      = var.time_limit
  deployment_type = "zip"
  zip_project     = true
  s3_bucket       = var.deploy_s3_bucket
  s3_key          = "backend-api/submission_lambda.zip"

  enable_vpc_access           = false

  environment_variables = {
    SUBMISSIONS_TABLE_NAME : var.submission_table_name
  }
}

# IAM Policy for DynamoDB access
resource "aws_iam_role_policy" "submission_lambda_dynamodb" {
  name = "${module.label_submission.id}-dynamodb-policy"
  role = module.submission_lambda.role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",   
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          "${var.submission_table_arn}/*",
          var.submission_table_arn
        ]
      }
    ]
  })
}