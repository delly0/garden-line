import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import NightStarLayer from '../components/NightStarLayer';
import SkyGradient from '../components/SkyGradient';
import Clouds from '../components/Clouds';
import useCelestialPosition from '../utils/useCelestialPosition';
import Sun from '../components/Sun';
import Moon from '../components/Moon';
import MoodLamp from '../components/MoodLamp';
import useWeather from '../hooks/useWeather';
import SendThoughtModal from '../components/SendThoughtModal';
import ThoughtDetailModal from '../components/ThoughtDetailModal';

const { width } = Dimensions.get('window');

const flowerSources = [
  require('../assets/lottie/flower1.json'),
  require('../assets/lottie/flower2.json'),
  require('../assets/lottie/flower3.json'),
  require('../assets/lottie/flower4.json'),
];

export default function GardenScreen() {
  const [moodColor, setMoodColor] = useState('#FFDDEE');
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [plantedFlowers, setPlantedFlowers] = useState([]);
  const { x, y } = useCelestialPosition(timeOfDay);
  const { weather, error } = useWeather();
  const [showThoughtModal, setShowThoughtModal] = useState(false);
  const [selectedThought, setSelectedThought] = useState(null);

  const plantThoughtFlower = (thought) => {
    const source = flowerSources[Math.floor(Math.random() * flowerSources.length)];
    const left = Math.random() * 0.8 + 0.1;

    const screenHeight = Dimensions.get('window').height;
    const groundTopY = screenHeight * 0.40;
    const top = groundTopY + Math.random() * (screenHeight * 0.45 - width * 0.25);

    const newFlower = {
      id: Date.now().toString(),
      source,
      left,
      top,
      thought,
    };

    setPlantedFlowers((prev) => [...prev, newFlower]);
  };


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
  // e.g. "6:00 AM" or "7:01 PM"
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

  return (
    <View style={styles.container}>
      <SkyGradient timeOfDay={timeOfDay} />
      {(timeOfDay === 'day' || timeOfDay === 'sunrise') && (
        <Clouds show={true} cloud={weather?.cloud} />
      )}

      {(timeOfDay === 'night' || timeOfDay === 'sunset') && (
        <NightStarLayer />
      )}

      <MoodLamp color={moodColor} />

      {timeOfDay === 'day' && <Sun x={x} y={y} />}
      {timeOfDay === 'night' && <Moon x={x} y={y} />}
      {timeOfDay === 'sunrise' && <Sun x={x} y={y} />}
      {timeOfDay === 'sunset' && <Moon x={x} y={y} />}

      <View style={styles.ground} />

      {/* <Clouds show={timeOfDay === 'day' || timeOfDay === 'sunrise'} coverage={weather?.clouds?.all / 100 || 0} /> */}
      <Clouds show={timeOfDay === 'day' || timeOfDay === 'sunrise'} coverage={(weather?.cloud || 0) / 100} />


      {plantedFlowers.map((flower) => (
        <TouchableOpacity key={flower.id} onPress={() => setSelectedThought(flower.thought)}>
          <LottieView
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
        </TouchableOpacity>
      ))}

      <View style={styles.timeToggle}>
        {['sunrise', 'day', 'sunset', 'night'].map((t) => (
          <TouchableOpacity key={t} onPress={() => setTimeOfDay(t)} style={styles.timeButton}>
            <Text style={styles.timeText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => setShowThoughtModal(true)} style={styles.plantButton}>
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
        visible={showThoughtModal}
        onClose={() => setShowThoughtModal(false)}
        onSend={(message) => {
          plantThoughtFlower(message);
        }}
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

