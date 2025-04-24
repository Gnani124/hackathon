import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../constants/colors';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  Upload
} from 'lucide-react-native';

export default function AddEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [totalPeople, setTotalPeople] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !place || !totalPeople || !image) {
      Alert.alert('Error', 'Please fill in all fields and add an image');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement event creation API call
      // const response = await createEvent({
      //   title,
      //   description,
      //   place,
      //   date,
      //   time,
      //   totalPeople: parseInt(totalPeople),
      //   image,
      // });
      
      Alert.alert('Success', 'Event created successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.info]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          {/* Image Upload */}
          <TouchableOpacity 
            style={styles.imageUpload}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <ImageIcon size={32} color={colors.primary} />
                <Text style={styles.uploadText}>Add Event Image</Text>
                <Text style={styles.uploadSubtext}>Tap to select an image</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter event title"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter event description"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Place */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIconText]}
                value={place}
                onChangeText={setPlace}
                placeholder="Enter event location"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity 
              style={styles.inputWithIcon}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={colors.primary} style={styles.inputIcon} />
              <Text style={styles.inputWithIconText}>
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Time */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity 
              style={styles.inputWithIcon}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color={colors.primary} style={styles.inputIcon} />
              <Text style={styles.inputWithIconText}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    setTime(selectedTime);
                  }
                }}
              />
            )}
          </View>

          {/* Total People */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Total People</Text>
            <View style={styles.inputWithIcon}>
              <Users size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIconText]}
                value={totalPeople}
                onChangeText={setTotalPeople}
                placeholder="Enter maximum number of people"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Upload size={20} color="#FFFFFF" style={styles.submitIcon} />
                <Text style={styles.submitButtonText}>Create Event</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  imageUpload: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: colors.card,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 120,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWithIconText: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 