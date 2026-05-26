import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const getButtonStyle = () => {
    const base = [styles.button];

    if (variant === 'primary') base.push(styles.primaryButton);
    if (variant === 'secondary') base.push(styles.secondaryButton);
    if (variant === 'outline') base.push(styles.outlineButton);
    if (variant === 'text') base.push(styles.textButton);
    if (fullWidth) base.push(styles.fullWidth);
    if (disabled) base.push(styles.disabled);

    return base;
  };

  const getTextStyle = () => {
    const base = [styles.text];

    if (variant === 'primary') base.push(styles.primaryText);
    if (variant === 'secondary') base.push(styles.secondaryText);
    if (variant === 'outline') base.push(styles.outlineText);
    if (variant === 'text') base.push(styles.textButtonText);

    return base;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#1F3D2B',
  },
  secondaryButton: {
    backgroundColor: '#C45C2E',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1F3D2B',
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#1F3D2B',
  },
  textButtonText: {
    color: '#1F3D2B',
    textDecorationLine: 'underline',
  },
});
