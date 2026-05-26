from typing import Dict, List
import os

class PromptBuilder:
    def __init__(self):
        self.prompts_dir = os.path.join(os.path.dirname(__file__), '..', 'prompts')
    
    def _load_template(self, filename: str) -> str:
        path = os.path.join(self.prompts_dir, filename)
        with open(path, 'r') as f:
            return f.read()
    
    def build_system_prompt(self) -> str:
        return self._load_template('system_prompt.txt')
    
    def build_location_trip_prompt(self, trip_data: Dict) -> str:
        template = self._load_template('location_trip.txt')
        
        interests = ', '.join(trip_data.get('interests', []))
        duration = trip_data.get('duration', 3)
        budget = trip_data.get('budget', 'moderate')
        intensity = trip_data.get('intensity', 5)
        group_type = trip_data.get('group_type', 'solo')
        destination = trip_data.get('destination', '')
        activity_preferences = trip_data.get('activity_preferences', [])
        
        # Handle recommended places from Reddit scraper
        recommended_places = trip_data.get('recommended_places', [])
        if recommended_places:
            places_text = "Local Recommendations (prioritize these!):\n"
            for place in recommended_places:
                places_text += f"- {place.get('name', 'Unknown')}: {place.get('description', '')}\n"
            recommended_places_section = places_text
        else:
            recommended_places_section = ""
        
        return template.format(
            destination=destination,
            duration=duration,
            budget=budget,
            intensity=intensity,
            group_type=group_type,
            interests=interests,
            activity_preferences=', '.join(activity_preferences) if activity_preferences else 'None specified',
            recommended_places_section=recommended_places_section
        )
    
    def build_roadtrip_prompt(self, trip_data: Dict) -> str:
        template = self._load_template('roadtrip.txt')
        
        interests = ', '.join(trip_data.get('interests', []))
        duration = trip_data.get('duration', 3)
        budget = trip_data.get('budget', 'moderate')
        start_location = trip_data.get('start_location', '')
        end_location = trip_data.get('end_location', '')
        scenic_route = trip_data.get('scenic_route', False)
        include_gas = trip_data.get('include_gas', False)
        intensity = trip_data.get('intensity', 5)
        
        return template.format(
            start_location=start_location,
            end_location=end_location,
            duration=duration,
            budget=budget,
            intensity=intensity,
            interests=interests,
            scenic_route='Yes' if scenic_route else 'No',
            include_gas='Yes' if include_gas else 'No'
        )
