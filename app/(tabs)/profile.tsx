import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Camera, LogOut, User, Settings, CreditCard as Edit2, UserPlus, ChevronRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';

export default function ProfileScreen() {
  const { user, logout, updateUserProfile } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Default profile picture URL
  const defaultProfilePicture = 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      setIsUploading(true);
      console.log('Starting image upload process...');
      console.log('User ID:', user.id);
      
      // Check file size (limit to 5MB)
      const response = await fetch(uri);
      const blob = await response.blob();
      console.log('Image blob size:', blob.size);
      console.log('Image type:', blob.type);
      
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Check file type
      const fileType = blob.type;
      if (!fileType.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      // Create a reference to the storage location with a unique filename
      const filename = `profile-pictures/${user.id}_${Date.now()}`;
      const storageRef = ref(storage, filename);
      console.log('Storage reference created:', filename);
      
      // Upload the image with metadata
      const metadata = {
        contentType: fileType,
        customMetadata: {
          'userId': user.id,
          'uploadedAt': Date.now().toString()
        }
      };
      
      console.log('Starting upload to Firebase Storage...');
      const uploadResult = await uploadBytes(storageRef, blob, metadata);
      console.log('Upload successful:', uploadResult);
      
      // Get the download URL
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Download URL obtained:', downloadURL);
      
      // Update user profile with new image URL
      console.log('Updating user profile with new image URL...');
      await updateUserProfile({ profilePicture: downloadURL });
      console.log('Profile update successful');
      
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      let errorMessage = 'Failed to update profile picture. Please try again.';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'You are not authorized to upload images. Please sign in again.';
      } else if (error.code === 'storage/canceled') {
        errorMessage = 'Upload was canceled. Please try again.';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'An error occurred while uploading. Please check your internet connection and try again.';
      } else if (error.message === 'User not authenticated') {
        errorMessage = 'Please sign in again to update your profile picture.';
      } else if (error.message === 'Image size must be less than 5MB') {
        errorMessage = 'Image size must be less than 5MB. Please choose a smaller image.';
      } else if (error.message === 'File must be an image') {
        errorMessage = 'Please select an image file.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const getRoleSpecificOptions = () => {
    switch (user?.role) {
      case 'student':
        return [
          { icon: <User size={22} color="#3B82F6" />, title: 'Academic Profile', screen: 'academic-profile' },
          { icon: <UserPlus size={22} color="#3B82F6" />, title: 'Connect Parent', screen: 'connect-parent' },
        ];
      case 'faculty':
        return [
          { icon: <BookOpen size={22} color="#3B82F6" />, title: 'My Courses', screen: 'my-courses' },
          { icon: <Upload size={22} color="#3B82F6" />, title: 'Upload Materials', screen: 'upload-materials' },
        ];
      case 'parent':
        return [
          { icon: <Users size={22} color="#3B82F6" />, title: 'My Children', screen: 'my-children' },
          { icon: <AlertCircle size={22} color="#3B82F6" />, title: 'Notifications', screen: 'notifications' },
        ];
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {isUploading ? (
              <View style={[styles.avatar, styles.avatarLoading]}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              <Image
                source={{ 
                  uri: user?.profilePicture || defaultProfilePicture
                }}
                style={styles.avatar}
                onError={() => {
                  console.error('Error loading profile image');
                  setImageError(true);
                }}
              />
            )}
            <TouchableOpacity 
              style={[styles.cameraButton, isUploading && styles.cameraButtonDisabled]} 
              onPress={pickImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Camera size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.displayName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'student'
                ? 'Student'
                : user?.role === 'faculty'
                  ? 'Faculty'
                  : 'Parent'}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card style={styles.optionsCard}>
          {getRoleSpecificOptions().map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.optionItem,
                index < getRoleSpecificOptions().length - 1 && styles.optionItemBorder
              ]}
              onPress={() => {
                // Navigate to the specific screen
              }}
            >
              <View style={styles.optionIconTitle}>
                {option.icon}
                <Text style={styles.optionTitle}>{option.title}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </Card>

        <Card style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              // Navigate to account settings
            }}
          >
            <View style={styles.optionIconTitle}>
              <Settings size={20} color="#6B7280" />
              <Text style={styles.settingTitle}>Account Settings</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              // Navigate to edit profile
            }}
          >
            <View style={styles.optionIconTitle}>
              <Edit2 size={20} color="#6B7280" />
              <Text style={styles.settingTitle}>Edit Profile</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </Card>

        <View style={styles.logoutContainer}>
          <Button
            title="Log Out"
            variant="outline"
            onPress={handleLogout}
            isLoading={isLoggingOut}
            fullWidth
          />
        </View>

        <Text style={styles.version}>CampusSync v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

import { BookOpen, Upload, Users, CircleAlert as AlertCircle } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cameraButtonDisabled: {
    opacity: 0.7,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#EBF5FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
  },
  optionsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingTitle: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
  },
  logoutContainer: {
    margin: 16,
    marginTop: 24,
  },
  version: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  avatarLoading: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});