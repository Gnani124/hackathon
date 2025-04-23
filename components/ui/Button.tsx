import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  gradient = false,
}) => {
  // Size styles
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 16 },
          text: { fontSize: 14 },
        };
      case 'lg':
        return {
          container: { paddingVertical: 16, paddingHorizontal: 24 },
          text: { fontSize: 18 },
        };
      default:
        return {
          container: { paddingVertical: 12, paddingHorizontal: 20 },
          text: { fontSize: 16 },
        };
    }
  };

  // Variant styles
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: '#14B8A6' },
          text: { color: '#FFFFFF' },
        };
      case 'outline':
        return {
          container: { 
            backgroundColor: 'transparent', 
            borderWidth: 1, 
            borderColor: '#3B82F6' 
          },
          text: { color: '#3B82F6' },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: '#3B82F6' },
        };
      case 'danger':
        return {
          container: { backgroundColor: '#EF4444' },
          text: { color: '#FFFFFF' },
        };
      default:
        return {
          container: { backgroundColor: '#3B82F6' },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  
  const buttonStyles = [
    styles.button,
    sizeStyles.container,
    !gradient && variantStyles.container,
    fullWidth && styles.fullWidth,
    (disabled || isLoading) && styles.disabled,
    style,
  ];
  
  const textStyles = [
    styles.text,
    sizeStyles.text,
    variantStyles.text,
    (disabled || isLoading) && styles.disabledText,
    textStyle,
  ];

  const Button = (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={buttonStyles}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#3B82F6' : '#FFFFFF'} 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );

  if (gradient && variant === 'primary' && !disabled) {
    return (
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, sizeStyles.container, fullWidth && styles.fullWidth, style]}
      >
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || isLoading}
          style={[styles.gradientButton, fullWidth && styles.fullWidth]}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={textStyles}>{title}</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return Button;
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        outlineStyle: 'none',
      },
    }),
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },
  disabledText: {
    color: '#9CA3AF',
  },
});