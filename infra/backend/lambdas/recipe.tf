module "recipe_packager" {
  source = "../../modules/util_packager/python"

  entry_file_path = "${var.backend_api_root_dir}/recipe/handler.py"
  export_dir      = "${path.root}/dist/backend-api/recipe/recipe/"
  sys_paths       = [var.backend_api_root_dir]
  no_reqs         = true
}

module "recipe_lambda" {
  source  = "../../modules/lambda"
  context = module.label_recipe.context

  name = "recipe_lambda"

  handler         = "handler.handler"
  source_dir      = module.recipe_packager.result.build_directory
  build_path      = "${path.root}/dist/backend-api/recipe/handler.zip"
  runtime         = "python3.12"
  memory          = var.memory
  time_limit      = var.time_limit
  deployment_type = "zip"
  zip_project     = true
  s3_bucket       = var.deploy_s3_bucket
  s3_key          = "backend-api/recipe_lambda.zip"

  enable_vpc_access           = false

  environment_variables = {
    RECIPES_TABLE_NAME : var.recipe_table_name
  }
}

# IAM Policy for DynamoDB access
resource "aws_iam_role_policy" "recipe_lambda_dynamodb" {
  name = "${module.label_recipe.id}-dynamodb-policy"
  role = module.recipe_lambda.role_name

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
          var.recipe_table_arn,
          "${var.recipe_table_arn}/*",
        ]
      }
    ]
  })
}