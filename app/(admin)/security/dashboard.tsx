import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SecurityIncident, SecurityZone } from '../../../types';
import NotificationService from '../../../services/NotificationService';

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [activeIncidents, setActiveIncidents] = useState<SecurityIncident[]>([]);
  const [securityZones, setSecurityZones] = useState<SecurityZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
  });

  // Mock data for testing
  useEffect(() => {
    // Simulate real-time incident updates
    const mockIncidents: SecurityIncident[] = [
      {
        id: '1',
        type: 'drug',
        location: {
          zone: 'Main Entrance',
          coordinates: { latitude: 12.9716, longitude: 77.5946 },
        },
        timestamp: Date.now(),
        status: 'pending',
        severity: 'high',
        description: 'Suspicious package detected in vehicle ABC123',
        reportedBy: 'Sensor-001',
      },
      {
        id: '2',
        type: 'alcohol',
        location: {
          zone: 'Parking Lot',
          coordinates: { latitude: 12.9717, longitude: 77.5947 },
        },
        timestamp: Date.now() - 3600000,
        status: 'investigating',
        severity: 'medium',
        description: 'Alcohol detected in vehicle XYZ789',
        reportedBy: 'Sensor-002',
      },
    ];

    const mockZones: SecurityZone[] = [
      {
        id: '1',
        name: 'Main Entrance',
        type: 'entrance',
        coordinates: { latitude: 12.9716, longitude: 77.5946 },
        radius: 50,
        status: 'active',
      },
      {
        id: '2',
        name: 'Parking Lot',
        type: 'parking',
        coordinates: { latitude: 12.9717, longitude: 77.5947 },
        radius: 100,
        status: 'active',
      },
    ];

    setActiveIncidents(mockIncidents);
    setSecurityZones(mockZones);

    // Simulate new incident detection
    const interval = setInterval(() => {
      const newIncident: SecurityIncident = {
        id: Date.now().toString(),
        type: ['drug', 'alcohol', 'cigarette'][Math.floor(Math.random() * 3)] as any,
        location: {
          zone: 'Main Entrance',
          coordinates: { latitude: 12.9716, longitude: 77.5946 },
        },
        timestamp: Date.now(),
        status: 'pending',
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        description: `Suspicious ${['drug', 'alcohol', 'cigarette'][Math.floor(Math.random() * 3)]} detected in vehicle ${Math.random().toString(36).substring(7).toUpperCase()}`,
        reportedBy: `Sensor-${Math.floor(Math.random() * 100)}`,
      };

      setActiveIncidents(prev => [newIncident, ...prev]);

      // Send notifications
      if (notificationSettings.email) {
        NotificationService.getInstance().sendEmailNotification(newIncident);
      }
      if (notificationSettings.sms) {
        NotificationService.getInstance().sendSMSNotification(newIncident);
      }
    }, 30000); // Simulate new incident every 30 seconds

    return () => clearInterval(interval);
  }, [notificationSettings]);

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'drug':
        return 'exclamation-triangle';
      case 'alcohol':
        return 'glass';
      case 'cigarette':
        return 'ban';
      default:
        return 'question-circle';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#DC2626';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#0D9488';
      default:
        return '#6B7280';
    }
  };

  const toggleNotification = (type: 'email' | 'sms') => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Dashboard</Text>
        <Text style={styles.subtitle}>24/7 Campus Monitoring</Text>
      </View>

      <View style={styles.notificationSettings}>
        <TouchableOpacity
          style={[
            styles.notificationButton,
            notificationSettings.email && styles.activeNotification,
          ]}
          onPress={() => toggleNotification('email')}
        >
          <FontAwesome name="envelope" size={20} color={notificationSettings.email ? '#FFFFFF' : '#4B5563'} />
          <Text style={[styles.notificationText, notificationSettings.email && styles.activeNotificationText]}>
            Email Alerts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.notificationButton,
            notificationSettings.sms && styles.activeNotification,
          ]}
          onPress={() => toggleNotification('sms')}
        >
          <FontAwesome name="mobile" size={20} color={notificationSettings.sms ? '#FFFFFF' : '#4B5563'} />
          <Text style={[styles.notificationText, notificationSettings.sms && styles.activeNotificationText]}>
            SMS Alerts
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeIncidents.length}</Text>
          <Text style={styles.statLabel}>Active Incidents</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{securityZones.length}</Text>
          <Text style={styles.statLabel}>Security Zones</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Vehicles Monitored</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Incidents</Text>
        {activeIncidents.map((incident) => (
          <TouchableOpacity
            key={incident.id}
            style={styles.incidentCard}
            onPress={() => router.push(`/(admin)/security/incidents/${incident.id}` as any)}
          >
            <View style={styles.incidentHeader}>
              <FontAwesome
                name={getIncidentIcon(incident.type)}
                size={24}
                color={getSeverityColor(incident.severity)}
              />
              <View style={styles.incidentInfo}>
                <Text style={styles.incidentType}>
                  {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                </Text>
                <Text style={styles.incidentLocation}>{incident.location.zone}</Text>
              </View>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(incident.severity) },
                ]}
              >
                <Text style={styles.severityText}>
                  {incident.severity.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.incidentDescription}>{incident.description}</Text>
            <Text style={styles.incidentTime}>
              {new Date(incident.timestamp).toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Zones</Text>
        <View style={styles.zonesContainer}>
          {securityZones.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.zoneCard,
                selectedZone === zone.id && styles.selectedZone,
              ]}
              onPress={() => setSelectedZone(zone.id)}
            >
              <Text style={styles.zoneName}>{zone.name}</Text>
              <Text style={styles.zoneType}>{zone.type}</Text>
              <View
                style={[
                  styles.zoneStatus,
                  { backgroundColor: zone.status === 'active' ? '#10B981' : '#6B7280' },
                ]}
              >
                <Text style={styles.zoneStatusText}>
                  {zone.status.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  notificationSettings: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    width: '45%',
    justifyContent: 'center',
  },
  activeNotification: {
    backgroundColor: '#1E3A8A',
  },
  notificationText: {
    marginLeft: 8,
    color: '#4B5563',
    fontWeight: '500',
  },
  activeNotificationText: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  incidentCard: {
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
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  incidentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  incidentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  incidentLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  incidentTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  zonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  zoneCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedZone: {
    borderColor: '#1E3A8A',
    borderWidth: 2,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  zoneType: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  zoneStatus: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  zoneStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 