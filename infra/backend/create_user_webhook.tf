
module "create_user_packager" { 
  source = "../modules/util_packager/python"

  entry_file_path = "${path.root}/../lambda_functions/webhooks/auth0/create_user/handler.py"
  export_dir      = "${path.root}/dist/lambda_functions/webhooks/auth0/create_user"
  sys_paths       = ["${path.root}/../lambda_functions/webhooks/auth0/create_user"]
  no_reqs         = true
}

module "create_user_lambda" {
    source = "../modules/lambda"
    context = var.context

    name = "create-user-lambda"

    source_dir = module.create_user_packager.result.build_directory

    build_path = "${path.root}/dist/create_user_webhook/create_user_webhook.zip"

    handler = "handler.handler"
    runtime         = "python3.12"
    memory          = 256
    time_limit      = 15
    deployment_type = "zip"
    zip_project     = true
    s3_bucket       = module.lambda_deployment_bucket.bucket_name
    s3_key          = "lambda/create_user_webhook/create_user_webhook.zip"

    enable_vpc_access = false

    environment_variables = {
      USERS_TABLE_NAME = var.user_table_name
    }

}

resource "aws_iam_policy" "create_user_policy" {
  name        = "create-user-policy"
  description = "Policy for create user lambda."

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:PutItem",
        ],
        Resource = [
            var.user_table_arn,
        ]
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "create_user_attach" {
  role       = module.create_user_lambda.role_name
  policy_arn = aws_iam_policy.create_user_policy.arn
}


