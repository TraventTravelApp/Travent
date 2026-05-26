from typing import Dict

class Trip:
    def __init__(self, trip_id: str, user_id: str, trip_type: str, 
                 destination: str, preferences: Dict, status: str = 'pending'):
        self.trip_id = trip_id
        self.user_id = user_id
        self.type = trip_type
        self.destination = destination
        self.preferences = preferences
        self.status = status
        self.itinerary = {}
    
    def to_dict(self):
        return {
            'trip_id': self.trip_id,
            'user_id': self.user_id,
            'type': self.type,
            'destination': self.destination,
            'preferences': self.preferences,
            'status': self.status,
            'itinerary': self.itinerary
        }
