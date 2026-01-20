

resource "aws_iam_openid_connect_provider" "github_actions_provider" {
  url = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

data "aws_iam_policy_document" "ci_cd_role_trust_policy" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github_actions_provider.arn]
    }

    condition {
      test = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values = ["sts.amazonaws.com"]
    }

    condition {
      test = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = ["repo:${var.github_repo}:*"]
    }
  }
}

resource "aws_iam_role" "ci_cd_role" {
  name = "CICDRole"
  assume_role_policy = data.aws_iam_policy_document.ci_cd_role_trust_policy.json
}


data "aws_caller_identity" "current" {}

# Permissions needed for CI/CD role to deploy infrastructure
resource "aws_iam_policy" "ci_cd_policy" {
  name = "CICDDeploymentPolicy"
  description = "Policy for CI/CD pipeline to deploy infrastructure"

  policy = templatefile("${path.module}/ci-cd-policy.json", {
    Account = data.aws_caller_identity.current.account_id
  })
}

resource "aws_iam_role_policy_attachment" "atelier_ci_cd_role_permissions" {
  role = aws_iam_role.ci_cd_role.name
  policy_arn = aws_iam_policy.ci_cd_policy.arn
}
