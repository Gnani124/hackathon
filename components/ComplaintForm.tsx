import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Send, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as MailComposer from 'expo-mail-composer';

interface ComplaintFormProps {
  facultyEmail: string;
  facultyName: string;
  studentName: string;
  studentEmail: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ComplaintForm({
  facultyEmail,
  facultyName,
  studentName,
  studentEmail,
  onSuccess,
  onCancel,
}: ComplaintFormProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendComplaint = async () => {
    if (!subject || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSending(true);
    try {
      const emailBody = `
Dear ${facultyName},

This is a complaint from ${studentName} (${studentEmail}).

Subject: ${subject}

Message:
${message}

Best regards,
${studentName}
      `;

      const result = await MailComposer.composeAsync({
        recipients: [facultyEmail],
        subject: `Complaint: ${subject}`,
        body: emailBody,
      });

      if (result.status === 'sent') {
        Alert.alert('Success', 'Your complaint has been sent successfully');
        onSuccess?.();
      } else {
        Alert.alert('Error', 'Failed to send complaint. Please try again.');
      }
    } catch (error) {
      console.error('Error sending complaint:', error);
      Alert.alert('Error', 'Failed to send complaint. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AlertTriangle size={24} color={colors.primary} />
        <Text style={styles.title}>Submit Complaint to {facultyName}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter complaint subject"
            value={subject}
            onChangeText={setSubject}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Describe your complaint in detail"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isSending}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.sendButton]}
            onPress={handleSendComplaint}
            disabled={isSending}
          >
            <LinearGradient
              colors={[colors.primary, colors.info]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {isSending ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <>
                <Send size={20} color={colors.card} />
                <Text style={[styles.buttonText, styles.sendButtonText]}>Send Complaint</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageInput: {
    height: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    position: 'relative',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
  },
  sendButtonText: {
    color: colors.card,
  },
}); 