import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Exam } from '@/types';
import { Card } from '@/components/ui/Card';
import { Calendar, Clock, MapPin, BookOpen, FileText, AlertCircle, CheckCircle2, Circle } from 'lucide-react-native';
import { format } from 'date-fns';

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
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const examRef = doc(db, 'exams', id as string);
        const examDoc = await getDoc(examRef);
        
        if (examDoc.exists()) {
          setExam({ id: examDoc.id, ...examDoc.data() } as Exam);
        } else {
          setError('Exam not found');
        }
      } catch (err) {
        console.error('Error fetching exam details:', err);
        setError('Failed to load exam details');
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !exam) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <AlertCircle size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Failed to load exam details'}</Text>
        </Card>
      </View>
    );
  }

  // Get roadmap items for the exam's subject
  const roadmapItems = subjectRoadmaps[exam.subject] || [
    { title: 'Basic Concepts', completed: true },
    { title: 'Intermediate Topics', completed: false },
    { title: 'Advanced Concepts', completed: false },
    { title: 'Exam Preparation', completed: false },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectBadgeText}>{exam.subject}</Text>
        </View>
        <Text style={styles.title}>{exam.title}</Text>
      </View>

      {exam.description && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{exam.description}</Text>
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Exam Details</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Calendar size={20} color="#6B7280" />
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>
                {format(new Date(exam.date), 'MMMM dd, yyyy')}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Clock size={20} color="#6B7280" />
            <View>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailText}>
                {format(new Date(exam.date), 'hh:mm a')} • {exam.duration} mins
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <MapPin size={20} color="#6B7280" />
            <View>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>{exam.location}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <BookOpen size={20} color="#6B7280" />
            <View>
              <Text style={styles.detailLabel}>Academic Info</Text>
              <Text style={styles.detailText}>
                Semester {exam.semester}, Year {exam.year}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Roadmap</Text>
        <Text style={styles.roadmapDescription}>
          Follow this roadmap to prepare for your {exam.subject} exam
        </Text>
        
        <View style={styles.timeline}>
          {roadmapItems.map((item, index) => (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subjectBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  subjectBadgeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  section: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  detailsContainer: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 16,
    color: '#1F2937',
  },
  errorCard: {
    margin: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    flex: 1,
  },
  roadmapDescription: {
    fontSize: 14,
    color: '#6B7280',
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