import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { USERS } from '../users';
import LottieView from 'lottie-react-native';

// Example shared garden data
const initialGarden = {
  alice: [],
  bob: [],
  charlie: [],
};

// In-memory store
const gardenStore = { ...initialGarden };

const flowerSources = [
  require('../assets/lottie/flower1.json'),
  require('../assets/lottie/flower2.json'),
  require('../assets/lottie/flower3.json'),
  require('../assets/lottie/flower4.json'),
];

const { width } = Dimensions.get('window');

export default function FriendGardenScreen({ route }) {
  const { userId, userName } = route.params;
  const [flowers, setFlowers] = useState([]);

  useEffect(() => {
    // Simulate fetching this user's garden
    setFlowers(gardenStore[userId] || []);
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{userName}'s Garden</Text>
      <View style={styles.garden}>
        {flowers.map((flower, idx) => (
          <LottieView
            key={idx}
            source={flower.source}
            autoPlay
            loop
            style={{
              position: 'absolute',
              width: width * 0.25,
              height: width * 0.25,
              left: flower.left * width,
              top: flower.top,
            }}
          />
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  gardenArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
    marginTop: 60,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 10,
  },
  flowerWrapper: {
    marginTop: 20,
  },
  plant: {
    width: width * 0.35,
    height: width * 0.35,
  },
  colorPicker: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  timeToggle: {
    position: 'absolute',
    top: 50,
    right: 10,
    flexDirection: 'row',
    backgroundColor: '#ffffffcc',
    padding: 6,
    borderRadius: 8,
    zIndex: 10,
    elevation: 10,
  },
  timeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#eee',
    marginHorizontal: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#333',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '45%',
    backgroundColor: '#A3C9A8',
  },
  plantButton: {
    position: 'absolute',
    bottom: 90,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    alignSelf: 'center',
    elevation: 5,
  },
  plantButtonText: {
    fontSize: 16,
    color: '#444',
  },
  friendText: { fontSize: 18 },
});

