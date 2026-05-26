from typing import List, Dict
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.distance import haversine_distance

def optimize_route(pois: List[Dict], start_location: Dict = None) -> List[Dict]:
    """
    Optimize route using nearest neighbor algorithm (simple TSP)
    
    Args:
        pois: List of POIs with 'lat' and 'lon' coordinates
        start_location: Optional starting point {'lat': x, 'lon': y}
    
    Returns:
        Ordered list of POIs
    """
    
    if not pois:
        return []
    
    if len(pois) == 1:
        return pois
    
    # Add coordinates if missing (fallback to city center)
    for poi in pois:
        if 'lat' not in poi or 'lon' not in poi:
            poi['lat'] = 0.0
            poi['lon'] = 0.0
    
    unvisited = pois.copy()
    route = []
    
    # Start from provided location or first POI
    if start_location:
        current = start_location
    else:
        current = unvisited.pop(0)
        route.append(current)
    
    # Nearest neighbor algorithm
    while unvisited:
        nearest = None
        min_distance = float('inf')
        
        for poi in unvisited:
            distance = haversine_distance(
                current['lat'], current['lon'],
                poi['lat'], poi['lon']
            )
            
            if distance < min_distance:
                min_distance = distance
                nearest = poi
        
        if nearest:
            route.append(nearest)
            unvisited.remove(nearest)
            current = nearest
    
    return route

def calculate_total_distance(pois: List[Dict]) -> float:
    """Calculate total distance of a route in kilometers"""
    
    if len(pois) < 2:
        return 0.0
    
    total = 0.0
    for i in range(len(pois) - 1):
        total += haversine_distance(
            pois[i]['lat'], pois[i]['lon'],
            pois[i + 1]['lat'], pois[i + 1]['lon']
        )
    
    return total

def split_into_days(pois: List[Dict], days: int, max_pois_per_day: int = 5) -> List[List[Dict]]:
    """Split POIs into daily itineraries"""
    
    if not pois or days <= 0:
        return []
    
    pois_per_day = max(1, len(pois) // days)
    pois_per_day = min(pois_per_day, max_pois_per_day)
    
    daily_itineraries = []
    
    for day in range(days):
        start_idx = day * pois_per_day
        end_idx = start_idx + pois_per_day
        
        if day == days - 1:  # Last day gets remaining POIs
            day_pois = pois[start_idx:]
        else:
            day_pois = pois[start_idx:end_idx]
        
        if day_pois:
            # Optimize route for this day
            optimized = optimize_route(day_pois)
            daily_itineraries.append(optimized)
    
    return daily_itineraries
