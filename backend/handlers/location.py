import json
import os
import boto3
from botocore.exceptions import ClientError

# Initialize AWS Location Service client
location_client = boto3.client('location', region_name='us-east-1')
PLACE_INDEX_NAME = os.environ.get('LOCATION_PLACE_INDEX_NAME', 'TripPlaceIndex')


def search_places(event, context):
    """
    Search for places using AWS Location Service
    """
    try:
        # Parse query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        search_text = query_params.get('query', '').strip()
        
        if not search_text:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': True,
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Query parameter is required'
                })
            }
        
        # Limit to US locations for better results
        max_results = int(query_params.get('maxResults', 10))
        
        # Search using AWS Location Service
        response = location_client.search_place_index_for_text(
            IndexName=PLACE_INDEX_NAME,
            Text=search_text,
            MaxResults=max_results,
            FilterCountries=['USA']  # Limit to US locations
        )
        
        # Format results
        places = []
        for result in response.get('Results', []):
            place = result.get('Place', {})
            
            # Build location string
            label = place.get('Label', '')
            city = place.get('Municipality', '')
            state = place.get('Region', '')
            country = place.get('Country', '')
            
            # Create formatted location string
            location_parts = []
            if city:
                location_parts.append(city)
            if state:
                location_parts.append(state)
            
            location_str = ', '.join(location_parts) if location_parts else label
            
            places.append({
                'label': location_str,
                'fullLabel': label,
                'coordinates': place.get('Geometry', {}).get('Point', []),
                'city': city,
                'state': state,
                'country': country
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({
                'success': True,
                'data': places
            })
        }
        
    except ClientError as e:
        print(f"AWS Location Service error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({
                'success': False,
                'error': f'Location service error: {str(e)}'
            })
        }
    except Exception as e:
        print(f"Error searching places: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }
