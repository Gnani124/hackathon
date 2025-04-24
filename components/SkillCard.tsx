import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Skill } from '@/data/domains';
import { BookOpen, Clock } from 'lucide-react-native';

interface SkillCardProps {
  skill: Skill;
  index: number;
  color: string;
}

export default function SkillCard({ skill, index, color }: SkillCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return '#10B981';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { borderLeftColor: color }]}
      activeOpacity={0.7}
      >
      <View style={styles.header}>
        <View style={styles.numberContainer}>
          <Text style={[styles.number, { color }]}>{index + 1}</Text>
          </View>
          <View style={styles.titleContainer}>
          <Text style={styles.title}>{skill.title}</Text>
          <View style={[styles.levelBadge, { backgroundColor: `${getLevelColor(skill.level)}20` }]}>
            <Text style={[styles.levelText, { color: getLevelColor(skill.level) }]}>
              {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
            </Text>
          </View>
        </View>
        </View>

        <Text style={styles.description}>{skill.description}</Text>
        
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.footerText}>{skill.estimatedTime}</Text>
              </View>
        <View style={styles.footerItem}>
          <BookOpen size={16} color="#6B7280" />
          <Text style={styles.footerText}>Resources</Text>
          </View>
    </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  number: {
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
});