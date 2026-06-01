data "aws_caller_identity" "current" {}

locals {
  name_prefix = "${var.project_name}-${var.environment}-swagger"
  basic_auth_token = base64encode("${var.basic_auth_username}:${var.basic_auth_password}")
  tags = {
    Project     = var.project_name
    Environment = var.environment
    Task        = "A6-swagger-ui"
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket" "swagger_docs" {
  bucket = "${local.name_prefix}-docs"

  tags = local.tags
}

resource "aws_s3_bucket_public_access_block" "swagger_docs" {
  bucket = aws_s3_bucket.swagger_docs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "swagger_docs" {
  bucket = aws_s3_bucket.swagger_docs.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "swagger_docs" {
  bucket = aws_s3_bucket.swagger_docs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_cloudfront_origin_access_control" "swagger_docs" {
  name                              = "${local.name_prefix}-oac"
  description                       = "OAC for internal Swagger UI docs bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "archive_file" "basic_auth_lambda" {
  type        = "zip"
  output_path = "${path.module}/basic-auth.zip"

  source {
    content = templatefile("${path.module}/lambda-edge/basic-auth.js", {
      basic_auth_token = local.basic_auth_token
    })
    filename = "index.js"
  }
}

resource "aws_iam_role" "lambda_edge" {
  provider = aws.us_east_1
  name     = "${local.name_prefix}-edge-auth"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "edgelambda.amazonaws.com",
          ]
        }
      },
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "lambda_edge_basic" {
  provider   = aws.us_east_1
  role       = aws_iam_role.lambda_edge.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "basic_auth" {
  provider         = aws.us_east_1
  function_name    = "${local.name_prefix}-basic-auth"
  role             = aws_iam_role.lambda_edge.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.basic_auth_lambda.output_path
  source_code_hash = data.archive_file.basic_auth_lambda.output_base64sha256
  publish          = true
  timeout          = 5
  memory_size      = 128

  tags = local.tags
}

resource "aws_cloudfront_distribution" "swagger_docs" {
  enabled             = true
  comment             = "Internal Swagger UI for ${var.project_name}"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  http_version        = "http2and3"
  is_ipv6_enabled     = true

  origin {
    domain_name              = aws_s3_bucket.swagger_docs.bucket_regional_domain_name
    origin_id                = "s3-swagger-docs"
    origin_access_control_id = aws_cloudfront_origin_access_control.swagger_docs.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-swagger-docs"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    # Disable caching so auth is enforced on every request.
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = aws_lambda_function.basic_auth.qualified_arn
      include_body = false
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = local.tags
}

resource "aws_s3_bucket_policy" "swagger_docs" {
  bucket = aws_s3_bucket.swagger_docs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        {
          Sid       = "AllowCloudFrontServicePrincipal"
          Effect    = "Allow"
          Principal = { Service = "cloudfront.amazonaws.com" }
          Action    = "s3:GetObject"
          Resource  = "${aws_s3_bucket.swagger_docs.arn}/*"
          Condition = {
            StringEquals = {
              "AWS:SourceArn" = aws_cloudfront_distribution.swagger_docs.arn
            }
          }
        },
      ],
      length(var.allowed_ip_cidrs) > 0 ? [
        {
          Sid       = "AllowCorporateVpnRead"
          Effect    = "Allow"
          Principal = "*"
          Action    = "s3:GetObject"
          Resource  = "${aws_s3_bucket.swagger_docs.arn}/*"
          Condition = {
            IpAddress = {
              "aws:SourceIp" = var.allowed_ip_cidrs
            }
          }
        },
      ] : []
    )
  })
}

resource "aws_s3_object" "index_html" {
  bucket       = aws_s3_bucket.swagger_docs.id
  key          = "index.html"
  source       = "${path.module}/../../docs/index.html"
  content_type = "text/html"
  etag         = filemd5("${path.module}/../../docs/index.html")
}

resource "aws_s3_object" "openapi_yaml" {
  bucket       = aws_s3_bucket.swagger_docs.id
  key          = "openapi.yaml"
  source       = "${path.module}/../../docs/openapi.yaml"
  content_type = "application/yaml"
  etag         = filemd5("${path.module}/../../docs/openapi.yaml")
}
