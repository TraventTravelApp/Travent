variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
  default     = "c-o1"
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)."
  type        = string
  default     = "internal"
}

variable "aws_region" {
  description = "Primary AWS region for S3 and regional resources."
  type        = string
  default     = "us-east-1"
}

variable "basic_auth_username" {
  description = "HTTP Basic Auth username for internal Swagger UI access."
  type        = string
  sensitive   = true
}

variable "basic_auth_password" {
  description = "HTTP Basic Auth password for internal Swagger UI access."
  type        = string
  sensitive   = true
}

variable "allowed_ip_cidrs" {
  description = "Optional corporate/VPN CIDR blocks for S3 bucket policy (empty = CloudFront-only access)."
  type        = list(string)
  default     = []
}
