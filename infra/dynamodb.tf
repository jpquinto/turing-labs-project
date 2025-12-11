module "participant_table" {
  source  = "./modules/dynamodb_table"
  context = module.null_label.context

  name = "participant"

  billing_mode = "PAY_PER_REQUEST"

  hash_key = "participant_id"

  attributes = [
    {
      name = "code"
      type = "S"
    },
    {
      name = "participant_id"
      type = "S"
    },
    {
      name = "trial_id"
      type = "S"
    },
  ]

  global_secondary_indexes = [
    {
      name            = "code_index"
      hash_key        = "code"
      range_key       = "participant_id"
      projection_type = "ALL"
    },
    {
      name            = "trial_id_index"
      hash_key        = "trial_id"
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
  range_key = "trial_id"

  attributes = [
    {
      name = "recipe_id"
      type = "S"
    },
    {
      name = "trial_id"
      type = "S"
    }
  ]

  global_secondary_indexes = [
    {
      name            = "trial_id_index"
      hash_key        = "trial_id"
      range_key       = "recipe_id"
      projection_type = "ALL"
    },
  ]
}

module "trial_table" {
  source  = "./modules/dynamodb_table"
  context = module.null_label.context

  name = "trial"

  billing_mode = "PAY_PER_REQUEST"

  hash_key = "trial_id"

  attributes = [
    {
      name = "trial_id"
      type = "S"
    },
  ]
}

module "submission_table" {
  source  = "./modules/dynamodb_table"
  context = module.null_label.context

  name = "submission"

  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "submission_id"
  range_key = "recipe_id"

  attributes = [
    {
      name = "submission_id"
      type = "S"
    },
    {
      name = "recipe_id"
      type = "S"
    },
    {
      name = "participant_id"
      type = "S"
    },
    {
      name = "trial_id"
      type = "S"
    },
  ]
  global_secondary_indexes = [
    {
      name            = "participant_id_index"
      hash_key        = "participant_id"
      range_key       = "recipe_id"
      projection_type = "ALL"
    },
    {
      name            = "trial_id_index"
      hash_key        = "trial_id"
      range_key       = "recipe_id"
      projection_type = "ALL"
    },
    {
      name            = "recipe_id_index"
      hash_key        = "recipe_id"
      range_key       = "submission_id"
      projection_type = "ALL"
    }
  ]
}

module "user_table" {
  source  = "./modules/dynamodb_table"
  context = module.null_label.context

  name = "user"

  billing_mode = "PAY_PER_REQUEST"

  hash_key = "user_id"

  attributes = [
    {
      name = "user_id"
      type = "S"
    },
  ]
}
