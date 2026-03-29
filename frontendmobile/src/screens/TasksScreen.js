import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardHeader from '../components/DashboardHeader';
import InProgressBanner from '../components/InProgressBanner';
import MusicPlayerMobile from '../components/MusicPlayerMobile';

export default function TasksScreen({ navigation, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(true);
  const appState = useRef(AppState.currentState);
  const pollingInterval = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    loadUser();
    fetchTasks();

    // Start polling every 60 seconds when app is active
    startPolling();

    // Listen for app state changes (foreground/background)
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      setIsMounted(false);
      stopPolling();
      subscription.remove();
    };
  }, []);

  const startPolling = () => {
    // Clear any existing interval
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    // Poll every 20 seconds
    pollingInterval.current = setInterval(() => {
      if (appState.current === 'active') {
        fetchTasks();
      }
    }, 20000);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground, refresh immediately and restart polling
      fetchTasks();
      startPolling();
    } else if (nextAppState.match(/inactive|background/)) {
      // App went to background, stop polling to save battery
      stopPolling();
    }
    appState.current = nextAppState;
  };

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData && isMounted) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks?status=in_progress');
      if (isMounted) {
        setTasks(response.data);
      }
    } catch (error) {
      // Silently fail for background polling, only show error on manual refresh
      if (refreshing && isMounted) {
        Alert.alert('Error', 'Failed to load tasks');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    onLogout();
  };

  const completeTask = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}`, { 
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      if (isMounted) {
        fetchTasks();
      }
    } catch (error) {
      if (isMounted) {
        Alert.alert('Error', 'Failed to complete task');
      }
    }
  };

  const cancelTask = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}`, { 
        status: 'todo',
        started_at: null
      });
      if (isMounted) {
        fetchTasks();
      }
    } catch (error) {
      if (isMounted) {
        Alert.alert('Error', 'Failed to cancel task');
      }
    }
  };

  // Get the first in-progress task for the banner
  const currentTask = tasks.length > 0 ? tasks[0] : null;

  return (
    <DashboardLayout
      header={
        <>
          <DashboardHeader user={user} onLogout={handleLogout} />
        </>
      }
      content={
        <InProgressBanner 
          task={currentTask} 
          onComplete={completeTask}
          onCancel={cancelTask}
        />
      }
      footer={<MusicPlayerMobile />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2d0f0f',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff5f0',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffd4d4',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#c85050',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d0f0f',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#ff9800',
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#c85050',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});
