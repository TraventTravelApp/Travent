"""Sentry SDK initialization for AWS Lambda.

Reads SENTRY_DSN from the environment and configures the SDK with the
AWS Lambda integration. If SENTRY_DSN is unset or empty, init is a
no-op so local development and unconfigured stages continue to work.

Importing this module triggers init() once per Lambda container
(executes at cold start).
"""
import os

import sentry_sdk
from sentry_sdk.integrations.aws_lambda import AwsLambdaIntegration


_initialized = False


def init_sentry() -> bool:
    """Initialize Sentry once. Returns True if enabled, False if no DSN."""
    global _initialized
    if _initialized:
        return True

    dsn = os.getenv("SENTRY_DSN", "").strip()
    if not dsn:
        return False

    sentry_sdk.init(
        dsn=dsn,
        integrations=[AwsLambdaIntegration(timeout_warning=True)],
        environment=os.getenv("STAGE", "dev"),
        release=os.getenv("SENTRY_RELEASE") or None,
        traces_sample_rate=0.0,
        send_default_pii=False,
    )
    _initialized = True
    return True


init_sentry()
