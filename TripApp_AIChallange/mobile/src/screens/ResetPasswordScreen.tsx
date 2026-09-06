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

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

// Password strength rules
interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const RULES: Rule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
];

type ScreenState = 'form' | 'success' | 'error';

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { email, code } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [screenState, setScreenState] = useState<ScreenState>('form');

  const allRulesPassed = RULES.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allRulesPassed && passwordsMatch && !loading;

  const handleReset = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);

    try {
      const response = await authService.confirmForgotPassword({
        email,
        code,
        new_password: newPassword,
      });

      if (response.success) {
        setScreenState('success');
      } else {
        const msg = response.error || '';
        if (
          msg.toLowerCase().includes('expired') ||
          msg.toLowerCase().includes('ExpiredCodeException')
        ) {
          setError(
            'This reset code has expired. Please request a new one.'
          );
          setScreenState('error');
        } else if (
          msg.toLowerCase().includes('mismatch') ||
          msg.toLowerCase().includes('invalid') ||
          msg.toLowerCase().includes('CodeMismatchException')
        ) {
          setError('That code is incorrect. Please go back and try again.');
          setScreenState('error');
        } else {
          setError(msg || 'Something went wrong. Please try again.');
          setScreenState('error');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setScreenState('error');
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────
  if (screenState === 'success') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.centeredContent}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Password reset!</Text>
          <Text style={styles.successSubtitle}>
            Your password has been updated. You can now log in with your new password.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go to login"
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Error state (expired / invalid code) ──────────────────────────
  if (screenState === 'error') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.centeredContent}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.errorStateIcon}>❌</Text>
          <Text style={styles.errorStateTitle}>Reset failed</Text>
          <Text style={styles.errorStateSubtitle}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Request a new code"
          >
            <Text style={styles.retryButtonText}>Request a New Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setScreenState('form');
              setError('');
            }}
            activeOpacity={0.7}
            style={styles.tryAgainRow}
          >
            <Text style={styles.tryAgainText}>← Try entering the code again</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Form state ─────────────────────────────────────────────────────
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

          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.title}>Set a new password</Text>
          <Text style={styles.subtitle}>Make it something strong you'll remember.</Text>

          <View style={styles.formCard}>
            {/* New password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="New password"
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={(v) => { setNewPassword(v); setError(''); }}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Strength rules */}
            {newPassword.length > 0 && (
              <View style={styles.rulesContainer}>
                {RULES.map((rule) => {
                  const passed = rule.test(newPassword);
                  return (
                    <View key={rule.label} style={styles.ruleRow}>
                      <Text style={[styles.ruleDot, passed ? styles.ruleDotPass : styles.ruleDotFail]}>
                        {passed ? '✓' : '·'}
                      </Text>
                      <Text style={[styles.ruleText, passed ? styles.ruleTextPass : styles.ruleTextFail]}>
                        {rule.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Confirm password */}
            <View style={[styles.inputGroup, { marginTop: 8 }]}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  confirmPassword.length > 0 && !passwordsMatch ? styles.inputMismatch : null,
                  confirmPassword.length > 0 && passwordsMatch ? styles.inputMatch : null,
                ]}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                autoCapitalize="none"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={styles.mismatchHint}>Passwords don't match</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.resetButton, !canSubmit && styles.resetButtonDisabled]}
              onPress={handleReset}
              disabled={!canSubmit}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Reset password"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.resetButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ResetPasswordCode', { email })}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back to code entry</Text>
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  centeredContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 16,
  },
  lockIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F3D2B',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
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
    marginBottom: 16,
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  eyeButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 18,
  },
  rulesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleDot: {
    fontSize: 14,
    fontWeight: '700',
    width: 16,
    textAlign: 'center',
  },
  ruleDotPass: {
    color: '#059669',
  },
  ruleDotFail: {
    color: '#9CA3AF',
  },
  ruleText: {
    fontSize: 13,
  },
  ruleTextPass: {
    color: '#059669',
  },
  ruleTextFail: {
    color: '#6B7280',
  },
  inputMismatch: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputMatch: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  mismatchHint: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonDisabled: {
    opacity: 0.45,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
  },

  // Success state
  successIcon: {
    fontSize: 56,
    marginBottom: 16,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F3D2B',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  loginButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Error state
  errorStateIcon: {
    fontSize: 56,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorStateTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F3D2B',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorStateSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  retryButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tryAgainRow: {
    alignItems: 'center',
  },
  tryAgainText: {
    fontSize: 14,
    color: '#666',
  },
});
