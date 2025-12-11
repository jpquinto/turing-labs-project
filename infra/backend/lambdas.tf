
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

    trial_table_name = var.trial_table_name
    trial_table_arn  = var.trial_table_arn

    submission_table_name = var.submission_table_name
    submission_table_arn  = var.submission_table_arn

    voice_memo_bucket = var.voice_memo_bucket
    voice_memo_bucket_arn = var.voice_memo_bucket_arn

    backend_api_root_dir = var.backend_api_root_dir
}