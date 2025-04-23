import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Calendar, MapPin, Users, Image as ImageIcon } from 'lucide-react-native';
import { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  compact?: boolean;
}

export function EventCard({ event, onPress, compact = false }: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const cardStyle = compact ? StyleSheet.flatten([styles.card, styles.compactCard]) : styles.card;
  const imageContainerStyle = compact ? StyleSheet.flatten([styles.imageContainer, styles.compactImageContainer]) : styles.imageContainer;
  const contentStyle = compact ? StyleSheet.flatten([styles.content, styles.compactContent]) : styles.content;
  const titleStyle = compact ? StyleSheet.flatten([styles.title, styles.compactTitle]) : styles.title;
  const descriptionStyle = compact ? StyleSheet.flatten([styles.description, styles.compactDescription]) : styles.description;
  const detailsStyle = compact ? StyleSheet.flatten([styles.details, styles.compactDetails]) : styles.details;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={cardStyle}>
        <View style={imageContainerStyle}>
          {event.imageUrl && !imageError ? (
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={handleImageError}
            />
          ) : (
            <View style={styles.fallbackImage}>
              <ImageIcon size={40} color="#6B7280" />
            </View>
          )}
        </View>
        <View style={contentStyle}>
          <Text style={titleStyle}>{event.title}</Text>
          <Text style={descriptionStyle} numberOfLines={compact ? 1 : 2}>
            {event.description}
          </Text>
          
          <View style={detailsStyle}>
            <View style={styles.detailItem}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {new Date(event.date).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
            
            {!compact && (
              <View style={styles.detailItem}>
                <Users size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  {event.attendees?.length || 0} attendees
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    overflow: 'hidden',
  } as ViewStyle,
  compactCard: {
    marginBottom: 8,
  } as ViewStyle,
  imageContainer: {
    width: '100%',
    height: 200,
  } as ViewStyle,
  compactImageContainer: {
    height: 120,
  } as ViewStyle,
  image: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  fallbackImage: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  content: {
    padding: 16,
  } as ViewStyle,
  compactContent: {
    padding: 12,
  } as ViewStyle,
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  } as TextStyle,
  compactTitle: {
    fontSize: 16,
    marginBottom: 4,
  } as TextStyle,
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  } as TextStyle,
  compactDescription: {
    marginBottom: 8,
  } as TextStyle,
  details: {
    gap: 8,
  } as ViewStyle,
  compactDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  } as ViewStyle,
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as ViewStyle,
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  } as TextStyle,
}); 