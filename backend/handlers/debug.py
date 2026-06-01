"""Debug endpoints for verifying observability wiring.

These endpoints exist only to confirm Sentry (and any future
observability tooling) is reporting from production Lambdas.
Safe to remove once verification is complete.
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.error_handler import handle_errors


@handle_errors
def trigger_sentry(event, context):
    """Deliberately raise an exception so Sentry can be verified.

    Hit `GET /debug/sentry` and confirm the error appears in the configured
    Sentry project. Returns HTTP 500 to the caller; the error is captured
    by the handle_errors decorator before the response is built.
    """
    raise RuntimeError("Chronicle Sentry verification — this error is expected.")
