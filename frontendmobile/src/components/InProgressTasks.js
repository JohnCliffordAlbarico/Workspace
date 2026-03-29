import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

export default function InProgressTasks({ tasks, loading, onComplete, onRefresh, refreshing }) {
  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.goal_time_minutes && (
          <Text style={styles.goalTime}>
            🎯 Goal: {item.goal_time_minutes} min
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => onComplete(item.id)}
      >
        <Text style={styles.completeButtonText}>✓</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#c85050" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⚡ In Progress</Text>
        <Text style={styles.taskCount}>{tasks.length}</Text>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No tasks in progress</Text>
            <Text style={styles.emptySubtext}>
              Start a task from your web dashboard
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffd4d4',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff5f0',
  },
  taskCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c85050',
    backgroundColor: 'rgba(200, 80, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listContent: {
    padding: 15,
    flexGrow: 1,
  },
  taskCard: {
    backgroundColor: 'rgba(45, 15, 20, 0.6)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(200, 80, 80, 0.3)',
  },
  taskContent: {
    flex: 1,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f5e6d3',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#b47272',
    marginBottom: 4,
  },
  goalTime: {
    fontSize: 12,
    color: '#ffa502',
    fontWeight: '600',
  },
  completeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  completeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#ffd4d4',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a89080',
    textAlign: 'center',
  },
});
