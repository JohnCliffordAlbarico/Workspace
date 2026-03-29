import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function InProgressBanner({ task }) {
  const [duration, setDuration] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [isMounted, setIsMounted] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setIsMounted(true);
    
    // Pulse animation for badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
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

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!task?.started_at || !isMounted) {
      setDuration('');
      setMetrics(null);
      return;
    }

    const updateTimer = () => {
      if (!isMounted) return;

      try {
        const start = new Date(task.started_at);
        const now = new Date();
        const diff = now - start;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        setDuration(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );

        const elapsedMinutes = Math.floor(diff / 60000);
        
        if (task.goal_time_minutes) {
          const percentage = Math.min(100, (elapsedMinutes / task.goal_time_minutes) * 100);
          const remaining = task.goal_time_minutes - elapsedMinutes;
          
          setMetrics({
            elapsed: elapsedMinutes,
            goal: task.goal_time_minutes,
            percentage: percentage.toFixed(0),
            remaining: remaining,
            isOvertime: remaining < 0,
            hasGoal: true
          });
        } else {
          setMetrics({
            elapsed: elapsedMinutes,
            hasGoal: false
          });
        }
      } catch (error) {
        console.error('Timer update error:', error);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [task, isMounted]);

  if (!task) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyBadge}>
          <Text style={styles.emptyBadgeText}>NO TASK</Text>
        </View>
        <Text style={styles.emptyTitle}>Ready to work?</Text>
        <Text style={styles.emptyDescription}>
          Start a task from your dashboard to begin tracking
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Animated.View style={[styles.statusBadge, { opacity: pulseAnim }]}>
          <Text style={styles.statusText}>🔄 In Progress</Text>
        </Animated.View>
      </View>

      {/* Task Title */}
      <Text style={styles.title}>{task.title}</Text>

      {/* Timer */}
      {duration && (
        <Text style={styles.timer}>⏱️ {duration}</Text>
      )}

      {/* Progress Section */}
      {metrics?.hasGoal && (
        <View style={styles.progressSection}>
          {/* Progress Info */}
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>Progress: {metrics.percentage}%</Text>
            <Text style={[
              styles.remainingText,
              metrics.isOvertime && styles.overtimeText
            ]}>
              {metrics.isOvertime 
                ? `⚠️ ${Math.abs(metrics.remaining)} min overtime`
                : `✓ ${metrics.remaining} min remaining`
              }
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(100, metrics.percentage)}%`,
                  backgroundColor: metrics.isOvertime ? '#ff4757' : '#ffa502'
                }
              ]}
            />
          </View>
        </View>
      )}

      {/* Time Details Grid */}
      <View style={styles.timeGrid}>
        <View style={styles.timeCard}>
          <Text style={styles.timeLabel}>ELAPSED</Text>
          <Text style={styles.timeValue}>{duration}</Text>
        </View>
        
        {metrics?.hasGoal && (
          <>
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>GOAL TIME</Text>
              <Text style={styles.timeValueNeutral}>
                {Math.floor(metrics.goal / 60)}h {metrics.goal % 60}m
              </Text>
            </View>
            
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>
                {metrics.isOvertime ? 'OVERTIME' : 'REMAINING'}
              </Text>
              <Text style={[
                styles.timeValue,
                metrics.isOvertime && styles.overtimeValue
              ]}>
                {Math.floor(Math.abs(metrics.remaining) / 60)}h {Math.abs(metrics.remaining) % 60}m
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 32,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 99, 72, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 165, 2, 0.4)',
    shadowColor: '#ffa502',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    width: '100%',
  },
  emptyBadge: {
    backgroundColor: 'rgba(120, 120, 120, 0.15)',
    borderWidth: 1,
    borderColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 28,
  },
  emptyBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    color: '#b47272',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  statusBadge: {
    alignSelf: 'center',
    backgroundColor: '#ffa502',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a0a0a',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f5e6d3',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 30,
  },
  timer: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffa502',
    fontFamily: 'monospace',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 13,
    color: '#f5e6d3',
  },
  remainingText: {
    fontSize: 13,
    color: '#ffa502',
  },
  overtimeText: {
    color: '#ff4757',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  timeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  timeCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 10,
    color: '#a89080',
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffa502',
    fontFamily: 'monospace',
  },
  timeValueNeutral: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f5e6d3',
    fontFamily: 'monospace',
  },
  overtimeValue: {
    color: '#ff4757',
  },
});
