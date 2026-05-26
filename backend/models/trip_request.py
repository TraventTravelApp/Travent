"""Pydantic models for trip request validation"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import date


class RoadTripPreferences(BaseModel):
    """Road trip specific preferences"""
    include_gas_costs: bool = False
    scenic_route: bool = True


class TripQuestionnaire(BaseModel):
    """Trip questionnaire data with validation"""
    starting_point: Optional[str] = Field(None, min_length=1, max_length=200)
    ending_point: Optional[str] = Field(None, min_length=1, max_length=200)
    duration_days: int = Field(..., ge=1, le=30, description="Trip duration in days (1-30)")
    budget: float = Field(..., ge=0, le=100000, description="Trip budget in USD (0-100,000)")
    how_busy: int = Field(..., ge=1, le=5, description="Activity intensity level (1-5)")
    traveling_with: str = Field(..., pattern="^(solo|group)$")
    road_trip_preferences: Optional[RoadTripPreferences] = None
    activity_categories: List[str] = Field(default_factory=list, max_length=10)

    @field_validator('activity_categories')
    @classmethod
    def validate_activity_categories(cls, v):
        """Ensure each activity category is valid"""
        if v:
            # Limit individual category name length
            for category in v:
                if not isinstance(category, str) or len(category) > 50:
                    raise ValueError("Activity category must be a string under 50 characters")
        return v


class CreateTripRequest(BaseModel):
    """Request model for creating a new trip"""
    type: str = Field(..., pattern="^(location|roadtrip)$", description="Trip type: location or roadtrip")
    destination: Optional[str] = Field(None, min_length=1, max_length=200)
    questionnaire: TripQuestionnaire
    preferences: Dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode='after')
    def validate_destination_for_location_trip(self):
        """Ensure destination is provided for location trips"""
        if self.type == 'location' and not self.destination:
            raise ValueError("destination is required for location trips")
        return self

    @model_validator(mode='after')
    def validate_points_for_roadtrip(self):
        """Ensure starting/ending points are provided for road trips"""
        if self.type == 'roadtrip':
            q = self.questionnaire
            if not q.starting_point or not q.ending_point:
                raise ValueError("starting_point and ending_point are required for road trips")
        return self


class AIItineraryRequest(BaseModel):
    """Request model for AI itinerary generation"""
    trip_type: str = Field(..., pattern="^(location|roadtrip)$")
    destination: Optional[str] = Field(None, min_length=1, max_length=200)
    start_location: Optional[str] = Field(None, min_length=1, max_length=200)
    end_location: Optional[str] = Field(None, min_length=1, max_length=200)
    duration: int = Field(3, ge=1, le=30)
    budget: float = Field(500, ge=0, le=100000)
    intensity: int = Field(3, ge=1, le=5)
    group_type: str = Field('solo', pattern="^(solo|group)$")
    interests: List[str] = Field(default_factory=list, max_length=20)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    include_gas: bool = False
    scenic_route: bool = True

    @model_validator(mode='after')
    def validate_location_fields(self):
        """Validate location fields based on trip type"""
        if self.trip_type == 'location' and not self.destination:
            raise ValueError("destination is required for location trips")

        if self.trip_type == 'roadtrip':
            if not self.start_location or not self.end_location:
                raise ValueError("start_location and end_location are required for road trips")

        return self

    @field_validator('interests')
    @classmethod
    def validate_interests(cls, v):
        """Validate interests list"""
        if v:
            for interest in v:
                if not isinstance(interest, str) or len(interest) > 100:
                    raise ValueError("Each interest must be a string under 100 characters")
        return v

    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date_format(cls, v):
        """Validate date format if provided"""
        if v:
            try:
                # Try to parse as YYYY-MM-DD
                parts = v.split('-')
                if len(parts) != 3:
                    raise ValueError("Date must be in YYYY-MM-DD format")
                year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
                date(year, month, day)  # Validate it's a real date
            except (ValueError, IndexError):
                raise ValueError("Invalid date format. Expected YYYY-MM-DD")
        return v


class UpdateTripRequest(BaseModel):
    """Request model for updating a trip"""
    preferences: Optional[Dict[str, Any]] = None
    status: Optional[str] = Field(None, pattern="^(pending|active|completed|cancelled)$")
    itinerary: Optional[Dict[str, Any]] = None

    @model_validator(mode='after')
    def at_least_one_field(self):
        """Ensure at least one field is being updated"""
        if not any([self.preferences, self.status, self.itinerary]):
            raise ValueError("At least one field must be provided for update")
        return self


class ProfileUpdateRequest(BaseModel):
    """Request model for profile updates"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    profile_photo_url: Optional[str] = Field(None, max_length=500)
    preferences: Optional[Dict[str, Any]] = None

    @field_validator('profile_photo_url')
    @classmethod
    def validate_url(cls, v):
        """Basic URL validation"""
        if v and not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError("profile_photo_url must be a valid URL")
        return v
