import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Floating Butterflies Component
const FloatingButterflies = () => {
  const butterflies = [
    { top: '15%', left: '10%', size: 28, opacity: 0.5, duration: 4000 },
    { top: '25%', right: '15%', size: 24, opacity: 0.4, duration: 4500 },
    { top: '60%', left: '85%', size: 22, opacity: 0.45, duration: 5000 },
    { top: '70%', right: '75%', size: 26, opacity: 0.35, duration: 5500 },
    { top: '80%', left: '20%', size: 20, opacity: 0.4, duration: 6000 },
    { top: '40%', left: '50%', size: 24, opacity: 0.3, duration: 6500 },
  ];

  return (
    <View style={styles.butterfliesContainer}>
      {butterflies.map((butterfly, index) => {
        const animatedValue = new Animated.Value(0);
        
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: butterfly.duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: butterfly.duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();

        const translateY = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        });

        return (
          <Animated.Text
            key={index}
            style={[
              styles.butterfly,
              {
                top: butterfly.top,
                left: butterfly.left,
                right: butterfly.right,
                fontSize: butterfly.size,
                opacity: butterfly.opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            🦋
          </Animated.Text>
        );
      })}
    </View>
  );
};

export default function DashboardLayout({ header, content, footer }) {
  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#2d0f0f', '#4a1a1a', '#6b2828', '#8b3a3a', '#a85050']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />
      
      {/* Floating Butterflies */}
      <FloatingButterflies />
      
      {/* Header Slot */}
      {header && <View style={styles.headerSlot}>{header}</View>}
      
      {/* Content Slot - Centered */}
      <View style={styles.contentSlot}>{content}</View>
      
      {/* Footer Slot */}
      {footer && <View style={styles.footerSlot}>{footer}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d0f0f',
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  butterfliesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  butterfly: {
    position: 'absolute',
  },
  headerSlot: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  contentSlot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  footerSlot: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
});
