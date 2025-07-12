import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import SendThoughtModal from '../components/SendThoughtModal';
import GardenView from '../components/GardenView';
import SkyGradient from '../components/SkyGradient';
import Clouds from '../components/Clouds';
import NightStarLayer from '../components/NightStarLayer';
import MoodLamp from '../components/MoodLamp';
import Sun from '../components/Sun';
import Moon from '../components/Moon';
import useCelestialPosition from '../utils/useCelestialPosition';
import useWeather from '../hooks/useWeather';

import { auth, db } from '../firebaseConfig';
import { collection, addDoc, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const flowerSources = [
  require('../assets/lottie/flower1.json'),
  require('../assets/lottie/flower2.json'),
  require('../assets/lottie/flower3.json'),
  require('../assets/lottie/flower4.json'),
];

export default function FriendGardenScreen({ route }) {
  const { userId, userName } = route.params;
  const [flowers, setFlowers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [moodColor, setMoodColor] = useState('#FFDDEE');
  const [timeOfDay, setTimeOfDay] = useState('day');

  const [friendCoords, setFriendCoords] = useState(null);

  // Get friend’s saved lat/lon
  useEffect(() => {
    const userDoc = doc(db, 'users', userId);
    getDoc(userDoc).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFriendCoords({ lat: data.lat, lon: data.lon });
      }
    });
  }, [userId]);

  const { weather } = useWeather(friendCoords?.lat, friendCoords?.lon);

  
  const { x, y } = useCelestialPosition(timeOfDay);
  

  useEffect(() => {
    if (!userId) return;
    const gardenRef = collection(db, 'users', userId, 'garden');
    const unsubscribe = onSnapshot(gardenRef, (snapshot) => {
      const flowersFromDb = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlowers(flowersFromDb);
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

  const plantThoughtFlower = async (thought) => {
  if (!userId) return;

  const sourceIndex = Math.floor(Math.random() * flowerSources.length);
  const left = Math.random() * 0.8 + 0.1;

  const screenHeight = Dimensions.get('window').height;
  const groundTopY = screenHeight * 0.40;
  const top = groundTopY + Math.random() * (screenHeight * 0.45 - width * 0.25);

  const flowerData = {
    left,
    top,
    sourceIndex,
    thought: {
      ...thought,
      sender: auth.currentUser?.displayName || auth.currentUser?.email || 'Anonymous',
      timestamp: Date.now(),
    },
  };

  try {
    // Save flower in friend's garden
    await addDoc(collection(db, 'users', userId, 'garden'), flowerData);

    // 💬 Also send a flower message to the chat
    const chatId = [auth.currentUser.uid, userId].sort().join('_');
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: auth.currentUser.uid,
      type: 'flower',
      thought: flowerData.thought, // include the thought message
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.log('Error planting flower or sending message:', error);
  }
};


  return (
    <View style={styles.container}>
      <SkyGradient timeOfDay={timeOfDay} />
      {(timeOfDay === 'day' || timeOfDay === 'sunrise') && (
        <Clouds show={true} cloud={weather?.cloud} />
      )}
      {(timeOfDay === 'sunset' || timeOfDay === 'night') && <NightStarLayer />}
      {/* <MoodLamp color={moodColor} /> */}
      {timeOfDay === 'day' && <Sun x={x} y={y} />}
      {timeOfDay === 'night' && <Moon x={x} y={y} />}
      {timeOfDay === 'sunrise' && <Sun x={x} y={y} />}
      {timeOfDay === 'sunset' && <Moon x={x} y={y} />}

      <View style={styles.ground} />

      <GardenView
        flowers={flowers.map((f) => ({
          ...f,
          source: flowerSources[f.sourceIndex],
        }))}
        onPressFlower={() => {}}
      />

      <TouchableOpacity onPress={() => setShowModal(true)} style={styles.plantButton}>
        <Text style={styles.plantButtonText}>Plant Flower 🌸</Text>
      </TouchableOpacity>

      <View style={styles.colorPicker}>
        {['#FFDDEE', '#B2F7EF', '#FFF1A5', '#D0F0C0'].map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => setMoodColor(color)}
            style={[styles.colorCircle, { backgroundColor: color }]}
          />
        ))}
      </View>

      <SendThoughtModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSend={plantThoughtFlower}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
});

