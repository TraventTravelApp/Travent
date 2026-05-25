"""Validate AI-generated itineraries against user constraints"""
from typing import Dict, List, Tuple, Any


class ItineraryValidator:
    """Validates generated itineraries against user requirements"""

    def validate(self, itinerary: Dict[str, Any], constraints: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate itinerary against user constraints.

        Args:
            itinerary: Parsed itinerary from AI
            constraints: User requirements (duration, budget, intensity, etc.)

        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []

        # Validate required structure
        if not isinstance(itinerary, dict):
            errors.append("Itinerary must be a dictionary")
            return False, errors

        # Validate days array exists
        days = itinerary.get('days', [])
        if not days:
            errors.append("Itinerary must contain a 'days' array")
            return False, errors

        if not isinstance(days, list):
            errors.append("'days' must be an array")
            return False, errors

        # Validate day count matches duration
        expected_duration = constraints.get('duration', 3)
        if len(days) != expected_duration:
            errors.append(
                f"Expected {expected_duration} days, but itinerary has {len(days)} days"
            )

        # Validate budget (within 10% tolerance)
        if 'total_estimated_cost' in itinerary or 'total_cost' in itinerary:
            total_cost = itinerary.get('total_estimated_cost') or itinerary.get('total_cost')
            expected_budget = constraints.get('budget', 500)

            # Try to parse cost if it's a string
            if isinstance(total_cost, str):
                # Extract numbers from string like "$500" or "500 USD"
                import re
                numbers = re.findall(r'\d+\.?\d*', str(total_cost))
                if numbers:
                    total_cost = float(numbers[0])
                else:
                    total_cost = None

            if isinstance(total_cost, (int, float)) and isinstance(expected_budget, (int, float)):
                budget_tolerance = expected_budget * 0.10  # 10% tolerance
                if total_cost > expected_budget + budget_tolerance:
                    errors.append(
                        f"Total cost ${total_cost} exceeds budget ${expected_budget} by more than 10%"
                    )

        # Validate activities per day based on intensity
        intensity = constraints.get('intensity', 3)
        min_activities, max_activities = self._get_activity_range(intensity)

        for i, day in enumerate(days, 1):
            if not isinstance(day, dict):
                errors.append(f"Day {i} must be a dictionary")
                continue

            activities = day.get('activities', [])
            if not isinstance(activities, list):
                errors.append(f"Day {i}: 'activities' must be an array")
                continue

            activity_count = len(activities)

            if activity_count < min_activities:
                errors.append(
                    f"Day {i}: Has {activity_count} activities, expected at least {min_activities} "
                    f"for intensity level {intensity}"
                )

            if activity_count > max_activities:
                errors.append(
                    f"Day {i}: Has {activity_count} activities, expected at most {max_activities} "
                    f"for intensity level {intensity}"
                )

            # Validate each activity has required fields
            for j, activity in enumerate(activities, 1):
                if not isinstance(activity, dict):
                    errors.append(f"Day {i}, Activity {j}: Must be a dictionary")
                    continue

                if not activity.get('name'):
                    errors.append(f"Day {i}, Activity {j}: Missing 'name' field")

                # Check for description (recommended but not required)
                if not activity.get('description'):
                    # This is a warning, not an error
                    pass

        # Return validation result
        is_valid = len(errors) == 0
        return is_valid, errors

    def _get_activity_range(self, intensity: int) -> Tuple[int, int]:
        """
        Get the expected range of activities per day based on intensity.

        Args:
            intensity: User's desired intensity level (1-5)

        Returns:
            Tuple of (min_activities, max_activities)
        """
        activity_ranges = {
            1: (1, 2),   # Very relaxed: 1-2 activities
            2: (2, 3),   # Relaxed: 2-3 activities
            3: (3, 4),   # Moderate: 3-4 activities
            4: (4, 5),   # Packed: 4-5 activities
            5: (5, 7),   # Very packed: 5-7 activities
        }

        return activity_ranges.get(intensity, (3, 4))

    def get_validation_summary(self, errors: List[str]) -> str:
        """Format validation errors into a human-readable summary"""
        if not errors:
            return "Itinerary passed all validation checks."

        summary = f"Found {len(errors)} validation issue(s):\n"
        for i, error in enumerate(errors, 1):
            summary += f"{i}. {error}\n"

        return summary
