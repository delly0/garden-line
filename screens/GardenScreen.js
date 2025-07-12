import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import SkyGradient from '../components/SkyGradient';
import Clouds from '../components/Clouds';
import NightStarLayer from '../components/NightStarLayer';
import MoodLamp from '../components/MoodLamp';
import Sun from '../components/Sun';
import Moon from '../components/Moon';
import useCelestialPosition from '../utils/useCelestialPosition';
import useWeather from '../hooks/useWeather';
import ThoughtDetailModal from '../components/ThoughtDetailModal';
import GardenView from '../components/GardenView';
import * as Location from 'expo-location';

import { auth, db } from '../firebaseConfig';
import { collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const flowerSources = [
  require('../assets/lottie/flower1.json'),
  require('../assets/lottie/flower2.json'),
  require('../assets/lottie/flower3.json'),
  require('../assets/lottie/flower4.json'),
];


export default function GardenScreen() {
  const [coords, setCoords] = useState(null);
  const [moodColor, setMoodColor] = useState('#FFDDEE');
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [plantedFlowers, setPlantedFlowers] = useState([]);
  const { x, y } = useCelestialPosition(timeOfDay);
  const { weather } = useWeather();
  const [selectedThought, setSelectedThought] = useState(null);
  const userId = auth.currentUser?.uid;
  const [currentUserColor, setCurrentUserColor] = useState('#BAFFC9'); 

    useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setCoords({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
  const fetchUserColor = async () => {
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      setCurrentUserColor(userDoc.data().color || '#BAFFC9');
    }
  };
  fetchUserColor();
}, [auth.currentUser]);


  useEffect(() => {
    if (!userId) return;
    const gardenRef = collection(db, 'users', userId, 'garden');

    const unsubscribe = onSnapshot(gardenRef, (snapshot) => {
      const flowersFromDb = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlantedFlowers(flowersFromDb);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!weather) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const sunriseTime = parseTime12h(weather.sunrise);
    const sunsetTime = parseTime12h(weather.sunset);

    const sunriseMin = sunriseTime.hours * 60 + sunriseTime.minutes;
    const sunsetMin = sunsetTime.hours * 60 + sunsetTime.minutes;

    if (currentMinutes < sunriseMin) setTimeOfDay('night');
    else if (currentMinutes < sunriseMin + 60) setTimeOfDay('sunrise');
    else if (currentMinutes < sunsetMin - 60) setTimeOfDay('day');
    else if (currentMinutes < sunsetMin) setTimeOfDay('sunset');
    else setTimeOfDay('night');
  }, [weather]);

  function parseTime12h(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  }

  return (
    <View style={styles.container}>
      <SkyGradient timeOfDay={timeOfDay} />
      {(timeOfDay === 'day' || timeOfDay === 'sunrise') && (
        <Clouds show={true} cloud={weather?.cloud} />
      )}
      {(timeOfDay === 'night' || timeOfDay === 'sunset') && <NightStarLayer />}
      {timeOfDay === 'day' && <Sun x={x} y={y} />}
      {timeOfDay === 'night' && <Moon x={x} y={y} />}
      {timeOfDay === 'sunrise' && <Sun x={x} y={y} />}
      {timeOfDay === 'sunset' && <Moon x={x} y={y} />}

      <View style={styles.ground} />

      {/* <MoodLamp currentUserColor={currentUserColor} /> */}

      <GardenView
        flowers={plantedFlowers.map((f) => ({
          ...f,
          source: flowerSources[f.sourceIndex],
        }))}
        onPressFlower={(thought) => setSelectedThought(thought)}
      />

      <ThoughtDetailModal thought={selectedThought} onClose={() => setSelectedThought(null)} />
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
});

