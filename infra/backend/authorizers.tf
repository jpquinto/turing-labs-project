
################################
# AUTH0 WEBHOOK AUTHENTICATOR
################################
module "auth0_webhook_packager" { 
  source = "../modules/util_packager/python"

  entry_file_path = "${path.root}/../lambda_functions/authorizers/webhooks/auth0/handler.py"
  export_dir      = "${path.root}/dist/lambda_functions/authorizers/webhooks/auth0"
  sys_paths       = ["${path.root}/../lambda_functions/authorizers/webhooks/auth0"]
  no_reqs         = true
}

module "auth0_webhook_lambda" {
    source = "../modules/lambda"
    context = var.context

    name = "authorizers-webhooks-auth0-lambda"

    source_dir = module.auth0_webhook_packager.result.build_directory

    build_path = "${path.root}/dist/authorizers/webhooks/auth0/auth0_webhook_authorizer.zip"

    handler = "handler.handler"
    runtime         = "python3.12"
    memory          = 256
    time_limit      = 15
    deployment_type = "zip"
    zip_project     = true
    s3_bucket       = module.lambda_deployment_bucket.bucket_name
    s3_key          = "lambda/authorizers/webhooks/auth0/auth0_webhook_authorizer.zip"

    enable_vpc_access = false

    environment_variables = {
        AUTH0_WEBHOOK_SECRET = var.auth0_webhook_secret
    }

}

module "authorizers_webhooks_auth0_authorizer" {
  source  = "../modules/apigw_rest/authorizers/lambda_authorizer"
  context = var.context

  rest_api_id                      = module.api_gateway.api_id
  authorizer_name                  = "authorizers-webhooks-auth0-authorizer"
  authorizer_invoke_arn            = module.auth0_webhook_lambda.invoke_arn
  authorizer_arn                   = module.auth0_webhook_lambda.arn
  authorizer_result_ttl_in_seconds = 300
}