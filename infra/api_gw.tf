module "backend" {
    source = "./backend"
    context = module.null_label.context

    
    participant_table_name = module.participant_table.name
    participant_table_arn  = module.participant_table.arn
    
    recipe_table_name = module.recipe_table.name
    recipe_table_arn  = module.recipe_table.arn

    backend_api_root_dir = "${path.root}/../lambda_functions"
}