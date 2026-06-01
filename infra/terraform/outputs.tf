output "swagger_ui_url" {
  description = "CloudFront URL for internal Swagger UI (requires HTTP Basic Auth)."
  value       = "https://${aws_cloudfront_distribution.swagger_docs.domain_name}"
}

output "s3_bucket_name" {
  description = "S3 bucket hosting openapi.yaml and Swagger UI static files."
  value       = aws_s3_bucket.swagger_docs.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation after doc updates)."
  value       = aws_cloudfront_distribution.swagger_docs.id
}

output "openapi_yaml_url" {
  description = "Direct URL to openapi.yaml (same origin as Swagger UI)."
  value       = "https://${aws_cloudfront_distribution.swagger_docs.domain_name}/openapi.yaml"
}
