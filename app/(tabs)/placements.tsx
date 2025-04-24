import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, FlatList, Dimensions, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { MotiView } from 'moti';
import { Briefcase, Plus, Search, Filter, X, ChevronRight, Building2, DollarSign, Users, Calendar } from 'lucide-react-native';
import { fetchPlacements, createPlacement } from '@/services/placementsService';
import { PlacementCompany } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function PlacementsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [isFaculty] = useState(user?.role === 'faculty');
  const [showAddForm, setShowAddForm] = useState(false);
  const [companies, setCompanies] = useState<PlacementCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'technical' | 'non-technical'>('all');
  const [companyName, setCompanyName] = useState('');
  const [salaryPackage, setSalaryPackage] = useState('');
  const [mode, setMode] = useState('offline');
  const [jobType, setJobType] = useState('technical');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  useEffect(() => {
    loadPlacements();
  }, []);

  const loadPlacements = async () => {
    try {
      setIsLoading(true);
      const placements = await fetchPlacements();
      setCompanies(placements);
    } catch (error) {
      console.error('Error loading placements:', error);
      Alert.alert('Error', 'Failed to load placements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!companyName || !salaryPackage || !description || !requirements) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const newPlacement = await createPlacement({
        companyName,
        salaryPackage,
        mode: mode as 'online' | 'offline',
        jobType: jobType as 'technical' | 'non-technical',
        description,
        requirements,
        createdBy: user?.id || 'anonymous'
      });

      setCompanies([newPlacement, ...companies]);
      Alert.alert('Success', 'Placement company added successfully');
      setCompanyName('');
      setSalaryPackage('');
      setMode('offline');
      setJobType('technical');
      setDescription('');
      setRequirements('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating placement:', error);
      Alert.alert('Error', 'Failed to add placement company');
    }
  };

  const handleViewDetails = (placementId: string) => {
    router.push({
      pathname: '/placements/[id]',
      params: { id: placementId }
    });
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || company.jobType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const renderCompanyCard = ({ item, index }: { item: PlacementCompany; index: number }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.9, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 100 }}
      style={styles.companyCard}
    >
      <LinearGradient
        colors={item.jobType === 'technical' ? ['#4F46E5', '#7C3AED'] : ['#F59E0B', '#D97706']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.companyInfo}>
              <Building2 size={24} color="#fff" />
              <Text style={styles.companyName}>{item.companyName}</Text>
            </View>
            <View style={[styles.modeBadge, item.mode === 'online' ? styles.onlineBadge : styles.offlineBadge]}>
              <Text style={styles.badgeText}>{item.mode}</Text>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <DollarSign size={20} color="#fff" />
              <Text style={styles.detailText}>{item.salaryPackage} LPA</Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={20} color="#fff" />
              <Text style={styles.detailText}>{item.jobType}</Text>
            </View>
          </View>

          <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>
          
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => handleViewDetails(item.id)}
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
          <Text style={styles.title}>Add Placement Company</Text>
        </MotiView>

        <View style={styles.form}>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={styles.input}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Enter company name"
          />

          <Text style={styles.label}>Package (LPA)</Text>
          <TextInput
            style={styles.input}
            value={salaryPackage}
            onChangeText={setSalaryPackage}
            placeholder="Enter package in LPA"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Mode</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'offline' && styles.modeButtonActive]}
              onPress={() => setMode('offline')}
            >
              <Text style={[styles.modeText, mode === 'offline' && styles.modeTextActive]}>Offline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'online' && styles.modeButtonActive]}
              onPress={() => setMode('online')}
            >
              <Text style={[styles.modeText, mode === 'online' && styles.modeTextActive]}>Online</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Job Type</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, jobType === 'technical' && styles.modeButtonActive]}
              onPress={() => setJobType('technical')}
            >
              <Text style={[styles.modeText, jobType === 'technical' && styles.modeTextActive]}>Technical</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, jobType === 'non-technical' && styles.modeButtonActive]}
              onPress={() => setJobType('non-technical')}
            >
              <Text style={[styles.modeText, jobType === 'non-technical' && styles.modeTextActive]}>Non-Technical</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter company description"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Job Requirements</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={requirements}
            onChangeText={setRequirements}
            placeholder="Enter job requirements"
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add Company</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Briefcase size={24} color="#3B82F6" />
          <Text style={styles.title}>Placement Companies</Text>
        </View>
        {isFaculty && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </MotiView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies..."
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
          style={[styles.filterChip, selectedFilter === 'technical' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('technical')}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'technical' && styles.filterChipTextActive]}>Technical</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'non-technical' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('non-technical')}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'non-technical' && styles.filterChipTextActive]}>Non-Technical</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCompanies}
        renderItem={renderCompanyCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  listContainer: {
    padding: 16,
  },
  companyCard: {
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
  cardGradient: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineBadge: {
    backgroundColor: '#10B981',
  },
  offlineBadge: {
    backgroundColor: '#3B82F6',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
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
  descriptionText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.9,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    padding: 20,
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
  modeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  modeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  modeText: {
    fontSize: 16,
    color: '#374151',
  },
  modeTextActive: {
    color: '#fff',
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
}); 