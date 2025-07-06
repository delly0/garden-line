import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, Button, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';



export default function ThoughtDetailModal({ thought, onClose }) {
  if (!thought) return null;
  const { width } = Dimensions.get('window');

  const readableDate = new Date(thought.timestamp).toLocaleString();

  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);

  // Load the audio when modal opens and thought is audio
  useEffect(() => {
    if (thought.type === 'audio' && typeof thought.content === 'string') {
      const loadSound = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync({ uri: thought.content });
          soundRef.current = sound;

          // Listen for playback status updates to update isPlaying
          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) return;
            setIsPlaying(status.isPlaying);
          });
        } catch (error) {
          console.log('Error loading audio', error);
        }
      };

      loadSound();

      // Cleanup on unmount or thought change
      return () => {
        if (soundRef.current) {
          soundRef.current.unloadAsync();
          soundRef.current = null;
          setIsPlaying(false);
        }
      };
    }
  }, [thought]);

  const handlePlayPause = async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.log('Error in play/pause', error);
    }
  };

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.label}>From: {thought.sender}</Text>
          <Text style={styles.date}>{readableDate}</Text>
          <View style={styles.content}>
            {thought.type === 'text' && typeof thought.content === 'string' && (
              <Text style={styles.message}>{thought.content}</Text>
            )}

            {thought.type === 'image' && typeof thought.content === 'string' && (
              <Image source={{ uri: thought.content }} style={styles.image} />
            )}

            {thought.type === 'audio' && typeof thought.content === 'string' && (
              <View style={{ alignItems: 'center' }}>
                <Button
                  title={isPlaying ? 'Pause Audio' : 'Play Audio'}
                  onPress={handlePlayPause}
                />
              </View>
            )}
            {thought.type === 'song' && typeof thought.content === 'string' && (() => {
              const rawUrl = thought.content;
              const trackId = extractTrackId(rawUrl);

              if (!trackId) {
                return <Text style={{ color: 'red' }}>⚠️ Invalid Spotify link</Text>;
              }

              return (
                <View style={{ height: 100, overflow: 'hidden', borderRadius: 12 }}>
                  <WebView
                    source={{ uri: `https://open.spotify.com/embed/track/${trackId}` }}
                    style={{ width: width * 0.8, height: 100 }}
                    javaScriptEnabled={true}
                    scrollEnabled={false}
                  />
                </View>
              );
            })()}


          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Helper to extract Spotify track ID from URL/URI
function extractTrackId(url) {
  if (!url) return '';
  let match = url.match(/track\/([a-zA-Z0-9]+)/);
  if (match && match[1]) return match[1];
  match = url.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (match && match[1]) return match[1];
  return '';
}


const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    elevation: 10,
  },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  date: { fontSize: 12, color: '#888', marginBottom: 10 },
  message: { fontSize: 16 },
  content: { marginBottom: 20 },
  closeBtn: { alignItems: 'center' },
  closeText: { color: '#666' },
  image: { width: 200, height: 200, borderRadius: 12 },
});