import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import InterestQuizScreen from '../screens/InterestQuizScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import NewTripScreen from '../screens/NewTripScreen';
import TripQuestionnaireScreen from '../screens/TripQuestionnaireScreen';
import TripPreviewScreen from '../screens/TripPreviewScreen';
import EditActivitiesScreen from '../screens/EditActivitiesScreen';
import TripRouteViewScreen from '../screens/TripRouteViewScreen';
import TripDayListViewScreen from '../screens/TripDayListViewScreen';
import TravelDiaryScreen from '../screens/TravelDiaryScreen';
import TripMemoriesScreen from '../screens/TripMemoriesScreen';
import FriendsScreen from '../screens/FriendsScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import ShareTripScreen from '../screens/ShareTripScreen';
import TripListViewScreen from '../screens/TripListViewScreen';
import TripMapViewScreen from '../screens/TripMapViewScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManualTripBuilderScreen from '../screens/ManualTripBuilderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F4EBDC' },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="InterestQuiz" component={InterestQuizScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NewTrip" component={NewTripScreen} />
        <Stack.Screen name="TripQuestionnaire" component={TripQuestionnaireScreen} />
        <Stack.Screen name="ManualTripBuilder" component={ManualTripBuilderScreen} />
        <Stack.Screen name="TripPreview" component={TripPreviewScreen} />
        <Stack.Screen name="EditActivities" component={EditActivitiesScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="TripRouteView" component={TripRouteViewScreen} />
        <Stack.Screen name="TripDayListView" component={TripDayListViewScreen} />
        <Stack.Screen name="TravelDiary" component={TravelDiaryScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="TripMemories" component={TripMemoriesScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Friends" component={FriendsScreen} />
        <Stack.Screen name="AddFriend" component={AddFriendScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="ShareTrip" component={ShareTripScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="TripListView" component={TripListViewScreen} />
        <Stack.Screen name="TripMapView" component={TripMapViewScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
