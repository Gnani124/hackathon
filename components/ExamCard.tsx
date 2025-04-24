import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, BookOpen } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface ExamCardProps {
  title: string;
  date: string;
  time: string;
  subject: string;
  onPress: () => void;
}

export function ExamCard({ title, date, time, subject, onPress }: ExamCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={colors.primary} />
          <Text style={styles.detailText}>{date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color={colors.primary} />
          <Text style={styles.detailText}>{time}</Text>
        </View>
        <View style={styles.detailRow}>
          <BookOpen size={16} color={colors.primary} />
          <Text style={styles.detailText}>{subject}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
}); 