data aws_iam_policy_document "task_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect = "Allow"
    principals {
      identifiers = ["ecs-tasks.amazonaws.com"]
      type = "Service"
    }
  }
}

resource "aws_iam_role" "task_execution" {
  name = module.label_ecs_task_role.id

  assume_role_policy = data.aws_iam_policy_document.task_assume_role.json

  tags = module.label_ecs_task_role.tags
}

resource "aws_iam_role_policy_attachment" "task_execution_policy" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "task_extra_policies" {
  for_each = { for index, policy_arn in var.extra_policy_arns : index => policy_arn }
  role       = aws_iam_role.task_execution.name
  policy_arn = each.value
}
