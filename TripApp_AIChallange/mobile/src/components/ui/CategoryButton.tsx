import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CategoryButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export default function CategoryButton({
  label,
  selected,
  onPress,
  disabled = false,
}: CategoryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        selected && styles.selectedButton,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1F3D2B33',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#1F3D2B',
    borderColor: '#1F3D2B',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F3D2B',
  },
  selectedText: {
    color: '#FFFFFF',
  },
});
