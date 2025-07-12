import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Button,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

export default function SendThoughtModal({ visible, onSend, onClose }) {
  const [thoughtType, setThoughtType] = useState('text');
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const soundRef = useRef(null);
  const [songLink, setSongLink] = useState('');
  const [vibrations, setvibrations] = useState('');
  const [vibrationPattern, setVibrationPattern] = useState([]);

  const predefinedMessages = [
    'Thinking of you 💭',
    'Sending love 🌸',
    'You’ve got this 💪',
    'Hope you’re smiling today 😊',
  ];

  const addVibrationPulse = () => {
    // Append a fixed pulse duration (e.g. 200ms vibration + 100ms pause)
    // Pattern alternates vibration, pause, vibration, pause...
    // So add 200, 100 to pattern array
    setVibrationPattern((prev) => {
      if (prev.length === 0) {
        // Start with vibration 200ms
        return [200];
      } else if (prev.length % 2 === 1) {
        // Last was vibration, so add pause 100ms
        return [...prev, 100];
      } else {
        // Last was pause, add vibration 200ms
        return [...prev, 200];
      }
    });
  };

  const clearVibrationPattern = () => setVibrationPattern([]);


  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        isMeteringEnabled: false,
      });

      await rec.startAsync();
      setRecording(rec);
      setRecordedUri(null); // reset
    } catch (err) {
      console.log('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Upload to Firebase Storage
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage(getApp());
      const fileName = `audio/${Date.now()}.m4a`;
      const audioRef = ref(storage, fileName);

      await uploadBytes(audioRef, blob);
      const downloadURL = await getDownloadURL(audioRef);

      setRecordedUri(downloadURL); // Use public URL
    } catch (err) {
      console.log('Failed to stop recording or upload', err);
    }
  };

  const playSound = async () => {
    if (!recordedUri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (err) {
      console.log('Failed to play sound', err);
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handleSend = () => {
    let content;
    if (thoughtType === 'text') content = text;
    else if (thoughtType === 'image') content = imageUri;
    else if (thoughtType === 'song') content = songLink;
    else if (thoughtType === 'audio') content = recordedUri;
    // else if (thoughtType === 'vibration') {
    //   if (vibrationPattern.length === 0) return;
    //   content = vibrationPattern;
    // }

    if (!content) return;

    const newThought = {
      type: thoughtType,
      content,
      sender: 'You',
      timestamp: new Date().toISOString(),
    };

    onSend(newThought);

    // Reset
    setText('');
    setImageUri(null);
    setSongLink('');
    setRecordedUri(null);
    // setVibrationPattern([]);
    setThoughtType('text');
    onClose();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.header}>Send a Thought</Text>

          <View style={styles.tabs}>
            {['text', 'image', 'audio', 'song'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setThoughtType(type)}
                style={[styles.tab, thoughtType === type && styles.activeTab]}
              >
                <Text style={thoughtType === type ? styles.activeTabText : styles.tabText}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {thoughtType === 'text' && (
            <>
              <TextInput
                placeholder="Write a message..."
                value={text}
                onChangeText={setText}
                style={styles.input}
                multiline
              />
              <View style={styles.predefinedContainer}>
                <Text style={styles.predefinedLabel}>Quick messages:</Text>
                <View style={styles.predefinedList}>
                  {predefinedMessages.map((msg) => (
                    <TouchableOpacity
                      key={msg}
                      style={styles.predefinedButton}
                      onPress={() => setText(msg)}
                    >
                      <Text style={styles.predefinedText}>{msg}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {thoughtType === 'image' && (
            <View style={styles.imageSection}>
              <Button title="Pick an image" onPress={handlePickImage} />
              {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
            </View>
          )}

          {thoughtType === 'audio' && (
            <View style={{ marginVertical: 10, alignItems: 'center' }}>
              {!recording ? (
                <Button title="Start Recording" onPress={startRecording} />
              ) : (
                <Button title="Stop Recording" onPress={stopRecording} color="red" />
              )}

              {recordedUri && (
                <>
                  <Text style={{ marginTop: 10 }}>🎧 Recorded audio ready to send</Text>
                  <Button title="Play Recording" onPress={playSound} />
                </>
              )}
            </View>
          )}

          {thoughtType === 'song' && (
            <TextInput
              placeholder="Paste Spotify link"
              value={songLink}
              onChangeText={setSongLink}
              style={styles.input}
              placeholderTextColor="#555"
            />
          )}
          {/* {thoughtType === 'vibration' && (
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <Text style={{ marginBottom: 12, fontSize: 16 }}>
                Tap below to build your custom vibration pattern
              </Text>
              <TouchableOpacity
                onPress={addVibrationPulse}
                style={{
                  backgroundColor: '#ddd',
                  padding: 20,
                  borderRadius: 50,
                  marginBottom: 12,
                  width: 120,
                  alignItems: 'center',
                }}
              >
                <Text>Tap to add vibration</Text>
              </TouchableOpacity>

              <Text>Current pattern (ms): {vibrationPattern.join(', ') || 'Empty'}</Text>

              <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
                <Button title="Clear" onPress={clearVibrationPattern} />
                <Button
                  title="Send Vibration Touch"
                  onPress={handleSend}
                  disabled={vibrationPattern.length === 0}
                />
              </View>
            </View>
          )} */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
              <Text style={{ color: 'white' }}>Send</Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000077',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  tabText: {
    color: '#666',
  },
  activeTab: {
    backgroundColor: '#E0E0E0',
  },
  activeTabText: {
    fontWeight: '600',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  preview: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: {
    backgroundColor: '#222',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  predefinedContainer: { marginTop: 10 },
  predefinedLabel: { fontSize: 12, color: '#444', marginBottom: 4 },
  predefinedList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  predefinedButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  predefinedText: { fontSize: 13, color: '#333' },
});