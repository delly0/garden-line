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

export default function SendThoughtModal({ visible, onSend, onClose }) {
  const [thoughtType, setThoughtType] = useState('text');
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const soundRef = useRef(null);
  const [songLink, setSongLink] = useState('');

  const predefinedMessages = [
    'Thinking of you 💭',
    'Sending love 🌸',
    'You’ve got this 💪',
    'Hope you’re smiling today 😊',
    ];

    // Start recording
    const startRecording = async () => {
        try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await rec.startAsync();
        setRecording(rec);
        setRecordedUri(null); // reset any previous
        } catch (err) {
        console.log('Failed to start recording', err);
        }
    };

    // Stop recording
    const stopRecording = async () => {
        try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordedUri(uri);
        setRecording(null);
        } catch (err) {
        console.log('Failed to stop recording', err);
        }
    };

    // Play recorded audio
    const playSound = async () => {
        if (!recordedUri) return;
        if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
        soundRef.current = sound;
        await sound.playAsync();
    };

    // Cleanup sound on unmount
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

          {/* Thought type selector */}
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

          {/* Dynamic input based on type */}
          {thoughtType === 'text' && (
            <TextInput
              placeholder="Write a message..."
              value={text}
              onChangeText={setText}
              style={styles.input}
              multiline
            />
          )}

          {thoughtType === 'text' && (
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
            )}

          {thoughtType === 'image' && (
            <View style={styles.imageSection}>
              <Button title="Pick an image" onPress={handlePickImage} />
              {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
            </View>
          )}

          {/* {thoughtType === 'audio' && (
            <Text style={{ marginVertical: 10 }}>🎤 Voice recording (coming soon)</Text>
          )} */}
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
