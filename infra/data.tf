data "aws_secretsmanager_secret_version" "third_party_secrets" {
  secret_id = "third-party-secrets"
}

locals {
  third_party_secrets = jsondecode(data.aws_secretsmanager_secret_version.third_party_secrets.secret_string)
}