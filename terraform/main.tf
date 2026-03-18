terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ========================================
# ECR Repositories
# ========================================

resource "aws_ecr_repository" "dev" {
  name                 = "${var.project_name}-dev"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.project_name}-dev"
    Environment = "dev"
    Project     = var.project_name
  }
}

resource "aws_ecr_repository" "prod" {
  name                 = "${var.project_name}-prod"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.project_name}-prod"
    Environment = "prod"
    Project     = var.project_name
  }
}

# ========================================
# IAM Roles
# ========================================

# CodeBuild Service Role
resource "aws_iam_role" "codebuild" {
  name = "${var.project_name}-codebuild-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name    = "${var.project_name}-codebuild-role"
    Project = var.project_name
  }
}

resource "aws_iam_role_policy_attachment" "codebuild_ecr" {
  role       = aws_iam_role.codebuild.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}

resource "aws_iam_role_policy_attachment" "codebuild_logs" {
  role       = aws_iam_role.codebuild.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

# App Runner Access Role (for pulling from ECR)
resource "aws_iam_role" "apprunner_access" {
  name = "${var.project_name}-apprunner-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name    = "${var.project_name}-apprunner-access-role"
    Project = var.project_name
  }
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr_access" {
  role       = aws_iam_role.apprunner_access.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# App Runner Instance Role
resource "aws_iam_role" "apprunner_instance" {
  name = "${var.project_name}-apprunner-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name    = "${var.project_name}-apprunner-instance-role"
    Project = var.project_name
  }
}

resource "aws_iam_role_policy_attachment" "apprunner_instance_ecr" {
  role       = aws_iam_role.apprunner_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# ========================================
# CodeBuild Projects
# ========================================

resource "aws_codebuild_project" "dev" {
  name          = "${var.project_name}-build-dev"
  service_role  = aws_iam_role.codebuild.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    type            = "LINUX_CONTAINER"
    image           = "aws/codebuild/standard:7.0"
    compute_type    = "BUILD_GENERAL1_SMALL"
    privileged_mode = true

    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }

    environment_variable {
      name  = "ECR_REPOSITORY"
      value = aws_ecr_repository.dev.name
    }
  }

  source {
    type     = "GITHUB"
    location = var.github_repo_url
  }

  tags = {
    Name        = "${var.project_name}-build-dev"
    Environment = "dev"
    Project     = var.project_name
  }
}

resource "aws_codebuild_project" "prod" {
  name          = "${var.project_name}-build-prod"
  service_role  = aws_iam_role.codebuild.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    type            = "LINUX_CONTAINER"
    image           = "aws/codebuild/standard:7.0"
    compute_type    = "BUILD_GENERAL1_SMALL"
    privileged_mode = true

    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }

    environment_variable {
      name  = "ECR_REPOSITORY"
      value = aws_ecr_repository.prod.name
    }
  }

  source {
    type     = "GITHUB"
    location = var.github_repo_url
  }

  tags = {
    Name        = "${var.project_name}-build-prod"
    Environment = "prod"
    Project     = var.project_name
  }
}

# ========================================
# App Runner Services
# ========================================

# NOTE: App Runner services will fail initially if no image exists in ECR
# You need to push an initial image first, or comment out these resources
# until images are available

resource "aws_apprunner_service" "dev" {
  count        = var.create_apprunner_services ? 1 : 0
  service_name = "${var.project_name}-dev"

  source_configuration {
    image_repository {
      image_identifier      = "${aws_ecr_repository.dev.repository_url}:latest"
      image_repository_type = "ECR"

      image_configuration {
        port = "3000"

        runtime_environment_variables = {
          NODE_ENV = "production"
          PORT     = "3000"
        }
      }
    }

    auto_deployments_enabled = true

    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_access.arn
    }
  }

  instance_configuration {
    cpu               = var.dev_cpu
    memory            = var.dev_memory
    instance_role_arn = aws_iam_role.apprunner_instance.arn
  }

  health_check_configuration {
    protocol            = "TCP"
    path                = "/"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 3
  }

  tags = {
    Name        = "${var.project_name}-dev"
    Environment = "dev"
    Project     = var.project_name
  }
}

resource "aws_apprunner_service" "prod" {
  count        = var.create_apprunner_services ? 1 : 0
  service_name = "${var.project_name}-prod"

  source_configuration {
    image_repository {
      image_identifier      = "${aws_ecr_repository.prod.repository_url}:latest"
      image_repository_type = "ECR"

      image_configuration {
        port = "3000"

        runtime_environment_variables = {
          NODE_ENV = "production"
          PORT     = "3000"
        }
      }
    }

    auto_deployments_enabled = true

    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_access.arn
    }
  }

  instance_configuration {
    cpu               = var.prod_cpu
    memory            = var.prod_memory
    instance_role_arn = aws_iam_role.apprunner_instance.arn
  }

  health_check_configuration {
    protocol            = "TCP"
    path                = "/"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 3
  }

  tags = {
    Name        = "${var.project_name}-prod"
    Environment = "prod"
    Project     = var.project_name
  }
}

# ========================================
# Data Sources
# ========================================

data "aws_caller_identity" "current" {}
