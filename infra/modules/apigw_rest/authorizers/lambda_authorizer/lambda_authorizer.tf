data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_api_gateway_authorizer" "lambda_authorizer" {
  name                             = var.authorizer_name
  rest_api_id                      = var.rest_api_id
  authorizer_uri                   = var.authorizer_invoke_arn
  authorizer_credentials           = aws_iam_role.invocation_role.arn
  authorizer_result_ttl_in_seconds = var.authorizer_result_ttl_in_seconds
  type                             = "TOKEN"
  identity_source                  = "method.request.header.Authorization"
}

data "aws_iam_policy_document" "invocation_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}



resource "aws_iam_role" "invocation_role" {
  name               = "${module.label_authorizer_role.id}-${var.authorizer_name}"
  tags               = module.label_authorizer_role.tags
  path               = "/"
  assume_role_policy = data.aws_iam_policy_document.invocation_assume_role.json
}

data "aws_iam_policy_document" "invocation_policy" {
  statement {
    effect    = "Allow"
    actions   = ["lambda:InvokeFunction"]
    resources = [var.authorizer_arn]
  }
}

resource "aws_iam_role_policy" "invocation_policy" {
  name   = "${module.label_authorizer_policy.id}-${var.authorizer_name}"
  role   = aws_iam_role.invocation_role.id
  policy = data.aws_iam_policy_document.invocation_policy.json
}

# Add Lambda permission for API Gateway to invoke the authorizer
resource "aws_lambda_permission" "authorizer_permission" {
  statement_id  = "AllowAPIGatewayInvokeAuthorizer-${var.rest_api_id}"
  action        = "lambda:InvokeFunction"
  function_name = var.authorizer_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${var.rest_api_id}/authorizers/${aws_api_gateway_authorizer.lambda_authorizer.id}"
}