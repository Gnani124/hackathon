import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Users, Award, ChevronRight, ArrowLeft, Bookmark, Share2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { domains } from '../../../data/domains';
import { colors } from '../../../constants/colors';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 300;
const NAVBAR_HEIGHT = 60;

export default function DomainDetailScreen() {
  const { id } = useLocalSearchParams();
  const domain = domains.find(d => d.id === id);
  const scrollY = useRef(new Animated.Value(0)).current;

  if (!domain) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Domain not found</Text>
      </SafeAreaView>
    );
  }

  const handleBackPress = () => {
    router.back();
  };

  const handleSkillPress = (skillId: string) => {
    // Navigate to skill detail page (to be implemented)
    console.log('Navigate to skill:', skillId);
  };

  // Animation interpolations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - NAVBAR_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const navbarOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - NAVBAR_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - NAVBAR_HEIGHT],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Navigation Bar */}
      <Animated.View style={[styles.navbar, { opacity: navbarOpacity }]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <View style={styles.navbarContent}>
          <Pressable style={styles.navbarBackButton} onPress={handleBackPress}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.navbarTitle} numberOfLines={1}>{domain.title}</Text>
          <View style={styles.navbarActions}>
            <Pressable style={styles.navbarAction}>
              <Bookmark size={20} color={colors.textPrimary} />
            </Pressable>
            <Pressable style={styles.navbarAction}>
              <Share2 size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ scale: headerScale }] }]}>
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <Image source={{ uri: domain.imageUrl }} style={styles.headerImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.headerGradient}
          />
          <View style={styles.headerContent}>
            <Text style={styles.title}>{domain.title}</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Users size={16} color={colors.card} />
                <Text style={styles.statText}>{domain.skills.length} skills</Text>
              </View>
              <View style={styles.stat}>
                <Clock size={16} color={colors.card} />
                <Text style={styles.statText}>{domain.timeToComplete}</Text>
              </View>
              <View style={styles.stat}>
                <Award size={16} color={colors.card} />
                <Text style={styles.statText}>{domain.difficulty}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Domain</Text>
          <Text style={styles.description}>{domain.description}</Text>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills You'll Learn</Text>
          {domain.skills.map((skill) => (
            <Pressable
              key={skill.id}
              style={styles.skillCard}
              onPress={() => handleSkillPress(skill.id)}
            >
              <BlurView intensity={10} style={styles.skillContent}>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillTitle}>{skill.title}</Text>
                  <Text style={styles.skillDescription} numberOfLines={2}>
                    {skill.description}
                  </Text>
                  <View style={styles.skillMeta}>
                    <Text style={styles.skillLevel}>{skill.level}</Text>
                    <Text style={styles.skillTime}>{skill.estimatedTime}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </BlurView>
            </Pressable>
          ))}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 300,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: colors.card,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.card,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  skillCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  skillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
  },
  skillInfo: {
    flex: 1,
    marginRight: 12,
  },
  skillTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  skillDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  skillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skillLevel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.primary,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'capitalize',
  },
  skillTime: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 20,
  },
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: NAVBAR_HEIGHT,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navbarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  navbarBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbarTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginHorizontal: 12,
  },
  navbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navbarAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 