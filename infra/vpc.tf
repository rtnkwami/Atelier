resource "aws_vpc" "vpc" {
  cidr_block                       = var.vpc_cidr_range
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

resource "aws_subnet" "web_subnets" {
  for_each = local.availability_zones

  vpc_id                          = aws_vpc.vpc.id
  availability_zone               = each.key
  cidr_block                      = cidrsubnet(aws_vpc.vpc.cidr_block, 4, index(tolist(local.availability_zones), each.key))
  ipv6_cidr_block                 = cidrsubnet(aws_vpc.vpc.ipv6_cidr_block, 4, index(tolist(local.availability_zones), each.key))
  assign_ipv6_address_on_creation = true
  map_public_ip_on_launch         = true

  tags = {
    "Name"         = "${var.resource_prefix}-sn-web-${each.key}"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

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

resource "aws_subnet" "app_subnets" {
  for_each = local.availability_zones

  vpc_id                          = aws_vpc.vpc.id
  availability_zone               = each.key
  cidr_block                      = cidrsubnet(aws_vpc.vpc.cidr_block, 4, index(tolist(local.availability_zones), each.key) + 3)
  ipv6_cidr_block                 = cidrsubnet(aws_vpc.vpc.ipv6_cidr_block, 4, index(tolist(local.availability_zones), each.key) + 3)
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
  cidr_block                      = cidrsubnet(aws_vpc.vpc.cidr_block, 4, index(tolist(local.availability_zones), each.key) + 6)
  ipv6_cidr_block                 = cidrsubnet(aws_vpc.vpc.ipv6_cidr_block, 4, index(tolist(local.availability_zones), each.key) + 6)
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
  cidr_block                      = cidrsubnet(aws_vpc.vpc.cidr_block, 4, index(tolist(local.availability_zones), each.key) + 9)
  ipv6_cidr_block                 = cidrsubnet(aws_vpc.vpc.ipv6_cidr_block, 4, index(tolist(local.availability_zones), each.key) + 9)
  assign_ipv6_address_on_creation = true

  tags = {
    "Name"         = "${var.resource_prefix}-sn-reserved-${each.key}"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

resource "aws_eip" "nat_gateway_eip" {
  domain = "vpc"

  tags = {
    "Name"         = "${var.resource_prefix}-nat-gw-eip"
    "Project"      = var.project_name
    "ResourceType" = "Networking"
  }
}

# Create single NAT gateway in one AZ. Because NAT GWs are expensive and this is a "small" project, only 1 will be used.
resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.nat_gateway_eip.id
  subnet_id     = aws_subnet.web_subnets[tolist(local.availability_zones)[0]].id

  tags = {
    Name         = "${var.resource_prefix}-nat-gw"
    Project      = var.project_name
    ResourceType = "Networking"
  }
}

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

resource "aws_route_table_association" "app_subnet_rt_association" {
  for_each = local.availability_zones

  subnet_id      = aws_subnet.app_subnets[each.key].id
  route_table_id = aws_route_table.private_subnet_route_table.id
}
