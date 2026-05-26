import boto3

dynamodb = boto3.client('dynamodb', region_name='us-east-1')

def create_users_table():
    """Create users table with user_id as primary key"""
    try:
        dynamodb.create_table(
            TableName='users',
            KeySchema=[
                {'AttributeName': 'user_id', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'user_id', 'AttributeType': 'S'},
                {'AttributeName': 'email', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'email-index',
                    'KeySchema': [
                        {'AttributeName': 'email', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
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
        print("Users table created")
    except dynamodb.exceptions.ResourceInUseException:
        print("Users table already exists")

def create_trips_table():
    """Create trips table"""
    try:
        dynamodb.create_table(
            TableName='trips',
            KeySchema=[
                {'AttributeName': 'trip_id', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'trip_id', 'AttributeType': 'S'},
                {'AttributeName': 'user_id', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'user-index',
                    'KeySchema': [
                        {'AttributeName': 'user_id', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
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
        print("Trips table created")
    except dynamodb.exceptions.ResourceInUseException:
        print("Trips table already exists")

def create_trip_photos_table():
    """Create trip-photos table to store photos separately (avoid 400KB DynamoDB item limit)"""
    try:
        dynamodb.create_table(
            TableName='trip-photos',
            KeySchema=[
                {'AttributeName': 'trip_id', 'KeyType': 'HASH'},
                {'AttributeName': 'photo_id', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'trip_id', 'AttributeType': 'S'},
                {'AttributeName': 'photo_id', 'AttributeType': 'S'}
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print("Trip-photos table created")
    except dynamodb.exceptions.ResourceInUseException:
        print("Trip-photos table already exists")

def create_all_tables():
    """Create all DynamoDB tables"""
    create_users_table()
    create_trips_table()
    create_trip_photos_table()

    print("\nWaiting for tables to be active...")
    waiter = dynamodb.get_waiter('table_exists')
    waiter.wait(TableName='users')
    waiter.wait(TableName='trips')
    waiter.wait(TableName='trip-photos')

    print("All tables are active!")

if __name__ == "__main__":
    create_all_tables()
