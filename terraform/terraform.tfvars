# Terraform values for production deployment

aws_region              = "ap-southeast-1"
environment             = "production"
project                 = "concert-ticket"

vpc_cidr                = "10.0.0.0/16"
public_subnet_cidrs     = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs    = ["10.0.3.0/24", "10.0.4.0/24"]

# Database  
db_instance_class       = "db.t3.small"
db_allocated_storage    = 50
db_name                 = "concert_ticket_system"
db_username             = "postgres"

# Cache
cache_node_type         = "cache.t3.small"
cache_num_nodes         = 2

# High Availability
multi_az                = true
