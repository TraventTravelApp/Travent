// User types
export interface User {
  user_id: string;
  email: string;
  quiz_results?: QuizResults;
  created_at: string;
}

export interface QuizResults {
  interests: string[];
}

// Trip types
export interface Trip {
  trip_id: string;
  user_id: string;
  type: 'location' | 'roadtrip';
  destination: string;
  start_date: string;
  end_date: string;
  preferences: TripPreferences;
  status: 'planned' | 'in_progress' | 'completed';
  itinerary: DayItinerary[];
  created_at: string;
  updated_at: string;
}

export interface TripPreferences {
  budget: number;
  activity_intensity: 1 | 2 | 3 | 4 | 5;
  solo_or_group: 'solo' | 'group';
  categories?: string[];
  include_gas?: boolean;
  scenic_route?: boolean;
}

export interface DayItinerary {
  day: number;
  date: string;
  activities: Activity[];
  totalCostUSD: number;
  transportMode?: 'walk' | 'subway' | 'taxi' | 'car' | 'none';
}

export interface Activity {
  name: string;
  type: string;
  durationHours: number;
  costUSD: number;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  InterestQuiz: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  NewTrip: undefined;
  TripQuestionnaire: { type: 'location' | 'roadtrip' };
  ManualTripBuilder: undefined;
  TripPreview: { tripId: string };
  EditActivities: { tripId: string; dayNumber: number };
  TripRouteView: { tripId: string };
  TripDayListView: { tripId: string };
  TravelDiary: { tripId: string };
  TripMemories: { tripId: string };
  Friends: undefined;
  AddFriend: undefined;
  ShareTrip: { friendId: string; friendName: string };
  TripListView: { tripId: string };
  TripMapView: { tripId: string };
  Profile: undefined;
};
