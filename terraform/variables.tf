variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "shepherdwatch-finmodule-fe"
}

variable "github_repo_url" {
  description = "GitHub repository URL"
  type        = string
  default     = "https://github.com/Intplus-Tech/ShepherdWatch-FINModuleFE.git"
}

variable "create_apprunner_services" {
  description = "Whether to create App Runner services (set to false if no images in ECR yet)"
  type        = bool
  default     = false
}

variable "dev_cpu" {
  description = "CPU units for dev environment (1024 = 1 vCPU, 2048 = 2 vCPU, 4096 = 4 vCPU)"
  type        = string
  default     = "1024"
}

variable "dev_memory" {
  description = "Memory for dev environment (2 GB, 3 GB, 4 GB, 6 GB, 8 GB, 10 GB, 12 GB)"
  type        = string
  default     = "2 GB"
}

variable "prod_cpu" {
  description = "CPU units for prod environment (1024 = 1 vCPU, 2048 = 2 vCPU, 4096 = 4 vCPU)"
  type        = string
  default     = "4096"
}

variable "prod_memory" {
  description = "Memory for prod environment (2 GB, 3 GB, 4 GB, 6 GB, 8 GB, 10 GB, 12 GB)"
  type        = string
  default     = "8 GB"
}
