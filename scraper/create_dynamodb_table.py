import boto3

dynamodb = boto3.client('dynamodb', region_name='us-east-1')

def create_table():
    """Create DynamoDB table for travel POIs"""
    
    try:
        table = dynamodb.create_table(
            TableName='travel-pois',
            KeySchema=[
                {
                    'AttributeName': 'poi_id',
                    'KeyType': 'HASH'
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'poi_id',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'city',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'category',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'budget_level',
                    'AttributeType': 'S'
                }
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'city-category-index',
                    'KeySchema': [
                        {
                            'AttributeName': 'city',
                            'KeyType': 'HASH'
                        },
                        {
                            'AttributeName': 'category',
                            'KeyType': 'RANGE'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'budget-index',
                    'KeySchema': [
                        {
                            'AttributeName': 'budget_level',
                            'KeyType': 'HASH'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        
        print("Table created successfully!")
        print("Waiting for table to be active...")
        
        waiter = dynamodb.get_waiter('table_exists')
        waiter.wait(TableName='travel-pois')
        
        print("Table is now active!")
        
    except dynamodb.exceptions.ResourceInUseException:
        print("Table already exists!")

if __name__ == "__main__":
    create_table()
