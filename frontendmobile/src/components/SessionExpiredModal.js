import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

export default function SessionExpiredModal({ visible, onLogout }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for warning icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {}} // Prevent closing with back button
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Warning Icon */}
          <Animated.Text
            style={[
              styles.warningIcon,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            ⚠️
          </Animated.Text>

          {/* Title */}
          <Text style={styles.title}>Session Expired</Text>

          {/* Message */}
          <Text style={styles.message}>
            Your session has expired due to inactivity. For your security, you
            need to log in again to continue.
          </Text>

          {/* Logout Button */}
          <TouchableOpacity style={styles.button} onPress={onLogout}>
            <Text style={styles.buttonText}>OK, Log Me Out</Text>
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoText}>
            You'll be redirected to the login page
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#2d1418',
    borderRadius: 16,
    padding: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 71, 87, 0.5)',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 60,
    elevation: 20,
  },
  warningIcon: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4757',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#f5e6d3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#ff4757',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoText: {
    fontSize: 12,
    color: '#a89080',
    textAlign: 'center',
    marginTop: 16,
  },
});
