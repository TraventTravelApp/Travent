import boto3
from boto3.dynamodb.conditions import Key, Attr
from typing import List, Dict

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('travel-pois')

def query_pois_by_city_category(city: str, category: str) -> List[Dict]:
    """Query POIs by city and category"""
    
    response = table.query(
        IndexName='city-category-index',
        KeyConditionExpression=Key('city').eq(city) & Key('category').eq(category)
    )
    
    return response['Items']

def query_pois_for_itinerary(
    city: str,
    categories: List[str],
    budget_level: str,
    min_intensity: int = 1,
    max_intensity: int = 5
) -> List[Dict]:
    """Query POIs matching user preferences"""
    
    all_pois = []
    
    for category in categories:
        response = table.query(
            IndexName='city-category-index',
            KeyConditionExpression=Key('city').eq(city) & Key('category').eq(category),
            FilterExpression=Attr('budget_level').eq(budget_level) & 
                           Attr('activity_intensity').between(min_intensity, max_intensity)
        )
        
        all_pois.extend(response['Items'])
    
    all_pois.sort(key=lambda x: x.get('yelp_reviews', x.get('reddit_mentions', 0)), reverse=True)
    
    return all_pois

def validate_poi_exists(poi_name: str, city: str) -> Dict:
    """Check if a POI exists in the knowledge base"""
    
    response = table.scan(
        FilterExpression=Attr('name').eq(poi_name) & Attr('city').eq(city)
    )
    
    if response['Items']:
        return response['Items'][0]
    return None

if __name__ == "__main__":
    pois = query_pois_for_itinerary(
        city='Nyc',
        categories=['Food & Drink', 'Culture & History'],
        budget_level='medium',
        min_intensity=2,
        max_intensity=4
    )
    
    print(f"Found {len(pois)} POIs:")
    for poi in pois[:5]:
        print(f"- {poi['name']} ({poi['category']}, intensity: {poi['activity_intensity']})")
