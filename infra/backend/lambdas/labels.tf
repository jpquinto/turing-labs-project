module "main_ctx" {
  source  = "cloudposse/label/null"
  context = var.context

  name = "backend-api"

  tags = {
    module = "backend-api"
  }
}


module "label_participant" {
  source  = "cloudposse/label/null"
  context = module.main_ctx.context

  attributes = ["participant"]
}


module "label_recipe" {
  source  = "cloudposse/label/null"
  context = module.main_ctx.context

  attributes = ["recipe"]
}

module "label_trial" {
  source  = "cloudposse/label/null"
  context = module.main_ctx.context

  attributes = ["trial"]
}

module "label_submission" {
  source  = "cloudposse/label/null"
  context = module.main_ctx.context

  attributes = ["submission"]
}

module "label_voice_memo" {
  source  = "cloudposse/label/null"
  context = module.main_ctx.context

  attributes = ["voice-memo"]
}