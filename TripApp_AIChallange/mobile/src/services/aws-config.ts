import { Amplify } from 'aws-amplify';

// AWS Location Services configuration
// Update these values after deploying the backend
export const configureAWS = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || '',
        userPoolClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '',
        region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
      },
    },
    Geo: {
      LocationService: {
        maps: {
          items: {
            [process.env.EXPO_PUBLIC_LOCATION_MAP_NAME || 'TripMapView']: {
              style: 'VectorEsriStreets',
            },
          },
          default: process.env.EXPO_PUBLIC_LOCATION_MAP_NAME || 'TripMapView',
        },
        searchIndices: {
          items: [process.env.EXPO_PUBLIC_LOCATION_PLACE_INDEX_NAME || 'TripPlaceIndex'],
          default: process.env.EXPO_PUBLIC_LOCATION_PLACE_INDEX_NAME || 'TripPlaceIndex',
        },
        region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
      },
    },
  });
};

export const getMapStyleURL = () => {
  const region = process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1';
  const mapName = process.env.EXPO_PUBLIC_LOCATION_MAP_NAME || 'TripMapView';
  return `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor`;
};
