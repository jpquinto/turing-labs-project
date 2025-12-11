
module "lambdas" {
    source = "./lambdas"

    context = var.context

    memory = var.memory
    time_limit = var.time_limit

    deploy_s3_bucket = module.lambda_deployment_bucket.bucket_name
    
    participant_table_name = var.participant_table_name
    participant_table_arn  = var.participant_table_arn
    
    recipe_table_name = var.recipe_table_name
    recipe_table_arn  = var.recipe_table_arn

    backend_api_root_dir = var.backend_api_root_dir
}