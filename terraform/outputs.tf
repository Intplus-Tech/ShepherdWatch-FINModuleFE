output "account_id" {
  description = "AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "region" {
  description = "AWS Region"
  value       = var.aws_region
}

# ========================================
# ECR Outputs
# ========================================

output "ecr_dev_repository_url" {
  description = "Dev ECR repository URL"
  value       = aws_ecr_repository.dev.repository_url
}

output "ecr_dev_repository_name" {
  description = "Dev ECR repository name"
  value       = aws_ecr_repository.dev.name
}

output "ecr_prod_repository_url" {
  description = "Prod ECR repository URL"
  value       = aws_ecr_repository.prod.repository_url
}

output "ecr_prod_repository_name" {
  description = "Prod ECR repository name"
  value       = aws_ecr_repository.prod.name
}

# ========================================
# IAM Outputs
# ========================================

output "codebuild_role_arn" {
  description = "CodeBuild service role ARN"
  value       = aws_iam_role.codebuild.arn
}

output "apprunner_access_role_arn" {
  description = "App Runner ECR access role ARN"
  value       = aws_iam_role.apprunner_access.arn
}

output "apprunner_instance_role_arn" {
  description = "App Runner instance role ARN"
  value       = aws_iam_role.apprunner_instance.arn
}

# ========================================
# CodeBuild Outputs
# ========================================

output "codebuild_dev_project_name" {
  description = "Dev CodeBuild project name"
  value       = aws_codebuild_project.dev.name
}

output "codebuild_prod_project_name" {
  description = "Prod CodeBuild project name"
  value       = aws_codebuild_project.prod.name
}

# ========================================
# App Runner Outputs
# ========================================

output "apprunner_dev_service_url" {
  description = "Dev App Runner service URL"
  value       = var.create_apprunner_services ? aws_apprunner_service.dev[0].service_url : "Not created - set create_apprunner_services=true"
}

output "apprunner_dev_service_arn" {
  description = "Dev App Runner service ARN"
  value       = var.create_apprunner_services ? aws_apprunner_service.dev[0].arn : "Not created"
}

output "apprunner_prod_service_url" {
  description = "Prod App Runner service URL"
  value       = var.create_apprunner_services ? aws_apprunner_service.prod[0].service_url : "Not created - set create_apprunner_services=true"
}

output "apprunner_prod_service_arn" {
  description = "Prod App Runner service ARN"
  value       = var.create_apprunner_services ? aws_apprunner_service.prod[0].arn : "Not created"
}

# ========================================
# GitHub Actions Configuration
# ========================================

output "github_actions_configuration" {
  description = "Configuration needed for GitHub Actions workflows"
  value = {
    aws_region               = var.aws_region
    aws_account_id           = data.aws_caller_identity.current.account_id
    dev_ecr_repository       = aws_ecr_repository.dev.name
    prod_ecr_repository      = aws_ecr_repository.prod.name
    dev_apprunner_arn        = var.create_apprunner_services ? aws_apprunner_service.dev[0].arn : "Not created"
    prod_apprunner_arn       = var.create_apprunner_services ? aws_apprunner_service.prod[0].arn : "Not created"
  }
}
