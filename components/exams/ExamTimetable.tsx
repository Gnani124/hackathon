import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { format, isToday, isTomorrow, isAfter, isBefore } from 'date-fns';
import { colors } from '@/constants/colors';
import { MotiView } from 'moti';
import { Exam } from '@/types';

interface ExamTimetableProps {
  exams: Exam[];
  onExamPress: (exam: Exam) => void;
}

export function ExamTimetable({ exams, onExamPress }: ExamTimetableProps) {
  const getDayLabel = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'EEEE');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getTimeSlot = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Time';
      return format(date, 'hh:mm a');
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'MMM dd');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const sortedExams = [...exams].sort((a, b) => a.date - b.date);

  return (
    <ScrollView style={styles.container}>
      {sortedExams.map((exam, index) => (
        <MotiView
          key={exam.id}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: index * 100 }}
        >
          <TouchableOpacity
            style={styles.examCard}
            onPress={() => onExamPress(exam)}
          >
            <View style={styles.dateContainer}>
              <Text style={styles.dayLabel}>{getDayLabel(exam.date)}</Text>
              <Text style={styles.dateText}>
                {formatDate(exam.date)}
              </Text>
            </View>

            <View style={styles.examInfo}>
              <Text style={styles.subjectText}>{exam.subject}</Text>
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Clock size={14} color={colors.primary} />
                  <Text style={styles.detailText}>{getTimeSlot(exam.date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MapPin size={14} color={colors.primary} />
                  <Text style={styles.detailText}>{exam.location}</Text>
                </View>
              </View>
            </View>

            <ChevronRight size={20} color={colors.primary} />
          </TouchableOpacity>
        </MotiView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  examInfo: {
    flex: 1,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
}); 