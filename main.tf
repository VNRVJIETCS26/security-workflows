provider "aws" {
  region = "us-east-1"
}

resource "aws_kms_key" "main" {
  description             = "CMK for S3, EC2 and RDS encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_s3_bucket" "secure_bucket" {
  bucket = "test-secure-private-bucket-12345"
}

resource "aws_s3_bucket_public_access_block" "secure_public_access" {
  bucket = aws_s3_bucket.secure_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "secure_ownership" {
  bucket = aws_s3_bucket.secure_bucket.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "secure_encryption" {
  bucket = aws_s3_bucket.secure_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.main.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_versioning" "secure_versioning" {
  bucket = aws_s3_bucket.secure_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_security_group" "restricted_sg" {
  name        = "restricted-security-group"
  description = "Restricted inbound and outbound traffic"

  ingress {
    description = "SSH only from trusted dummy IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.10/32"]
  }

  egress {
    description = "HTTPS only to trusted dummy IP"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.20/32"]
  }
}

resource "aws_instance" "secure_ec2" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"

  vpc_security_group_ids = [aws_security_group.restricted_sg.id]

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    encrypted  = true
    kms_key_id = aws_kms_key.main.arn
  }
}

resource "aws_db_instance" "secure_rds" {
  identifier     = "secure-rds"
  engine         = "postgres"
  instance_class = "db.t3.micro"

  allocated_storage = 20
  username          = "admin"
  password          = var.rds_password

  publicly_accessible       = false
  storage_encrypted         = true
  kms_key_id                = aws_kms_key.main.arn
  iam_database_authentication_enabled = true

  backup_retention_period = 7
  deletion_protection     = true
  skip_final_snapshot     = false
  final_snapshot_identifier = "secure-rds-final-snapshot"
}

variable "rds_password" {
  description = "RDS admin password. Pass using TF_VAR_rds_password or a secrets manager."
  type        = string
  sensitive   = true
}
