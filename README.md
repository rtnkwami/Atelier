<!-- omit from toc -->
# Atelier - 3 Tier Web Architecture with CI/CD Integration
<!-- omit from toc -->
## Project Overview
This project involves building and deploying a 3-tier e-commerce web application on AWS to provide scalability. OpenTofu is used to create the infrastructure, and GitHub Actions is used to test the application code, build container image artifacts, and deploy to AWS.

This repository serves as a Personal DevOps Lab for experimenting with various AWS architectural patterns, automation workflows, and infrastructure best practices.

---
<!-- omit from toc -->
## Table of Contents
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Design Principles \& Architecture](#design-principles--architecture)
  - [Traffic Routing \& Load Balancing](#traffic-routing--load-balancing)
  - [Network Segmentation (Subnet Strategy)](#network-segmentation-subnet-strategy)
  - [Network Security (Least Privilege)](#network-security-least-privilege)
  - [Service \& Data Design](#service--data-design)
- [Infrastructure as Code (IaC)](#infrastructure-as-code-iac)
  - [Remote State](#remote-state)
- [CI/CD Pipeline](#cicd-pipeline)
  - [Smart Workflow Orchestration (Path Filtering)](#smart-workflow-orchestration-path-filtering)
  - [Container Lifecycle \& Optimization](#container-lifecycle--optimization)
  - [Database Migration Strategy](#database-migration-strategy)
- [Deployment \& Usage](#deployment--usage)
  - [Prerequisites](#prerequisites)
  - [Bootstrap](#bootstrap)
  - [GitHub Actions Configuration](#github-actions-configuration)
  - [Auth0 Integration \& Callback URLs](#auth0-integration--callback-urls)
  - [Deploy](#deploy)
  - [Destroy](#destroy)
- [Observability](#observability)
- [Case Studies (Lab Roadmap)](#case-studies-lab-roadmap)

## Tech Stack
- **Backend**: NestJS
- **Infrastructure**: OpenTofu
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Scripting**: Python

## Architecture Overview
As displayed in the diagram, Atelier is deployed on ECS Fargate and connects to Aurora RDS. Elasticache acts as the data store for user session data, and Route 53 provides DNS access to the application.

![Architecture](./docs/architecture.png)

---

## Design Principles & Architecture
### Traffic Routing & Load Balancing
Two ALBs are used to decouple the presentation and application layers while maintaining internal network privacy.

- **External Application Load Balancer(ALB)**: Acts as the entry point for all user traffic, listening on port 80. It handles public requests and routes them to the Frontend ECS service on port 3000.

- **Internal Application Load Balancer(ALB)**: Enables service-to-service communication. It listens on port 5000 and routes requests from the Frontend to the Backend API.

**Configuration**: [View Load Balancer Definitions](./infra/load-balancers.tf)

### Network Segmentation (Subnet Strategy)
The VPC is divided into three functional layers across multiple Availability Zones to ensure resource isolation:

- **Web Subnets (Public)**: Houses the External ALB and the NAT Gateway. These are the only subnets with a direct route to the Internet Gateway (IGW).

- **App Subnets (Private)**: Houses Frontend and Backend ECS Fargate tasks, as well as the Internal ALB. These subnets route outbound traffic through the NAT Gateway in the Web tier.

- **DB Subnets (Private)**: A dedicated, isolated layer for stateful resources, including Amazon Aurora Serverless database and Valkey (ElastiCache). These subnets have no outbound internet route and no direct public access.

**Configuration**: [View VPC & Subnet Networking](./infra/vpc.tf)

### Network Security (Least Privilege)
Isolation is strictly enforced through security groups. Each security group layer only accepts traffic from the layer immediately preceding it:

- **Web Tier**: The External ALB security group allows 80/443 from the internet. The Frontend security group only accepts traffic from the External ALB.

- **App Tier**: The Internal ALB security group only accepts traffic from the Frontend security group. The Backend security group only accepts traffic from the Internal ALB.

- **Data Tier**: Aurora RDS and Valkey (ElastiCache) security groups only accept traffic from the Backend security group and have no outbound internet access.

- **Egress**: A NAT Gateway residing in a public subnet provides controlled outbound access for the Frontend and Backend tasks (required for external integrations like Auth0).

**Configuration**: [View Security Group Rules](./infra/security-groups.tf)

### Service & Data Design
- **Compute**: The Frontend and Backend are deployed as separate ECS Services within a single ECS Cluster. This allows for independent deployment cycles and auto-scaling policies for each service.

- **Stateful Services**:
  - **Aurora Serverless**: Provides the primary relational data store.

  - **Valkey (ElastiCache)**: Currently utilized for session management (Carts), with a plan to expand into general query caching.

**Configuration**:
  - [View ECS Resources](./infra/ecs-cluster.tf)

  - [View Database Resources](./infra/database.tf)

---

## Infrastructure as Code (IaC)
Pre-requisite resources in AWS are created by a CloudFormation template,[`bootstrap.yaml`](./bootstrap.yaml). Resources created are necessary secrets and configuration parameters stored in AWS SSM Parameter Store and Secrets Manager.
Application infrastructure is provisioned using OpenTofu, with all resources defined in the `infra/` directory. Configuration parameters and secrets created by the CloudFormation template are pulled via data blocks, to reduce the number of variables needed ot deploy the ifnrastructure.

### Remote State
State is managed remotely using an S3 backend, with encryption at rest enabled and state locking handled natively by S3. The state bucket is provisioned by [`bootstrap.yaml`](./bootstrap.yaml) prior to any OpenTofu operations.

**Configuration**: [View Backend Configuration](./infra/main.tf)

---

## CI/CD Pipeline
This repository was built as a monorepo, and thus makes extensive use of Turborepo in the CI/CD pipeline. The pipeline is designed to detect changes, ensuring that only modified services are built and deployed, saving significant time and compute resources.

  ![Pipeline](./docs//pipeline.png)

  ### Smart Workflow Orchestration (Path Filtering)
  The pipeline uses a `detect-changes` stage to analyze recently pushed commits. This stage determines if the api, web app, infrastructure, or database migration code require action.

  - **Matrix Strategy**: If both the `api` and `web` apps are changed, GitHub Actions launches parallel `containerize` and `deploy` jobs for each, significantly reducing the total runtime.

  - **Infrastructure Sync**: The `provision` job ensures the AWS environment matches the OpenTofu configuration before any application deployment occurs.

  ### Container Lifecycle & Optimization
  - **Turborepo Pruning**: To keep Docker images lean, the pipeline uses `turbo prune --docker`. This extracts only the relevant workspace packages and local dependencies required for the specific component being built. See [Turborepo docs](https://turborepo.dev/docs/reference/prune)

 - **Secure Authentication**: The pipeline uses AWS OIDC (OpenID Connect). This allows GitHub Actions to assume a specific IAM role via a short-lived token, eliminating the need for long-lived AWS Access Keys within the pipeline. See [Configuring OIDC in AWS](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)

  - **Tagging Strategy**: Images are currently tagged with both the Git SHA (for traceability) and latest (for ECS deployment).

  ### Database Migration Strategy
  Migrations are handled via a decoupled workflow to ensure data schema consistency before new application code goes live.

  - **Mechanism**: The container image for the `api` contains both the application code as well as the migration scripts to apply to the database. Any time that migrations change, the container image for `api` is rebuilt.

  - **Execution**: To run database migrations, a one-off ECS Task is spun up to execute the migration logic. The entrypoint of the `api` container is changed to run the migration scripts, and the container/task is automatically terminated upon completion. This ensures migrations run in an environment identical to the production API.

---

## Deployment & Usage
> This project is configured for a specific AWS environment and was not designed to run universally. However, if you wish to deploy it yourself, the following prerequisites are required.

### Prerequisites
- An AWS Account
- A DockerHub account with a [personal access token](https://docs.docker.com/security/access-tokens/#create-a-personal-access-token)
- An Auth0 account with a [Regular Web Application](https://auth0.com/docs/get-started/auth0-overview/create-applications/regular-web-apps) and [API](https://auth0.com/docs/get-started/apis) configured
- A Route 53 Hosted Zone (optional, for custom domain; replace the default variable name in `infra/dns.tf`)

### Bootstrap
All secrets, IAM roles, and state management infrastructure are provisioned via `bootstrap.yaml`. Deploy it first via the AWS CloudFormation console or CLI, providing your Auth0 and database values as parameters.
```bash
aws cloudformation deploy \
  --template-file bootstrap.yaml \
  --stack-name atelier-bootstrap \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Auth0ClientIdValue= \
    Auth0ClientSecretValue= \
    Auth0DomainValue= \
    Auth0AudienceValue=
```

Once deployed, retrieve the outputs:
```bash
aws cloudformation describe-stacks \
  --stack-name atelier-bootstrap \
  --query "Stacks[0].Outputs"
```

### GitHub Actions Configuration
Add the following to your repository's Actions secrets and variables:

| Name | Type | Source |
|------|------|--------|
| `CI_CD_ROLE` | Secret | `CICDRoleArn` bootstrap output |
| `DOCKERHUB_TOKEN` | Secret | DockerHub |
| `DOCKERHUB_USERNAME` | Variable | DockerHub |
| `TOFU_STATE_BUCKET` | Variable | `TerraformStateBucketName` bootstrap output |

### Auth0 Integration & Callback URLs
Since this application uses Auth0 for identity management, the Allowed Callback URLs in your Auth0 Application settings must match your deployment endpoint.

If using a Custom Domain: Set the callback to `https://atelier.yourdomain.com/api/auth/callback`.

If using the Raw Endpoint: Retrieve the `app_endpoint` from the OpenTofu output and set the callback to `http://[ALB-DNS-NAME]/api/auth/callback`.

> If you switch from the raw ALB endpoint to a custom domain later, you must update these values in the Auth0 Dashboard, or authentication requests will be rejected.

### Deploy
Push to `main` to trigger the pipeline. The pipeline will provision the infrastructure and deploy the application automatically.

### Destroy
To tear down the infrastructure, run the following locally:
```bash
cd infra
tofu destroy
```

Then delete the bootstrap stack:
```bash
aws cloudformation delete-stack --stack-name atelier-bootstrap
```

---

## Observability
Application logs are available via Amazon CloudWatch. ECS is configured to stream container logs automatically to the following log groups:

| Service | Log Group |
|---------|-----------|
| API | `/ecs/atelier-api` |
| Frontend | `/ecs/atelier-web` |

> Note: Log retention is set to 1 day. Frontend logs may be limited.

Full observability tooling (metrics, tracing, alerting) is planned as part of Case Study 4.

---

## Case Studies (Lab Roadmap)

- Case Study 1: High Availability & Multi-AZ Failover (Planned)

- Case Study 2: Redis Performance & Failover (Planned)

- Case Study 3: S3 & CloudFront Integration (Planned)

- Case Study 4: Security Hardening & Observability (Planned)