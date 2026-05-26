class POI:
    def __init__(self, poi_id: str, name: str, city: str, country: str,
                 category: str, budget_level: str, activity_intensity: int,
                 lat: float = None, lon: float = None):
        self.poi_id = poi_id
        self.name = name
        self.city = city
        self.country = country
        self.category = category
        self.budget_level = budget_level
        self.activity_intensity = activity_intensity
        self.lat = lat
        self.lon = lon
    
    def to_dict(self):
        return {
            'poi_id': self.poi_id,
            'name': self.name,
            'city': self.city,
            'country': self.country,
            'category': self.category,
            'budget_level': self.budget_level,
            'activity_intensity': self.activity_intensity,
            'lat': self.lat,
            'lon': self.lon
        }
