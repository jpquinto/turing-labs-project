locals {
  # 1. Filter routes into top-level and nested paths
  top_level_paths = toset([for r in var.http_routes : r.path if !strcontains(r.path, "/")])
  nested_paths    = toset([for r in var.http_routes : r.path if strcontains(r.path, "/")])

  # 2. Top-Level Resources (e.g., "user", "order")
  top_level_resources = { for path in local.top_level_paths : path => {
    path_part = path
  } }

  # 3. Nested Resources (e.g., "user/{id}", "order/{id}")
  nested_resources = { for path in local.nested_paths : path => {
    # FIX: Replaced deprecated 'last' function with index access (split(...)[length(...)-1])
    path_part   = split("/", path)[length(split("/", path)) - 1] # e.g., "{id}"
    parent_path = join("/", slice(split("/", path), 0, length(split("/", path)) - 1)) # e.g., "user"
  } }

  # 4. Create a compound key map for all HTTP methods/integrations (No Change)
  http_routes_map = {
    for route in var.http_routes : "${route.path}_${route.http_method}" => route
  }

  # 5. Combined map for easy lookup in the integration module and deployment triggers
  all_resources = merge(aws_api_gateway_resource.top_level, aws_api_gateway_resource.nested)
}

resource "aws_api_gateway_rest_api" "api" {
  name = module.label_apigw.id
  tags = module.label_apigw.tags
  endpoint_configuration {
    types = var.api_type
  }
}

resource "aws_api_gateway_rest_api_policy" "policy" {
  count       = contains(var.api_type, "PRIVATE") ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.api.id
  policy      = data.aws_iam_policy_document.api_policy[count.index].json
}

# 1. Create Top-Level Resources (Parent is always the API Root)
resource "aws_api_gateway_resource" "top_level" {
  for_each    = local.top_level_resources
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = each.value.path_part
}

# 2. Create Nested Resources (Explicitly depend on Top-Level Resources)
resource "aws_api_gateway_resource" "nested" {
  for_each    = local.nested_resources
  rest_api_id = aws_api_gateway_rest_api.api.id
  path_part   = each.value.path_part

  # Reference the parent resource using the parent_path key
  parent_id = aws_api_gateway_resource.top_level[each.value.parent_path].id
}


# 3. Create Methods and Integrations using a Compound Key
module "api_lambda_integration" {
  source = "./integrations/lambda"

  for_each = {
    for k, route in local.http_routes_map : k => route
    if route.integration_type == "lambda"
  }

  rest_api_id          = aws_api_gateway_rest_api.api.id
  
  # Determine resource_id based on whether the path is nested or top-level
  resource_id          = strcontains(each.value.path, "/") ? (
    aws_api_gateway_resource.nested[each.value.path].id
  ) : (
    aws_api_gateway_resource.top_level[each.value.path].id
  )
  
  http_method          = each.value.http_method
  lambda_invoke_arn    = each.value.lambda_invoke_arn
  lambda_function_name = each.value.lambda_function_name

  authorizer_type   = each.value.use_authorizer && each.value.authorizer_id != null ? "CUSTOM" : "NONE"
  authorizer_id     = each.value.use_authorizer ? each.value.authorizer_id : null
  api_execution_arn = aws_api_gateway_rest_api.api.execution_arn
  enable_cors_all   = each.value.enable_cors_all
  enable_api_key    = var.enable_api_key
}

# Update the deployment triggers to include Cognito authorizer
resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    # This remains correct, as it triggers a redeployment when any route changes
    routes_hash = jsonencode(var.http_routes)

    # Use the local http_routes_map to correctly include all method/integration keys
    integrations_hash = sha256(jsonencode(local.http_routes_map))

    # Include BOTH resource maps in the deployment trigger
    api_hash = sha256(jsonencode({
      rest_api = aws_api_gateway_rest_api.api.body
      resources = {
        for k, v in local.all_resources : k => {
          path_part = v.path_part
          parent_id = v.parent_id
        }
      }
    }))

    policy_hash = contains(var.api_type, "PRIVATE") ? sha256(jsonencode({
      policy = aws_api_gateway_rest_api_policy.policy[0].policy
    })) : "no-policy"

    # Ensure redeployment triggers on changes to all new resource blocks
    redeployment_hash = sha256(join(",", [
      jsonencode(aws_api_gateway_rest_api.api),
      jsonencode(aws_api_gateway_resource.top_level),
      jsonencode(aws_api_gateway_resource.nested),
      jsonencode(module.api_lambda_integration)
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    module.api_lambda_integration,
    aws_api_gateway_rest_api_policy.policy,
    # Explicit dependency on the nested resources ensures correct ordering for deployment
    aws_api_gateway_resource.nested, 
  ]
}

resource "aws_api_gateway_stage" "auth_stage" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = var.stage_name
  tags          = module.label_apigw_rest_api_label.tags

  variables = {
    "cors" = "true"
  }
}