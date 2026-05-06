import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PhotoThumbnail } from "@/components/PhotoThumbnail";
import { usePhotoIndex } from "@/context/PhotoIndexContext";
import { useColors } from "@/hooks/useColors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GAP = 2;
const COLS = 3;
const THUMB_SIZE = (SCREEN_WIDTH - GAP * (COLS - 1)) / COLS;

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const {
    indexedPhotos,
    isIndexing,
    indexingProgress,
    indexCount,
    pickAndIndexPhotos,
    cancelIndexing,
  } = usePhotoIndex();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (indexingProgress.total === 0) return;
    const pct = indexingProgress.current / indexingProgress.total;
    Animated.spring(progressAnim, {
      toValue: pct,
      useNativeDriver: false,
      tension: 30,
      friction: 8,
    }).start();
  }, [indexingProgress]);

  const handleAddPhotos = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await pickAndIndexPhotos();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    cancelIndexing();
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={[
        styles.flex,
        { backgroundColor: colors.background, opacity: fadeAnim },
      ]}
    >
      <View
        style={[
          styles.headerBar,
          { paddingTop: topInset + 12, backgroundColor: colors.background },
        ]}
      >
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            Library
          </Text>
          {indexCount > 0 && (
            <Text
              style={[
                styles.headerCount,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {indexCount} indexed
            </Text>
          )}
        </View>

        {isIndexing && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.primary, width: progressBarWidth },
                ]}
              />
            </View>
            <Text
              style={[
                styles.progressText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Analyzing {indexingProgress.current} of {indexingProgress.total}…
            </Text>
          </View>
        )}
      </View>

      {indexedPhotos.length === 0 ? (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIconWrap,
              { backgroundColor: colors.secondary },
            ]}
          >
            <Ionicons
              name="images-outline"
              size={48}
              color={colors.mutedForeground}
            />
          </View>
          <Text
            style={[
              styles.emptyTitle,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            No photos indexed yet
          </Text>
          <Text
            style={[
              styles.emptySub,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            Add photos from your gallery to make them searchable with AI
          </Text>
        </View>
      ) : (
        <FlatList
          data={indexedPhotos}
          keyExtractor={(item) => item.id}
          numColumns={COLS}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: bottomInset + 100 },
          ]}
          columnWrapperStyle={{ gap: GAP }}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          renderItem={({ item }) => (
            <PhotoThumbnail uri={item.uri} size={THUMB_SIZE} isIndexed />
          )}
        />
      )}

      <View
        style={[
          styles.fab,
          {
            bottom: bottomInset + 16,
            backgroundColor: isIndexing ? colors.destructive : colors.primary,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fabInner}
          onPress={isIndexing ? handleCancel : handleAddPhotos}
        >
          {isIndexing ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text
                style={[
                  styles.fabText,
                  { fontFamily: "Inter_600SemiBold" },
                ]}
              >
                Stop Indexing
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="add" size={22} color="#ffffff" />
              <Text
                style={[
                  styles.fabText,
                  { fontFamily: "Inter_600SemiBold" },
                ]}
              >
                Add Photos
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 28 },
  headerCount: { fontSize: 14 },
  progressContainer: { gap: 6 },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  progressText: { fontSize: 13 },
  gridContent: { paddingTop: 4 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 20, textAlign: "center" },
  emptySub: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  fab: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  fabText: { color: "#ffffff", fontSize: 16 },
});
