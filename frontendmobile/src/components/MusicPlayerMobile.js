import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Import all music files from assets/musics folder
const playlist = [
  {
    id: 1,
    title: 'Dreams Traversed by Moonlight',
    artist: 'Genshin Impact',
    file: require('../../assets/musics/Dreams Traversed by Moonlight  Genshin Impact.mp3'),
  },
  {
    id: 2,
    title: 'Red Swan',
    artist: 'Attack on Titan',
    file: require('../../assets/musics/Red Swan (Attack on Titan anime theme).mp3'),
  },
];

export default function MusicPlayerMobile() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Configure audio mode for better performance
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Request notification permissions
    requestNotificationPermissions();

    // Listen for notification interactions
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      subscription.remove();
    };
  }, []);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
    }
  };

  const handleNotificationResponse = (response) => {
    const action = response.notification.request.content.data.action;
    
    if (action === 'play') {
      togglePlayPause();
    } else if (action === 'next') {
      playNext();
    } else if (action === 'previous') {
      playPrevious();
    }
  };

  const showMusicNotification = async (track) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: track.title,
        body: track.artist,
        sound: false,
        data: { action: 'play' },
        categoryIdentifier: 'music',
      },
      trigger: null,
    });
  };

  const loadAndPlaySound = async (index) => {
    // Prevent multiple loads
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Unload previous sound completely
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      // Load with optimized settings
      const { sound: newSound } = await Audio.Sound.createAsync(
        playlist[index].file,
        { 
          shouldPlay: true,
          progressUpdateIntervalMillis: 1000,
        },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      setCurrentTrackIndex(index);
      
      // Show notification with current track
      await showMusicNotification(playlist[index]);
    } catch (error) {
      console.error('Error loading sound:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded && status.didJustFinish && !isLoading) {
      // Auto-play next track
      playNext();
    }
  };

  const togglePlayPause = async () => {
    if (isLoading) return;

    if (!sound) {
      // Load and play first track
      await loadAndPlaySound(0);
      return;
    }

    try {
      // Don't check status, just toggle immediately
      if (isPlaying) {
        setIsPlaying(false);
        await sound.pauseAsync();
      } else {
        setIsPlaying(true);
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      // Revert state on error
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = async () => {
    if (isLoading) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    await loadAndPlaySound(nextIndex);
  };

  const playPrevious = async () => {
    if (isLoading) return;
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    await loadAndPlaySound(prevIndex);
  };

  const currentTrack = playlist[currentTrackIndex];

  return (
    <View style={styles.container}>
      <View style={styles.playerView}>
        {/* Album Art / Music Icon */}
        <View style={styles.albumArt}>
          <Text style={styles.musicIcon}>🎵</Text>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={playPrevious}>
            <Text style={styles.controlIcon}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={playNext}>
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  playerView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 80, 80, 0.3)',
    gap: 12,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 80, 80, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicIcon: {
    fontSize: 24,
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 12,
    color: '#b47272',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 18,
    color: '#fff',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#fff',
  },
});
