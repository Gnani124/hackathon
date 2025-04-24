import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Exam, ExamResult } from '@/types';
import { Calendar, Clock, MapPin, BookOpen, ArrowLeft, Download, Share2, Users, Brain, FileText, Award, BarChart, Star, CheckCircle, XCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, differenceInDays } from 'date-fns';
import { colors } from '@/constants/colors';
import { MotiView } from 'moti';
import { deleteExam } from '@/services/examsService';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Mock roadmap data - in a real app, this would come from a database
const subjectRoadmaps: Record<string, { title: string; completed: boolean }[]> = {
  'Mathematics': [
    { title: 'Basic Algebra', completed: true },
    { title: 'Calculus Fundamentals', completed: true },
    { title: 'Linear Algebra', completed: false },
    { title: 'Differential Equations', completed: false },
    { title: 'Advanced Topics', completed: false },
  ],
  'Physics': [
    { title: 'Classical Mechanics', completed: true },
    { title: 'Thermodynamics', completed: true },
    { title: 'Electromagnetism', completed: false },
    { title: 'Quantum Mechanics', completed: false },
    { title: 'Special Relativity', completed: false },
  ],
  'Computer Science': [
    { title: 'Programming Basics', completed: true },
    { title: 'Data Structures', completed: true },
    { title: 'Algorithms', completed: false },
    { title: 'Database Systems', completed: false },
    { title: 'Software Engineering', completed: false },
  ],
  'Chemistry': [
    { title: 'Inorganic Chemistry', completed: true },
    { title: 'Organic Chemistry', completed: true },
    { title: 'Physical Chemistry', completed: false },
    { title: 'Analytical Chemistry', completed: false },
    { title: 'Advanced Topics', completed: false },
  ],
  'Biology': [
    { title: 'Cell Biology', completed: true },
    { title: 'Genetics', completed: true },
    { title: 'Evolution', completed: false },
    { title: 'Ecology', completed: false },
    { title: 'Advanced Topics', completed: false },
  ],
};

export default function ExamDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExamAndResult = async () => {
      try {
        const examDoc = await getDoc(doc(db, 'exams', id as string));
        if (examDoc.exists()) {
          setExam({ id: examDoc.id, ...examDoc.data() } as Exam);
          
          if (user?.role === 'student') {
            const resultDoc = await getDoc(doc(db, 'examResults', `${user.id}_${id}`));
            if (resultDoc.exists()) {
              setResult({ id: resultDoc.id, ...resultDoc.data() } as ExamResult);
            }
          }
        }
      } catch (error) {
        console.error('Error loading exam:', error);
        Alert.alert('Error', 'Failed to load exam details');
      } finally {
        setIsLoading(false);
      }
    };

    loadExamAndResult();
  }, [id, user]);

  const handleDelete = async () => {
    try {
      await deleteExam(id as string);
      Alert.alert('Success', 'Exam deleted successfully');
      router.back();
    } catch (error) {
      console.error('Error deleting exam:', error);
      Alert.alert('Error', 'Failed to delete exam');
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'MMMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Time';
      return format(date, 'hh:mm a');
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const getDaysUntil = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 0;
      return differenceInDays(date, new Date());
    } catch (error) {
      return 0;
    }
  };

  if (isLoading || !exam) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading exam details...</Text>
      </View>
    );
  }

  const daysUntil = getDaysUntil(exam.date);

  const renderResult = () => {
    // If no real result, show dummy data
    const dummyResult: ExamResult = {
      id: 'dummy',
      examId: id as string,
      studentId: user?.id || '',
      marks: 85,
      totalMarks: 100,
      grade: 'A',
      feedback: 'Excellent performance! You have shown a strong understanding of the subject matter. Keep up the good work!',
      createdBy: 'system',
      createdAt: Date.now()
    };

    const resultToShow = result || dummyResult;
    const percentage = (resultToShow.marks / resultToShow.totalMarks) * 100;
    const gradeColor = percentage >= 70 ? colors.success : percentage >= 50 ? colors.warning : colors.error;
    
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.sectionTitle}>Your Result</Text>
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultGrade}>
              <Text style={[styles.resultGradeText, { color: gradeColor }]}>
                {resultToShow.grade || `${percentage.toFixed(1)}%`}
              </Text>
            </View>
            <View style={styles.resultDetails}>
              <View style={styles.resultDetail}>
                <Text style={styles.resultDetailLabel}>Marks</Text>
                <Text style={styles.resultDetailValue}>{resultToShow.marks}/{resultToShow.totalMarks}</Text>
              </View>
              <View style={styles.resultDetail}>
                <Text style={styles.resultDetailLabel}>Date</Text>
                <Text style={styles.resultDetailValue}>
                  {format(new Date(resultToShow.createdAt), 'MMM dd, yyyy')}
                </Text>
              </View>
            </View>
          </View>
          
          {resultToShow.feedback && (
            <Text style={styles.resultFeedback}>{resultToShow.feedback}</Text>
          )}
        </Card>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam Details</Text>
        {user?.role === 'faculty' && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        )}
      </LinearGradient>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.content}
      >
        <View style={styles.examHeader}>
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectBadgeText}>{exam.subject}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {daysUntil > 0 ? `${daysUntil} days left` : 'Today'}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{exam.title}</Text>
        <Text style={styles.description}>{exam.description}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Calendar size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>
                {formatDate(exam.date)}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Clock size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailText}>
                {formatTime(exam.date)} • {exam.duration} mins
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <MapPin size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>{exam.location}</Text>
            </View>
          </View>
        </View>

        {renderResult()}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <BookOpen size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Study Materials</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Download size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Brain size={20} color={colors.primary} />
              <Text style={styles.tipText}>Review key concepts and formulas</Text>
            </View>
            <View style={styles.tipItem}>
              <FileText size={20} color={colors.primary} />
              <Text style={styles.tipText}>Practice with previous papers</Text>
            </View>
            <View style={styles.tipItem}>
              <Users size={20} color={colors.primary} />
              <Text style={styles.tipText}>Join study groups for discussion</Text>
            </View>
          </View>
        </View>
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subjectBadgeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: `${colors.secondary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  detailsContainer: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  resultContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultGrade: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resultGradeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  resultDetails: {
    flex: 1,
  },
  resultDetail: {
    marginBottom: 8,
  },
  resultDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  resultDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  resultFeedback: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
}); 