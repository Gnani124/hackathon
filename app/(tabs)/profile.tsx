import React, { useState, useEffect } from 'react';
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
  Animated,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { 
  Camera, LogOut, User, Settings, CreditCard as Edit2, UserPlus, 
  ChevronRight, Book, Upload, Users, CircleAlert as AlertCircle, 
  Phone, Mail, Calendar, Target, Star, Award, Briefcase, 
  GraduationCap, Building2, Clock, Shield, Trophy, Medal, Crown 
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import RoleSpecificProfile from '@/components/profile/RoleSpecificProfile';
import { StudentRoadmap } from '@/components/student/StudentRoadmap';
import { User as UserType, StudentUser, FacultyUser } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout, updateUserProfile } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    phoneNumber: '',
    course: '',
    year: '',
    areaOfInterest: '',
    skills: '',
    studentId: '',
    // Faculty specific fields
    facultyId: '',
    department: '',
    qualification: '',
    experience: '',
    expertise: '',
  });
  const scrollY = new Animated.Value(0);
  const [roleSpecificData, setRoleSpecificData] = useState<{
    student: {
      rollNumber: string;
      department: string;
      year: string;
      semester: string;
    };
    faculty: {
      department: string;
      designation: string;
      qualification: string;
    };
  }>({
    student: {
      rollNumber: '',
      department: '',
      year: '',
      semester: '',
    },
    faculty: {
      department: '',
      designation: '',
      qualification: '',
    },
  });

  const student = user as StudentUser;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 120],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (user) {
      // Initialize role-specific data from user profile
      if (user.role === 'student' || user.role === 'faculty') {
        const roleData = user.role === 'student' 
          ? {
              rollNumber: (user as StudentUser).rollNumber || '',
              department: (user as StudentUser).department || '',
              year: (user as StudentUser).year || '',
              semester: (user as StudentUser).semester || '',
            }
          : {
              department: (user as FacultyUser).department || '',
              designation: (user as FacultyUser).designation || '',
              qualification: (user as FacultyUser).qualification || '',
            };

        setRoleSpecificData(prev => ({
          ...prev,
          [user.role]: roleData,
        }));
      }

      setEditForm({
        displayName: user.displayName || '',
        phoneNumber: (user as any).phoneNumber || '',
        course: (user as StudentUser).course || '',
        year: (user as StudentUser).year || '',
        areaOfInterest: (user as StudentUser).areaOfInterest || '',
        skills: (user as StudentUser).skills?.join(', ') || '',
        studentId: (user as StudentUser).studentId || '',
        // Faculty specific fields
        facultyId: (user as any).facultyId || '',
        department: (user as any).department || '',
        qualification: (user as any).qualification || '',
        experience: (user as any).experience || '',
        expertise: (user as any).expertise || '',
      });
    }
  }, [user]);

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
      console.log('Storage bucket:', storage.app.options.storageBucket);
      
      // Upload the image with metadata
      const metadata = {
        contentType: fileType,
        customMetadata: {
          'userId': user.id,
          'uploadedAt': Date.now().toString()
        }
      };
      
      console.log('Starting upload to Firebase Storage...');
      console.log('Upload metadata:', metadata);
      
      try {
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
      } catch (uploadError: any) {
        console.error('Upload error details:', {
          code: uploadError.code,
          message: uploadError.message,
          serverResponse: uploadError.serverResponse,
          name: uploadError.name,
          stack: uploadError.stack
        });
        throw uploadError;
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error stack:', error.stack);
      
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
        ];
      case 'faculty':
        return [
          { icon: <Book size={22} color="#3B82F6" />, title: 'My Courses', screen: 'my-courses' },
          { icon: <Upload size={22} color="#3B82F6" />, title: 'Upload Materials', screen: 'upload-materials' },
        ];
      default:
        return [];
    }
  };

  const handleRoleSpecificChange = (field: string, value: string) => {
    if (!user?.role || (user.role !== 'student' && user.role !== 'faculty')) return;

    setRoleSpecificData(prev => ({
      ...prev,
      [user.role]: {
        ...prev[user.role],
        [field]: value,
      },
    }));
  };

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updates = {
        displayName: editForm.displayName,
        phoneNumber: editForm.phoneNumber,
        ...(user?.role === 'student' && {
          course: editForm.course,
          year: editForm.year,
          areaOfInterest: editForm.areaOfInterest,
          skills: editForm.skills.split(',').map(skill => skill.trim()).filter(Boolean),
          studentId: editForm.studentId,
        }),
        ...(user?.role === 'faculty' && {
          facultyId: editForm.facultyId,
          department: editForm.department,
          qualification: editForm.qualification,
          experience: editForm.experience,
          expertise: editForm.expertise,
          email: user?.email,
          id: user?.id,
        }),
      };

      await updateUserProfile(updates);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const renderRoleSpecificInfo = () => {
    switch (user?.role) {
      case 'student':
        return (
          <>
            <Card style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <GraduationCap size={24} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Academic Information</Text>
              </View>
              {renderInfoItem(<Book size={20} color="#3B82F6" />, 'Course', student.course)}
              {renderInfoItem(<Calendar size={20} color="#3B82F6" />, 'Academic Year', student.year)}
              {renderInfoItem(<Target size={20} color="#3B82F6" />, 'Area of Interest', student.areaOfInterest)}
            </Card>

            {student.skills && student.skills.length > 0 && (
              <Card style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <Trophy size={24} color="#3B82F6" />
                  <Text style={styles.sectionTitle}>Skills</Text>
                </View>
                <View style={styles.skillsContainer}>
                  {student.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Star size={16} color="#3B82F6" style={styles.skillIcon} />
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </>
        );
      case 'faculty':
        return (
          <>
            <Card style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Shield size={24} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Professional Information</Text>
              </View>
              {renderInfoItem(<Building2 size={20} color="#3B82F6" />, 'Department', editForm.department)}
              {renderInfoItem(<Medal size={20} color="#3B82F6" />, 'Qualification', editForm.qualification)}
              {renderInfoItem(<Clock size={20} color="#3B82F6" />, 'Experience', editForm.experience)}
              {renderInfoItem(<Crown size={20} color="#3B82F6" />, 'Area of Expertise', editForm.expertise)}
            </Card>
          </>
        );
      default:
        return null;
    }
  };

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity 
              onPress={() => setIsEditModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={editForm.displayName}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, displayName: text }))}
                placeholder="Enter your name"
              />
            </View>

            {user?.role === 'student' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Student ID</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.studentId}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, studentId: text }))}
                    placeholder="Enter your student ID"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Course</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.course}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, course: text }))}
                    placeholder="Enter your course"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Academic Year</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.year}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, year: text }))}
                    placeholder="Enter your academic year"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Area of Interest</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.areaOfInterest}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, areaOfInterest: text }))}
                    placeholder="Enter your area of interest"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Skills (comma-separated)</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.skills}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, skills: text }))}
                    placeholder="Enter your skills (e.g., JavaScript, React, Node.js)"
                  />
                </View>
              </>
            )}

            {user?.role === 'faculty' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Faculty ID</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.facultyId}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, facultyId: text }))}
                    placeholder="Enter your faculty ID"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Department</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.department}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, department: text }))}
                    placeholder="Enter your department"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Qualification</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.qualification}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, qualification: text }))}
                    placeholder="Enter your qualification"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Experience</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.experience}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, experience: text }))}
                    placeholder="Enter your experience"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Area of Expertise</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.expertise}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, expertise: text }))}
                    placeholder="Enter your area of expertise"
                  />
                </View>
              </>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={editForm.phoneNumber}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, phoneNumber: text }))}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setIsEditModalVisible(false)}
              style={styles.modalButton}
            />
            <Button
              title={isSaving ? "Saving..." : "Save Changes"}
              variant="primary"
              onPress={handleSaveProfile}
              isLoading={isSaving}
              style={styles.modalButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderAttendanceCard = () => (
    <View style={styles.attendanceCard}>
      <LinearGradient
        colors={['#4F46E5', '#3B82F6']}
        style={styles.attendanceGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.attendanceTitle}>Attendance Dashboard</Text>
        <View style={styles.attendanceStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{student.attendance?.present || 0}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{student.attendance?.absent || 0}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{student.attendance?.percentage || 0}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
        </View>
        <View style={styles.attendanceBar}>
          <View 
            style={[
              styles.attendanceProgress, 
              { width: `${student.attendance?.percentage || 0}%` }
            ]} 
          />
        </View>
      </LinearGradient>
    </View>
  );

  const renderInfoItem = (icon: React.ReactNode, label: string, value?: string) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        {icon}
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#4F46E5', '#3B82F6']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
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
                onError={() => setImageError(true)}
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
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
            >
        <View style={styles.content}>
          {user?.role === 'student' && renderAttendanceCard()}

          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {renderInfoItem(<User size={20} color="#3B82F6" />, 'ID', user?.role === 'student' ? student.studentId : (user as any).facultyId)}
            {renderInfoItem(<Mail size={20} color="#3B82F6" />, 'Email', user?.email)}
            {renderInfoItem(<Phone size={20} color="#3B82F6" />, 'Phone', (user as any).phoneNumber)}
        </Card>

          {renderRoleSpecificInfo()}

          <View style={styles.buttonContainer}>
            <Button
              title="Edit Profile"
              variant="primary"
              onPress={handleEditProfile}
              style={styles.editButton}
            />
          <Button
            title="Log Out"
            variant="outline"
            onPress={handleLogout}
            isLoading={isLoggingOut}
              style={styles.logoutButton}
          />
          </View>
        </View>
      </Animated.ScrollView>
      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 200,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraButtonDisabled: {
    opacity: 0.7,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  roleText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  email: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  attendanceCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  attendanceGradient: {
    padding: 24,
  },
  attendanceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 16,
    minWidth: 100,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  attendanceBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  attendanceProgress: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  infoCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  skillText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    marginBottom: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButton: {
    marginBottom: 24,
    borderRadius: 12,
  },
  avatarLoading: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  modalForm: {
    maxHeight: '80%',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginLeft: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  skillIcon: {
    marginRight: 4,
  },
});