import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  showPasswordToggle?: boolean;
  onValidation?: (isValid: boolean) => void;
  validationRules?: {
    required?: boolean;
    minLength?: number;
    email?: boolean;
    strongPassword?: boolean;
  };
};

const FormInput: React.FC<Props> = ({ 
  label, 
  error, 
  style, 
  showPasswordToggle = false,
  onValidation,
  validationRules,
  value,
  onChangeText,
  ...rest 
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validateInput = (text: string) => {
    if (!validationRules) return true;

    const { required, minLength, email, strongPassword } = validationRules;

    if (required && !text.trim()) return false;
    if (minLength && text.length < minLength) return false;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return false;
    if (strongPassword && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(text)) return false;

    return true;
  };

  const handleTextChange = (text: string) => {
    onChangeText?.(text);
    if (onValidation) {
      const isValid = validateInput(text);
      onValidation(isValid);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return '';
    if (password.length < 6) return 'Weak';
    if (password.length < 8) return 'Fair';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) return 'Strong';
    return 'Good';
  };

  const passwordStrength = showPasswordToggle && validationRules?.strongPassword ? getPasswordStrength(value || '') : '';
  
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError
      ]}>
        <TextInput
          placeholderTextColor="#9E9E9E"
          style={[styles.input, style]}
          value={value}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : rest.secureTextEntry}
          {...rest}
        />
        
        {showPasswordToggle && (
          <TouchableOpacity 
            style={styles.passwordToggle}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text style={styles.passwordToggleText}>
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {passwordStrength ? (
        <Text style={[
          styles.passwordStrength,
          passwordStrength === 'Strong' && styles.strengthStrong,
          passwordStrength === 'Good' && styles.strengthGood,
          passwordStrength === 'Fair' && styles.strengthFair,
          passwordStrength === 'Weak' && styles.strengthWeak,
        ]}>
          Password strength: {passwordStrength}
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    color: '#BDBDBD',
    fontSize: 12,
    marginBottom: 6,
  },
  inputContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerFocused: {
    borderColor: '#4CAF50',
  },
  inputContainerError: {
    borderColor: '#FF5252',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 12,
  },
  passwordToggleText: {
    fontSize: 16,
  },
  passwordStrength: {
    fontSize: 12,
    marginTop: 4,
  },
  strengthWeak: {
    color: '#FF5252',
  },
  strengthFair: {
    color: '#FF9800',
  },
  strengthGood: {
    color: '#2196F3',
  },
  strengthStrong: {
    color: '#4CAF50',
  },
  error: {
    color: '#FF5252',
    marginTop: 6,
    fontSize: 12,
  },
});

export default FormInput;
