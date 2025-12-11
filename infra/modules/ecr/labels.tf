module main_ctx {
  source = "cloudposse/label/null"
  context = var.context

  tags = {
    component = "ecr"
  }
}

module label_ecr {
  source = "cloudposse/label/null"
  context = module.main_ctx.context

  attributes = ["ecr"]
}