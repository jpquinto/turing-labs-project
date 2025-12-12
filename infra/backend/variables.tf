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


variable "trial_table_name" {
  type        = string
  description = "The name of the DynamoDB table to store trial data"
}

variable "trial_table_arn" {
  type        = string
  description = "The ARN of the DynamoDB table to store trial data"
}

variable "submission_table_name" {
  type        = string
  description = "The name of the DynamoDB table to store submission data"
}

variable "submission_table_arn" {
  type        = string
  description = "The ARN of the DynamoDB table to store submission data"
}

variable "user_table_name" {
  type        = string
  description = "The name of the DynamoDB table to store user data"
}

variable "user_table_arn" {
  type        = string
  description = "The ARN of the DynamoDB table to store user data"
}

variable "auth0_webhook_secret" {
  type        = string
  description = "The secret for the Auth0 webhook"
}

variable "auth0_domain" {
  type        = string
  description = "The Auth0 domain (e.g., your-tenant.auth0.com)"
}

variable "auth0_audience" {
  type        = string
  description = "The Auth0 API audience identifier"
}

variable "voice_memo_bucket" {
  type        = string
  description = "The name of the S3 bucket to store voice memos"
}

variable "voice_memo_bucket_arn" {
  type        = string
  description = "The ARN of the S3 bucket to store voice memos"
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

