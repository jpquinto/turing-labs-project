output "repository_url" {
  value = aws_ecr_repository.this.repository_url
  description = "Repository URL"
}

output "repository_name" {
  value = aws_ecr_repository.this.name
  description = "Repository Name"
}