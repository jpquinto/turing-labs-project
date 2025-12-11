resource "aws_api_gateway_method" "method" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.resource_id
  http_method   = var.http_method
  authorization = var.authorizer_type
  authorizer_id = var.authorizer_id

  request_parameters = var.request_parameters

  depends_on = [
    var.authorizer_id
  ]

  api_key_required = var.enable_api_key
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = var.resource_id
  http_method             = var.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_arn

  depends_on = [
    aws_api_gateway_method.method
  ]

  cache_key_parameters = var.cache_key_parameters
}

resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = var.rest_api_id
  resource_id = var.resource_id
  http_method = var.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }

  depends_on = [
    aws_api_gateway_method.method,
    aws_api_gateway_integration.lambda_integration
  ]
}

resource "aws_api_gateway_integration_response" "integration_response" {
  rest_api_id = var.rest_api_id
  resource_id = var.resource_id
  http_method = var.http_method
  status_code = aws_api_gateway_method_response.response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
  }

  depends_on = [
    aws_api_gateway_method.method,
    aws_api_gateway_method_response.response_200,
    aws_api_gateway_integration.lambda_integration
  ]
}

# Add permission for API Gateway to invoke the integration Lambda
resource "aws_lambda_permission" "api_gateway_integration" {
  statement_id  = "AllowAPIGatewayInvoke-${var.rest_api_id}-${var.resource_id}-${var.http_method}"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_execution_arn}/*"

  depends_on = [
    aws_api_gateway_method.method
  ]
}
