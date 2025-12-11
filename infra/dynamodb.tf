module "participant_table" {
  source  = "./modules/dynamodb_table"
  context = module.null_label.context

  name = "participant"

  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "participant_id"
  range_key = "last_name"

  attributes = [
    {
      name = "first_name"
      type = "S"
    },
    {
      name = "last_name"
      type = "S"
    },
    {
      name = "participant_id"
      type = "S"
    },
  ]

  global_secondary_indexes = [
    {
      name            = "first_name_index"
      hash_key        = "first_name"
      range_key       = "participant_id"
      projection_type = "ALL"
    },
  ]
}

module "recipe_table" {
  source  = "./modules/dynamodb_table"
  context = module.null_label.context

  name = "recipe"

  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "recipe_id"

  attributes = [
    {
      name = "recipe_id"
      type = "S"
    },
  ]
}