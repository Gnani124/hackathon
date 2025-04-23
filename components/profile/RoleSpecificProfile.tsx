import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextField } from '@/components/ui/TextField';
import { UserRole } from '@/types';
import { Book, Award, Briefcase } from 'lucide-react-native';

interface RoleSpecificProfileProps {
  role: UserRole;
  values: {
    student?: {
      rollNumber?: string;
      department?: string;
      year?: string;
      semester?: string;
    };
    faculty?: {
      department?: string;
      designation?: string;
      qualification?: string;
      experience?: string;
      expertise?: string;
    };
  };
  onChange: (field: string, value: string) => void;
}

const RoleSpecificProfile: React.FC<RoleSpecificProfileProps> = ({ role, values, onChange }) => {
  const renderStudentFields = () => (
    <View style={styles.container}>
      <TextField
        label="Roll Number"
        value={values.student?.rollNumber || ''}
        onChangeText={(value) => onChange('rollNumber', value)}
        placeholder="Enter your roll number"
      />
      <TextField
        label="Department"
        value={values.student?.department || ''}
        onChangeText={(value) => onChange('department', value)}
        placeholder="Enter your department"
      />
      <TextField
        label="Year"
        value={values.student?.year || ''}
        onChangeText={(value) => onChange('year', value)}
        placeholder="Enter your year"
        keyboardType="numeric"
      />
      <TextField
        label="Semester"
        value={values.student?.semester || ''}
        onChangeText={(value) => onChange('semester', value)}
        placeholder="Enter your semester"
        keyboardType="numeric"
      />
    </View>
  );

  const renderFacultyFields = () => (
    <View style={styles.container}>
      <TextField
        label="Department"
        value={values.faculty?.department || ''}
        onChangeText={(value) => onChange('department', value)}
        placeholder="Enter your department"
        leftIcon={<Book size={20} color="#3B82F6" />}
      />
      <TextField
        label="Designation"
        value={values.faculty?.designation || ''}
        onChangeText={(value) => onChange('designation', value)}
        placeholder="Enter your designation"
        leftIcon={<Award size={20} color="#3B82F6" />}
      />
      <TextField
        label="Qualification"
        value={values.faculty?.qualification || ''}
        onChangeText={(value) => onChange('qualification', value)}
        placeholder="Enter your qualification"
        leftIcon={<Award size={20} color="#3B82F6" />}
      />
      <TextField
        label="Experience"
        value={values.faculty?.experience || ''}
        onChangeText={(value) => onChange('experience', value)}
        placeholder="Enter your years of experience"
        leftIcon={<Briefcase size={20} color="#3B82F6" />}
      />
      <TextField
        label="Area of Expertise"
        value={values.faculty?.expertise || ''}
        onChangeText={(value) => onChange('expertise', value)}
        placeholder="Enter your area of expertise"
        leftIcon={<Book size={20} color="#3B82F6" />}
      />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.title}>
        {role === 'student' ? 'Academic Information' : 'Professional Information'}
      </Text>
      {role === 'student' && renderStudentFields()}
      {role === 'faculty' && renderFacultyFields()}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  container: {
    gap: 12,
  },
});

export default RoleSpecificProfile; 