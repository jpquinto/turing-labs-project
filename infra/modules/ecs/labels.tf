module "main_ctx" {
  source  = "cloudposse/label/null"
  context = var.context

  tags = {
    component = "ecs"
    image     = var.image_uri
  }
}

module "label_ecs" {
  source  = "cloudposse/label/null"
  context = module.main_ctx.context

  attributes = ["ecs"]
}

module "label_ecs_cluster" {
  source  = "cloudposse/label/null"
  context = module.label_ecs.context

  attributes = ["cluster"]
}

module "label_ecs_cw" {
  source  = "cloudposse/label/null"
  context = module.label_ecs.context

  attributes = ["cw"]
}

module "label_ecs_task_def" {
  source  = "cloudposse/label/null"
  context = module.label_ecs.context

  attributes = ["task-def"]
}

module "label_ecs_task_role" {
  source  = "cloudposse/label/null"
  context = module.label_ecs.context

  attributes = ["task-role"]
}

module "label_ecs_service" {
  source  = "cloudposse/label/null"
  context = module.label_ecs.context

  attributes = ["service"]
}

module "label_ecs_exec_policy" {
  source  = "cloudposse/label/null"
  context = module.label_ecs.context

  attributes = ["exec-policy"]
}
