import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { colors } from '@/constants/colors';

interface DomainCardProps {
  domain: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    color: string;
    skills: any[];
    timeToComplete: string;
  };
  onPress: () => void;
}

const DomainCard: React.FC<DomainCardProps> = ({ domain, onPress }) => {
  return (
    <Pressable 
      style={styles.card}
      onPress={onPress}
    >
      <Image 
        source={{ uri: domain.imageUrl }} 
        style={styles.image} 
      />
      <View style={styles.content}>
        <Text style={styles.title}>{domain.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{domain.skills.length} skills</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{domain.timeToComplete}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 100,
  },
  content: {
    padding: 12,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 4,
  },
});

export default DomainCard;