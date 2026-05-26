import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.poi_service import validate_poi_exists
from typing import List, Dict

def validate_itinerary_pois(itinerary: Dict) -> Dict:
    """
    Validate all POIs in an itinerary exist in knowledge base
    Skip missing POIs and return cleaned itinerary
    """
    
    validated_itinerary = {
        'days': [],
        'skipped_pois': []
    }
    
    for day in itinerary.get('days', []):
        validated_day = {
            'day': day['day'],
            'pois': []
        }
        
        for poi in day.get('pois', []):
            poi_name = poi.get('name')
            city = poi.get('city')
            
            # Check if POI exists
            validated_poi = validate_poi_exists(poi_name, city)
            
            if validated_poi:
                validated_day['pois'].append(validated_poi)
            else:
                validated_itinerary['skipped_pois'].append({
                    'name': poi_name,
                    'city': city,
                    'reason': 'Not found in knowledge base'
                })
        
        if validated_day['pois']:
            validated_itinerary['days'].append(validated_day)
    
    return validated_itinerary

def validate_poi_list(poi_names: List[str], city: str) -> List[Dict]:
    """Validate a list of POI names and return valid ones"""
    
    valid_pois = []
    
    for poi_name in poi_names:
        poi = validate_poi_exists(poi_name, city)
        if poi:
            valid_pois.append(poi)
    
    return valid_pois
