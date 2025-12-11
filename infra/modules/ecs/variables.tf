variable "context" {
  description = "Context object from null-label"
  type        = any
}

variable "container_name" {
  description = "Name of the container"
  type        = string
}

variable "container_port" {
  description = "Port on which your app listens"
  type        = number
  default     = 3001
}

variable "image_uri" {
  description = "URI of the container image in ECR"
  type        = string
}

variable "desired_count" {
  type        = number
  default     = 1
  description = "Number of ECS tasks to run"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for Fargate tasks"
}

variable "target_group_arn" {
  description = "The ARN of the ALB target group"
  type        = string
}

variable "cpu" {
  type        = number
  default     = 512
  description = "CPU in MiB"
}

variable "memory" {
  type        = number
  default     = 1024
  description = "Memory in MiB"
}
variable "environment" {
  default = []
  type = list(object({
    name  = string
    value = string
  }))

  description = "Environment variables to pass to the container"
}

variable "extra_policy_arns" {
  type        = list(string)
  default     = []
  description = "Extra policy ARNs to attach to the ECS tasks"
}

variable "security_group_ids" {
  type        = list(string)
  default     = []
  description = "Security group IDs to attach to the ECS tasks"
}

variable "enable_execute_command" {
  type        = bool
  default     = false
  description = "Enable ECS Exec for the service"
}

variable "min_capacity" {
  type        = number
  default     = 1
  description = "Minimum number of ECS tasks for auto-scaling"
}

variable "max_capacity" {
  type        = number
  default     = 3
  description = "Maximum number of ECS tasks for auto-scaling"
}

variable "scaling_metric_type" {
  description = "The metric type for auto scaling"
  type        = string
  default     = "ECSServiceAverageCPUUtilization"
  validation {
    condition = contains([
      "ECSServiceAverageCPUUtilization",
      "ECSServiceAverageMemoryUtilization"
    ], var.scaling_metric_type)
    error_message = "Scaling metric type must be either ECSServiceAverageCPUUtilization or ECSServiceAverageMemoryUtilization."
  }
}

variable "target_cpu_utilization" {
  description = "Target CPU utilization percentage for auto scaling"
  type        = number
  default     = 70
}

variable "target_memory_utilization" {
  description = "Target memory utilization percentage for auto scaling"
  type        = number
  default     = 80
}

variable "scale_in_cooldown" {
  description = "The amount of time, in seconds, after a scale in activity completes before another scale in activity can start"
  type        = number
  default     = 15
}

variable "scale_out_cooldown" {
  description = "The amount of time, in seconds, after a scale out activity completes before another scale out activity can start"
  type        = number
  default     = 15
}
