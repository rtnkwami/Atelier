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
- [Infrastructure as Code (IaC)](#infrastructure-as-code-iac)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment \& Usage](#deployment--usage)
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
(Details regarding VPC design, Subnet strategy, Internal vs. External ALBs, and Security Group logic here.)

## Infrastructure as Code (IaC)
(Details regarding the flattened OpenTofu structure and state management here.)

## CI/CD Pipeline
(Details regarding GitHub Actions, DockerHub integration, OIDC, and automated deployment steps here.)

## Deployment & Usage
(Prerequisites, environment variables/secrets, and the commands required to deploy or destroy the stack here.)

## Observability
(How to verify the deployment via endpoints and where to find logs/metrics here.)

## Case Studies (Lab Roadmap)

- Case Study 1: High Availability & Multi-AZ Failover (Planned)

- Case Study 2: Redis Performance & Failover (Planned)

- Case Study 3: S3 & CloudFront Integration (Planned)

- Case Study 4: Security Hardening & Observability (Planned)