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
  GraduationCap, Building2, Clock, Shield, Trophy, Medal, Crown,
  AlertTriangle, X
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import RoleSpecificProfile from '@/components/profile/RoleSpecificProfile';
import { StudentRoadmap } from '@/components/student/StudentRoadmap';
import { User as UserType, StudentUser, ParentUser } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '@/constants/colors';
import ComplaintForm from '@/components/ComplaintForm';
import { FontAwesome } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

const { width } = Dimensions.get('window');

// Update the type definition for user role
type UserRole = 'student' | 'faculty' | 'parent';

// Update the FacultyUser type
type FacultyUser = UserType & {
  role: 'faculty';
  department: string;
  designation: string;
  qualification: string;
  phoneNumber: string;
  facultyId: string;
  experience: string;
  expertise: string;
};

// Add dummy attendance data
const dummyAttendanceData = {
  totalClasses: 45,
  present: 38,
  absent: 7,
  percentage: 84.4,
  monthlyStats: [
    { month: 'Jan', present: 18, absent: 2 },
    { month: 'Feb', present: 15, absent: 3 },
    { month: 'Mar', present: 5, absent: 2 },
  ],
  recentAttendance: [
    { date: '2024-03-15', status: 'present', subject: 'Mathematics' },
    { date: '2024-03-14', status: 'absent', subject: 'Physics' },
    { date: '2024-03-13', status: 'present', subject: 'Computer Science' },
    { date: '2024-03-12', status: 'present', subject: 'English' },
    { date: '2024-03-11', status: 'present', subject: 'Chemistry' },
  ]
};

export default function ParentProfile() {
  const { user, logout, updateUserProfile } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ParentUser>>({
    displayName: '',
    phoneNumber: '',
    address: '',
    relationship: ''
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

      setEditedProfile({
        displayName: user.displayName || '',
        phoneNumber: (user as ParentUser)?.phoneNumber || '',
        address: (user as ParentUser)?.address || '',
        relationship: (user as ParentUser)?.relationship || '',
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

  const handleSave = async () => {
    if (!user || !('uid' in user)) return;
    
    try {
      const userRef = doc(db, 'users', user.uid as string);
      await updateDoc(userRef, {
        displayName: editedProfile.displayName,
        phoneNumber: editedProfile.phoneNumber,
        address: editedProfile.address,
        relationship: editedProfile.relationship
      });
      
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      displayName: user?.displayName || '',
      phoneNumber: (user as ParentUser)?.phoneNumber || '',
      address: (user as ParentUser)?.address || '',
      relationship: (user as ParentUser)?.relationship || '',
    });
    setIsEditModalVisible(false);
  };

  const renderRoleSpecificInfo = () => {
    if (!user) return null;
    
    const userRole = user.role as UserRole;
    
    switch (userRole) {
      case 'parent':
        return (
          <>
            <Card style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <User size={24} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Parent Information</Text>
              </View>
              {renderInfoItem(<Phone size={20} color="#3B82F6" />, 'Phone Number', editedProfile.phoneNumber)}
              {renderInfoItem(<Mail size={20} color="#3B82F6" />, 'Address', editedProfile.address)}
              {renderInfoItem(<Users size={20} color="#3B82F6" />, 'Relationship', editedProfile.relationship)}
            </Card>
          </>
        );
      default:
        return null;
    }
  };

  const renderEditModal = () => {
    if (!user) return null;
    
    return (
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.displayName}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, displayName: text }))}
                  placeholder="Enter your name"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.phoneNumber}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, phoneNumber: text }))}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.address}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, address: text }))}
                  placeholder="Enter your address"
                  multiline
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Relationship</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.relationship}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, relationship: text }))}
                  placeholder="Enter your relationship"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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

  const renderAttendanceDashboard = () => {
    return (
      <View style={styles.attendanceDashboard}>
        <View style={styles.attendanceHeader}>
          <Calendar size={24} color={colors.primary} />
          <Text style={styles.studentAttendanceTitle}>Attendance Dashboard</Text>
        </View>

        {/* Overall Stats */}
        <View style={styles.studentAttendanceStats}>
          <View style={styles.studentAttendanceStat}>
            <Text style={styles.studentAttendanceStatValue}>{dummyAttendanceData.percentage}%</Text>
            <Text style={styles.studentAttendanceStatLabel}>Overall</Text>
          </View>
          <View style={styles.studentAttendanceStat}>
            <Text style={styles.studentAttendanceStatValue}>{dummyAttendanceData.present}</Text>
            <Text style={styles.studentAttendanceStatLabel}>Present</Text>
          </View>
          <View style={styles.studentAttendanceStat}>
            <Text style={styles.studentAttendanceStatValue}>{dummyAttendanceData.absent}</Text>
            <Text style={styles.studentAttendanceStatLabel}>Absent</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.attendanceProgressContainer}>
          <View style={styles.attendanceProgressBar}>
            <View 
              style={[
                styles.attendanceProgressFill,
                { width: `${dummyAttendanceData.percentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.attendanceProgressText}>
            {dummyAttendanceData.present} of {dummyAttendanceData.totalClasses} classes attended
          </Text>
        </View>

        {/* Monthly Stats */}
        <View style={styles.monthlyStats}>
          <Text style={styles.monthlyStatsTitle}>Monthly Overview</Text>
          <View style={styles.monthlyStatsContainer}>
            {dummyAttendanceData.monthlyStats.map((stat, index) => (
              <View key={index} style={styles.monthlyStat}>
                <Text style={styles.monthlyStatMonth}>{stat.month}</Text>
                <View style={styles.monthlyStatBar}>
                  <View 
                    style={[
                      styles.monthlyStatFill,
                      { 
                        width: `${(stat.present / (stat.present + stat.absent)) * 100}%`,
                        backgroundColor: colors.primary
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.monthlyStatText}>
                  {stat.present}/{stat.present + stat.absent}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Attendance */}
        <View style={styles.recentAttendance}>
          <Text style={styles.recentAttendanceTitle}>Recent Attendance</Text>
          {dummyAttendanceData.recentAttendance.map((record, index) => (
            <View key={index} style={styles.recentAttendanceItem}>
              <View style={styles.recentAttendanceDate}>
                <Text style={styles.recentAttendanceDay}>
                  {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={styles.recentAttendanceDateText}>
                  {new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <View style={styles.recentAttendanceInfo}>
                <Text style={styles.recentAttendanceSubject}>{record.subject}</Text>
                <View style={[
                  styles.recentAttendanceStatus,
                  { backgroundColor: record.status === 'present' ? `${colors.success}20` : `${colors.error}20` }
                ]}>
                  <Text style={[
                    styles.recentAttendanceStatusText,
                    { color: record.status === 'present' ? colors.success : colors.error }
                  ]}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const [isComplaintModalVisible, setIsComplaintModalVisible] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const handleComplaintSubmit = () => {
    setIsComplaintModalVisible(false);
    setSelectedFaculty(null);
  };

  const renderStudentProfile = () => {
    if (!user || (user.role as UserRole) !== 'student') return null;
    const student = user as StudentUser;

    return (
      <View style={styles.studentProfile}>
        {renderAttendanceDashboard()}
        {/* Academic Overview Card */}
        <View style={styles.overviewCard}>
          <LinearGradient
            colors={[colors.primary, colors.info]}
            style={styles.overviewGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.overviewHeader}>
              <GraduationCap size={24} color={colors.card} />
              <Text style={styles.overviewTitle}>Academic Overview</Text>
            </View>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{student.attendance?.percentage || 0}%</Text>
                <Text style={styles.overviewStatLabel}>Attendance</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{student.course || 'N/A'}</Text>
                <Text style={styles.overviewStatLabel}>Course</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{student.year || 'N/A'}</Text>
                <Text style={styles.overviewStatLabel}>Year</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              setSelectedFaculty({
                name: 'Dr. John Smith', // Replace with actual faculty data
                email: 'john.smith@example.com', // Replace with actual faculty email
              });
              setIsComplaintModalVisible(true);
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.info]}
              style={[StyleSheet.absoluteFill, styles.quickActionGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <AlertTriangle size={24} color={colors.card} />
            <Text style={styles.quickActionText}>Submit Complaint</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/results')}
          >
            <LinearGradient
              colors={[colors.success, colors.info]}
              style={[StyleSheet.absoluteFill, styles.quickActionGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Award size={24} color={colors.card} />
            <Text style={styles.quickActionText}>View Results</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.profileSection}>
          <View style={styles.profileSectionHeader}>
            <User size={24} color={colors.primary} />
            <Text style={styles.profileSectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.profileInfoCard}>
            {renderInfoItem(<Mail size={20} color={colors.primary} />, 'Email', user.email)}
            {renderInfoItem(<Phone size={20} color={colors.primary} />, 'Phone', student.phoneNumber)}
            {renderInfoItem(<Book size={20} color={colors.primary} />, 'Student ID', student.studentId)}
          </View>
        </View>

        {/* Academic Details */}
        <View style={styles.profileSection}>
          <View style={styles.profileSectionHeader}>
            <GraduationCap size={24} color={colors.primary} />
            <Text style={styles.profileSectionTitle}>Academic Details</Text>
          </View>
          <View style={styles.profileInfoCard}>
            {renderInfoItem(<Building2 size={20} color={colors.primary} />, 'Department', student.department)}
            {renderInfoItem(<Target size={20} color={colors.primary} />, 'Semester', student.semester)}
            {renderInfoItem(<Clock size={20} color={colors.primary} />, 'Year', student.year)}
          </View>
        </View>

        {/* Skills & Interests */}
        {student.skills && student.skills.length > 0 && (
          <View style={styles.profileSection}>
            <View style={styles.profileSectionHeader}>
              <Trophy size={24} color={colors.primary} />
              <Text style={styles.profileSectionTitle}>Skills & Interests</Text>
            </View>
            <View style={styles.profileSkillsCard}>
              <View style={styles.profileSkillsContainer}>
                {student.skills.map((skill, index) => (
                  <View key={index} style={styles.profileSkillTag}>
                    <Star size={16} color={colors.primary} style={styles.profileSkillIcon} />
                    <Text style={styles.profileSkillText}>{skill}</Text>
                  </View>
                ))}
              </View>
              {student.areaOfInterest && (
                <View style={styles.profileInterestContainer}>
                  <Text style={styles.profileInterestLabel}>Area of Interest</Text>
                  <Text style={styles.profileInterestText}>{student.areaOfInterest}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.profileActionButtons}>
          <TouchableOpacity
            style={styles.profileActionButton}
            onPress={handleEditProfile}
          >
            <Edit2 size={20} color={colors.primary} />
            <Text style={styles.profileActionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileActionButton, styles.profileLogoutButton]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.profileActionButtonText, styles.profileLogoutButtonText]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Complaint Modal */}
        <Modal
          visible={isComplaintModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsComplaintModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedFaculty && (
                <ComplaintForm
                  facultyEmail={selectedFaculty.email}
                  facultyName={selectedFaculty.name}
                  studentName={user.displayName || ''}
                  studentEmail={user.email || ''}
                  onSuccess={handleComplaintSubmit}
                  onCancel={() => setIsComplaintModalVisible(false)}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const renderFacultyProfile = () => {
    if (!user || (user.role as UserRole) !== 'faculty') return null;
    const faculty = user as unknown as FacultyUser;

    return (
      <View style={styles.facultyProfile}>
        {/* Personal Information */}
        <View style={styles.profileSection}>
          <View style={styles.profileSectionHeader}>
            <User size={24} color={colors.primary} />
            <Text style={styles.profileSectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.profileInfoCard}>
            {renderInfoItem(<Mail size={20} color={colors.primary} />, 'Email', user.email)}
            {renderInfoItem(<Phone size={20} color={colors.primary} />, 'Phone', faculty.phoneNumber)}
            {renderInfoItem(<Book size={20} color={colors.primary} />, 'Faculty ID', faculty.facultyId)}
          </View>
        </View>

        {/* Professional Information */}
        <View style={styles.profileSection}>
          <View style={styles.profileSectionHeader}>
            <Shield size={24} color={colors.primary} />
            <Text style={styles.profileSectionTitle}>Professional Information</Text>
          </View>
          <View style={styles.profileInfoCard}>
            {renderInfoItem(<Building2 size={20} color={colors.primary} />, 'Department', faculty.department)}
            {renderInfoItem(<Medal size={20} color={colors.primary} />, 'Qualification', faculty.qualification)}
            {renderInfoItem(<Clock size={20} color={colors.primary} />, 'Experience', faculty.experience)}
            {renderInfoItem(<Crown size={20} color={colors.primary} />, 'Area of Expertise', faculty.expertise)}
          </View>
        </View>

        {/* Complaint Box */}
        <View style={styles.facultyComplaintBox}>
          <View style={styles.facultyComplaintStats}>
            <View style={styles.facultyComplaintStat}>
              <Text style={styles.facultyComplaintStatValue}>12</Text>
              <Text style={styles.facultyComplaintStatLabel}>Total Complaints</Text>
            </View>
            <View style={styles.facultyComplaintStat}>
              <Text style={styles.facultyComplaintStatValue}>8</Text>
              <Text style={styles.facultyComplaintStatLabel}>Resolved</Text>
            </View>
            <View style={styles.facultyComplaintStat}>
              <Text style={styles.facultyComplaintStatValue}>4</Text>
              <Text style={styles.facultyComplaintStatLabel}>Pending</Text>
            </View>
          </View>

          <View style={styles.facultyRecentComplaints}>
            <Text style={styles.facultyRecentComplaintsTitle}>Recent Complaints</Text>
            {[
              { id: 1, student: 'John Doe', subject: 'Mathematics', date: '2024-03-15', status: 'pending' },
              { id: 2, student: 'Jane Smith', subject: 'Physics', date: '2024-03-14', status: 'resolved' },
              { id: 3, student: 'Mike Johnson', subject: 'Computer Science', date: '2024-03-13', status: 'resolved' },
            ].map((complaint) => (
              <View key={complaint.id} style={styles.facultyComplaintItem}>
                <View style={styles.facultyComplaintInfo}>
                  <Text style={styles.facultyComplaintStudent}>{complaint.student}</Text>
                  <Text style={styles.facultyComplaintSubject}>{complaint.subject}</Text>
                  <Text style={styles.facultyComplaintDate}>
                    {new Date(complaint.date).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </Text>
                </View>
                <View style={[
                  styles.facultyComplaintStatus,
                  { backgroundColor: complaint.status === 'resolved' ? `${colors.success}20` : `${colors.warning}20` }
                ]}>
                  <Text style={[
                    styles.facultyComplaintStatusText,
                    { color: complaint.status === 'resolved' ? colors.success : colors.warning }
                  ]}>
                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.profileActionButtons}>
          <TouchableOpacity
            style={styles.profileActionButton}
            onPress={handleEditProfile}
          >
            <Edit2 size={20} color={colors.primary} />
            <Text style={styles.profileActionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileActionButton, styles.profileLogoutButton]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.profileActionButtonText, styles.profileLogoutButtonText]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderParentProfile = () => {
    if (!user || (user.role as UserRole) !== 'parent') return null;
    const parent = user as ParentUser;

    return (
      <View style={styles.parentProfile}>
        {/* Personal Information */}
        <View style={styles.profileSection}>
          <View style={styles.profileSectionHeader}>
            <User size={24} color={colors.primary} />
            <Text style={styles.profileSectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.profileInfoCard}>
            {renderInfoItem(<Mail size={20} color={colors.primary} />, 'Email', user.email)}
            {renderInfoItem(<Phone size={20} color={colors.primary} />, 'Phone Number', parent.phoneNumber)}
            {renderInfoItem(<Mail size={20} color={colors.primary} />, 'Address', parent.address)}
            {renderInfoItem(<Users size={20} color={colors.primary} />, 'Relationship', parent.relationship)}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.profileActionButtons}>
          <TouchableOpacity
            style={styles.profileActionButton}
            onPress={handleEditProfile}
          >
            <Edit2 size={20} color={colors.primary} />
            <Text style={styles.profileActionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileActionButton, styles.profileLogoutButton]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.profileActionButtonText, styles.profileLogoutButtonText]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <LinearGradient
          colors={[colors.primary, colors.info]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {isUploading ? (
              <View style={[styles.avatar, styles.avatarLoading]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <Image
                source={{ uri: user?.profilePicture || defaultProfilePicture }}
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
                <ActivityIndicator size="small" color={colors.card} />
              ) : (
                <Camera size={18} color={colors.card} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.displayName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'student' ? 'Student' : user?.role === 'faculty' ? 'Faculty' : 'Parent'}
            </Text>
          </View>
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
        {user?.role === 'student' ? renderStudentProfile() : 
         user?.role === 'faculty' ? renderFacultyProfile() : 
         renderParentProfile()}
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
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
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
  modalBody: {
    maxHeight: '80%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
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
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.card,
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
  roleSpecificSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  complaintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  complaintButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.card,
  },
  studentProfile: {
    padding: 16,
  },
  overviewCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewGradient: {
    padding: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: colors.card,
    marginLeft: 12,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewStat: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  overviewStatValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: colors.card,
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.card,
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionGradient: {
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: colors.card,
  },
  profileSection: {
    marginBottom: 24,
  },
  profileSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  profileInfoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileSkillsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  profileSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  profileSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileSkillIcon: {
    marginRight: 4,
  },
  profileSkillText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.primary,
  },
  profileInterestContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  profileInterestLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  profileInterestText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
  },
  profileActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  profileActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  profileActionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
  profileLogoutButton: {
    borderColor: colors.error,
  },
  profileLogoutButtonText: {
    color: colors.error,
  },
  attendanceDashboard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentAttendanceTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  studentAttendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  studentAttendanceStat: {
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  studentAttendanceStatValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  studentAttendanceStatLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },
  attendanceProgressContainer: {
    marginBottom: 24,
  },
  attendanceProgressBar: {
    height: 8,
    backgroundColor: `${colors.primary}20`,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  attendanceProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  attendanceProgressText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  monthlyStats: {
    marginBottom: 24,
  },
  monthlyStatsTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  monthlyStatsContainer: {
    gap: 12,
  },
  monthlyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthlyStatMonth: {
    width: 40,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },
  monthlyStatBar: {
    flex: 1,
    height: 8,
    backgroundColor: `${colors.primary}20`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  monthlyStatFill: {
    height: '100%',
    borderRadius: 4,
  },
  monthlyStatText: {
    width: 40,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
    textAlign: 'right',
  },
  recentAttendance: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  recentAttendanceTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  recentAttendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentAttendanceDate: {
    width: 80,
  },
  recentAttendanceDay: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
  },
  recentAttendanceDateText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  recentAttendanceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentAttendanceSubject: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textPrimary,
  },
  recentAttendanceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentAttendanceStatusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  facultyProfile: {
    padding: 16,
  },
  facultyComplaintBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  facultyComplaintStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  facultyComplaintStat: {
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  facultyComplaintStatValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  facultyComplaintStatLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },
  facultyRecentComplaints: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  facultyRecentComplaintsTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  facultyComplaintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  facultyComplaintInfo: {
    flex: 1,
  },
  facultyComplaintStudent: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  facultyComplaintSubject: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  facultyComplaintDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  facultyComplaintStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  facultyComplaintStatusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  parentProfile: {
    padding: 16,
  },
});