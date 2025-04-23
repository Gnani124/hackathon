import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchUpcomingEvents } from '@/services/eventsService';
import { fetchUpcomingExams } from '@/services/examsService';
import { Event, Exam, Student } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { ExamCard } from '@/components/exams/ExamCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const events = await fetchUpcomingEvents();
      setUpcomingEvents(events.slice(0, 3));

      if (user?.role === 'student') {
        const student = user as Student;
        const exams = await fetchUpcomingExams(student.department, student.year, student.semester);
        setUpcomingExams(exams.slice(0, 3));
      } else {
        const exams = await fetchUpcomingExams();
        setUpcomingExams(exams.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.displayName?.split(' ')[0]}
          </Text>
          <Text style={styles.subtitle}>
            {user?.role === 'student'
              ? 'Your academic dashboard'
              : user?.role === 'faculty'
                ? 'Manage your teaching schedule'
                : 'Monitor your child\'s progress'}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <Button
              title="See All"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/events')}
              style={styles.seeAllButton}
              textStyle={styles.seeAllButtonText}
            />
          </View>
          
          {upcomingEvents.length > 0 ? (
            <View style={styles.eventsContainer}>
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </View>
          ) : (
            <Card style={styles.emptyStateCard}>
              <Text style={styles.emptyStateText}>No upcoming events</Text>
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Exams</Text>
            <Button
              title="See All"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/exams')}
              style={styles.seeAllButton}
              textStyle={styles.seeAllButtonText}
            />
          </View>
          
          {upcomingExams.length > 0 ? (
            <View style={styles.examsContainer}>
              {upcomingExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} compact />
              ))}
            </View>
          ) : (
            <Card style={styles.emptyStateCard}>
              <Text style={styles.emptyStateText}>No upcoming exams</Text>
            </Card>
          )}
        </View>

        {user?.role === 'faculty' && (
          <Card style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>Teacher Tools</Text>
            <Text style={styles.actionCardDescription}>
              Create exams, post results, and manage your classes
            </Text>
            <Button
              title="Manage Classes"
              variant="primary"
              onPress={() => {}}
              style={styles.actionButton}
            />
          </Card>
        )}

        {user?.role === 'student' && (
          <Card style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>Student Resources</Text>
            <Text style={styles.actionCardDescription}>
              Access study materials, check your results, and track your progress
            </Text>
            <Button
              title="View Resources"
              variant="primary"
              onPress={() => {}}
              style={styles.actionButton}
            />
          </Card>
        )}

        {user?.role === 'parent' && (
          <Card style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>Child's Progress</Text>
            <Text style={styles.actionCardDescription}>
              Monitor academic performance, attendance, and upcoming events
            </Text>
            <Button
              title="View Progress"
              variant="primary"
              onPress={() => {}}
              style={styles.actionButton}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#3B82F6',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllButton: {
    paddingHorizontal: 0,
  },
  seeAllButtonText: {
    fontSize: 14,
  },
  eventsContainer: {
    gap: 8,
  },
  examsContainer: {
    gap: 8,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#F3F4F6',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionCard: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  actionCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
});