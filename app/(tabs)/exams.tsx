import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  ViewStyle, 
  RefreshControl, 
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
  TextInput,
  Modal,
  Share,
  Alert
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Calendar, 
  Bell, 
  FileText, 
  ChevronRight, 
  Clock, 
  MapPin, 
  BookOpen, 
  Download, 
  Share2, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Brain,
  Bookmark,
  BarChart,
  Award,
  Zap,
  Users,
  Search,
  Filter,
  Plus,
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Share as ShareIcon,
  BookmarkPlus,
  CalendarPlus,
  FilePlus,
  BookPlus,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  BookmarkCheck,
  CalendarCheck,
  FileCheck
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { fetchExams, fetchUpcomingExams } from '@/services/examsService';
import { Exam } from '@/types';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { colors } from '@/constants/colors';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;

// Mock data for demonstration
const examTimetable = [
  {
    id: '1',
    subject: 'Advanced Mathematics',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '09:00 AM - 12:00 PM',
    venue: 'Hall A, Block 2',
    type: 'Final Exam',
    difficulty: 'High',
    topics: ['Calculus', 'Linear Algebra', 'Differential Equations'],
    professor: 'Dr. Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: '2',
    subject: 'Quantum Physics',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: '09:00 AM - 12:00 PM',
    venue: 'Hall B, Block 1',
    type: 'Final Exam',
    difficulty: 'Very High',
    topics: ['Wave Functions', 'Heisenberg Uncertainty', 'Quantum Tunneling'],
    professor: 'Prof. Michael Chen',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: '3',
    subject: 'Data Structures & Algorithms',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    time: '09:00 AM - 12:00 PM',
    venue: 'Lab 3, Block 3',
    type: 'Final Exam',
    difficulty: 'Medium',
    topics: ['Trees', 'Graphs', 'Dynamic Programming'],
    professor: 'Dr. Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: '4',
    subject: 'Machine Learning',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    time: '09:00 AM - 12:00 PM',
    venue: 'Hall C, Block 4',
    type: 'Final Exam',
    difficulty: 'High',
    topics: ['Neural Networks', 'Support Vector Machines', 'Clustering'],
    professor: 'Prof. David Kim',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  }
];

const examNotifications = [
  {
    id: '1',
    title: 'Exam Schedule Released',
    message: 'The final exam schedule for the current semester has been released. Please check your timetable.',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    type: 'schedule'
  },
  {
    id: '2',
    title: 'Exam Guidelines Updated',
    message: 'Please review the updated exam guidelines before your exams. New rules regarding electronic devices have been added.',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: 'guidelines'
  },
  {
    id: '3',
    title: 'Exam Venue Change',
    message: 'The venue for Quantum Physics exam has been changed to Hall B, Block 1 due to renovation work in the original venue.',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    type: 'venue'
  },
  {
    id: '4',
    title: 'Study Resources Available',
    message: 'Additional study resources for Advanced Mathematics are now available in the library and online portal.',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    read: false,
    type: 'resources'
  }
];

const previousPapers = [
  {
    id: '1',
    subject: 'Advanced Mathematics',
    year: '2022',
    semester: 'Fall',
    type: 'Final Exam',
    downloadUrl: '#',
    topics: ['Calculus', 'Linear Algebra'],
    difficulty: 'High',
    professor: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    subject: 'Quantum Physics',
    year: '2022',
    semester: 'Fall',
    type: 'Final Exam',
    downloadUrl: '#',
    topics: ['Wave Functions', 'Heisenberg Uncertainty'],
    difficulty: 'Very High',
    professor: 'Prof. Michael Chen'
  },
  {
    id: '3',
    subject: 'Data Structures & Algorithms',
    year: '2022',
    semester: 'Fall',
    type: 'Final Exam',
    downloadUrl: '#',
    topics: ['Trees', 'Graphs'],
    difficulty: 'Medium',
    professor: 'Dr. Emily Rodriguez'
  },
  {
    id: '4',
    subject: 'Machine Learning',
    year: '2022',
    semester: 'Fall',
    type: 'Final Exam',
    downloadUrl: '#',
    topics: ['Neural Networks', 'Support Vector Machines'],
    difficulty: 'High',
    professor: 'Prof. David Kim'
  }
];

const studyResources = [
  {
    id: '1',
    title: 'Mathematics Formula Sheet',
    type: 'PDF',
    subject: 'Advanced Mathematics',
    size: '2.5 MB',
    downloadUrl: '#'
  },
  {
    id: '2',
    title: 'Physics Problem Set',
    type: 'PDF',
    subject: 'Quantum Physics',
    size: '1.8 MB',
    downloadUrl: '#'
  },
  {
    id: '3',
    title: 'Algorithms Cheat Sheet',
    type: 'PDF',
    subject: 'Data Structures & Algorithms',
    size: '1.2 MB',
    downloadUrl: '#'
  },
  {
    id: '4',
    title: 'ML Concepts Summary',
    type: 'PDF',
    subject: 'Machine Learning',
    size: '3.1 MB',
    downloadUrl: '#'
  }
];

const examTips = [
  {
    id: '1',
    title: 'Time Management',
    description: 'Allocate specific time for each section based on marks weightage.',
    icon: <Clock size={20} color={colors.primary} />
  },
  {
    id: '2',
    title: 'Active Recall',
    description: 'Test yourself regularly instead of passive reading to improve retention.',
    icon: <Brain size={20} color={colors.primary} />
  },
  {
    id: '3',
    title: 'Study Groups',
    description: 'Join study groups to discuss concepts and solve problems together.',
    icon: <Users size={20} color={colors.primary} />
  },
  {
    id: '4',
    title: 'Practice Papers',
    description: 'Solve previous year papers to understand exam pattern and difficulty.',
    icon: <FileText size={20} color={colors.primary} />
  },
  {
    id: '5',
    title: 'Healthy Habits',
    description: 'Get adequate sleep, exercise, and nutrition to maintain focus.',
    icon: <Zap size={20} color={colors.primary} />
  },
  {
    id: '6',
    title: 'Review Strategy',
    description: 'Use spaced repetition technique for better long-term memory.',
    icon: <BookOpen size={20} color={colors.primary} />
  }
];

export default function ExamsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('timetable');
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [scrollY] = useState(new Animated.Value(0));
  
  // Animation values for the header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 120],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });
  
  const tabPosition = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  const loadExams = async () => {
    try {
      setIsLoading(true);
      let fetchedExams: Exam[] = [];
      
      if (user?.role === 'student') {
        // For students, fetch exams based on their department, year, and semester
        fetchedExams = await fetchExams(
          user.department,
          user.year ? parseInt(user.year) : undefined,
          user.semester ? parseInt(user.semester) : undefined
        );
      } else {
        // For faculty, fetch all exams
        fetchedExams = await fetchExams();
      }
      
      // If no exams are fetched, use mock data
      if (fetchedExams.length === 0) {
        // Convert mock data to Exam type
        fetchedExams = examTimetable.map(item => ({
          id: item.id,
          title: `${item.subject} ${item.type}`,
          subject: item.subject,
          date: new Date(item.date).getTime(),
          duration: 180, // 3 hours
          location: item.venue,
          description: `Topics covered: ${item.topics.join(', ')}`,
          department: 'Computer Science',
          year: 3,
          semester: 6,
          createdBy: 'system',
          createdAt: Date.now()
        }));
      }
      
      setExams(fetchedExams);
    } catch (error) {
      console.error('Error loading exams:', error);
      // Use mock data if there's an error
      const mockExams = examTimetable.map(item => ({
        id: item.id,
        title: `${item.subject} ${item.type}`,
        subject: item.subject,
        date: new Date(item.date).getTime(),
        duration: 180, // 3 hours
        location: item.venue,
        description: `Topics covered: ${item.topics.join(', ')}`,
        department: 'Computer Science',
        year: 3,
        semester: 6,
        createdBy: 'system',
        createdAt: Date.now()
      }));
      setExams(mockExams);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExams();
    setRefreshing(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Very High':
        return '#EF4444';
      case 'High':
        return '#F59E0B';
      case 'Medium':
        return '#10B981';
      case 'Low':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getDaysUntilExam = (examDate: number) => {
    const today = new Date();
    const exam = new Date(examDate);
    return differenceInDays(exam, today);
  };

  const getExamStatus = (examDate: number) => {
    const today = new Date();
    const exam = new Date(examDate);
    
    if (isBefore(exam, today)) {
      return { status: 'completed', color: '#10B981', text: 'Completed' };
    } else if (isAfter(exam, addDays(today, 7))) {
      return { status: 'upcoming', color: '#3B82F6', text: 'Upcoming' };
    } else {
      return { status: 'soon', color: '#F59E0B', text: 'Soon' };
    }
  };

  const renderExamCard = ({ item, index }: { item: Exam; index: number }) => {
    const daysUntil = getDaysUntilExam(item.date);
    const examStatus = getExamStatus(item.date);
    
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: 500,
          delay: index * 100,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }}
      >
        <Card style={styles.examCard}>
    <LinearGradient
            colors={['transparent', `${examStatus.color}10`]}
            style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
          />
          
          <View style={styles.examHeader}>
            <View style={styles.subjectBadge}>
              <Text style={styles.subjectBadgeText}>{item.subject}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${examStatus.color}20` }]}>
              <Text style={[styles.statusText, { color: examStatus.color }]}>
                {examStatus.text}
              </Text>
            </View>
          </View>
          
          <Text style={styles.examTitle}>{item.title}</Text>
          
          {item.description && (
            <Text style={styles.examDescription} numberOfLines={2}>{item.description}</Text>
          )}
          
          <View style={styles.examDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {format(new Date(item.date), 'MMMM dd, yyyy')}
                {daysUntil > 0 && ` (${daysUntil} days left)`}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {format(new Date(item.date), 'hh:mm a')} • {item.duration} mins
      </Text>
            </View>
            
            <View style={styles.detailRow}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          </View>
          
          <View style={styles.examActions}>
            <TouchableOpacity style={styles.actionButton}>
              <BookOpen size={18} color={colors.primary} />
              <Text style={styles.actionButtonText}>Study</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Download size={18} color={colors.primary} />
              <Text style={styles.actionButtonText}>Materials</Text>
        </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={18} color={colors.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

          <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => router.push({
                pathname: "/exams/[id]",
                params: { id: item.id }
              })}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Card>
      </MotiView>
    );
  };

  const renderNotificationItem = ({ item }: { item: any }) => {
    const cardStyle = {
      ...styles.notificationCard,
      ...(item.read ? { borderLeftColor: '#E5E7EB' } : {})
    } as ViewStyle;
    
    const getNotificationIcon = () => {
      switch (item.type) {
        case 'schedule':
          return <Calendar size={20} color={colors.primary} />;
        case 'guidelines':
          return <AlertCircle size={20} color={colors.warning} />;
        case 'venue':
          return <MapPin size={20} color={colors.error} />;
        case 'resources':
          return <BookOpen size={20} color={colors.success} />;
        default:
          return <Bell size={20} color={colors.primary} />;
      }
    };
      
    return (
      <Card style={cardStyle}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIconContainer}>
            {getNotificationIcon()}
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationDate}>
              {format(new Date(item.date), 'MMM dd, yyyy')}
            </Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </Card>
    );
  };

  const renderPreviousPaperItem = ({ item }: { item: any }) => (
    <Card style={styles.paperCard}>
      <View style={styles.paperInfo}>
        <Text style={styles.paperSubject}>{item.subject}</Text>
        <Text style={styles.paperDetails}>
          {item.year} • {item.semester} • {item.type}
        </Text>
        <View style={styles.paperTopics}>
          {item.topics.map((topic: string, index: number) => (
            <View key={index} style={styles.topicTag}>
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.professorText}>Professor: {item.professor}</Text>
      </View>
      
      <TouchableOpacity style={styles.downloadButton}>
        <Download size={20} color={colors.primary} />
      </TouchableOpacity>
    </Card>
  );

  const renderStudyResourceItem = ({ item }: { item: any }) => (
    <Card style={styles.resourceCard}>
      <View style={styles.resourceIconContainer}>
        <FileText size={24} color={colors.primary} />
      </View>
      <View style={styles.resourceInfo}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceSubject}>{item.subject}</Text>
        <View style={styles.resourceMeta}>
          <Text style={styles.resourceType}>{item.type}</Text>
          <Text style={styles.resourceSize}>{item.size}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.downloadButton}>
        <Download size={20} color={colors.primary} />
          </TouchableOpacity>
    </Card>
  );

  const renderExamTipItem = ({ item }: { item: any }) => (
    <Card style={styles.tipCard}>
      <View style={styles.tipIconContainer}>
        {item.icon}
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{item.title}</Text>
        <Text style={styles.tipDescription}>{item.description}</Text>
      </View>
    </Card>
  );

  const renderExamStats = () => (
    <View style={styles.statsContainer}>
      <Card style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: `${colors.warning}20` }]}>
          <AlertCircle size={24} color={colors.warning} />
        </View>
        <Text style={styles.statValue}>{exams.length}</Text>
        <Text style={styles.statLabel}>Upcoming Exams</Text>
      </Card>
      
      <Card style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: `${colors.success}20` }]}>
          <CheckCircle size={24} color={colors.success} />
        </View>
        <Text style={styles.statValue}>3</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </Card>
      
      <Card style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: `${colors.error}20` }]}>
          <XCircle size={24} color={colors.error} />
        </View>
        <Text style={styles.statValue}>1</Text>
        <Text style={styles.statLabel}>Missed</Text>
      </Card>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exams, subjects..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Filter size={20} color={colors.primary} />
      </TouchableOpacity>
      </View>
    );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filterTitle}>Difficulty</Text>
      <View style={styles.filterOptions}>
        <TouchableOpacity 
          style={[
            styles.filterOption, 
            selectedDifficulty === 'Low' && styles.filterOptionSelected
          ]}
          onPress={() => setSelectedDifficulty(selectedDifficulty === 'Low' ? null : 'Low')}
        >
          <Text style={[
            styles.filterOptionText,
            selectedDifficulty === 'Low' && styles.filterOptionTextSelected
          ]}>Low</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterOption, 
            selectedDifficulty === 'Medium' && styles.filterOptionSelected
          ]}
          onPress={() => setSelectedDifficulty(selectedDifficulty === 'Medium' ? null : 'Medium')}
        >
          <Text style={[
            styles.filterOptionText,
            selectedDifficulty === 'Medium' && styles.filterOptionTextSelected
          ]}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterOption, 
            selectedDifficulty === 'High' && styles.filterOptionSelected
          ]}
          onPress={() => setSelectedDifficulty(selectedDifficulty === 'High' ? null : 'High')}
        >
          <Text style={[
            styles.filterOptionText,
            selectedDifficulty === 'High' && styles.filterOptionTextSelected
          ]}>High</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterOption, 
            selectedDifficulty === 'Very High' && styles.filterOptionSelected
          ]}
          onPress={() => setSelectedDifficulty(selectedDifficulty === 'Very High' ? null : 'Very High')}
        >
          <Text style={[
            styles.filterOptionText,
            selectedDifficulty === 'Very High' && styles.filterOptionTextSelected
          ]}>Very High</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.filterTitle}>Subject</Text>
      <View style={styles.filterOptions}>
        <TouchableOpacity 
          style={[
            styles.filterOption, 
            selectedSubject === 'Mathematics' && styles.filterOptionSelected
          ]}
          onPress={() => setSelectedSubject(selectedSubject === 'Mathematics' ? null : 'Mathematics')}
        >
          <Text style={[
            styles.filterOptionText,
            selectedSubject === 'Mathematics' && styles.filterOptionTextSelected
          ]}>Mathematics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterOption, 
            selectedSubject === 'Physics' && styles.filterOptionSelected
          ]}
          onPress={() => setSelectedSubject(selectedSubject === 'Physics' ? null : 'Physics')}
        >
          <Text style={[
            styles.filterOptionText,
            selectedSubject === 'Physics' && styles.filterOptionTextSelected
          ]}>Physics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterOption, 
            selectedSubject === 'Computer Science' && styles.filterOptionSelected
          ]}
          onPress={() => setSelectedSubject(selectedSubject === 'Computer Science' ? null : 'Computer Science')}
        >
          <Text style={[
            styles.filterOptionText,
            selectedSubject === 'Computer Science' && styles.filterOptionTextSelected
          ]}>Computer Science</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterOption, 
            selectedSubject === 'Machine Learning' && styles.filterOptionSelected
          ]}
          onPress={() => setSelectedSubject(selectedSubject === 'Machine Learning' ? null : 'Machine Learning')}
        >
          <Text style={[
            styles.filterOptionText,
            selectedSubject === 'Machine Learning' && styles.filterOptionTextSelected
          ]}>Machine Learning</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <BlurView intensity={20} style={styles.headerContent}>
            <Animated.View style={{ opacity: headerOpacity }}>
              <Text style={styles.title}>Exams</Text>
              <Text style={styles.subtitle}>Manage your exam schedule and resources</Text>
            </Animated.View>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.tabs, { transform: [{ translateY: tabPosition }] }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'timetable' && styles.activeTab]}
          onPress={() => setActiveTab('timetable')}
        >
          <Calendar size={20} color={activeTab === 'timetable' ? colors.primary : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'timetable' && styles.activeTabText]}>
            Timetable
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Bell size={20} color={activeTab === 'notifications' ? colors.primary : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
            Notifications
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'papers' && styles.activeTab]}
          onPress={() => setActiveTab('papers')}
        >
          <FileText size={20} color={activeTab === 'papers' ? colors.primary : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'papers' && styles.activeTabText]}>
            Previous Papers
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'resources' && styles.activeTab]}
          onPress={() => setActiveTab('resources')}
        >
          <BookOpen size={20} color={activeTab === 'resources' ? colors.primary : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>
            Resources
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading exams...</Text>
          </View>
        ) : (
          <>
            {renderSearchBar()}
            
            {showFilters && renderFilters()}
            
            {renderExamStats()}
            
            {activeTab === 'timetable' && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Upcoming Exams</Text>
                  <TouchableOpacity style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>See All</Text>
                    <ChevronRight size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={exams}
                  renderItem={renderExamCard}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContent}
                  scrollEnabled={false}
                />
                
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Study Tips</Text>
                </View>
                
                <FlatList
                  data={examTips}
                  renderItem={renderExamTipItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.tipsList}
                  scrollEnabled={false}
                  numColumns={2}
                />
              </>
            )}
            
            {activeTab === 'notifications' && (
              <FlatList
                data={examNotifications}
                renderItem={renderNotificationItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
              />
            )}
            
            {activeTab === 'papers' && (
              <FlatList
                data={previousPapers}
                renderItem={renderPreviousPaperItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
              />
            )}
            
            {activeTab === 'resources' && (
              <FlatList
                data={studyResources}
                renderItem={renderStudyResourceItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
              />
            )}
          </>
        )}
      </Animated.ScrollView>
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/exams/add')}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    height: isSmallDevice ? 160 : 200,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallDevice ? 16 : 20,
  },
  title: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: -30,
    marginHorizontal: isSmallDevice ? 12 : 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isSmallDevice ? 8 : 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    marginLeft: 8,
    fontSize: isSmallDevice ? 12 : 14,
    color: '#6B7280',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: isSmallDevice ? 12 : 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: isSmallDevice ? 14 : 16,
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: colors.primary,
    marginRight: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: isSmallDevice ? 12 : 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: isSmallDevice ? 40 : 48,
    height: isSmallDevice ? 40 : 48,
    borderRadius: isSmallDevice ? 20 : 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isSmallDevice ? 10 : 12,
    color: '#6B7280',
  },
  examCard: {
    marginBottom: 16,
    padding: isSmallDevice ? 12 : 16,
    overflow: 'hidden',
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  subjectBadgeText: {
    fontSize: isSmallDevice ? 10 : 12,
    color: colors.primary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: '500',
  },
  examTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  examDescription: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#4B5563',
    marginBottom: 16,
  },
  examDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#6B7280',
  },
  examActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: colors.primary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  notificationCard: {
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  } as ViewStyle,
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  paperCard: {
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paperInfo: {
    flex: 1,
  },
  paperSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  paperDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  paperTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  topicTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  topicText: {
    fontSize: 12,
    color: colors.primary,
  },
  professorText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceCard: {
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resourceSubject: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  resourceMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  resourceType: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resourceSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  tipCard: {
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: (width - 60) / 2,
    marginRight: 16,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  tipsList: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});