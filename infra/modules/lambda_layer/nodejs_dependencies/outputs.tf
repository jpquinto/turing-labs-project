output "layer_arn" {
  value       = module.lambda_layer.layer_arn
  description = "ARN of the Lambda layer"
}

output "layer_name" {
  value       = module.lambda_layer.layer_name
  description = "Name of the Lambda layer"
}