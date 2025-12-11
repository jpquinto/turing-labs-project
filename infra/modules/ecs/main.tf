data "aws_region" "current" {}

resource "aws_ecs_cluster" "this" {
  name = module.label_ecs_cluster.id
  tags = module.label_ecs_cluster.tags

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${module.label_ecs_cw.id}"
  retention_in_days = 7
  tags              = module.label_ecs_cw.tags
}

data "aws_iam_policy_document" "ecs_exec_policy" {
  count = var.enable_execute_command ? 1 : 0

  statement {
    effect = "Allow"
    actions = [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel"
    ]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "ecs_cognito_policy" {
  count = var.enable_execute_command ? 1 : 0

  statement {
    effect = "Allow"
    actions = [
      "cognito-idp:AdminGetUser",
      "cognito-idp:AdminCreateUser",
      "cognito-idp:AdminDeleteUser",
      "cognito-idp:AdminSetUserPassword",
      "cognito-idp:AdminUpdateUserAttributes",
      "cognito-idp:AdminAddUserToGroup",
      "cognito-idp:ListUsers"
    ]
    resources = ["*"] # TODO: Refine this to specific Cognito User Pool ARNs
  }
}

resource "aws_iam_policy" "ecs_exec_policy" {
  count = var.enable_execute_command ? 1 : 0

  name        = module.label_ecs_exec_policy.id
  description = "Policy for ECS Exec to allow SSM messages"
  policy      = data.aws_iam_policy_document.ecs_exec_policy[0].json
  tags        = module.label_ecs_exec_policy.tags
}

resource "aws_iam_policy" "cognito_test_policy" {
  count = var.enable_execute_command ? 1 : 0

  name        = "${module.label_ecs_task_def.id}-cognito-test-policy"
  description = "Policy for Cognito operations during integration testing"
  policy      = data.aws_iam_policy_document.ecs_cognito_policy[0].json
  tags        = module.label_ecs_exec_policy.tags
}

resource "aws_iam_role_policy_attachment" "ecs_exec_policy_attachment" {
  count = var.enable_execute_command ? 1 : 0

  role       = aws_iam_role.task_execution.name
  policy_arn = aws_iam_policy.ecs_exec_policy[0].arn
}

resource "aws_iam_role_policy_attachment" "cognito_test_policy_attachment" {
  count = var.enable_execute_command ? 1 : 0

  role       = aws_iam_role.task_execution.name
  policy_arn = aws_iam_policy.cognito_test_policy[0].arn
}

resource "aws_ecs_task_definition" "this" {
  family                   = module.label_ecs_task_def.id
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task_execution.arn # Can be a separate role later

  container_definitions = jsonencode([
    {
      name  = var.container_name
      image = var.image_uri
      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = var.environment
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = var.container_name
        }
      }
    }
  ])

  tags = module.label_ecs_task_def.tags
}



resource "aws_ecs_service" "this" {
  name            = module.label_ecs_service.id
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = var.security_group_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = var.container_name
    container_port   = var.container_port
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  tags = module.label_ecs_service.tags

  depends_on = [aws_iam_role.task_execution]

  enable_execute_command = var.enable_execute_command
}

# Auto Scaling Target
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.this.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  depends_on = [aws_ecs_service.this]

  tags = module.label_ecs_service.tags
}

# Auto Scaling Policy - Scale Up
resource "aws_appautoscaling_policy" "scale_up" {
  name               = "${module.label_ecs_service.id}-scale-up"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = var.scaling_metric_type
    }
    target_value       = var.target_cpu_utilization
    scale_in_cooldown  = var.scale_in_cooldown
    scale_out_cooldown = var.scale_out_cooldown
  }
}
