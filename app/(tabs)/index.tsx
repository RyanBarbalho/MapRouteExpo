import React, { useState } from 'react';
import { Button, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from 'react-native-maps';

interface RoutePoint {
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  info: string;
}

// Initial coordinates for São Paulo
const INITIAL_REGION = {
  latitude: -23.550520,
  longitude: -46.633308,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Hardcoded route coordinates with additional info
const ROUTE_COORDINATES: RoutePoint[] = [
  {
    latitude: -23.550520,
    longitude: -46.633308,
    title: "Starting Point",
    description: "São Paulo",
    info: "São Paulo is the largest city in Brazil and the main financial center of South America. This is where our journey begins."
  },
  {
    latitude: -23.557000,
    longitude: -46.639000,
    title: "Intermediate Point",
    description: "Route Point",
    info: "This is a key point in our route that helps shape the journey through the city's main districts."
  },
  {
    latitude: -23.560000,
    longitude: -46.645000,
    title: "End Point",
    description: "Destination",
    info: "Our final destination, located in a vibrant neighborhood with plenty of attractions and amenities."
  },
];

export default function TabOneScreen() {
  const [routeVisible, setRouteVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<RoutePoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleRoute = () => {
    setRouteVisible(!routeVisible);
  };

  const handleMarkerPress = (marker: RoutePoint) => {
    setSelectedMarker(marker);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Route Example</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={INITIAL_REGION}
        >
          {/* Starting Point Marker */}
          <Marker
            coordinate={ROUTE_COORDINATES[0]}
            title={ROUTE_COORDINATES[0].title}
            description={ROUTE_COORDINATES[0].description}
            pinColor="green"
            onPress={() => handleMarkerPress(ROUTE_COORDINATES[0])}
          />

          {/* Intermediate Point Marker */}
          <Marker
            coordinate={ROUTE_COORDINATES[1]}
            title={ROUTE_COORDINATES[1].title}
            description={ROUTE_COORDINATES[1].description}
            pinColor="orange"
            onPress={() => handleMarkerPress(ROUTE_COORDINATES[1])}
          />

          {/* End Point Marker */}
          <Marker
            coordinate={ROUTE_COORDINATES[2]}
            title={ROUTE_COORDINATES[2].title}
            description={ROUTE_COORDINATES[2].description}
            pinColor="red"
            onPress={() => handleMarkerPress(ROUTE_COORDINATES[2])}
          />

          {routeVisible && (
            <Polyline
              coordinates={ROUTE_COORDINATES}
              strokeColor="#000"
              strokeWidth={6}
            />
          )}
        </MapView>
      </View>

      {/* Modal for marker info */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMarker && (
              <>
                <Text style={styles.modalTitle}>{selectedMarker.title}</Text>
                <Text style={styles.modalDescription}>{selectedMarker.description}</Text>
                <Text style={styles.modalInfo}>{selectedMarker.info}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        <Button
          title={routeVisible ? "Hide Route" : "Show Route"}
          onPress={toggleRoute}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  mapContainer: {
    width: '100%',
    height: '70%',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalDescription: {
    fontSize: 18,
    color: '#666',
    marginBottom: 15,
  },
  modalInfo: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
