import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Exam } from '../../types';
import { Card } from '../ui/Card';
import { Clock, Calendar, MapPin, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ExamCardProps {
  exam: Exam;
  compact?: boolean;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, compact = false }) => {
  const router = useRouter();
  
  const navigateToExamDetails = () => {
    router.push(`/exams/${exam.id}`);
  };

  if (compact) {
    return (
      <TouchableOpacity onPress={navigateToExamDetails} activeOpacity={0.7}>
        <Card style={styles.compactCard}>
          <View style={styles.compactContent}>
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>{format(new Date(exam.date), 'dd')}</Text>
              <Text style={styles.dateMonth}>{format(new Date(exam.date), 'MMM')}</Text>
            </View>
            <View style={styles.compactDetails}>
              <Text style={styles.compactTitle} numberOfLines={1}>{exam.title}</Text>
              <Text style={styles.subjectText}>{exam.subject}</Text>
              <View style={styles.compactInfo}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.compactInfoText}>{format(new Date(exam.date), 'hh:mm a')}</Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={navigateToExamDetails} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectBadgeText}>{exam.subject}</Text>
          </View>
        </View>
        
        <Text style={styles.title}>{exam.title}</Text>
        
        {exam.description && (
          <Text style={styles.description} numberOfLines={2}>{exam.description}</Text>
        )}
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.infoText}>{format(new Date(exam.date), 'MMMM dd, yyyy')}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.infoText}>{format(new Date(exam.date), 'hh:mm a')} • {exam.duration} mins</Text>
          </View>
          
          <View style={styles.infoItem}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.infoText}>{exam.location}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <BookOpen size={16} color="#6B7280" />
            <Text style={styles.infoText}>Semester {exam.semester}, Year {exam.year}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  subjectBadgeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoContainer: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Compact styles
  compactCard: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dateMonth: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  compactDetails: {
    marginLeft: 12,
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  subjectText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  compactInfoText: {
    fontSize: 13,
    color: '#6B7280',
  },
});