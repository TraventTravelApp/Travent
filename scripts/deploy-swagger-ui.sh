#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="${ROOT_DIR}/docs"
TF_DIR="${ROOT_DIR}/infra/terraform"

usage() {
  cat <<'EOF'
Deploy internal Swagger UI (A6) to S3 + CloudFront.

Usage:
  ./scripts/deploy-swagger-ui.sh init      # terraform init
  ./scripts/deploy-swagger-ui.sh apply     # full infra + doc upload (terraform apply)
  ./scripts/deploy-swagger-ui.sh sync      # upload docs only + invalidate CloudFront cache
  ./scripts/deploy-swagger-ui.sh preview   # local preview on http://localhost:8080

Prerequisites:
  - AWS CLI configured (aws sts get-caller-identity)
  - Terraform >= 1.5
  - Copy infra/terraform/terraform.tfvars.example -> terraform.tfvars and set credentials

Access control:
  - Default: HTTP Basic Auth via CloudFront Lambda@Edge
  - Optional VPN: set allowed_ip_cidrs in terraform.tfvars (confirm approach with Emma)
EOF
}

require_aws() {
  aws sts get-caller-identity >/dev/null
}

# Terraform does not read `aws login` sessions directly; export temp creds first.
load_aws_creds_for_terraform() {
  if ! aws configure export-credentials --format env >/dev/null 2>&1; then
    echo "Could not export AWS credentials. Run 'aws login' and try again."
    exit 1
  fi
  # shellcheck disable=SC1090
  eval "$(aws configure export-credentials --format env)"
}

require_tf_outputs() {
  BUCKET="$(terraform -chdir="${TF_DIR}" output -raw s3_bucket_name)"
  DIST_ID="$(terraform -chdir="${TF_DIR}" output -raw cloudfront_distribution_id)"
  SWAGGER_URL="$(terraform -chdir="${TF_DIR}" output -raw swagger_ui_url)"
}

cmd="${1:-}"

case "${cmd}" in
  init)
    terraform -chdir="${TF_DIR}" init
    ;;
  apply)
    require_aws
    load_aws_creds_for_terraform
    if [[ ! -f "${TF_DIR}/terraform.tfvars" ]]; then
      echo "Missing ${TF_DIR}/terraform.tfvars — copy from terraform.tfvars.example first."
      exit 1
    fi
    terraform -chdir="${TF_DIR}" init
    terraform -chdir="${TF_DIR}" apply
    require_tf_outputs
    echo ""
    echo "Swagger UI: ${SWAGGER_URL}"
    echo "Use the basic auth credentials from terraform.tfvars."
    ;;
  sync)
    require_aws
    require_tf_outputs
    aws s3 cp "${DOCS_DIR}/index.html" "s3://${BUCKET}/index.html" --content-type "text/html"
    aws s3 cp "${DOCS_DIR}/openapi.yaml" "s3://${BUCKET}/openapi.yaml" --content-type "application/yaml"
    aws cloudfront create-invalidation --distribution-id "${DIST_ID}" --paths "/*" >/dev/null
    echo "Docs synced to s3://${BUCKET} and CloudFront cache invalidated."
    echo "Swagger UI: ${SWAGGER_URL}"
    ;;
  preview)
    echo "Swagger UI preview: http://localhost:8080"
    python3 -m http.server 8080 --directory "${DOCS_DIR}"
    ;;
  -h|--help|help|"")
    usage
    ;;
  *)
    echo "Unknown command: ${cmd}"
    usage
    exit 1
    ;;
esac
