import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, Circle } from 'lucide-react-native';

interface RoadmapItem {
  title: string;
  completed: boolean;
}

interface StudentRoadmapProps {
  items: RoadmapItem[];
}

export function StudentRoadmap({ items }: StudentRoadmapProps) {
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Academic Roadmap</Text>
      <View style={styles.timeline}>
        {items.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              {item.completed ? (
                <CheckCircle2 size={24} color="#10B981" />
              ) : (
                <Circle size={24} color="#6B7280" />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text style={[
                styles.timelineTitle,
                item.completed && styles.completedTitle
              ]}>
                {item.title}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  completedTitle: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },
}); 