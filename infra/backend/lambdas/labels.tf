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

