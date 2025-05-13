import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Polygon } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from './config';

// Liberdade neighborhood coordinates (approximate center)
const LIBERDADE_LOCATION = {
  latitude: -23.5605,
  longitude: -46.6392,
};

// Your current location (hardcoded for this example)
const CURRENT_LOCATION = {
  latitude: -23.550520,
  longitude: -46.633308,
};

// Hardcoded coordinates for demonstration
const DESTINATIONS = [
  { id: 1, coordinate: { latitude: -23.550520, longitude: -46.633308 }, title: 'São Paulo' },
  { id: 2, coordinate: { latitude: -22.906847, longitude: -43.172897 }, title: 'Rio de Janeiro' },
  { id: 3, coordinate: { latitude: -19.916681, longitude: -43.934493 }, title: 'Belo Horizonte' },
  { id: 4, coordinate: { latitude: -23.5577, longitude: -46.6396 }, title: 'Liberdade' },
  { id: 5, coordinate: { latitude: -23.5882, longitude: -46.6324 }, title: 'Vila Mariana', color: 'blue' },
];

export default function App() {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [neighborhoodBoundaries, setNeighborhoodBoundaries] = useState([]);

  useEffect(() => {
    getLiberdadeBoundaries();
  }, []);

  const getLiberdadeBoundaries = async () => {
    try {
      // Search for Liberdade neighborhood
      const placesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Liberdade neighborhood São Paulo&location=${LIBERDADE_LOCATION.latitude},${LIBERDADE_LOCATION.longitude}&radius=1000&key=${GOOGLE_MAPS_API_KEY}`
      );
      const placesData = await placesResponse.json();

      if (placesData.results && placesData.results[0]) {
        const placeId = placesData.results[0].place_id;

        // Get place details including geometry
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`
        );
        const detailsData = await detailsResponse.json();

        if (detailsData.result?.geometry?.bounds) {
          const bounds = detailsData.result.geometry.bounds;
          // Create a more detailed polygon with more points for better shape
          const coordinates = [
            { latitude: bounds.northeast.lat, longitude: bounds.southwest.lng },
            { latitude: bounds.northeast.lat, longitude: bounds.northeast.lng },
            { latitude: bounds.southwest.lat, longitude: bounds.northeast.lng },
            { latitude: bounds.southwest.lat, longitude: bounds.southwest.lng },
            // Add intermediate points for better shape
            { latitude: (bounds.northeast.lat + bounds.southwest.lat) / 2, longitude: bounds.northeast.lng },
            { latitude: bounds.southwest.lat, longitude: (bounds.northeast.lng + bounds.southwest.lng) / 2 },
            { latitude: (bounds.northeast.lat + bounds.southwest.lat) / 2, longitude: bounds.southwest.lng },
            { latitude: bounds.northeast.lat, longitude: (bounds.northeast.lng + bounds.southwest.lng) / 2 },
          ];
          setNeighborhoodBoundaries(coordinates);
        }
      }
    } catch (error) {
      console.error('Error fetching Liberdade boundaries:', error);
      Alert.alert('Error', 'Failed to fetch Liberdade neighborhood boundaries');
    }
  };

  const getDirections = async () => {
    try {
      setIsLoading(true);

      // Create waypoints string for all destinations except the last one
      const waypoints = DESTINATIONS.slice(0, -1).map(dest =>
        `${dest.coordinate.latitude},${dest.coordinate.longitude}`
      ).join('|');

      // Use Google Directions API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${CURRENT_LOCATION.latitude},${CURRENT_LOCATION.longitude}&destination=${DESTINATIONS[DESTINATIONS.length-1].coordinate.latitude},${DESTINATIONS[DESTINATIONS.length-1].coordinate.longitude}&waypoints=${waypoints}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.routes && data.routes[0]) {
        // Decode the polyline points
        const points = data.routes[0].overview_polyline.points;
        const coordinates = decodePolyline(points);
        setRouteCoordinates(coordinates);
      } else {
        Alert.alert('Error', 'No route found');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Error', 'Failed to fetch route');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to decode Google's polyline format
  const decodePolyline = (encoded) => {
    // list of points
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let shift = 0, result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (index < len && encoded.charCodeAt(index - 1) >= 0x20);

      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (index < len && encoded.charCodeAt(index - 1) >= 0x20);

      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5
      });
    }

    return points;
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: LIBERDADE_LOCATION.latitude,
          longitude: LIBERDADE_LOCATION.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        apiKey={GOOGLE_MAPS_API_KEY}
      >
        {/* Current Location Marker */}
        <Marker
          coordinate={CURRENT_LOCATION}
          title="Current Location"
          pinColor="blue"
        />

        {/* Destination Markers */}
        {DESTINATIONS.map((destination) => (
          <Marker
            key={destination.id}
            coordinate={destination.coordinate}
            title={destination.title}
            pinColor={destination.color || 'red'}
          />
        ))}

        {/* Route Line */}
        {routeCoordinates.length > 0 && (
          <MapView.Polyline
            coordinates={routeCoordinates}
            strokeWidth={3}
            strokeColor="red"
          />
        )}

        {/* Liberdade Neighborhood Polygon */}
        {neighborhoodBoundaries.length > 0 && (
          <Polygon
            coordinates={neighborhoodBoundaries}
            strokeColor="green"
            fillColor="rgba(0, 255, 0, 0.2)"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading route...</Text>
        ) : (
          <Button
            title="Show Route Through All Points"
            onPress={getDirections}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    textAlign: 'center',
    padding: 10,
  },
});