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

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPasswordCode'>;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function ResetPasswordCodeScreen({ navigation, route }: Props) {
  const { email } = route.params;

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<Array<TextInput | null>>(Array(CODE_LENGTH).fill(null));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    setTimeout(() => inputRefs.current[0]?.focus(), 200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleDigitChange = (value: string, index: number) => {
    const cleaned = value.replace(/[^0-9]/g, '');

    // Handle paste of full code
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

    if (cleaned && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  const handleNext = () => {
    if (!isComplete) return;
    // Pass both email + code to the new password screen
    navigation.navigate('ResetPassword', { email, code });
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;
    setError('');
    setSuccessMsg('');
    setResendLoading(true);

    try {
      const response = await authService.forgotPassword({ email });
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

          <Text style={styles.icon}>📬</Text>
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit reset code to{'\n'}
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
                    ref={(ref) => { inputRefs.current[i] = ref; }}
                    style={[
                      styles.otpBox,
                      digits[i] ? styles.otpBoxFilled : null,
                      error ? styles.otpBoxError : null,
                    ]}
                    value={digits[i]}
                    onChangeText={(v) => handleDigitChange(v, i)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                    keyboardType="number-pad"
                    maxLength={6}
                    selectTextOnFocus
                    textContentType="oneTimeCode"
                    caretHidden={Platform.OS === 'ios'}
                    accessibilityLabel={`Digit ${i + 1} of ${CODE_LENGTH}`}
                  />
                ))}
            </View>

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

            {/* Next button — validates code format, then passes to ResetPassword */}
            <TouchableOpacity
              style={[styles.nextButton, (!isComplete || loading) && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!isComplete || loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Continue to reset password"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.nextButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Resend */}
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
                  accessibilityLabel="Resend reset code"
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

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Use a different email</Text>
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
  icon: {
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
  nextButton: {
    backgroundColor: '#1F3D2B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonDisabled: {
    opacity: 0.45,
  },
  nextButtonText: {
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
