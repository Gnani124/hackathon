import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { ArrowRight, Star, TrendingUp, Target } from 'lucide-react-native';
import { router } from 'expo-router';

interface CareerPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  skills: string[];
  growth: string;
  salary: string;
}

const careerPaths: CareerPath[] = [
  {
    id: '1',
    title: 'Full Stack Development',
    description: 'Build end-to-end web applications with modern technologies',
    icon: <Star size={24} color={colors.primary} />,
    color: colors.primary,
    skills: ['React', 'Node.js', 'TypeScript', 'Database Design'],
    growth: 'High',
    salary: '$80k - $150k',
  },
  {
    id: '2',
    title: 'Data Science & AI',
    description: 'Analyze data and build intelligent systems',
    icon: <TrendingUp size={24} color={colors.secondary} />,
    color: colors.secondary,
    skills: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization'],
    growth: 'Very High',
    salary: '$90k - $160k',
  },
  {
    id: '3',
    title: 'Cloud Architecture',
    description: 'Design and manage cloud infrastructure',
    icon: <Target size={24} color={colors.info} />,
    color: colors.info,
    skills: ['AWS', 'Azure', 'DevOps', 'System Design'],
    growth: 'High',
    salary: '$100k - $180k',
  },
];

export default function FutureRoadmap() {
  const handlePathPress = (pathId: string) => {
    router.push({
      pathname: "/(tabs)/domain/[id]",
      params: { id: pathId }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Future Career Paths</Text>
      <Text style={styles.subtitle}>Based on your interests and skills</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {careerPaths.map((path) => (
          <Pressable
            key={path.id}
            style={[styles.card, { borderColor: path.color }]}
            onPress={() => handlePathPress(path.id)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: `${path.color}20` }]}>
                {path.icon}
              </View>
              <Text style={[styles.pathTitle, { color: path.color }]}>{path.title}</Text>
            </View>
            
            <Text style={styles.description}>{path.description}</Text>
            
            <View style={styles.skillsContainer}>
              {path.skills.map((skill, index) => (
                <View key={index} style={[styles.skillTag, { backgroundColor: `${path.color}10` }]}>
                  <Text style={[styles.skillText, { color: path.color }]}>{skill}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Growth</Text>
                <Text style={[styles.statValue, { color: path.color }]}>{path.growth}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Salary Range</Text>
                <Text style={[styles.statValue, { color: path.color }]}>{path.salary}</Text>
              </View>
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.exploreText}>Explore Path</Text>
              <ArrowRight size={16} color={path.color} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  scrollView: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  card: {
    width: 300,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 2,
    borderStyle: 'solid',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  exploreText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
}); 