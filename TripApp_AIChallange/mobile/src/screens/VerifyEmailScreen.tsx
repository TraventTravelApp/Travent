import React, { useState, useRef, useEffect, useCallback } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { email, mode } = route.params;

  // OTP digits stored as a 6-element array
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<Array<TextInput | null>>(Array(CODE_LENGTH).fill(null));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start the resend cooldown
  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    // Focus first box on mount
    setTimeout(() => inputRefs.current[0]?.focus(), 200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleDigitChange = (value: string, index: number) => {
    // Only accept digits
    const cleaned = value.replace(/[^0-9]/g, '');
    // Handle paste: if user pastes a full code into the first box
    if (cleaned.length > 1) {
      const newDigits = Array(CODE_LENGTH).fill('');
      cleaned.slice(0, CODE_LENGTH).split('').forEach((ch, i) => {
        newDigits[i] = ch;
      });
      setDigits(newDigits);
      inputRefs.current[Math.min(cleaned.length, CODE_LENGTH) - 1]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    setError('');

    // Advance focus to next box
    if (cleaned && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      // Clear previous box and move focus back
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  const handleVerify = async () => {
    if (!isComplete) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await authService.confirmEmail({ email, code });

      if (response.success) {
        setSuccessMsg('Email verified! Taking you to login…');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1200);
      } else {
        const msg = response.error || 'Verification failed';
        if (
          msg.toLowerCase().includes('expired') ||
          msg.toLowerCase().includes('mismatch') ||
          msg.toLowerCase().includes('invalid') ||
          msg.toLowerCase().includes('codeMismatch') ||
          msg.toLowerCase().includes('ExpiredCodeException')
        ) {
          setError(
            msg.toLowerCase().includes('expired')
              ? 'That code has expired. Tap "Resend code" to get a new one.'
              : 'Incorrect code. Please double-check and try again.'
          );
        } else {
          setError(msg);
        }
        // Clear boxes so user can re-enter
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;
    setError('');
    setSuccessMsg('');
    setResendLoading(true);

    try {
      const response = await authService.resendCode({ email });
      if (response.success) {
        setSuccessMsg('New code sent — check your inbox.');
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        startCooldown();
      } else {
        setError(response.error || 'Failed to resend code. Please try again.');
      }
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const maskedEmail = email.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, a, b, c) => a + b.replace(/./g, '•') + c
  );

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

          {/* Envelope icon + title */}
          <Text style={styles.emailIcon}>📧</Text>
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailText}>{maskedEmail}</Text>
          </Text>

          <View style={styles.formCard}>
            {/* OTP boxes */}
            <View style={styles.otpRow}>
              {Array(CODE_LENGTH)
                .fill(null)
                .map((_, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => {
                      inputRefs.current[i] = ref;
                    }}
                    style={[
                      styles.otpBox,
                      digits[i] ? styles.otpBoxFilled : null,
                      error ? styles.otpBoxError : null,
                    ]}
                    value={digits[i]}
                    onChangeText={(v) => handleDigitChange(v, i)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                    keyboardType="number-pad"
                    maxLength={6} // allow paste of full code into first box
                    selectTextOnFocus
                    textContentType="oneTimeCode" // iOS autofill from SMS
                    caretHidden={Platform.OS === 'ios'}
                    accessibilityLabel={`Digit ${i + 1} of ${CODE_LENGTH}`}
                  />
                ))}
            </View>

            {/* Error / success messages */}
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            {successMsg ? (
              <View style={styles.successBanner}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            {/* Verify button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (!isComplete || loading) && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              disabled={!isComplete || loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Verify email"
              accessibilityState={{ disabled: !isComplete || loading }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify Email</Text>
              )}
            </TouchableOpacity>

            {/* Resend section */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn't get it? </Text>
              {cooldown > 0 ? (
                <Text style={styles.resendCooldown}>Resend in {cooldown}s</Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resendLoading}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Resend verification code"
                >
                  {resendLoading ? (
                    <ActivityIndicator size="small" color="#1F3D2B" />
                  ) : (
                    <Text style={styles.resendLink}>Resend code</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Back link */}
          <TouchableOpacity
            onPress={() => {
              if (mode === 'login') {
                navigation.navigate('Login');
              } else {
                navigation.navigate('Signup');
              }
            }}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>
              ← {mode === 'login' ? 'Back to Login' : 'Back to Sign Up'}
            </Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 72,
    height: 72,
  },
  emailIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    color: '#1F3D2B',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emailText: {
    color: '#1F3D2B',
    fontWeight: '600',
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 0.9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    fontSize: 22,
    fontWeight: '700',
    color: '#1F3D2B',
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: '#1F3D2B',
    backgroundColor: '#F0F4F0',
  },
  otpBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorIcon: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 20,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successIcon: {
    fontSize: 14,
    lineHeight: 20,
  },
  successText: {
    flex: 1,
    color: '#065F46',
    fontSize: 13,
    lineHeight: 20,
  },
  verifyButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    opacity: 0.45,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    fontSize: 14,
    color: '#1F3D2B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendCooldown: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
  },
});
