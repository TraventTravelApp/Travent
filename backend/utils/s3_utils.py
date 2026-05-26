import boto3
import uuid
import os
from datetime import datetime
from typing import Optional

# S3 client
s3_client = boto3.client('s3', region_name='us-east-1')

# S3 bucket name (from environment variable)
BUCKET_NAME = os.getenv('S3_BUCKET_NAME', 'travel-assistant-uploads')

# Allowed file types
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
ALLOWED_PDF_TYPES = ['application/pdf']

def upload_file(file_content: bytes, file_name: str, content_type: str, folder: str = 'uploads') -> Optional[str]:
    """
    Upload file to S3
    
    Args:
        file_content: File content as bytes
        file_name: Original file name
        content_type: MIME type (e.g., 'image/jpeg')
        folder: S3 folder path (e.g., 'profile-photos', 'trip-photos')
    
    Returns:
        S3 URL of uploaded file or None if failed
    """
    
    try:
        # Generate unique file name
        file_extension = file_name.split('.')[-1] if '.' in file_name else 'jpg'
        unique_name = f"{uuid.uuid4()}.{file_extension}"
        s3_key = f"{folder}/{unique_name}"
        
        # Upload to S3
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType=content_type,
            Metadata={
                'original_name': file_name,
                'uploaded_at': datetime.utcnow().isoformat()
            }
        )
        
        # Return S3 URL
        s3_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
        return s3_url
        
    except Exception as e:
        print(f"Error uploading to S3: {e}")
        return None

def upload_profile_photo(file_content: bytes, file_name: str, content_type: str, user_id: str) -> Optional[str]:
    """Upload user profile photo"""
    
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}")
    
    return upload_file(file_content, file_name, content_type, f'profile-photos/{user_id}')

def upload_trip_photo(file_content: bytes, file_name: str, content_type: str, trip_id: str) -> Optional[str]:
    """Upload trip photo"""
    
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}")
    
    return upload_file(file_content, file_name, content_type, f'trip-photos/{trip_id}')

def upload_poi_image(file_content: bytes, file_name: str, content_type: str, poi_id: str) -> Optional[str]:
    """Upload POI image"""
    
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}")
    
    return upload_file(file_content, file_name, content_type, f'poi-images/{poi_id}')

def upload_itinerary_pdf(file_content: bytes, file_name: str, trip_id: str) -> Optional[str]:
    """Upload generated itinerary PDF"""
    
    return upload_file(file_content, file_name, 'application/pdf', f'itineraries/{trip_id}')

def delete_file(s3_url: str) -> bool:
    """
    Delete file from S3
    
    Args:
        s3_url: Full S3 URL of the file
    
    Returns:
        True if deleted successfully, False otherwise
    """
    
    try:
        # Extract S3 key from URL
        s3_key = s3_url.split(f"{BUCKET_NAME}.s3.amazonaws.com/")[1]
        
        s3_client.delete_object(
            Bucket=BUCKET_NAME,
            Key=s3_key
        )
        
        return True
        
    except Exception as e:
        print(f"Error deleting from S3: {e}")
        return False

def generate_presigned_url(s3_key: str, expiration: int = 3600) -> Optional[str]:
    """
    Generate presigned URL for temporary access
    
    Args:
        s3_key: S3 object key
        expiration: URL expiration time in seconds (default 1 hour)
    
    Returns:
        Presigned URL or None if failed
    """
    
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': s3_key
            },
            ExpiresIn=expiration
        )
        
        return url
        
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return None

def get_file_metadata(s3_url: str) -> Optional[dict]:
    """Get file metadata from S3"""
    
    try:
        s3_key = s3_url.split(f"{BUCKET_NAME}.s3.amazonaws.com/")[1]
        
        response = s3_client.head_object(
            Bucket=BUCKET_NAME,
            Key=s3_key
        )
        
        return {
            'content_type': response.get('ContentType'),
            'content_length': response.get('ContentLength'),
            'last_modified': response.get('LastModified'),
            'metadata': response.get('Metadata', {})
        }
        
    except Exception as e:
        print(f"Error getting file metadata: {e}")
        return None
