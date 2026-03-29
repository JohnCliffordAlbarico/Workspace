import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';

export default function DashboardHeader({ user, onLogout }) {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || user.email?.split('@')[0] || 'User');
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: onLogout, style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.header}>
      {/* Logout Button - Top Right */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutIcon}>⎋</Text>
      </TouchableOpacity>

      <View style={styles.profileSection}>
        {/* Profile Avatar with Gradient */}
        <View style={styles.avatarContainer}>
          {user?.profile_img ? (
            <Image 
              source={{ uri: user.profile_img }} 
              style={styles.profileImage}
            />
          ) : (
            <Text style={styles.userIcon}>👤</Text>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userStatus}>On a roll today 🔥</Text>
        </View>
      </View>

      {/* Quote */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>
          "You don't lack discipline. You're surrounded by systems engineered to break it."
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    alignItems: 'center',
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(200, 80, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(200, 80, 80, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoutIcon: {
    fontSize: 24,
    color: '#ff4757',
  },
  profileSection: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#c85050',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(200, 80, 80, 0.6)',
    shadowColor: '#c85050',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  userIcon: {
    fontSize: 28,
    color: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  userStatus: {
    fontSize: 11,
    color: '#b47272',
  },
  quoteContainer: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(200, 80, 80, 0.2)',
  },
  quote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#d4a574',
    textAlign: 'center',
    lineHeight: 18,
  },
});
