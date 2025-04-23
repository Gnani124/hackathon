import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Domain } from '@/data/domains';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface RoadmapProgressProps {
  domain: Domain;
}

export default function RoadmapProgress({ domain }: RoadmapProgressProps) {
  // Mock progress data - in a real app, this would come from user data
  const progress = {
    completed: 2,
    total: domain.skills.length,
  };

  const progressPercentage = Math.round((progress.completed / progress.total) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${progressPercentage}%`,
              backgroundColor: domain.color,
            }
          ]} 
        />
      </View>
      
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressText}>
          {progress.completed} of {progress.total} skills completed
        </Text>
        <Text style={styles.percentageText}>{progressPercentage}%</Text>
      </View>
      
      <View style={styles.skillsProgress}>
        {domain.skills.map((skill, index) => (
          <View key={skill.id} style={styles.skillProgressItem}>
            <View style={styles.skillProgressIcon}>
              {index < progress.completed ? (
                <CheckCircle2 size={20} color={domain.color} />
              ) : (
                <Circle size={20} color={colors.textSecondary} />
              )}
            </View>
            <Text 
              style={[
                styles.skillProgressText,
                index < progress.completed && { color: domain.color }
              ]}
            >
              {skill.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  skillsProgress: {
    gap: 12,
  },
  skillProgressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillProgressIcon: {
    marginRight: 12,
  },
  skillProgressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
}); 