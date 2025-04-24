import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Building2, DollarSign, Users, Calendar, ArrowLeft, Briefcase, MapPin, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { PlacementCompany } from '@/types';
import { deletePlacement } from '@/services/placementsService';

const { width } = Dimensions.get('window');

export default function PlacementDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [placement, setPlacement] = useState<PlacementCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlacementDetails();
  }, [id]);

  const loadPlacementDetails = async () => {
    try {
      setIsLoading(true);
      const docRef = doc(db, 'placements', id as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setPlacement({ id: docSnap.id, ...docSnap.data() } as PlacementCompany);
      }
    } catch (error) {
      console.error('Error loading placement details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Placement',
      'Are you sure you want to delete this placement? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlacement(id as string);
              Alert.alert('Success', 'Placement deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting placement:', error);
              Alert.alert('Error', 'Failed to delete placement');
            }
          },
        },
      ]
    );
  };

  if (isLoading || !placement) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <LinearGradient
          colors={placement.jobType === 'technical' ? ['#4F46E5', '#7C3AED'] : ['#F59E0B', '#D97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Building2 size={32} color="#fff" />
            <Text style={styles.companyName}>{placement.companyName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <DollarSign size={24} color="#4F46E5" />
                <Text style={styles.infoLabel}>Package</Text>
                <Text style={styles.infoValue}>{placement.salaryPackage} LPA</Text>
              </View>
              <View style={styles.infoItem}>
                <Briefcase size={24} color="#4F46E5" />
                <Text style={styles.infoLabel}>Job Type</Text>
                <Text style={styles.infoValue}>{placement.jobType}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MapPin size={24} color="#4F46E5" />
                <Text style={styles.infoLabel}>Mode</Text>
                <Text style={styles.infoValue}>{placement.mode}</Text>
              </View>
              <View style={styles.infoItem}>
                <Calendar size={24} color="#4F46E5" />
                <Text style={styles.infoLabel}>Posted</Text>
                <Text style={styles.infoValue}>
                  {new Date(placement.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Company</Text>
            <Text style={styles.description}>{placement.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Requirements</Text>
            <Text style={styles.requirements}>{placement.requirements}</Text>
          </View>

          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  content: {
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  requirements: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  applyButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 