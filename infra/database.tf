resource "aws_db_subnet_group" "db_cluster_subnet_group" {
  name       = "${var.resource_prefix}-db-subnet-group"
  subnet_ids = [for subnet in aws_subnet.db_subnets : subnet.id]

  tags = {
    "Name"         = "${var.resource_prefix}-db-subnet-group"
    "Project"      = var.project_name
    "ResourceType" = "Database"
  }
}
# yet another test
resource "aws_rds_cluster" "db_cluster" {
  cluster_identifier     = "${var.resource_prefix}-db-cluster"
  engine                 = "aurora-postgresql"
  engine_version         = "17.7"
  engine_mode            = "provisioned"
  database_name          = data.aws_ssm_parameter.database_name.value
  master_username        = data.aws_ssm_parameter.database_user.value
  master_password        = data.aws_secretsmanager_secret_version.database_password.secret_string
  db_subnet_group_name   = aws_db_subnet_group.db_cluster_subnet_group.name
  vpc_security_group_ids = [aws_security_group.database_cluster_security_group.id]
  skip_final_snapshot    = true


  serverlessv2_scaling_configuration {
    max_capacity             = 1.0
    min_capacity             = 0.0
    seconds_until_auto_pause = 600
  }

  tags = {
    "Name"         = "${var.resource_prefix}-db-cluster"
    "Project"      = var.project_name
    "ResourceType" = "Database"
  }
}

resource "aws_rds_cluster_instance" "db_cluster_instance" {
  cluster_identifier = aws_rds_cluster.db_cluster.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.db_cluster.engine
  engine_version     = aws_rds_cluster.db_cluster.engine_version

  tags = {
    "Name"         = "${var.resource_prefix}-db-cluster instance"
    "Project"      = var.project_name
    "ResourceType" = "Database"
  }
}

resource "aws_elasticache_subnet_group" "valkey_cluster_subnet_group" {
  name       = "${var.resource_prefix}-cache-subnet-group"
  subnet_ids = [for subnet in aws_subnet.db_subnets : subnet.id]

  tags = {
    "Name"         = "${var.resource_prefix}-cache-subnet-group"
    "Project"      = var.project_name
    "ResourceType" = "Cache"
  }
}

resource "aws_elasticache_replication_group" "valkey_cluster" {
  replication_group_id = "${var.resource_prefix}-cache-cluster"
  engine               = "valkey"
  node_type            = "cache.t4g.small"
  description          = "Cache cluster for Atelier"
  num_cache_clusters   = 1
  subnet_group_name    = aws_elasticache_subnet_group.valkey_cluster_subnet_group.name
  security_group_ids   = [aws_security_group.valkey_cache_security_group.id]
  # multi_az_enabled = true
  # automatic_failover_enabled = true

  tags = {
    "Name"         = "${var.resource_prefix}-cache-cluster"
    "Project"      = var.project_name
    "ResourceType" = "Cache"
  }
}