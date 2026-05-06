import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

type Props = {
  uri: string;
  size: number;
  isIndexed?: boolean;
  relevanceScore?: number;
  onPress?: () => void;
};

export function PhotoThumbnail({
  uri,
  size,
  isIndexed,
  relevanceScore,
  onPress,
}: Props) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const showRelevance = relevanceScore !== undefined && relevanceScore > 0;
  const relevancePct = showRelevance ? Math.round(relevanceScore * 100) : 0;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size }]}
          contentFit="cover"
          transition={200}
        />

        {isIndexed && !showRelevance && (
          <View
            style={[
              styles.indexedBadge,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        )}

        {showRelevance && (
          <View
            style={[
              styles.relevanceBadge,
              { backgroundColor: colors.primary + "dd" },
            ]}
          >
            <Text style={styles.relevanceText}>{relevancePct}%</Text>
          </View>
        )}

        {!isIndexed && !showRelevance && (
          <View
            style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.35)" }]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 6,
  },
  image: {
    borderRadius: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
  },
  indexedBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  relevanceBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  relevanceText: {
    color: "#ffffff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
