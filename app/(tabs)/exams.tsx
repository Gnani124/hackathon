import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchExams } from '@/services/examsService';
import { ExamCard } from '@/components/exams/ExamCard';
import { Exam, Student } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Plus, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ExamsScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const loadExams = async () => {
    try {
      setIsLoading(true);
      
      if (user?.role === 'student') {
        const student = user as Student;
        const examsData = await fetchExams(student.department, student.year, student.semester);
        setExams(examsData);
      } else {
        const examsData = await fetchExams();
        setExams(examsData);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
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

  const renderHeader = () => (
    <LinearGradient
      colors={['#14B8A6', '#0D9488']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <Text style={styles.headerTitle}>Exams</Text>
      <Text style={styles.headerSubtitle}>
        {user?.role === 'student' 
          ? 'Track your upcoming exams and results' 
          : user?.role === 'faculty'
            ? 'Manage exams and publish results'
            : 'Monitor your child\'s exam schedule'
        }
      </Text>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={18} color="#FFFFFF" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>

        {user?.role === 'faculty' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              // Navigate to add exam screen
            }}
          >
            <Plus size={18} color="#14B8A6" />
            <Text style={styles.addButtonText}>Add Exam</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExamCard exam={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exams found</Text>
          </View>
        }
      />
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
  listContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterButtonText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: '#14B8A6',
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});