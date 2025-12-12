module "python_dependencies_layer" {
  source = "../modules/lambda_layer/python_dependencies"

  context = var.context
  name    = "python_dependencies"

  runtime      = ["python3.12"]
  architecture = ["x86_64"]

  deployment_type = "s3"
  zip_project     = true
  source_dir      = "${var.backend_api_root_dir}/layers/python-dependencies"
  build_path      = "${path.root}/dist/backend/layers/python-dependencies-layer.zip"
  upload_to_s3    = true
  s3_bucket       = module.lambda_deployment_bucket.bucket_name
  s3_key          = "lambda_layers/python_dependencies.zip"

  dependencies = [
    "PyJWT[crypto]==2.8.0",
    "cryptography==41.0.7"
  ]
}