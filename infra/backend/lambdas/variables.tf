variable "context" {
  type        = any
  description = "Nulllabel Context"
}


variable "participant_table_name" {
  type        = string
  description = "The name of the DynamoDB table to store participant data"
}

variable "participant_table_arn" {
  type        = string
  description = "The ARN of the DynamoDB table to store participant data"
}


variable "recipe_table_name" {
  type        = string
  description = "The name of the DynamoDB table to store recipe data"
}

variable "recipe_table_arn" {
  type        = string
  description = "The ARN of the DynamoDB table to store recipe data"
}



variable "memory" {
    type        = number
    description = "Default memory for Lambda functions"
    default     = 512
}

variable "time_limit" {
    type        = number
    description = "Default time limit for Lambda functions"
    default     = 30
}

variable "backend_api_root_dir" {
    type        = string
    description = "Root directory path for backend-api API code"
}


variable "deploy_s3_bucket" {
    type        = string
    description = "S3 bucket name for Lambda deployment packages"
}
