import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SecuritySettings as SecuritySettingsType } from '../../../types';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettingsType>({
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
    detectionSensitivity: {
      drug: 'medium',
      alcohol: 'medium',
      cigarette: 'medium',
    },
    alertThresholds: {
      drug: 5,
      alcohol: 5,
      cigarette: 5,
    },
    reportSchedule: {
      daily: true,
      weekly: true,
      monthly: true,
    },
    emailRecipients: ['admin@campusync.com'],
  });

  const [newEmail, setNewEmail] = useState('');

  const updateNotificationPreference = (key: keyof typeof settings.notificationPreferences) => {
    setSettings((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key],
      },
    }));
  };

  const updateDetectionSensitivity = (
    type: keyof typeof settings.detectionSensitivity,
    value: 'low' | 'medium' | 'high'
  ) => {
    setSettings((prev) => ({
      ...prev,
      detectionSensitivity: {
        ...prev.detectionSensitivity,
        [type]: value,
      },
    }));
  };

  const updateAlertThreshold = (
    type: keyof typeof settings.alertThresholds,
    value: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      alertThresholds: {
        ...prev.alertThresholds,
        [type]: value,
      },
    }));
  };

  const updateReportSchedule = (type: keyof typeof settings.reportSchedule) => {
    setSettings((prev) => ({
      ...prev,
      reportSchedule: {
        ...prev.reportSchedule,
        [type]: !prev.reportSchedule[type],
      },
    }));
  };

  const addEmailRecipient = () => {
    if (newEmail && !settings.emailRecipients.includes(newEmail)) {
      setSettings((prev) => ({
        ...prev,
        emailRecipients: [...prev.emailRecipients, newEmail],
      }));
      setNewEmail('');
    }
  };

  const removeEmailRecipient = (email: string) => {
    setSettings((prev) => ({
      ...prev,
      emailRecipients: prev.emailRecipients.filter((e) => e !== email),
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Settings</Text>
        <Text style={styles.subtitle}>Configure system preferences</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Email Notifications</Text>
          <Switch
            value={settings.notificationPreferences.email}
            onValueChange={() => updateNotificationPreference('email')}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={settings.notificationPreferences.push}
            onValueChange={() => updateNotificationPreference('push')}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>SMS Notifications</Text>
          <Switch
            value={settings.notificationPreferences.sms}
            onValueChange={() => updateNotificationPreference('sms')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detection Sensitivity</Text>
        {Object.entries(settings.detectionSensitivity).map(([type, value]) => (
          <View key={type} style={styles.sensitivityContainer}>
            <Text style={styles.settingLabel}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <View style={styles.sensitivityButtons}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.sensitivityButton,
                    value === level && styles.activeSensitivity,
                  ]}
                  onPress={() => updateDetectionSensitivity(type as any, level)}
                >
                  <Text
                    style={[
                      styles.sensitivityButtonText,
                      value === level && styles.activeSensitivityText,
                    ]}
                  >
                    {level.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Thresholds</Text>
        {Object.entries(settings.alertThresholds).map(([type, value]) => (
          <View key={type} style={styles.thresholdContainer}>
            <Text style={styles.settingLabel}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <TextInput
              style={styles.thresholdInput}
              value={value.toString()}
              onChangeText={(text) => updateAlertThreshold(type as any, parseInt(text) || 0)}
              keyboardType="numeric"
            />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Schedule</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Daily Reports</Text>
          <Switch
            value={settings.reportSchedule.daily}
            onValueChange={() => updateReportSchedule('daily')}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Weekly Reports</Text>
          <Switch
            value={settings.reportSchedule.weekly}
            onValueChange={() => updateReportSchedule('weekly')}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Monthly Reports</Text>
          <Switch
            value={settings.reportSchedule.monthly}
            onValueChange={() => updateReportSchedule('monthly')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email Recipients</Text>
        <View style={styles.emailInputContainer}>
          <TextInput
            style={styles.emailInput}
            placeholder="Enter email address"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addEmailButton}
            onPress={addEmailRecipient}
          >
            <Text style={styles.addEmailButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {settings.emailRecipients.map((email) => (
          <View key={email} style={styles.emailRecipient}>
            <Text style={styles.emailText}>{email}</Text>
            <TouchableOpacity
              onPress={() => removeEmailRecipient(email)}
              style={styles.removeEmailButton}
            >
              <FontAwesome name="times" size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
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
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#4B5563',
  },
  sensitivityContainer: {
    marginBottom: 15,
  },
  sensitivityButtons: {
    flexDirection: 'row',
    marginTop: 5,
  },
  sensitivityButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  activeSensitivity: {
    backgroundColor: '#1E3A8A',
  },
  sensitivityButtonText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '500',
  },
  activeSensitivityText: {
    color: '#FFFFFF',
  },
  thresholdContainer: {
    marginBottom: 15,
  },
  thresholdInput: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 5,
  },
  emailInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  emailInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  addEmailButton: {
    backgroundColor: '#1E3A8A',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addEmailButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emailRecipient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  emailText: {
    fontSize: 14,
    color: '#4B5563',
  },
  removeEmailButton: {
    padding: 5,
  },
}); 