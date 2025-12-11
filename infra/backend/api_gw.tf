module "api_gateway" {
    source = "../modules/apigw_rest"
    context = var.context

    api_name = "backend-api"
    stage_name = "dev"

    http_routes = [
        {
            http_method          = "POST"
            path                 = "user"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.create_user_lambda.invoke_arn
            lambda_function_name = module.create_user_lambda.name
            enable_cors_all      = true
            use_authorizer       = true
            authorizer_id        = module.authorizers_webhooks_auth0_authorizer.authorizer_id
        },

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

        # Trial CRUD endpoints
        {
            http_method          = "GET"
            path                 = "trial"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.trial_lambda.invoke_arn
            lambda_function_name = module.lambdas.trial_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "GET"
            path                 = "trial/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.trial_lambda.invoke_arn
            lambda_function_name = module.lambdas.trial_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "POST"
            path                 = "trial"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.trial_lambda.invoke_arn
            lambda_function_name = module.lambdas.trial_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "PUT"
            path                 = "trial/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.trial_lambda.invoke_arn
            lambda_function_name = module.lambdas.trial_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "DELETE"
            path                 = "trial/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.trial_lambda.invoke_arn
            lambda_function_name = module.lambdas.trial_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },

        # Submission CRUD endpoints
        {
            http_method          = "GET"
            path                 = "submission"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.submission_lambda.invoke_arn
            lambda_function_name = module.lambdas.submission_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "GET"
            path                 = "submission/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.submission_lambda.invoke_arn
            lambda_function_name = module.lambdas.submission_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "POST"
            path                 = "submission"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.submission_lambda.invoke_arn
            lambda_function_name = module.lambdas.submission_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "PUT"
            path                 = "submission/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.submission_lambda.invoke_arn
            lambda_function_name = module.lambdas.submission_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
        {
            http_method          = "DELETE"
            path                 = "submission/{id}"
            integration_type     = "lambda"
            lambda_invoke_arn    = module.lambdas.submission_lambda.invoke_arn
            lambda_function_name = module.lambdas.submission_lambda.name
            enable_cors_all      = true
            use_authorizer       = false
        },
    ]

    authorizer_type = "CUSTOM"
    api_type        = ["REGIONAL"]
}