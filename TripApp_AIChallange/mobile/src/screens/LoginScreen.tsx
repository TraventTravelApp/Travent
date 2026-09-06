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
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { authService } from '../services/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setUnverified(false);
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        navigation.navigate('Home');
      } else {
        // Unverified account — send them to VerifyEmail directly
        if (
          response.error?.includes('not verified') ||
          response.error?.includes('UserNotConfirmedException')
        ) {
          setUnverified(true);
          setError('Your email isn\'t verified yet.');
        } else {
          setError(response.error || 'Login failed. Check your credentials and try again.');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoVerify = () => {
    // Navigate straight to VerifyEmail; the screen will handle resending
    navigation.navigate('VerifyEmail', { email: email.trim(), mode: 'login' });
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

          {/* Title */}
          <Text style={styles.title}>Welcome back, explorer</Text>
          <Text style={styles.subtitle}>Log in to continue your journey</Text>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(v) => { setEmail(v); setUnverified(false); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                secureTextEntry
                textContentType="password"
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Unverified prompt — directs user to VerifyEmail screen */}
            {unverified && (
              <TouchableOpacity
                style={styles.verificationPrompt}
                onPress={handleGoVerify}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Verify your email"
              >
                <Text style={styles.verificationPromptText}>
                  📧 Verify your email →
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.loginButton,
                (loading || !email || !password) && styles.loginButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || !email || !password}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Log in"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.7}
            >
              <Text style={styles.signupLink}>
                Don't have an account? <Text style={styles.signupLinkBold}>Sign up</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
              style={styles.forgotRow}
            >
              <Text style={styles.forgotLink}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

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
  loginButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupLink: {
    fontSize: 14,
    color: '#1F3D2B',
    textAlign: 'center',
  },
  signupLinkBold: {
    fontWeight: '600',
    color: '#1F3D2B',
  },
  forgotRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
  },
  verificationPrompt: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  verificationPromptText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
