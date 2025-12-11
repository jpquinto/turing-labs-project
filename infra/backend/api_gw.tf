module "api_gateway" {
    source = "../modules/apigw_rest"
    context = var.context

    api_name = "backend-api"
    stage_name = "dev"

    http_routes = [

        # Participant CRUD endpoints
        {
            http_method          = "GET"
            path                 = "participant"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.participant_lambda.invoke_arn
            lambda_function_name = module.lambdas.participant_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "GET"
            path                 = "participant/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.participant_lambda.invoke_arn
            lambda_function_name = module.lambdas.participant_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "POST"
            path                 = "participant"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.participant_lambda.invoke_arn
            lambda_function_name = module.lambdas.participant_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "PUT"
            path                 = "participant/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.participant_lambda.invoke_arn
            lambda_function_name = module.lambdas.participant_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "DELETE"
            path                 = "participant/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.participant_lambda.invoke_arn
            lambda_function_name = module.lambdas.participant_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },

        # Order CRUD endpoints
        {
            http_method          = "GET"
            path                 = "recipe"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.recipe_lambda.invoke_arn
            lambda_function_name = module.lambdas.recipe_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "GET"
            path                 = "recipe/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.recipe_lambda.invoke_arn
            lambda_function_name = module.lambdas.recipe_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "POST"
            path                 = "recipe"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.recipe_lambda.invoke_arn
            lambda_function_name = module.lambdas.recipe_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "PUT"
            path                 = "recipe/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.recipe_lambda.invoke_arn
            lambda_function_name = module.lambdas.recipe_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "DELETE"
            path                 = "recipe/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.recipe_lambda.invoke_arn
            lambda_function_name = module.lambdas.recipe_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },

    ]

    authorizer_type = "CUSTOM"
    api_type        = ["REGIONAL"]
}