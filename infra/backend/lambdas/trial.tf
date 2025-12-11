module "trial_packager" {
  source = "../../modules/util_packager/python"

  entry_file_path = "${var.backend_api_root_dir}/trial/handler.py"
  export_dir      = "${path.root}/dist/backend-api/trial/trial/"
  sys_paths       = [var.backend_api_root_dir]
  no_reqs         = true
}

module "trial_lambda" {
  source  = "../../modules/lambda"
  context = module.label_trial.context

  name = "trial_lambda"

  handler         = "handler.handler"
  source_dir      = module.trial_packager.result.build_directory
  build_path      = "${path.root}/dist/backend-api/trial/handler.zip"
  runtime         = "python3.12"
  memory          = var.memory
  time_limit      = var.time_limit
  deployment_type = "zip"
  zip_project     = true
  s3_bucket       = var.deploy_s3_bucket
  s3_key          = "backend-api/trial_lambda.zip"

  enable_vpc_access           = false

  environment_variables = {
    TRIALS_TABLE_NAME : var.trial_table_name
  }
}

# IAM Policy for DynamoDB access
resource "aws_iam_role_policy" "trial_lambda_dynamodb" {
  name = "${module.label_trial.id}-dynamodb-policy"
  role = module.trial_lambda.role_name

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
          "${var.trial_table_arn}/*",
          var.trial_table_arn
        ]
      }
    ]
  })
}