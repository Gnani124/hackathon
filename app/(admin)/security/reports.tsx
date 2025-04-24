import React, { useState } from 'react';
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
import { SecurityReport } from '../../../types';

export default function SecurityReports() {
  const { user } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Mock report data
  const mockReport: SecurityReport = {
    id: '1',
    type: 'daily',
    startDate: Date.now() - 86400000,
    endDate: Date.now(),
    incidents: [],
    summary: {
      totalIncidents: 5,
      byType: {
        drug: 2,
        alcohol: 2,
        cigarette: 1,
      },
      bySeverity: {
        low: 1,
        medium: 3,
        high: 1,
      },
    },
    generatedBy: user?.id || '',
    createdAt: Date.now(),
  };

  const generateReport = () => {
    // In a real app, this would fetch data from the backend
    console.log('Generating report...');
  };

  const exportReport = () => {
    // In a real app, this would export the report as PDF/CSV
    console.log('Exporting report...');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Reports</Text>
        <Text style={styles.subtitle}>Generate and analyze security data</Text>
      </View>

      <View style={styles.reportTypeContainer}>
        <TouchableOpacity
          style={[
            styles.reportTypeButton,
            selectedReportType === 'daily' && styles.activeReportType,
          ]}
          onPress={() => setSelectedReportType('daily')}
        >
          <Text style={styles.reportTypeText}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.reportTypeButton,
            selectedReportType === 'weekly' && styles.activeReportType,
          ]}
          onPress={() => setSelectedReportType('weekly')}
        >
          <Text style={styles.reportTypeText}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.reportTypeButton,
            selectedReportType === 'monthly' && styles.activeReportType,
          ]}
          onPress={() => setSelectedReportType('monthly')}
        >
          <Text style={styles.reportTypeText}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.reportTypeButton,
            selectedReportType === 'custom' && styles.activeReportType,
          ]}
          onPress={() => setSelectedReportType('custom')}
        >
          <Text style={styles.reportTypeText}>Custom</Text>
        </TouchableOpacity>
      </View>

      {selectedReportType === 'custom' && (
        <View style={styles.dateRangeContainer}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>End Date</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateReport}
        >
          <Text style={styles.generateButtonText}>Generate Report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={exportReport}
        >
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reportSummary}>
        <Text style={styles.sectionTitle}>Report Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Incidents</Text>
            <Text style={styles.summaryValue}>{mockReport.summary.totalIncidents}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>By Type</Text>
            <View style={styles.summaryDetails}>
              <Text style={styles.summaryDetail}>Drug: {mockReport.summary.byType.drug}</Text>
              <Text style={styles.summaryDetail}>Alcohol: {mockReport.summary.byType.alcohol}</Text>
              <Text style={styles.summaryDetail}>Cigarette: {mockReport.summary.byType.cigarette}</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>By Severity</Text>
            <View style={styles.summaryDetails}>
              <Text style={styles.summaryDetail}>High: {mockReport.summary.bySeverity.high}</Text>
              <Text style={styles.summaryDetail}>Medium: {mockReport.summary.bySeverity.medium}</Text>
              <Text style={styles.summaryDetail}>Low: {mockReport.summary.bySeverity.low}</Text>
            </View>
          </View>
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
  reportTypeContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  reportTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  activeReportType: {
    backgroundColor: '#1E3A8A',
  },
  reportTypeText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  dateRangeContainer: {
    padding: 20,
    paddingTop: 0,
  },
  dateInputContainer: {
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 5,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    justifyContent: 'space-between',
  },
  generateButton: {
    backgroundColor: '#1E3A8A',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: '#0D9488',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportSummary: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    marginBottom: 15,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 24,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  summaryDetails: {
    marginTop: 5,
  },
  summaryDetail: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
}); 