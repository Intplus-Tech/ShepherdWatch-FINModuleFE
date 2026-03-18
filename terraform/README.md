# Terraform Infrastructure for ShepherdWatch FINModule

This Terraform configuration replicates the complete dev/prod AWS infrastructure for the ShepherdWatch FINModule frontend application.

## What This Creates

### Resources Created:
- **2 ECR Repositories**: Separate Docker image repositories for dev and prod
- **3 IAM Roles**: CodeBuild service role, App Runner access role, App Runner instance role
- **2 CodeBuild Projects**: For building dev and prod Docker images
- **2 App Runner Services**: Serverless container hosting for dev (1 vCPU, 2GB) and prod (4 vCPU, 8GB)

### Environment Specifications:
- **Dev Environment**: 1 vCPU, 2 GB RAM (cost-efficient)
- **Prod Environment**: 4 vCPU, 8 GB RAM (high-performance)

## Prerequisites

1. **Terraform Installed**: Version 1.0 or higher
   ```bash
   terraform --version
   ```

2. **AWS CLI Configured**: With valid credentials
   ```bash
   aws configure
   ```

3. **AWS Permissions**: Your AWS user/role must have permissions to create:
   - ECR repositories
   - IAM roles and policies
   - CodeBuild projects
   - App Runner services

## Step-by-Step Deployment

### Phase 1: Initial Infrastructure (ECR Repositories Only)

The deployment happens in TWO phases because App Runner services require Docker images to exist in ECR before they can be created.

#### 1. Create Configuration File

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

#### 2. Customize terraform.tfvars

Edit `terraform.tfvars` with your values:

```hcl
# AWS Configuration
aws_region   = "us-east-1"          # Your preferred region
project_name = "shepherdwatch-finmodule-fe"  # Your project name

# GitHub Repository
github_repo_url = "https://github.com/YOUR-ORG/YOUR-REPO.git"

# IMPORTANT: Keep this false for initial deployment
create_apprunner_services = false

# Dev Environment Resources
dev_cpu    = "1024"  # 1 vCPU
dev_memory = "2 GB"

# Production Environment Resources
prod_cpu    = "4096"  # 4 vCPU
prod_memory = "8 GB"
```

#### 3. Initialize Terraform

```bash
terraform init
```

#### 4. Preview Changes

```bash
terraform plan
```

#### 5. Apply Phase 1 (ECR + IAM + CodeBuild)

```bash
terraform apply
```

Type `yes` when prompted. This creates:
- ECR repositories (dev and prod)
- IAM roles
- CodeBuild projects

#### 6. Note the Output Values

After successful apply, Terraform will output important values:

```
ecr_dev_repository_url  = "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/PROJECT-dev"
ecr_prod_repository_url = "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/PROJECT-prod"
aws_account_id          = "ACCOUNT_ID"
aws_region              = "REGION"
```

**Save these values** - you'll need them for GitHub Actions workflows.

### Phase 2: Push Docker Images and Create App Runner Services

#### 7. Update GitHub Actions Workflows

Update your GitHub Actions workflow files with the Terraform output values:

**`.github/workflows/deploy-dev.yml`:**
```yaml
env:
  AWS_REGION: <region from terraform output>
  ECR_REPOSITORY: <ecr_dev_repository_name from terraform output>
```

**`.github/workflows/deploy-prod.yml`:**
```yaml
env:
  AWS_REGION: <region from terraform output>
  ECR_REPOSITORY: <ecr_prod_repository_name from terraform output>
```

#### 8. Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

#### 9. Push Code to Trigger Image Build

```bash
# For dev environment
git checkout -b dev
git push origin dev

# For prod environment
git checkout main
git push origin main
```

GitHub Actions will automatically:
- Build the Docker image
- Push to the corresponding ECR repository

#### 10. Enable App Runner Services

After images are successfully pushed to ECR, update `terraform.tfvars`:

```hcl
create_apprunner_services = true  # Change from false to true
```

#### 11. Apply Phase 2 (App Runner Services)

```bash
terraform plan
terraform apply
```

Type `yes` when prompted. This creates:
- Dev App Runner service
- Prod App Runner service

#### 12. Get Your Application URLs

After successful deployment:

```bash
terraform output apprunner_dev_service_url
terraform output apprunner_prod_service_url
```

Your applications will be accessible at these URLs within 3-5 minutes.

## Updating GitHub Actions with App Runner ARNs

After Phase 2 completes, update your GitHub workflows with App Runner service ARNs:

**`.github/workflows/deploy-dev.yml`:**
```yaml
env:
  APP_RUNNER_SERVICE_ARN: <dev_apprunner_arn from terraform output>
```

**`.github/workflows/deploy-prod.yml`:**
```yaml
env:
  APP_RUNNER_SERVICE_ARN: <prod_apprunner_arn from terraform output>
```

Commit and push these changes to enable automatic redeployments.

## Deployment Flow

After initial setup, deployments are fully automatic:

1. **Dev Branch**: Push to `dev` → GitHub Actions builds → Pushes to dev ECR → App Runner auto-deploys
2. **Main Branch**: Push to `main` → GitHub Actions builds → Pushes to prod ECR → App Runner auto-deploys

## Customization

### Changing Resource Allocations

To modify CPU/memory for environments, edit `terraform.tfvars`:

```hcl
dev_cpu    = "2048"  # Change to 2 vCPU
dev_memory = "4 GB"  # Change to 4 GB

prod_cpu    = "4096"  # 4 vCPU
prod_memory = "12 GB" # Change to 12 GB
```

Valid CPU/Memory combinations:
- 1024 (1 vCPU): 2 GB, 3 GB, 4 GB
- 2048 (2 vCPU): 4 GB, 6 GB
- 4096 (4 vCPU): 8 GB, 10 GB, 12 GB

Then apply:
```bash
terraform apply
```

### Changing AWS Region

Update `aws_region` in `terraform.tfvars`:

```hcl
aws_region = "us-west-2"
```

**Note**: This requires destroying and recreating all resources.

## Managing the Infrastructure

### View Current State

```bash
terraform show
```

### List All Resources

```bash
terraform state list
```

### View Specific Output

```bash
terraform output ecr_dev_repository_url
terraform output github_actions_configuration
```

### Update Infrastructure

After modifying any `.tf` files or `terraform.tfvars`:

```bash
terraform plan   # Preview changes
terraform apply  # Apply changes
```

### Destroy Infrastructure

**WARNING**: This deletes all resources including ECR images.

```bash
terraform destroy
```

Type `yes` when prompted.

## Troubleshooting

### Issue: App Runner service fails to create

**Cause**: No Docker image exists in ECR repository

**Solution**:
1. Ensure `create_apprunner_services = false` during initial deployment
2. Push images via GitHub Actions first
3. Then set `create_apprunner_services = true` and re-apply

### Issue: "AccessDenied" errors

**Cause**: Insufficient AWS permissions

**Solution**: Ensure your AWS user/role has permissions for ECR, IAM, CodeBuild, and App Runner

### Issue: GitHub Actions failing to push to ECR

**Cause**: Missing or incorrect GitHub secrets

**Solution**: Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correctly set in GitHub repository secrets

## Cost Estimation

Approximate monthly costs (us-east-1):

- **ECR Storage**: $0.10 per GB/month (~$1-2 for typical images)
- **CodeBuild**: Free tier includes 100 build minutes/month
- **App Runner Dev** (1 vCPU, 2GB): ~$20-30/month
- **App Runner Prod** (4 vCPU, 8GB): ~$80-100/month

**Total estimated**: ~$100-135/month (varies with usage)

## Architecture

```
┌─────────────┐
│   GitHub    │
│ Repository  │
└──────┬──────┘
       │
       │ Push to branch
       ▼
┌─────────────────────┐
│  GitHub Actions     │
│  - Build Docker     │
│  - Push to ECR      │
└──────┬──────────────┘
       │
       ├─────────────────┬─────────────────┐
       ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   ECR Dev   │   │  ECR Prod   │   │  CodeBuild  │
└──────┬──────┘   └──────┬──────┘   └─────────────┘
       │                 │
       │ Auto-deploy     │ Auto-deploy
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│ App Runner  │   │ App Runner  │
│    Dev      │   │    Prod     │
│  1vCPU,2GB  │   │ 4vCPU,8GB   │
└─────────────┘   └─────────────┘
```

## Security Notes

- Never commit `terraform.tfvars` with sensitive values to version control
- Store AWS credentials securely as GitHub secrets
- ECR repositories have image scanning enabled by default
- IAM roles follow principle of least privilege
- App Runner services use separate instance roles for runtime permissions

## Support

For issues specific to this Terraform configuration, check:
1. Terraform output messages
2. AWS CloudWatch logs for App Runner services
3. GitHub Actions workflow logs
4. AWS Console for service status

## Next Steps

After successful deployment:

1. Monitor App Runner services in AWS Console
2. Set up custom domains if needed
3. Configure environment variables for App Runner services
4. Set up CloudWatch alarms for monitoring
5. Consider implementing AWS WAF for production
