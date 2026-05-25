import boto3
import os
from botocore.config import Config

# Configure retry strategy for DynamoDB operations
DYNAMODB_RETRY_CONFIG = Config(
    retries={
        'max_attempts': 5,
        'mode': 'adaptive'  # Adaptive retry with exponential backoff
    },
    read_timeout=10,
    connect_timeout=5
)

dynamodb = boto3.resource(
    'dynamodb',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    config=DYNAMODB_RETRY_CONFIG
)

def get_dynamodb_table(table_name: str):
    """
    Get DynamoDB table resource with retry configuration.

    Automatically retries on:
    - ProvisionedThroughputExceededException
    - ThrottlingException
    - RequestLimitExceeded
    - InternalServerError
    """
    return dynamodb.Table(table_name)

def batch_write_items(table_name: str, items: list):
    """Batch write items to DynamoDB"""
    table = get_dynamodb_table(table_name)
    
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)
