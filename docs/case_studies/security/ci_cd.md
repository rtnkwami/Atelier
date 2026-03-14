# Case Study 1: GitHub Actions OIDC Least Privilege

## Introduction

Prior to doing this case study, I looked up setting up OIDC (or OpenID Connect) with GitHub Actions. Since I'm coming from a security background, it didn't really sit right with me to upload my Access Keys to a public repository (even if they were set as secrets).

According to the GitHub Actions [docs](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) there are alternatives to using AWS Access Keys directly in a repository. So I went with that approach.

This case study isn't about setting up OIDC. Rather, it's about tightening the permissions that my CI/CD pipeline's role has in my deployment environment. So let me walk you through what I'll be doing.

At the time of writing this, my OIDC role for this repo's pipeline is using admin access. here's a snippet of the role:

```yaml
CICDRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: "2012-10-17"
      Statement:
          - Effect: Allow
            Action: "sts:AssumeRoleWithWebIdentity"
            Principal:
              Federated: !GetAtt GitHubActionsOIDCProvider.Arn
            Condition:
              StringEquals: 
                "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                "token.actions.githubusercontent.com:repository": !Sub "${GitHubRepository}"
                "token.actions.githubusercontent.com:ref": "refs/heads/main"
              StringLike:
                "token.actions.githubusercontent.com:sub": !Sub "repo:${GitHubRepository}:*"
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/AdministratorAccess
```

You can find the role in [`bootstrap.yaml`](../../../bootstrap.yaml). And as you can see, we're using AdministratorAccess. Really, really bad for security, but I used it to verify that my pipeline and application were working, and so that I could practice how to determine the least permissions I needed to make this pipeline work. That's what this case study is for after all.

## Approach

Okay, let's talk about the approach we are going to be using. AWS provides us with some services that we can take advantage of:

1. **CloudTrail:** logs every API call that you make to AWS. Creation, destruction, updates, and much more. Since OpenTofu uses API calls to AWS to create the infrastructure defined within it, we can use CloudTrail to identify all of the API calls that our CI/CD pipeline needs.

2. **AWS IAM Policy Generator:** allows us to generate a policy based on CloudTrail activity.

So these are the services that we will be using for this case study. Let's begin.

## Walkthrough

### Step 1: Create a CloudTrail Trail to Track Pipeline Activity

The first thing we need to do is to create a trail in CloudTrail. IAM policy generator expects that we have a trail, so that it can simply extract information from the trail.

So let's do that in the console:

![Create Trail](./_images/create-trail.png)

![Finish Trail Creation](./_images/finish-trail-creation.png)

### Step 3: Generate API Events via CI/CD Pipeline

Now that we are done with creating the role, we need to generate some events for the trail to capture.
To do that, we can run the CI/CD pipeline and generate some events with the admin access that the pipeline has. This will allow the policy generator to see the exact permissions required.

![Generate Events with Pipeline](./_images/generate-events-with-pipeline.png)

![Events After Pipeline Run](./_images/events-after-pipeline-run.png)

Okay. So now that we have generated events using our pipeline it's time to move on to the next step.

### Step 4: Enable Policy Generation on the CI/CD IAM Role

AWS provides a feature within IAM Roles that enables you to create a permissions policy for an IAM Role based on the usage of the role logged within CloudTrail Events. So let's enable that:

![Enable Policy Generation](./_images/enable-policy-generation.png)

![Generate CI/CD Policy](./_images/generate-ci-cd-policy.png)

![Generate CI/CD Policy 2](./_images/generate-ci-cd-policy-2.png)

### Step 5: Review the Generated Policy

So our policy has now been generated:

![Policy Generation Complete](./_images/policy-generation-complete.png)

And now we have to review the policy. There are a lot of permissions that this role uses, so we won't include all of them here in a screenshot:

![Review Policy](./_images/review-policy.png)

![Successfully Generated](./_images/successfully-generated-policy.png)

As we can see, the policy generator did a lot of work. We were able to generate a policy instead of having to manually write out the permissions ourselves. Now, there are a few things I want to do to make managing these permissions easier, because there are a lot of them. I need to refine and segregate these policies. What I plan on doing is going for separating them into:

- Compute Policy
- Database Policy
- Networking Policies
- Security, Identity, & Compliance Policy

Well, that's the idea anyway. I'm not necessarily going to stick to the exact structure I just stated above, but at least you get the idea. Instead of keeping them in JSON, I'll add them to `bootstrap.yaml` so that we can reproduce these permissions whenever we need to.

### Step 6: Refine and Segregate the Generated Policy

For historical reasons, I'll keep the full generated policy within my repo, so that you can see where we started, and where we ended. You can access the policy [here](/CI_CD_Role_Policy.json).

Now, let's move on to segregating the policy. Rather than reproducing the full policy here in CloudFormation , youc can find the complete implementation in [`bootstrap.yaml`](/bootstrap.yaml). Let's walk through the decisions made during the segregation process.

The first thing I want to establish is that I'm not restructuring what AWS generated. The policy generator already did the hard work of scoping actions to the correct resource types. My job here is purely organization — grouping statements into logical managed policies that are easier to read, audit, and maintain.

#### Network Policy

The network policy is the largest of the bunch, which makes sense given that networking is the foundation everything else sits on. I split the statements into read-only discovery actions and mutating management actions, further broken down by resource type — VPCs, subnets, route tables, security groups, internet gateways, NAT gateways, network interfaces, and elastic IPs. You'll also notice that some actions like `ec2:CreateRouteTable` and `ec2:CreateSubnet` appear across multiple resource statements. This is intentional and reflects how AWS itself scoped them in the generated policy.

#### Compute Policy

The compute policy covers ECS, CloudWatch, Auto Scaling, and CloudWatch Logs. The split here follows the same read vs. write pattern, discovery actions against `Resource: "*"` and management actions scoped to specific resource ARNs.

#### Load Balancer Policy

The load balancer policy covers all `elasticloadbalancing:*` actions. Over here I placed `CreateListener` and `CreateLoadBalancer` both under `Resource: "*"` in the generated policy. Rather than bundling them with the discovery actions, I gave them their own LoadBalancerCreation statement to make it clear these are mutating actions, not reads.

#### Security And Identity Policy

This policy covers ACM, IAM, KMS, Secrets Manager, and SSM. One extra tightening step was applied here: since the secrets and parameters used by this application are all defined in bootstrap.yaml under the `/atelier/` path, I was able to scope the `SecretsManagement` and `SsmParameterAccess` statements to `arn:...:secret:/atelier/*` and `arn:...:parameter/atelier/*` respectively, rather than leaving them open to all secrets and parameters in the account.

#### DNS And Storage Policy

The final policy covers Route 53, S3, and STS. Route 53 ARNs don't include partition, region, or account segments, so these statements use plain `arn:aws:route53:::` rather than the `!Sub` with CloudFormation pseudo-parameters used elsewhere.