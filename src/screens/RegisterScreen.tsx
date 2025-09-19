import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import FormInput from '../components/FormInput';
import { AuthService } from '../services';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);

    // Name validation
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      setPasswordError('Password must contain uppercase, lowercase, number and special character');
      isValid = false;
    }

    // Confirm password validation
    if (!confirm.trim()) {
      setConfirmError('Please confirm your password');
      isValid = false;
    } else if (password !== confirm) {
      setConfirmError('Passwords do not match');
      isValid = false;
    }

    // Terms agreement
    if (!agreedToTerms) {
      Alert.alert('Terms & Conditions', 'Please agree to the terms and conditions to continue.');
      isValid = false;
    }

    return isValid;
  };

  const onRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Use Firebase Authentication
      const result = await AuthService.register(email.trim(), password, name.trim());
      
      if (result.success) {
        Alert.alert(
          'Registration Successful!', 
          'Welcome to AgroSense! You can now login with your new credentials.',
          [
            {
              text: 'Login',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', result.error || 'Something went wrong. Please try again.');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.logo}>AgroSense</Text>
          <Text style={styles.subtitle}>Join the future of smart farming</Text>

          <View style={styles.card}>
            <FormInput 
              label="Full Name" 
              value={name} 
              onChangeText={setName}
              error={nameError}
              validationRules={{
                required: true,
                minLength: 2
              }}
              onValidation={(isValid) => {
                if (!isValid && name) {
                  setNameError('Name must be at least 2 characters');
                } else {
                  setNameError(null);
                }
              }}
            />
            
            <FormInput 
              label="Email" 
              value={email} 
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address" 
              autoCapitalize="none"
              validationRules={{
                required: true,
                email: true
              }}
              onValidation={(isValid) => {
                if (!isValid && email) {
                  setEmailError('Please enter a valid email');
                } else {
                  setEmailError(null);
                }
              }}
            />
            
            <FormInput 
              label="Password" 
              value={password} 
              onChangeText={setPassword}
              error={passwordError}
              showPasswordToggle
              validationRules={{
                required: true,
                strongPassword: true
              }}
              onValidation={(isValid) => {
                if (!isValid && password) {
                  setPasswordError('Password must contain uppercase, lowercase, number and special character');
                } else {
                  setPasswordError(null);
                }
              }}
            />
            
            <FormInput 
              label="Confirm Password" 
              value={confirm} 
              onChangeText={setConfirm}
              error={confirmError}
              showPasswordToggle
              validationRules={{
                required: true,
                minLength: 8
              }}
              onValidation={(isValid) => {
                if (!isValid && confirm) {
                  setConfirmError('Please confirm your password');
                } else if (password && confirm && password !== confirm) {
                  setConfirmError('Passwords do not match');
                } else {
                  setConfirmError(null);
                }
              }}
            />

            <TouchableOpacity 
              style={styles.termsRow}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Pressable 
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
              onPress={onRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </Pressable>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Login</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50,
  },
  logo: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#BDBDBD',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#141414',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 4,
    marginRight: 8,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    color: '#BDBDBD',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#BDBDBD',
  },
  linkAccent: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default RegisterScreen;
