"""Input validation utilities"""
import base64
import mimetypes
from typing import Optional


# File size limits (in bytes)
MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024  # 5MB
MAX_TRIP_PHOTO_SIZE = 10 * 1024 * 1024  # 10MB
MAX_POI_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_PDF_SIZE = 20 * 1024 * 1024  # 20MB

# Allowed MIME types
ALLOWED_IMAGE_TYPES = {
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
}

ALLOWED_PDF_TYPES = {
    'application/pdf'
}


class ValidationError(Exception):
    """Custom exception for validation errors"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def validate_file_upload(
    file_data: str,
    file_name: str,
    content_type: str,
    max_size: int,
    allowed_types: set
) -> bytes:
    """
    Validate file upload and return decoded file content.

    Args:
        file_data: Base64 encoded file data
        file_name: Original file name
        content_type: MIME type
        max_size: Maximum file size in bytes
        allowed_types: Set of allowed MIME types

    Returns:
        Decoded file content as bytes

    Raises:
        ValidationError: If validation fails
    """
    # Validate content type
    if content_type not in allowed_types:
        raise ValidationError(
            f"Invalid file type: {content_type}. Allowed types: {', '.join(allowed_types)}"
        )

    # Validate file extension matches content type
    file_ext = file_name.lower().split('.')[-1] if '.' in file_name else ''
    expected_type = mimetypes.guess_type(file_name)[0]

    if expected_type and expected_type != content_type:
        raise ValidationError(
            f"File extension '{file_ext}' does not match content type '{content_type}'"
        )

    # Decode base64 data
    try:
        file_content = base64.b64decode(file_data)
    except Exception as e:
        raise ValidationError(f"Invalid base64 encoding: {str(e)}")

    # Validate file size
    file_size = len(file_content)
    if file_size > max_size:
        max_size_mb = max_size / (1024 * 1024)
        actual_size_mb = file_size / (1024 * 1024)
        raise ValidationError(
            f"File too large: {actual_size_mb:.2f}MB. Maximum allowed: {max_size_mb}MB",
            status_code=413
        )

    if file_size == 0:
        raise ValidationError("File is empty")

    return file_content


def validate_profile_photo(file_data: str, file_name: str, content_type: str) -> bytes:
    """Validate profile photo upload"""
    return validate_file_upload(
        file_data,
        file_name,
        content_type,
        MAX_PROFILE_PHOTO_SIZE,
        ALLOWED_IMAGE_TYPES
    )


def validate_trip_photo(file_data: str, file_name: str, content_type: str) -> bytes:
    """Validate trip photo upload"""
    return validate_file_upload(
        file_data,
        file_name,
        content_type,
        MAX_TRIP_PHOTO_SIZE,
        ALLOWED_IMAGE_TYPES
    )


def validate_poi_image(file_data: str, file_name: str, content_type: str) -> bytes:
    """Validate POI image upload"""
    return validate_file_upload(
        file_data,
        file_name,
        content_type,
        MAX_POI_IMAGE_SIZE,
        ALLOWED_IMAGE_TYPES
    )


def validate_pdf(file_data: str, file_name: str, content_type: str) -> bytes:
    """Validate PDF upload"""
    return validate_file_upload(
        file_data,
        file_name,
        content_type,
        MAX_PDF_SIZE,
        ALLOWED_PDF_TYPES
    )


def sanitize_string(value: str, max_length: int = 1000, field_name: str = "Field") -> str:
    """
    Sanitize string input.

    Args:
        value: String to sanitize
        max_length: Maximum allowed length
        field_name: Name of field for error messages

    Returns:
        Sanitized string

    Raises:
        ValidationError: If validation fails
    """
    if not isinstance(value, str):
        raise ValidationError(f"{field_name} must be a string")

    # Strip whitespace
    value = value.strip()

    # Check length
    if len(value) == 0:
        raise ValidationError(f"{field_name} cannot be empty")

    if len(value) > max_length:
        raise ValidationError(
            f"{field_name} too long: {len(value)} characters. Maximum: {max_length}"
        )

    return value


def validate_number(
    value,
    min_value: Optional[float] = None,
    max_value: Optional[float] = None,
    field_name: str = "Value"
) -> float:
    """
    Validate numeric input.

    Args:
        value: Value to validate
        min_value: Minimum allowed value
        max_value: Maximum allowed value
        field_name: Name of field for error messages

    Returns:
        Validated number

    Raises:
        ValidationError: If validation fails
    """
    try:
        num = float(value)
    except (ValueError, TypeError):
        raise ValidationError(f"{field_name} must be a number")

    if min_value is not None and num < min_value:
        raise ValidationError(f"{field_name} must be at least {min_value}")

    if max_value is not None and num > max_value:
        raise ValidationError(f"{field_name} must be at most {max_value}")

    return num


def validate_email(email: str) -> str:
    """
    Validate email format.

    Args:
        email: Email address to validate

    Returns:
        Validated email (lowercased)

    Raises:
        ValidationError: If email is invalid
    """
    email = email.strip().lower()

    if not email:
        raise ValidationError("Email is required")

    if '@' not in email or '.' not in email:
        raise ValidationError("Invalid email format")

    if len(email) > 254:  # RFC 5321
        raise ValidationError("Email too long")

    return email
