import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder = "Describe a photo…",
  autoFocus = false,
}: Props) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 80,
      friction: 8,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 80,
      friction: 8,
    }).start();
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClear();
    inputRef.current?.focus();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor,
        },
      ]}
    >
      <Ionicons
        name="search"
        size={18}
        color={focused ? colors.primary : colors.mutedForeground}
        style={styles.icon}
      />
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            color: colors.foreground,
            fontFamily: "Inter_400Regular",
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    gap: 10,
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    flexShrink: 0,
  },
});
