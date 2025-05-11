import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

// Hardcoded coordinates for demonstration
const DESTINATIONS = [
  { id: 1, coordinate: { latitude: -23.550520, longitude: -46.633308 }, title: 'São Paulo' },
  { id: 2, coordinate: { latitude: -22.906847, longitude: -43.172897 }, title: 'Rio de Janeiro' },
  { id: 3, coordinate: { latitude: -19.916681, longitude: -43.934493 }, title: 'Belo Horizonte' },
];

// Your current location (hardcoded for this example)
const CURRENT_LOCATION = {
  latitude: -23.550520,
  longitude: -46.633308,
};

export default function App() {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getDirections = async (startLoc, destinationLoc) => {
    try {
      setIsLoading(true);

      // Using OpenStreetMap's routing service
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLoc.longitude},${startLoc.latitude};${destinationLoc.longitude},${destinationLoc.latitude}?overview=full&geometries=geojson`
      );

      const data = await response.json();

      if (data.routes && data.routes[0]) {
        // Convert GeoJSON coordinates to the format expected by react-native-maps
        const coordinates = data.routes[0].geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        setRouteCoordinates(coordinates);
      } else {
        Alert.alert('Error', 'No route found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch route');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: CURRENT_LOCATION.latitude,
          longitude: CURRENT_LOCATION.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
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
      </MapView>

      <View style={styles.buttonContainer}>
        {isLoading ? (
          <Text style={styles.loadingText}>Loading route...</Text>
        ) : (
          <Button
            title="Show Route to São Paulo"
            onPress={() => getDirections(CURRENT_LOCATION, DESTINATIONS[0].coordinate)}
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