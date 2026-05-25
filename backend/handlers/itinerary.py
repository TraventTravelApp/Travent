import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.decorators import require_auth
from utils.response import success_response, error_response
from services.route_optimizer import optimize_route, calculate_total_distance

trips_table = get_dynamodb_table('trips')

@require_auth
def add_poi_to_itinerary(event, context):
    """Add a custom POI to trip itinerary"""
    try:
        user_id = event['authenticated_user_id']

        trip_id = event['pathParameters']['trip_id']
        body = json.loads(event['body'])

        # Verify trip ownership
        response = trips_table.get_item(Key={'trip_id': trip_id})
        if 'Item' not in response:
            return error_response(404, "Trip not found")

        trip = response['Item']
        if trip['user_id'] != user_id:
            return error_response(403, "Forbidden")
        
        # Extract POI data
        day = body.get('day', 1)
        poi = {
            'poi_id': body.get('poi_id', f"custom_{len(trip.get('itinerary', {}).get('days', []))}"),
            'name': body.get('name'),
            'category': body.get('category', 'custom'),
            'lat': body.get('lat'),
            'lon': body.get('lon'),
            'address': body.get('address', ''),
            'estimated_duration_minutes': body.get('estimated_duration_minutes', 60),
            'notes': body.get('notes', ''),
            'custom': True
        }
        
        # Validate required fields
        if not all([poi['name'], poi['lat'], poi['lon']]):
            return error_response(400, "name, lat, and lon are required")
        
        # Get current itinerary
        itinerary = trip.get('itinerary', {'days': []})
        days = itinerary.get('days', [])
        
        # Find or create the day
        day_index = None
        for i, d in enumerate(days):
            if d.get('day') == day:
                day_index = i
                break
        
        if day_index is None:
            # Create new day
            days.append({
                'day': day,
                'pois': [poi],
                'total_distance_km': 0,
                'estimated_travel_time_minutes': 0
            })
        else:
            # Add to existing day
            days[day_index]['pois'].append(poi)
            
            # Re-optimize route for this day
            pois = days[day_index]['pois']
            optimized = optimize_route(pois)
            days[day_index]['pois'] = optimized
            days[day_index]['total_distance_km'] = calculate_total_distance(optimized)
        
        itinerary['days'] = days
        
        # Update trip
        trips_table.update_item(
            Key={'trip_id': trip_id},
            UpdateExpression='SET #itinerary = :i',
            ExpressionAttributeNames={'#itinerary': 'itinerary'},
            ExpressionAttributeValues={':i': itinerary}
        )
        
        return success_response({
            'message': 'POI added to itinerary',
            'itinerary': itinerary
        })
        
    except Exception as e:
        return error_response(500, str(e))

@require_auth
def remove_poi_from_itinerary(event, context):
    """Remove a POI from trip itinerary"""
    try:
        user_id = event['authenticated_user_id']

        trip_id = event['pathParameters']['trip_id']
        poi_id = event['pathParameters']['poi_id']

        # Verify trip ownership
        response = trips_table.get_item(Key={'trip_id': trip_id})
        if 'Item' not in response:
            return error_response(404, "Trip not found")

        trip = response['Item']
        if trip['user_id'] != user_id:
            return error_response(403, "Forbidden")
        
        # Get current itinerary
        itinerary = trip.get('itinerary', {'days': []})
        days = itinerary.get('days', [])
        
        # Find and remove POI
        found = False
        for day in days:
            pois = day.get('pois', [])
            for i, poi in enumerate(pois):
                if poi.get('poi_id') == poi_id:
                    pois.pop(i)
                    found = True
                    
                    # Re-optimize route for this day
                    if pois:
                        optimized = optimize_route(pois)
                        day['pois'] = optimized
                        day['total_distance_km'] = calculate_total_distance(optimized)
                    else:
                        day['pois'] = []
                        day['total_distance_km'] = 0
                        day['estimated_travel_time_minutes'] = 0
                    
                    break
            if found:
                break
        
        if not found:
            return error_response(404, "POI not found in itinerary")
        
        itinerary['days'] = days
        
        # Update trip
        trips_table.update_item(
            Key={'trip_id': trip_id},
            UpdateExpression='SET #itinerary = :i',
            ExpressionAttributeNames={'#itinerary': 'itinerary'},
            ExpressionAttributeValues={':i': itinerary}
        )
        
        return success_response({
            'message': 'POI removed from itinerary',
            'itinerary': itinerary
        })
        
    except Exception as e:
        return error_response(500, str(e))

@require_auth
def update_poi_in_itinerary(event, context):
    """Update a POI in trip itinerary"""
    try:
        user_id = event['authenticated_user_id']

        trip_id = event['pathParameters']['trip_id']
        poi_id = event['pathParameters']['poi_id']
        body = json.loads(event['body'])

        # Verify trip ownership
        response = trips_table.get_item(Key={'trip_id': trip_id})
        if 'Item' not in response:
            return error_response(404, "Trip not found")

        trip = response['Item']
        if trip['user_id'] != user_id:
            return error_response(403, "Forbidden")
        
        # Get current itinerary
        itinerary = trip.get('itinerary', {'days': []})
        days = itinerary.get('days', [])
        
        # Find and update POI
        found = False
        for day in days:
            pois = day.get('pois', [])
            for poi in pois:
                if poi.get('poi_id') == poi_id:
                    # Update allowed fields
                    if 'name' in body:
                        poi['name'] = body['name']
                    if 'notes' in body:
                        poi['notes'] = body['notes']
                    if 'estimated_duration_minutes' in body:
                        poi['estimated_duration_minutes'] = body['estimated_duration_minutes']
                    if 'lat' in body:
                        poi['lat'] = body['lat']
                    if 'lon' in body:
                        poi['lon'] = body['lon']
                    
                    found = True
                    
                    # Re-optimize route if coordinates changed
                    if 'lat' in body or 'lon' in body:
                        optimized = optimize_route(pois)
                        day['pois'] = optimized
                        day['total_distance_km'] = calculate_total_distance(optimized)
                    
                    break
            if found:
                break
        
        if not found:
            return error_response(404, "POI not found in itinerary")
        
        itinerary['days'] = days
        
        # Update trip
        trips_table.update_item(
            Key={'trip_id': trip_id},
            UpdateExpression='SET #itinerary = :i',
            ExpressionAttributeNames={'#itinerary': 'itinerary'},
            ExpressionAttributeValues={':i': itinerary}
        )
        
        return success_response({
            'message': 'POI updated in itinerary',
            'itinerary': itinerary
        })
        
    except Exception as e:
        return error_response(500, str(e))

@require_auth
def reorder_itinerary(event, context):
    """Manually reorder POIs in a day"""
    try:
        user_id = event['authenticated_user_id']

        trip_id = event['pathParameters']['trip_id']
        body = json.loads(event['body'])

        day = body.get('day')
        poi_order = body.get('poi_order')  # Array of poi_ids in desired order

        if not day or not poi_order:
            return error_response(400, "day and poi_order required")

        # Verify trip ownership
        response = trips_table.get_item(Key={'trip_id': trip_id})
        if 'Item' not in response:
            return error_response(404, "Trip not found")

        trip = response['Item']
        if trip['user_id'] != user_id:
            return error_response(403, "Forbidden")
        
        # Get current itinerary
        itinerary = trip.get('itinerary', {'days': []})
        days = itinerary.get('days', [])
        
        # Find the day
        day_index = None
        for i, d in enumerate(days):
            if d.get('day') == day:
                day_index = i
                break
        
        if day_index is None:
            return error_response(404, "Day not found in itinerary")
        
        # Reorder POIs
        current_pois = days[day_index]['pois']
        poi_map = {poi['poi_id']: poi for poi in current_pois}
        
        reordered_pois = []
        for poi_id in poi_order:
            if poi_id in poi_map:
                reordered_pois.append(poi_map[poi_id])
        
        # Update day with new order
        days[day_index]['pois'] = reordered_pois
        days[day_index]['total_distance_km'] = calculate_total_distance(reordered_pois)
        
        itinerary['days'] = days
        
        # Update trip
        trips_table.update_item(
            Key={'trip_id': trip_id},
            UpdateExpression='SET #itinerary = :i',
            ExpressionAttributeNames={'#itinerary': 'itinerary'},
            ExpressionAttributeValues={':i': itinerary}
        )
        
        return success_response({
            'message': 'Itinerary reordered',
            'itinerary': itinerary
        })
        
    except Exception as e:
        return error_response(500, str(e))
