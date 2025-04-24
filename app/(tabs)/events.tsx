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
  Platform,
  Image,
  Alert,
  TextInput,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchEvents, checkAndAddMockEvents, createEvent } from '@/services/eventsService';
import { Event } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Plus, Filter, Calendar, MapPin, Users, Clock, AlertCircle, Search, X, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { router, useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { MotiView } from 'moti';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function EventsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [totalPeople, setTotalPeople] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First check if we need to add mock events
      await checkAndAddMockEvents();
      
      // Then fetch all events
      const eventsData = await fetchEvents();
      setEvents(eventsData);
      
      if (eventsData.length === 0) {
        setError('No events found. Pull down to refresh.');
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !date || !time || !location || !totalPeople) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const eventData = {
        title,
        description,
        date,
        time,
        place: location,
        totalPeople: parseInt(totalPeople),
        createdBy: user?.id || 'anonymous',
        image: imageUri || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newEvent = await createEvent(eventData, imageUri || undefined);
      setEvents([newEvent, ...events]);
      Alert.alert('Success', 'Event created successfully');
      resetForm();
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setTotalPeople('');
    setImageUri(null);
    setShowAddForm(false);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (selectedFilter === 'upcoming') {
      return matchesSearch && eventDate > now;
    } else if (selectedFilter === 'past') {
      return matchesSearch && eventDate < now;
    }
    return matchesSearch;
  });

  const renderEventCard = ({ item, index }: { item: Event; index: number }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.9, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 100 }}
      style={styles.eventCard}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.imageOverlay}
      >
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <View style={styles.eventDetails}>
            <View style={styles.detailItem}>
              <Calendar size={16} color="#fff" />
              <Text style={styles.detailText}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={16} color="#fff" />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
          </View>
          <View style={styles.eventDetails}>
            <View style={styles.detailItem}>
              <MapPin size={16} color="#fff" />
              <Text style={styles.detailText}>{item.place}</Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={16} color="#fff" />
              <Text style={styles.detailText}>{item.totalPeople} spots</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => router.push({
              pathname: '/events/[id]',
              params: { id: item.id }
            })}
          >
            <Text style={styles.viewMoreText}>View Details</Text>
            <ChevronRight size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </MotiView>
  );

  if (showAddForm) {
    return (
      <ScrollView style={styles.container}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.backButton}>
            <X size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Event</Text>
        </MotiView>

        <View style={styles.form}>
          <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <ImageIcon size={32} color="#6B7280" />
                <Text style={styles.uploadText}>Add Event Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Event Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter event description"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="Enter event date (YYYY-MM-DD)"
          />

          <Text style={styles.label}>Time</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="Enter event time (HH:MM AM/PM)"
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter event location"
          />

          <Text style={styles.label}>Total Spots</Text>
          <TextInput
            style={styles.input}
            value={totalPeople}
            onChangeText={setTotalPeople}
            placeholder="Enter total number of spots"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.info]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Stay updated with all campus activities</Text>
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadEvents}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Calendar size={24} color="#3B82F6" />
          <Text style={styles.title}>Events</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </MotiView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'upcoming' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('upcoming')}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'upcoming' && styles.filterChipTextActive]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'past' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('past')}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'past' && styles.filterChipTextActive]}>Past</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events found</Text>
            <TouchableOpacity 
              style={styles.addEventButton}
              onPress={() => setShowAddForm(true)}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addEventButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
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
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  eventContent: {
    gap: 8,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  viewMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    padding: 20,
  },
  imageUploadButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    color: '#6B7280',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  addEventButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});