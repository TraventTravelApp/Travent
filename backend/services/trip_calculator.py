"""
Trip calculation utilities for budget, gas costs, and route preferences
"""

def calculate_gas_cost(distance_km, mpg=25, gas_price_per_gallon=3.50):
    """
    Calculate estimated gas cost for a trip
    
    Args:
        distance_km: Total distance in kilometers
        mpg: Miles per gallon (default: 25 mpg average)
        gas_price_per_gallon: Current gas price (default: $3.50)
    
    Returns:
        Estimated gas cost in dollars
    """
    # Convert km to miles
    distance_miles = distance_km * 0.621371
    
    # Calculate gallons needed
    gallons_needed = distance_miles / mpg
    
    # Calculate total cost
    total_cost = gallons_needed * gas_price_per_gallon
    
    return round(total_cost, 2)


def calculate_trip_budget(itinerary, base_budget, include_gas=False, mpg=25, gas_price=3.50):
    """
    Calculate trip budget breakdown
    
    Args:
        itinerary: Trip itinerary with days and POIs
        base_budget: User's total budget
        include_gas: Whether to include gas costs
        mpg: Miles per gallon
        gas_price: Gas price per gallon
    
    Returns:
        Budget breakdown dictionary
    """
    days = itinerary.get('days', [])
    
    # Calculate total distance
    total_distance_km = sum(day.get('total_distance_km', 0) for day in days)
    
    # Calculate gas cost if needed
    gas_cost = 0
    if include_gas:
        gas_cost = calculate_gas_cost(total_distance_km, mpg, gas_price)
    
    # Remaining budget for activities/food
    remaining_budget = base_budget - gas_cost
    
    # Estimate per-day budget
    num_days = len(days)
    per_day_budget = remaining_budget / num_days if num_days > 0 else 0
    
    # Estimate per-POI budget (rough estimate)
    total_pois = sum(len(day.get('pois', [])) for day in days)
    per_poi_budget = remaining_budget / total_pois if total_pois > 0 else 0
    
    return {
        'total_budget': base_budget,
        'gas_cost': gas_cost,
        'remaining_budget': remaining_budget,
        'per_day_budget': round(per_day_budget, 2),
        'per_poi_budget': round(per_poi_budget, 2),
        'total_distance_km': round(total_distance_km, 2),
        'estimated_gas_gallons': round(total_distance_km * 0.621371 / mpg, 2) if include_gas else 0
    }


def get_scenic_route_guidance():
    """
    Provide guidance for scenic route preferences
    
    Returns:
        Dictionary with scenic route recommendations
    """
    return {
        'recommendations': [
            'Prioritize routes with scenic byways and national scenic highways',
            'Include POIs along scenic routes (viewpoints, natural landmarks)',
            'Allow for longer travel times between destinations',
            'Consider routes with coastal, mountain, or countryside views',
            'Add extra buffer time for photo stops and scenic overlooks'
        ],
        'route_types': [
            'coastal_highways',
            'mountain_passes',
            'national_scenic_byways',
            'countryside_roads',
            'historic_routes'
        ],
        'time_multiplier': 1.3,  # Add 30% more time for scenic routes
        'suggested_poi_types': [
            'scenic_overlook',
            'viewpoint',
            'natural_landmark',
            'state_park',
            'national_park'
        ]
    }


def adjust_pois_for_busy_level(pois, how_busy, duration_days):
    """
    Adjust number of POIs based on how busy the user wants their trip
    
    Args:
        pois: List of available POIs
        how_busy: Slider value 1-5 (1=relaxed, 5=jam-packed)
        duration_days: Number of days
    
    Returns:
        Recommended number of POIs per day
    """
    # Base POIs per day based on busy level
    pois_per_day_map = {
        1: 2,   # Very relaxed - 2 POIs per day
        2: 3,   # Relaxed - 3 POIs per day
        3: 4,   # Moderate - 4 POIs per day
        4: 6,   # Busy - 6 POIs per day
        5: 8    # Very busy - 8 POIs per day
    }
    
    pois_per_day = pois_per_day_map.get(how_busy, 4)
    total_pois_needed = pois_per_day * duration_days
    
    return {
        'pois_per_day': pois_per_day,
        'total_pois_needed': total_pois_needed,
        'recommended_duration_per_poi_minutes': {
            1: 120,  # 2 hours per POI for relaxed
            2: 90,   # 1.5 hours
            3: 75,   # 1.25 hours
            4: 60,   # 1 hour
            5: 45    # 45 minutes for jam-packed
        }.get(how_busy, 75)
    }


def calculate_group_adjustments(traveling_with, base_budget, pois_per_day):
    """
    Adjust trip parameters for group travel
    
    Args:
        traveling_with: "solo" or "group"
        base_budget: Base budget
        pois_per_day: Base POIs per day
    
    Returns:
        Adjusted parameters for group travel
    """
    if traveling_with == "group":
        return {
            'budget_multiplier': 0.75,  # Group travel can be cheaper per person
            'adjusted_budget': base_budget * 0.75,
            'pois_per_day_adjustment': -1,  # Groups move slower, reduce by 1 POI
            'adjusted_pois_per_day': max(2, pois_per_day - 1),
            'time_multiplier': 1.2,  # Groups need 20% more time
            'recommendations': [
                'Consider group-friendly activities',
                'Book reservations in advance for larger parties',
                'Allow extra time for group coordination',
                'Choose POIs with group discounts'
            ]
        }
    else:
        return {
            'budget_multiplier': 1.0,
            'adjusted_budget': base_budget,
            'pois_per_day_adjustment': 0,
            'adjusted_pois_per_day': pois_per_day,
            'time_multiplier': 1.0,
            'recommendations': [
                'More flexibility in timing',
                'Can visit smaller, intimate venues',
                'Easier to make last-minute changes'
            ]
        }
