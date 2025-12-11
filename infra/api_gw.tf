module "backend" {
    source = "./backend"
    context = module.null_label.context

    
    participant_table_name = module.participant_table.name
    participant_table_arn  = module.participant_table.arn
    
    recipe_table_name = module.recipe_table.name
    recipe_table_arn  = module.recipe_table.arn

    trial_table_name = module.trial_table.name
    trial_table_arn  = module.trial_table.arn

    submission_table_name = module.submission_table.name
    submission_table_arn  = module.submission_table.arn

    backend_api_root_dir = "${path.root}/../lambda_functions"
}