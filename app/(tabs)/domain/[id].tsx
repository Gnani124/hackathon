import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { domains } from '@/data/domains';
import SkillCard from '@/components/SkillCard';
import RoadmapProgress from '@/components/RoadmapProgress';

export default function DomainDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [domain, setDomain] = useState(domains.find(d => d.id === id));
  const [isSaved, setIsSaved] = useState(false);

  if (!domain) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Domain not found</Text>
      </View>
    );
  }

  const toggleSavedStatus = () => {
    setIsSaved(!isSaved);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.headerContainer}>
        <Image 
          source={{ uri: domain.imageUrl }} 
          style={styles.headerImage} 
        />
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#fff" size={24} />
          </Pressable>
          <Pressable style={styles.saveButton} onPress={toggleSavedStatus}>
            <Bookmark 
              color="#fff" 
              size={24} 
              fill={isSaved ? "#fff" : "transparent"} 
            />
          </Pressable>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{domain.title}</Text>
            <Text style={styles.description}>{domain.description}</Text>
            <View style={styles.statContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{domain.skills.length}</Text>
                <Text style={styles.statLabel}>Skills</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{domain.timeToComplete}</Text>
                <Text style={styles.statLabel}>Est. Time</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{domain.difficulty}</Text>
                <Text style={styles.statLabel}>Difficulty</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <RoadmapProgress domain={domain} />
        </View>

        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Required Skills</Text>
          <Text style={styles.sectionDescription}>Master these skills to become proficient in {domain.title}</Text>
          
          {domain.skills.map((skill, index) => (
            <SkillCard 
              key={index} 
              skill={skill} 
              index={index} 
              color={domain.color}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerContainer: {
    height: 280,
    width: '100%',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  statContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  skillsSection: {
    marginBottom: 40,
  },
});