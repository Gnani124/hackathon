import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { format } from 'date-fns';
import { Event } from '../../types';
import { Card } from '../ui/Card';
import { MapPin, Calendar, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, compact = false }) => {
  const router = useRouter();
  const defaultImage = 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  
  const navigateToEventDetails = () => {
    router.push(`/events/${event.id}`);
  };

  if (compact) {
    return (
      <TouchableOpacity onPress={navigateToEventDetails} activeOpacity={0.7}>
        <Card style={styles.compactCard}>
          <View style={styles.compactContent}>
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>{format(new Date(event.date), 'dd')}</Text>
              <Text style={styles.dateMonth}>{format(new Date(event.date), 'MMM')}</Text>
            </View>
            <View style={styles.compactDetails}>
              <Text style={styles.compactTitle} numberOfLines={1}>{event.title}</Text>
              <View style={styles.compactInfo}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.compactInfoText} numberOfLines={1}>{event.location}</Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={navigateToEventDetails} activeOpacity={0.8}>
      <Card style={styles.card}>
        <Image 
          source={{ uri: event.imageUrl || defaultImage }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{event.description}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.infoText}>{format(new Date(event.date), 'MMM dd, yyyy')}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Users size={16} color="#6B7280" />
              <Text style={styles.infoText}>{event.attendees.length} attending</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
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
    backgroundColor: '#3B82F6',
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
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  compactInfoText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
});