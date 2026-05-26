import boto3
from boto3.dynamodb.conditions import Key, Attr
from typing import List, Dict

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('travel-pois')

def get_pois_for_preferences(
    city: str,
    categories: List[str],
    budget_level: str,
    min_intensity: int = 1,
    max_intensity: int = 5,
    limit: int = 50
) -> List[Dict]:
    """Query POIs matching user preferences"""
    
    all_pois = []
    
    for category in categories:
        try:
            response = table.query(
                IndexName='city-category-index',
                KeyConditionExpression=Key('city').eq(city) & Key('category').eq(category),
                FilterExpression=Attr('budget_level').eq(budget_level) & 
                               Attr('activity_intensity').between(min_intensity, max_intensity),
                Limit=limit
            )
            
            all_pois.extend(response['Items'])
        except Exception as e:
            print(f"Error querying {category}: {e}")
            continue
    
    # Sort by popularity (Yelp reviews, fallback to reddit mentions for old data)
    all_pois.sort(key=lambda x: x.get('yelp_reviews', x.get('reddit_mentions', 0)), reverse=True)
    
    return all_pois

def validate_poi_exists(poi_name: str, city: str) -> Dict:
    """Check if a POI exists in the knowledge base"""
    
    try:
        response = table.scan(
            FilterExpression=Attr('name').eq(poi_name) & Attr('city').eq(city),
            Limit=1
        )
        
        if response['Items']:
            return response['Items'][0]
        return None
    except Exception as e:
        print(f"Error validating POI: {e}")
        return None

def get_poi_by_id(poi_id: str) -> Dict:
    """Get a specific POI by ID"""
    
    try:
        response = table.get_item(Key={'poi_id': poi_id})
        return response.get('Item')
    except Exception as e:
        print(f"Error getting POI: {e}")
        return None
