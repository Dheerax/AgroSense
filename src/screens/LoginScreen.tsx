import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import FormInput from '../components/FormInput';
import { AuthService } from '../services';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError(null);
    setPasswordError(null);

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const onLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Use Firebase Authentication
      const result = await AuthService.login(email.trim(), password);
      
      if (result.success) {
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Main (TabNavigator)
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }
          }
        ]);
      } else {
        Alert.alert('Login Failed', result.error || 'Please check your credentials and try again.');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>AgroSense</Text>
        <Text style={styles.subtitle}>Welcome back to your smart farm</Text>

        <View style={styles.card}>
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
              minLength: 6
            }}
            onValidation={(isValid) => {
              if (!isValid && password) {
                setPasswordError('Password must be at least 6 characters');
              } else {
                setPasswordError(null);
              }
            }}
          />

          <TouchableOpacity 
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <Pressable 
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
            onPress={onLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </Pressable>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 4,
    marginRight: 8,
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
  rememberText: {
    color: '#BDBDBD',
    fontSize: 14,
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
  forgotPassword: {
    alignItems: 'center',
    marginVertical: 12,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
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

export default LoginScreen;
