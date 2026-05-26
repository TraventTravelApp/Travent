import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { authService } from '../services/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.signup({ email, password });

      if (response.success) {
        setSuccess('Account created! Check your email for verification code.');
        setNeedsVerification(true);
      } else {
        // TEMPORARY: If backend not configured, skip to home for testing
        if (response.error?.includes('Backend not configured')) {
          setSuccess('Demo mode: Skipping to app (backend not deployed yet)');
          setTimeout(() => {
            navigation.navigate('Home');
          }, 1000);
        } else {
          setError(response.error || 'Failed to create account');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.confirmEmail({
        email,
        code: verificationCode,
      });

      if (response.success) {
        setSuccess('Email verified! You can now log in.');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        setError(response.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.resendCode({ email });

      if (response.success) {
        setSuccess('Verification code resent! Check your email.');
      } else {
        setError(response.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {!needsVerification ? (
            <>
              {/* Title */}
              <Text style={styles.title}>Welcome back, explorer</Text>
              <Text style={styles.subtitle}>Create your account to start planning</Text>

              {/* Form Card */}
              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="At least 8 characters (uppercase, lowercase, number)"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {success ? <Text style={styles.success}>{success}</Text> : null}

                <TouchableOpacity
                  style={[
                    styles.createButton,
                    (loading || !email || !password || !confirmPassword) && styles.createButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading || !email || !password || !confirmPassword}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createButtonText}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}>
                    Already have an account? <Text style={styles.loginLinkBold}>Log in</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Verification Screen */}
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>We sent a code to {email}</Text>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#999"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {success ? <Text style={styles.success}>{success}</Text> : null}

                <TouchableOpacity
                  style={[
                    styles.createButton,
                    (loading || !verificationCode) && styles.createButtonDisabled,
                  ]}
                  onPress={handleVerification}
                  disabled={loading || !verificationCode}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createButtonText}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendCode}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resendButtonText}>Resend Code</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setNeedsVerification(false)} activeOpacity={0.7}>
                  <Text style={styles.loginLink}>
                    <Text style={styles.loginLinkBold}>← Back to Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Back to quiz link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('InterestQuiz')}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back to quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EBDC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 90,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    color: '#1F3D2B',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#1F3D2B',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 12,
  },
  success: {
    color: '#10B981',
    fontSize: 14,
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    fontSize: 14,
    color: '#1F3D2B',
    textAlign: 'center',
  },
  loginLinkBold: {
    fontWeight: '600',
    color: '#1F3D2B',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
  },
  resendButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  resendButtonText: {
    color: '#1F3D2B',
    fontSize: 16,
    fontWeight: '600',
  },
});
