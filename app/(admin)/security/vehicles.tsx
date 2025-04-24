import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Vehicle } from '../../../types';

export default function Vehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'authorized' | 'unauthorized' | 'flagged'>('all');

  // Mock data for testing
  useEffect(() => {
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        licensePlate: 'ABC123',
        owner: {
          id: '1',
          name: 'John Doe',
          role: 'student',
        },
        type: 'car',
        status: 'authorized',
        lastCheck: Date.now(),
        incidents: [],
      },
      {
        id: '2',
        licensePlate: 'XYZ789',
        owner: {
          id: '2',
          name: 'Jane Smith',
          role: 'faculty',
        },
        type: 'car',
        status: 'flagged',
        lastCheck: Date.now() - 3600000,
        incidents: ['1'],
      },
    ];

    setVehicles(mockVehicles);
  }, []);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.owner.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authorized':
        return '#10B981';
      case 'unauthorized':
        return '#DC2626';
      case 'flagged':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vehicle Monitoring</Text>
        <Text style={styles.subtitle}>Track and manage campus vehicles</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by license plate or owner"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'all' && styles.activeFilter,
          ]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'authorized' && styles.activeFilter,
          ]}
          onPress={() => setFilterStatus('authorized')}
        >
          <Text style={styles.filterText}>Authorized</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'unauthorized' && styles.activeFilter,
          ]}
          onPress={() => setFilterStatus('unauthorized')}
        >
          <Text style={styles.filterText}>Unauthorized</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === 'flagged' && styles.activeFilter,
          ]}
          onPress={() => setFilterStatus('flagged')}
        >
          <Text style={styles.filterText}>Flagged</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vehiclesContainer}>
        {filteredVehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={styles.vehicleCard}
            onPress={() => router.push(`/(admin)/security/vehicles/${vehicle.id}` as any)}
          >
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleInfo}>
                <FontAwesome name="car" size={24} color="#1E3A8A" style={styles.vehicleIcon} />
                <View>
                  <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
                  <Text style={styles.ownerName}>{vehicle.owner.name}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(vehicle.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {vehicle.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.vehicleDetails}>
              <View style={styles.detailRow}>
                <FontAwesome name="tag" size={16} color="#6B7280" style={styles.detailIcon} />
                <Text style={styles.detailText}>
                  Type: {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome name="clock-o" size={16} color="#6B7280" style={styles.detailIcon} />
                <Text style={styles.detailText}>
                  Last Check: {new Date(vehicle.lastCheck).toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome name="exclamation-circle" size={16} color="#6B7280" style={styles.detailIcon} />
                <Text style={styles.detailText}>
                  Incidents: {vehicle.incidents.length}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E3A8A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginTop: 4,
  },
  searchContainer: {
    padding: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: '#1E3A8A',
  },
  filterText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  vehiclesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    marginRight: 12,
  },
  licensePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  ownerName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vehicleDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
}); 