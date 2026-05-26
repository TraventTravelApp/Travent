import requests
import boto3
import uuid
import json
import os
import time
from datetime import datetime, timezone
from typing import List, Dict
from dotenv import load_dotenv
from decimal import Decimal

# Load environment variables
load_dotenv()

# Google Places API
GOOGLE_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY', '')
GOOGLE_PLACES_API = "https://maps.googleapis.com/maps/api/place/textsearch/json"
GOOGLE_DETAILS_API = "https://maps.googleapis.com/maps/api/place/details/json"

# DynamoDB setup
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('travel-pois')

# Target cities
CITIES = {
    'nyc': {'country': 'USA', 'location': 'New York, NY'},
}

# Blacklist keywords
BLACKLIST_KEYWORDS = [
    'vape', 'vaping', 'smoke shop', 'tobacco', 'cigar', 'hookah',
    'strip club', 'adult', 'gentlemen\'s club',
    'pawn shop', 'payday loan', 'check cashing',
    'walmart', 'target', 'cvs', 'walgreens', 'duane reade',
    'mcdonald', 'burger king', 'wendy', 'taco bell', 'kfc', 'subway',
    'starbucks', 'dunkin', 'olive garden', 'applebee', 'chili\'s',
    'gas station', 'auto repair', 'car wash',
    'laundromat', 'dry clean', 'storage unit',
    'liquor store', 'dispensary', 'cannabis',
    'urgent care', 'clinic', 'pharmacy', 'dentist', 'hospital',
    'times square', 'empire state', 'statue of liberty',
    'brooklyn bridge', 'grand central', 'rockefeller center'
]

# Search query templates (city will be inserted dynamically)
SEARCH_QUERY_TEMPLATES = [
    # Food & Drink
    "hidden gem restaurant",
    "local favorite cafe",
    "neighborhood bakery",
    "craft brewery",
    "authentic food",
    
    # Culture & History
    "small museum",
    "local art gallery",
    "historic site",
    
    # Nature & Scenic
    "neighborhood park",
    "scenic spot",
    "botanical garden",
    
    # Nightlife & Entertainment
    "local bar",
    "live music venue",
    "comedy club",
    
    # Shopping
    "vintage shop",
    "independent bookstore",
    "thrift store",
    
    # Well-Being
    "yoga studio",
    "day spa",
    
    # Adventure & Outdoors
    "climbing gym",
    "bike rental"
]

def is_blacklisted(place_name: str, types: List[str]) -> bool:
    """Check if place is blacklisted"""
    name_lower = place_name.lower()
    
    # Check name
    if any(keyword in name_lower for keyword in BLACKLIST_KEYWORDS):
        return True
    
    # Check types
    for place_type in types:
        if any(keyword in place_type.lower() for keyword in BLACKLIST_KEYWORDS):
            return True
    
    return False

def categorize_place(types: List[str], name: str) -> str:
    """Map Google place types to our categories"""
    
    types_str = ' '.join(types).lower()
    name_lower = name.lower()
    
    if any(t in types_str for t in ['restaurant', 'cafe', 'bakery', 'bar', 'food', 'meal']):
        return 'Food & Drink'
    elif any(t in types_str for t in ['gym', 'sports', 'bicycle', 'climbing']):
        return 'Adventure & Outdoors'
    elif any(t in types_str for t in ['park', 'natural', 'beach', 'garden']):
        return 'Nature & Scenic'
    elif any(t in types_str for t in ['museum', 'art_gallery', 'library', 'cultural', 'historic']):
        return 'Culture & History'
    elif any(t in types_str for t in ['night_club', 'bar', 'music', 'entertainment']):
        return 'Nightlife & Entertainment'
    elif any(t in types_str for t in ['spa', 'beauty', 'wellness', 'yoga']):
        return 'Well-Being'
    elif any(t in types_str for t in ['store', 'shop', 'shopping']):
        return 'Shopping'
    else:
        return 'Culture & History'  # Default

def estimate_budget(price_level: int) -> str:
    """Convert Google price level to budget"""
    if price_level is None or price_level <= 1:
        return 'low'
    elif price_level == 2:
        return 'medium'
    else:
        return 'high'

def search_google_places(query: str, location: str) -> List[Dict]:
    """Search Google Places API"""
    
    params = {
        'query': f"{query} {location}",  # Combine query with location
        'key': GOOGLE_API_KEY
    }
    
    try:
        response = requests.get(GOOGLE_PLACES_API, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') != 'OK':
            print(f"  API Status: {data.get('status')}")
            if 'error_message' in data:
                print(f"  Error: {data['error_message']}")
            return []
        
        return data.get('results', [])
    
    except Exception as e:
        print(f"  Error searching Google Places: {e}")
        return []

def get_existing_place_ids() -> set:
    """Get all existing Google Place IDs from DynamoDB"""
    print("� Checking existing POIs in DynamoDB...")
    
    try:
        existing_ids = set()
        
        # Scan DynamoDB for all POIs with google_place_id
        response = table.scan(
            ProjectionExpression='google_place_id',
            FilterExpression='attribute_exists(google_place_id)'
        )
        
        for item in response.get('Items', []):
            if 'google_place_id' in item:
                existing_ids.add(item['google_place_id'])
        
        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                ProjectionExpression='google_place_id',
                FilterExpression='attribute_exists(google_place_id)',
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            for item in response.get('Items', []):
                if 'google_place_id' in item:
                    existing_ids.add(item['google_place_id'])
        
        print(f"   Found {len(existing_ids)} existing POIs in database")
        return existing_ids
        
    except Exception as e:
        print(f"   ⚠️  Error checking existing POIs: {e}")
        return set()

def scrape_city(city: str, location: str, existing_ids: set = None) -> List[Dict]:
    """Scrape POIs for a city using Google Places"""
    print(f"\n🔍 Scraping {city}...")
    
    if existing_ids is None:
        existing_ids = set()
    
    all_pois = []
    seen_ids = existing_ids.copy()  # Start with existing IDs to avoid duplicates
    skipped_count = 0
    
    print(f"\n  Searching with queries...")
    
    for query_template in SEARCH_QUERY_TEMPLATES:
        query = f"{query_template} {location}"
        print(f"    Searching: {query}")
        places = search_google_places(query_template, location)
        
        for place in places:
            place_id = place.get('place_id')
            if place_id in seen_ids:
                skipped_count += 1
                continue
            
            # Get user ratings total (proxy for popularity)
            user_ratings_total = place.get('user_ratings_total', 0)
            
            # Filter: Hidden gems have 10-500 reviews
            if user_ratings_total < 10:
                continue
            if user_ratings_total > 500:
                continue
            
            # Check blacklist
            place_name = place.get('name', '')
            place_types = place.get('types', [])
            
            if is_blacklisted(place_name, place_types):
                print(f"      ❌ {place_name} (blacklisted)")
                continue
            
            # Get coordinates
            geometry = place.get('geometry', {})
            location_data = geometry.get('location', {})
            lat = location_data.get('lat')
            lon = location_data.get('lng')
            
            if lat:
                lat = Decimal(str(lat))
            if lon:
                lon = Decimal(str(lon))
            
            # Categorize
            category = categorize_place(place_types, place_name)
            
            # Estimate activity intensity based on category
            intensity = 3
            if category in ['Adventure & Outdoors']:
                intensity = 4
            elif category in ['Well-Being', 'Nature & Scenic']:
                intensity = 2
            
            # Convert rating to Decimal for DynamoDB
            rating = place.get('rating', 0)
            if rating:
                rating = Decimal(str(rating))
            else:
                rating = Decimal('0')
            
            poi = {
                'poi_id': str(uuid.uuid4()),
                'name': place_name,
                'city': city.title(),
                'country': CITIES[city]['country'],
                'category': category,
                'budget_level': estimate_budget(place.get('price_level')),
                'activity_intensity': intensity,
                'reddit_mentions': 0,
                'yelp_reviews': user_ratings_total,
                'yelp_rating': rating,
                'source_url': f"https://www.google.com/maps/place/?q=place_id:{place_id}",
                'description': place.get('formatted_address', ''),
                'scraped_at': datetime.now(timezone.utc).isoformat(),
                'lat': lat,
                'lon': lon,
                'google_place_id': place_id
            }
            
            all_pois.append(poi)
            seen_ids.add(place_id)
            print(f"      ✅ {place_name} ({user_ratings_total} reviews)")
        
        time.sleep(0.5)  # Rate limiting
    
    if skipped_count > 0:
        print(f"\n  ⏭️  Skipped {skipped_count} POIs (already in database)")
    
    return all_pois

def save_to_dynamodb(pois: List[Dict]):
    """Save POIs to DynamoDB"""
    print(f"\n💾 Saving {len(pois)} POIs to DynamoDB...")
    
    with table.batch_writer() as batch:
        for poi in pois:
            batch.put_item(Item=poi)
    
    print("✅ Saved successfully!")

def save_to_json(pois: List[Dict], filename: str = 'pois_backup.json'):
    """Save POIs to JSON file as backup"""
    json_pois = []
    for poi in pois:
        poi_copy = poi.copy()
        # Convert Decimal to float for JSON serialization
        if 'lat' in poi_copy and poi_copy['lat'] is not None:
            poi_copy['lat'] = float(poi_copy['lat'])
        if 'lon' in poi_copy and poi_copy['lon'] is not None:
            poi_copy['lon'] = float(poi_copy['lon'])
        if 'yelp_rating' in poi_copy and poi_copy['yelp_rating'] is not None:
            poi_copy['yelp_rating'] = float(poi_copy['yelp_rating'])
        json_pois.append(poi_copy)
    
    with open(filename, 'w') as f:
        json.dump(json_pois, f, indent=2)
    print(f"💾 Backup saved to {filename}")

def main():
    print(f"\n🎯 Starting Google Places scraper...")
    print(f"Google API Key: {'✅ Set' if GOOGLE_API_KEY else '❌ Not set'}\n")
    
    if not GOOGLE_API_KEY:
        print("❌ Error: GOOGLE_PLACES_API_KEY not set in .env file")
        print("Please add your Google Places API key to scraper/.env:")
        print("GOOGLE_PLACES_API_KEY=your_actual_google_api_key_here")
        print("\nGet your key at: https://console.cloud.google.com/apis/credentials")
        return
    
    # Get existing POIs from DynamoDB to avoid duplicates
    existing_ids = get_existing_place_ids()
    
    all_pois = []
    
    for city, config in CITIES.items():
        pois = scrape_city(city, config['location'], existing_ids)
        all_pois.extend(pois)
    
    # Remove duplicates by Google Place ID
    unique_pois = {}
    for poi in all_pois:
        place_id = poi.get('google_place_id')
        if place_id and place_id not in unique_pois:
            unique_pois[place_id] = poi
    
    final_pois = list(unique_pois.values())
    
    print(f"\n📊 Total NEW POIs found: {len(final_pois)}")
    print(f"   Hidden gems (10-500 reviews): {len([p for p in final_pois if 10 <= p.get('yelp_reviews', 0) <= 500])}")
    
    if len(final_pois) == 0:
        print("\n✅ No new POIs to add - database is up to date!")
        return
    
    # Show breakdown by category
    print(f"\n📋 Breakdown by category:")
    categories = {}
    for poi in final_pois:
        cat = poi['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    for category, count in sorted(categories.items()):
        print(f"   {category}: {count}")
    
    save_to_json(final_pois)
    save_to_dynamodb(final_pois)
    
    print(f"\n✅ Done! Added {len(final_pois)} new hidden gems from Google Places")

if __name__ == "__main__":
    main()
