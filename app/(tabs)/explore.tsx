import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions, TouchableOpacity, TextInput, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DomainCard from '../../components/DomainCard';
import FutureRoadmap from '../../components/profile/FutureRoadmap';
import { colors } from '../../constants/colors';
import { domains } from '../../data/domains';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Search, 
  BookOpen, 
  Code, 
  Database, 
  Smartphone, 
  Cpu, 
  Shield, 
  BarChart, 
  Briefcase, 
  GraduationCap,
  ChevronRight,
  Star,
  TrendingUp,
  Target,
  Zap,
  Users,
  Clock,
  Award,
  Sparkles,
  Rocket,
  Lightbulb
} from 'lucide-react-native';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

export default function ExploreScreen() {
  const [featuredDomain, setFeaturedDomain] = useState(domains[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const handleDomainPress = (domainId: string) => {
    router.push({
      pathname: "/(tabs)/domain/[id]",
      params: { id: domainId }
    });
  };

  const categories = [
    { id: 'all', name: 'All', icon: <BookOpen size={20} color={colors.primary} /> },
    { id: 'web', name: 'Web', icon: <Code size={20} color={colors.primary} /> },
    { id: 'data', name: 'Data', icon: <Database size={20} color={colors.primary} /> },
    { id: 'mobile', name: 'Mobile', icon: <Smartphone size={20} color={colors.primary} /> },
    { id: 'ai', name: 'AI', icon: <Cpu size={20} color={colors.primary} /> },
    { id: 'security', name: 'Security', icon: <Shield size={20} color={colors.primary} /> },
    { id: 'business', name: 'Business', icon: <Briefcase size={20} color={colors.primary} /> },
  ];

  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         domain.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    const categoryMap: Record<string, string[]> = {
      'web': ['Web Development'],
      'data': ['Data Science'],
      'mobile': ['Mobile Development'],
      'ai': ['AI & Machine Learning', 'Data Science'],
      'security': ['Cybersecurity'],
      'business': ['Business Analytics', 'Digital Marketing'],
    };
    
    return matchesSearch && categoryMap[selectedCategory]?.includes(domain.title);
  });

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Animated.ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Animated Header with gradient background */}
        <Animated.View style={[styles.headerGradient, { opacity: headerOpacity, transform: [{ scale: headerScale }] }]}>
          <LinearGradient
            colors={[colors.primary, colors.info]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Sparkles size={24} color="#FFFFFF" style={styles.titleIcon} />
              <Text style={styles.title}>Explore Careers</Text>
            </View>
            <Text style={styles.subtitle}>Discover your perfect career path</Text>
          </View>
          
          {/* Enhanced Search bar */}
          <View style={styles.searchContainer}>
            <BlurView intensity={20} style={styles.searchInputContainer}>
              <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search domains and skills..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </BlurView>
          </View>
          
          {/* Enhanced Category filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <BlurView intensity={selectedCategory === category.id ? 40 : 20} style={styles.categoryBlur}>
                  <View style={styles.categoryIcon}>{category.icon}</View>
                  <Text 
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText
                    ]}
                  >
                    {category.name}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Enhanced Featured Domain */}
        <View style={styles.featuredContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Rocket size={20} color={colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Featured Path</Text>
            </View>
          </View>
          <Pressable 
            style={styles.featuredCard}
            onPress={() => handleDomainPress(featuredDomain.id)}
          >
            <Image
              source={{ uri: featuredDomain.imageUrl }}
              style={styles.featuredImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.9)']}
              style={styles.overlay}
            />
            <View style={styles.featuredContent}>
              <View style={styles.featuredBadge}>
                <Star size={16} color="#FFFFFF" />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
              <Text style={styles.featuredTitle}>{featuredDomain.title}</Text>
              <Text style={styles.featuredDescription}>{featuredDomain.description}</Text>
              <View style={styles.featuredStats}>
                <View style={styles.featuredStat}>
                  <Users size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.featuredStatsText}>{featuredDomain.skills.length} skills</Text>
                </View>
                <Text style={styles.featuredStatsDot}>•</Text>
                <View style={styles.featuredStat}>
                  <Clock size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.featuredStatsText}>{featuredDomain.timeToComplete}</Text>
                </View>
                <Text style={styles.featuredStatsDot}>•</Text>
                <View style={styles.featuredStat}>
                  <Award size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.featuredStatsText}>{featuredDomain.difficulty}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Enhanced Career Paths */}
        <View style={styles.careerPathsContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Lightbulb size={20} color={colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Career Paths</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.careerPathsScroll}
          >
            {[
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
              {
                id: '4',
                title: 'Cybersecurity',
                description: 'Protect systems and data from cyber threats',
                icon: <Shield size={24} color={colors.warning} />,
                color: colors.warning,
                skills: ['Network Security', 'Ethical Hacking', 'Cryptography', 'Incident Response'],
                growth: 'Very High',
                salary: '$85k - $170k',
              },
              {
                id: '5',
                title: 'Mobile Development',
                description: 'Create mobile applications for iOS and Android',
                icon: <Smartphone size={24} color={colors.success} />,
                color: colors.success,
                skills: ['React Native', 'Swift', 'Kotlin', 'UI/UX Design'],
                growth: 'High',
                salary: '$75k - $140k',
              },
            ].map((path, index) => (
              <Pressable
                key={path.id}
                style={[styles.careerPathCard, { borderColor: path.color }]}
                onPress={() => handleDomainPress(path.id)}
              >
                <LinearGradient
                  colors={[`${path.color}10`, `${path.color}05`]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
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
                  <ChevronRight size={16} color={path.color} />
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Trending Skills Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <TrendingUp size={20} color={colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Trending Skills</Text>
            </View>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.trendingSkillsScroll}
          >
            {[
              { name: 'React Native', growth: '+45%', icon: <Code size={24} color={colors.primary} /> },
              { name: 'Machine Learning', growth: '+38%', icon: <Cpu size={24} color={colors.primary} /> },
              { name: 'Cloud Computing', growth: '+32%', icon: <Database size={24} color={colors.primary} /> },
              { name: 'Cybersecurity', growth: '+28%', icon: <Shield size={24} color={colors.primary} /> },
              { name: 'DevOps', growth: '+25%', icon: <Zap size={24} color={colors.primary} /> },
            ].map((skill, index) => (
              <View key={index} style={styles.trendingSkillCard}>
                <View style={styles.trendingSkillIcon}>{skill.icon}</View>
                <Text style={styles.trendingSkillName}>{skill.name}</Text>
                <Text style={styles.trendingSkillGrowth}>{skill.growth}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Learning Resources Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <BookOpen size={20} color={colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Learning Resources</Text>
            </View>
          </View>
          <View style={styles.resourcesGrid}>
            {[
              { title: 'Free Courses', count: '1,200+', icon: <GraduationCap size={24} color={colors.primary} /> },
              { title: 'Tutorials', count: '500+', icon: <Code size={24} color={colors.primary} /> },
              { title: 'Projects', count: '300+', icon: <Target size={24} color={colors.primary} /> },
              { title: 'Certifications', count: '50+', icon: <Award size={24} color={colors.primary} /> },
            ].map((resource, index) => (
              <View key={index} style={styles.resourceCard}>
                <View style={styles.resourceIcon}>{resource.icon}</View>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceCount}>{resource.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Community Highlights Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Users size={20} color={colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Community Highlights</Text>
            </View>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.communityScroll}
          >
            {[
              { title: 'Weekly Challenges', participants: '2.5k+', icon: <Target size={24} color={colors.primary} /> },
              { title: 'Study Groups', participants: '1.8k+', icon: <Users size={24} color={colors.primary} /> },
              { title: 'Mentorship', participants: '500+', icon: <GraduationCap size={24} color={colors.primary} /> },
              { title: 'Hackathons', participants: '300+', icon: <Zap size={24} color={colors.primary} /> },
            ].map((highlight, index) => (
              <View key={index} style={styles.communityCard}>
                <View style={styles.communityIcon}>{highlight.icon}</View>
                <Text style={styles.communityTitle}>{highlight.title}</Text>
                <Text style={styles.communityParticipants}>{highlight.participants} participants</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Personalized Recommendations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Sparkles size={20} color={colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Recommended for You</Text>
            </View>
          </View>
          <View style={styles.recommendationsContainer}>
            {domains.slice(0, 3).map((domain) => (
              <TouchableOpacity
                key={domain.id}
                style={styles.recommendationCard}
                onPress={() => handleDomainPress(domain.id)}
              >
                <Image
                  source={{ uri: domain.imageUrl }}
                  style={styles.recommendationImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.recommendationOverlay}
                />
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>{domain.title}</Text>
                  <Text style={styles.recommendationDescription} numberOfLines={2}>
                    {domain.description}
                  </Text>
                  <View style={styles.recommendationStats}>
                    <View style={styles.recommendationStat}>
                      <Clock size={14} color="#FFFFFF" />
                      <Text style={styles.recommendationStatText}>{domain.timeToComplete}</Text>
                    </View>
                    <View style={styles.recommendationStat}>
                      <Award size={14} color="#FFFFFF" />
                      <Text style={styles.recommendationStatText}>{domain.difficulty}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Enhanced Domains Section */}
        <View style={styles.domainsContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <GraduationCap size={20} color={colors.primary} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>All Domains</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {filteredDomains.length > 0 ? (
            <View style={styles.domainGrid}>
              {filteredDomains.map((domain) => (
                <Pressable
                  key={domain.id}
                  style={styles.domainCard}
                  onPress={() => handleDomainPress(domain.id)}
                >
                  <LinearGradient
                    colors={[`${colors.primary}10`, `${colors.primary}05`]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Image
                    source={{ uri: domain.imageUrl }}
                    style={styles.domainImage}
                  />
                  <View style={styles.domainContent}>
                    <Text style={styles.domainTitle}>{domain.title}</Text>
                    <Text style={styles.domainDescription} numberOfLines={2}>
                      {domain.description}
                    </Text>
                    <View style={styles.domainStats}>
                      <View style={styles.domainStat}>
                        <Users size={14} color={colors.primary} />
                        <Text style={styles.domainStatText}>{domain.skills.length} skills</Text>
                      </View>
                      <View style={styles.domainStat}>
                        <Clock size={14} color={colors.primary} />
                        <Text style={styles.domainStatText}>{domain.timeToComplete}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <BlurView intensity={20} style={styles.emptyStateContent}>
                <Search size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No domains found</Text>
                <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
              </BlurView>
            </View>
          )}
        </View>

        {/* Back to top button */}
        <TouchableOpacity 
          style={styles.backToTopButton}
          onPress={scrollToTop}
        >
          <LinearGradient
            colors={[colors.primary, colors.info]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Zap size={20} color="#FFFFFF" />
        </TouchableOpacity>
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
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#FFFFFF',
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  categoryButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedCategoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  featuredContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: colors.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  featuredTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredStatsText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 4,
  },
  featuredStatsDot: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 8,
  },
  careerPathsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  careerPathsScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  careerPathCard: {
    width: width * 0.75,
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
    overflow: 'hidden',
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
  backToTopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  domainsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
  },
  domainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  domainCard: {
    width: (width - 56) / 2,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  domainImage: {
    width: '100%',
    height: 120,
  },
  domainContent: {
    padding: 12,
  },
  domainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  domainDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  domainStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  domainStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  domainStatText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  trendingSkillsScroll: {
    marginTop: 16,
  },
  trendingSkillCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 160,
    alignItems: 'center',
  },
  trendingSkillIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingSkillName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  trendingSkillGrowth: {
    fontSize: 14,
    color: colors.success,
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  resourceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  resourceCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  communityScroll: {
    marginTop: 16,
  },
  communityCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 180,
  },
  communityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  communityParticipants: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recommendationsContainer: {
    marginTop: 16,
  },
  recommendationCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  recommendationImage: {
    width: '100%',
    height: '100%',
  },
  recommendationOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  recommendationContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  recommendationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  recommendationStats: {
    flexDirection: 'row',
    gap: 16,
  },
  recommendationStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendationStatText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
}); 