resource "aws_vpc" "vpc" {
  cidr_block                       = var.vpc_cidr_block
  assign_generated_ipv6_cidr_block = true

  tags = {
    "Name"         = "${var.resource_prefix}-vpc"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

resource "aws_internet_gateway" "vpc_igw" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    "Name"         = "${var.resource_prefix}-vpc-igw"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

locals {
  availability_zones = toset(var.availability_zones)
}

# ========================================
# PUBLIC SUBNETS
# ========================================
resource "aws_subnet" "web_subnets" {
  for_each = local.availability_zones

  vpc_id                          = aws_vpc.vpc.id
  availability_zone               = each.key
  cidr_block                      = cidrsubnet(aws_vpc.vpc.cidr_block, 4, index(var.availability_zones, each.key))
  ipv6_cidr_block                 = cidrsubnet(aws_vpc.vpc.ipv6_cidr_block, 4, index(var.availability_zones, each.key))
  assign_ipv6_address_on_creation = true
  map_public_ip_on_launch         = true

  tags = {
    "Name"         = "${var.resource_prefix}-sn-web-${each.key}"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

# Make web subnet public
resource "aws_route_table" "web_route_table" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.vpc_igw.id
  }

  route {
    ipv6_cidr_block = "::/0"
    gateway_id      = aws_internet_gateway.vpc_igw.id
  }

  tags = {
    "Name"         = "${var.resource_prefix}-web-route-table"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

resource "aws_route_table_association" "web_subnet_rt_association" {
  for_each = local.availability_zones

  subnet_id      = aws_subnet.web_subnets[each.key].id
  route_table_id = aws_route_table.web_route_table.id
}

# ========================================
# PRIVATE SUBNETS
# ========================================
resource "aws_subnet" "app_subnets" {
  for_each = local.availability_zones

  vpc_id                          = aws_vpc.vpc.id
  availability_zone               = each.key
  cidr_block                      = cidrsubnet(aws_vpc.vpc.cidr_block, 4, index(var.availability_zones, each.key) + 3)
  ipv6_cidr_block                 = cidrsubnet(aws_vpc.vpc.ipv6_cidr_block, 4, index(var.availability_zones, each.key) + 3)
  assign_ipv6_address_on_creation = true

  tags = {
    "Name"         = "${var.resource_prefix}-sn-app-${each.key}"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

resource "aws_subnet" "db_subnets" {
  for_each = local.availability_zones

  vpc_id                          = aws_vpc.vpc.id
  availability_zone               = each.key
  cidr_block                      = cidrsubnet(aws_vpc.vpc.cidr_block, 4, index(var.availability_zones, each.key) + 6)
  ipv6_cidr_block                 = cidrsubnet(aws_vpc.vpc.ipv6_cidr_block, 4, index(var.availability_zones, each.key) + 6)
  assign_ipv6_address_on_creation = true

  tags = {
    "Name"         = "${var.resource_prefix}-sn-db-${each.key}"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

resource "aws_subnet" "reserved_subnets" {
  for_each = local.availability_zones

  vpc_id                          = aws_vpc.vpc.id
  availability_zone               = each.key
  cidr_block                      = cidrsubnet(aws_vpc.vpc.cidr_block, 4, index(var.availability_zones, each.key) + 9)
  ipv6_cidr_block                 = cidrsubnet(aws_vpc.vpc.ipv6_cidr_block, 4, index(var.availability_zones, each.key) + 9)
  assign_ipv6_address_on_creation = true

  tags = {
    "Name"         = "${var.resource_prefix}-sn-reserved-${each.key}"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

# Very expensive resource. Beware
resource "aws_eip" "nat_gateway_eip" {
  domain = "vpc"

  tags = {
    "Name"         = "${var.resource_prefix}-nat-gw-eip"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

# Create single NAT gateway in one AZ
resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.nat_gateway_eip.id
  subnet_id     = aws_subnet.web_subnets[tolist(local.availability_zones)[0]].id

  tags = {
    Name         = "${var.resource_prefix}-nat-gw"
    Project      = var.project_name
    ResourceType = "Networking"
  }
}

# Create single private route table
resource "aws_route_table" "private_subnet_route_table" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway.id
  }

  tags = {
    "Name"         = "${var.resource_prefix}-private-subnet-route-table"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

# Associate all app subnets to the single route table
resource "aws_route_table_association" "app_subnet_rt_association" {
  for_each = local.availability_zones

  subnet_id      = aws_subnet.app_subnets[each.key].id
  route_table_id = aws_route_table.private_subnet_route_table.id
}

# Associate all reserved subnets to the single route table
resource "aws_route_table_association" "reserved_subnet_rt_association" {
  for_each = local.availability_zones

  subnet_id      = aws_subnet.reserved_subnets[each.key].id
  route_table_id = aws_route_table.private_subnet_route_table.id
}


# --------------- API Security Group Rules ---------------------- #

resource "aws_security_group" "api_security_group" {
  name = "${var.resource_prefix}-api-sg"
  description = "Allow all traffic to and from api"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "api_ingress" {
  security_group_id = aws_security_group.api_security_group.id
  
  description = "Allow ingress only from api load balancer to api"
  referenced_security_group_id = aws_security_group.api_lb_security_group.id
  ip_protocol = "tcp"
  from_port = 5000
  to_port = 5000
}

# Allow all egress traffic on API tasks because API needs to connect to both Docker Hub (which has no public IP ranges for whitelisting)
# and Auth0
resource "aws_vpc_security_group_egress_rule" "allow_all_tcp_egress_ipv4" {
  security_group_id = aws_security_group.api_security_group.id
  
  ip_protocol = "-1"
  cidr_ipv4 = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_tcp_egress_ipv6" {
  security_group_id = aws_security_group.api_security_group.id
  
  ip_protocol = "-1"
  cidr_ipv6 = "::/0"
}

# --------------- API Load Balancer Security Group Rules ---------------------- #

resource "aws_security_group" "api_lb_security_group" {
  name = "${var.resource_prefix}-api-lb-sg"
  description = "Allow all traffic to and from api load balancer"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "api_lb_ingress_ipv4_rule" {
  security_group_id = aws_security_group.api_lb_security_group.id

  description = "Allow https traffic from the internet"
  ip_protocol = "-1"
  # from_port = 443
  # to_port = 443
  cidr_ipv4 = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "api_lb_ingress_ipv6_rule" {
  security_group_id = aws_security_group.api_lb_security_group.id

  description = "Allow https traffic from the internet"
  ip_protocol = "-1"
  # from_port = 443
  # to_port = 443
  cidr_ipv6 = "::/0"
}

resource "aws_vpc_security_group_egress_rule" "api_lb_egress_rule" {
  security_group_id = aws_security_group.api_lb_security_group.id
  
  referenced_security_group_id = aws_security_group.api_security_group.id
  ip_protocol = "tcp"
  from_port = 5000
  to_port = 5000
}

# --------------- Database Security Group Rules ---------------------- #

resource "aws_security_group" "database_cluster_security_group" {
  name = "${var.resource_prefix}-database-cluster-sg"
  description = "Allow only traffic from the api to the database cluster"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "database_ingress_rule" {
  security_group_id = aws_security_group.database_cluster_security_group.id
  
  description = "Allow inbound connections from API to database cluster"
  referenced_security_group_id = aws_security_group.api_security_group.id
  ip_protocol = "tcp"
  from_port = 5432
  to_port = 5432
}