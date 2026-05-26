import json
import re
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)


class ItineraryParser:
    def parse(self, claude_response: str) -> Dict[str, Any]:
        """Parse Claude's response into structured itinerary data"""
        try:
            json_match = re.search(r'```json\s*(.*?)\s*```', claude_response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(1))
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse JSON from code block: {e}")
            
            try:
                return json.loads(claude_response)
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse JSON from direct response: {e}")
                
        except Exception as e:
            logger.error(f"Unexpected error during JSON parsing: {e}")
            
        return self._fallback_parse(claude_response)

    def _fallback_parse(self, text: str) -> Dict[str, Any]:
        """Fallback parser if JSON extraction fails"""
        days = []
        day_pattern = r'Day (\d+):(.*?)(?=Day \d+:|$)'
        matches = re.finditer(day_pattern, text, re.DOTALL | re.IGNORECASE)
        
        for match in matches:
            day_num = int(match.group(1))
            day_content = match.group(2).strip()
            
            activities = []
            activity_lines = [line.strip() for line in day_content.split('\n') if line.strip()]
            
            for line in activity_lines:
                if line and not line.startswith('#'):
                    activities.append({
                        'name': line,
                        'description': '',
                        'estimated_duration': '1-2 hours',
                        'estimated_cost': 'Varies'
                    })
            
            days.append({
                'day': day_num,
                'activities': activities
            })
        
        # Ensure we always return a complete valid structure
        return {
            'trip_summary': 'Generated itinerary',
            'days': days,
            'total_estimated_cost': 'See individual activities',
            'notes': []
        }