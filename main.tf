provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "vulnerable_bucket" {
  bucket = "test-public-vulnerable-bucket-12345"
}

resource "aws_s3_bucket_public_access_block" "bad_public_access" {
  bucket = aws_s3_bucket.vulnerable_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "public_acl" {
  bucket = aws_s3_bucket.vulnerable_bucket.id
  acl    = "public-read"
}

resource "aws_security_group" "open_sg" {
  name        = "open-security-group"
  description = "Allows all inbound and outbound traffic"

  ingress {
    description = "Open SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Open outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "bad_ec2" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"

  vpc_security_group_ids = [aws_security_group.open_sg.id]

  metadata_options {
    http_tokens = "optional" # IMDSv1 allowed
  }

  root_block_device {
    encrypted = false
  }
}

resource "aws_db_instance" "bad_rds" {
  identifier           = "bad-rds"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  username             = "admin"
  password             = "Password123!"
  skip_final_snapshot  = true
  publicly_accessible  = true
  storage_encrypted    = false
}
