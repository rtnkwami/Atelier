# ============================================================================
#  In this file:
#     - Database Security Group
#     - Database Cluster
# ============================================================================

resource "aws_security_group" "database_cluster_security_group" {
  name        = "${var.resource_prefix}-database-cluster-sg"
  description = "Allow only traffic from the backend to the database cluster"
  vpc_id      = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "database_ingress_rule" {
  security_group_id = aws_security_group.database_cluster_security_group.id

  description                  = "Allow inbound connections from API to database cluster"
  referenced_security_group_id = aws_security_group.api_security_group.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}

resource "aws_db_subnet_group" "db_cluster_subnet_group" {
  name       = "${var.resource_prefix}-db-subnet-group"
  subnet_ids = [for subnet in aws_subnet.db_subnets : subnet.id]

  tags = {
    "Name"         = "${var.resource_prefix}-db-subnet-group"
    "Project"      = var.project_name
    "ResourceType" = "Database"
  }
}

resource "aws_rds_cluster" "db_cluster" {
  cluster_identifier     = "${var.resource_prefix}-db-cluster"
  engine                 = "aurora-postgresql"
  engine_version         = "17.7"
  engine_mode            = "provisioned"
  database_name          = var.database_name
  master_username        = var.database_user
  master_password        = var.database_password
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