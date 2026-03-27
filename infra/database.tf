resource "aws_db_subnet_group" "db_cluster_subnet_group" {
  name       = "${var.resource_prefix}-db-subnet-group"
  subnet_ids = [for subnet in aws_subnet.db_subnets : subnet.id]

  tags = {
    "Name"         = "${var.resource_prefix}-db-subnet-group"
    "Project"      = var.project_name
    "ResourceType" = "Database"
  }
}

resource "aws_db_instance" "db_primary" {
  multi_az = true

  allocated_storage    = 20
  instance_class       = "db.t4g.medium"
  engine               = "postgresql"
  engine_version       = "17.1"
  db_name              = data.aws_ssm_parameter.database_name.value
  username             = data.aws_ssm_parameter.database_user.value
  password             = data.aws_secretsmanager_secret_version.database_password.secret_string
  db_subnet_group_name = aws_db_subnet_group.db_cluster_subnet_group.name
  skip_final_snapshot  = true

  tags = {
    "Name"         = "${var.resource_prefix}-db-cluster"
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