import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
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

function getStep(
  isIndexing: boolean,
  indexCount: number,
): 1 | 2 | 3 {
  if (indexCount > 0) return 3;
  if (isIndexing) return 2;
  return 1;
}

const STEPS = ["Select", "Analyze", "Search"] as const;

function WizardSteps({
  step,
  colors,
  bgColor,
}: {
  step: 1 | 2 | 3;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  bgColor: string;
}) {
  return (
    <View style={styles.wizardRow}>
      <View style={[styles.wizardLine, { backgroundColor: colors.border }]} />
      {STEPS.map((label, i) => {
        const num = (i + 1) as 1 | 2 | 3;
        const active = num === step;
        const done = num < step;
        return (
          <View
            key={label}
            style={[styles.wizardStep, { backgroundColor: bgColor }]}
          >
            <View
              style={[
                styles.wizardCircle,
                active || done
                  ? { backgroundColor: colors.primary, borderWidth: 0 }
                  : {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderWidth: 2,
                    },
              ]}
            >
              {done ? (
                <Ionicons name="checkmark" size={13} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.wizardNum,
                    {
                      color:
                        active || done ? "#fff" : colors.mutedForeground,
                      fontFamily: "Inter_600SemiBold",
                    },
                  ]}
                >
                  {num}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.wizardLabel,
                {
                  color:
                    active || done ? colors.primary : colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                },
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const HOW_IT_WORKS_ITEMS = [
  "Choose the photos you want to make searchable.",
  "Our AI securely analyzes what's in each photo.",
  "Find any photo instantly by typing what you remember.",
];

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const howItWorksAnim = useRef(new Animated.Value(0)).current;

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
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.025,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const toggleHowItWorks = () => {
    const opening = !howItWorksOpen;
    setHowItWorksOpen(opening);
    Animated.timing(howItWorksAnim, {
      toValue: opening ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const howItWorksHeight = howItWorksAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 176],
  });

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

  const step = getStep(isIndexing, indexCount);

  return (
    <Animated.View
      style={[
        styles.flex,
        { backgroundColor: colors.background, opacity: fadeAnim },
      ]}
    >
      {/* ── Header ── */}
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

        <WizardSteps
          step={step}
          colors={colors}
          bgColor={colors.background}
        />

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
              Analyzing {indexingProgress.current} of{" "}
              {indexingProgress.total}…
            </Text>
          </View>
        )}
      </View>

      {/* ── Content ── */}
      {indexedPhotos.length === 0 && !isIndexing ? (
        /* Empty state — onboarding card + accordion */
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomInset + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Main card */}
          <View style={[styles.mainCard, { backgroundColor: colors.card }]}>
            <View style={styles.iconBox}>
              <Ionicons name="images" size={42} color={colors.primary} />
              <View
                style={[
                  styles.sparkleBox,
                  { backgroundColor: colors.card },
                ]}
              >
                <Ionicons name="sparkles" size={15} color="#a855f7" />
              </View>
            </View>

            <Text
              style={[
                styles.cardTitle,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              Let's get you started
            </Text>
            <Text
              style={[
                styles.cardSub,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Select your favorite photos to create your smart, searchable
              library.
            </Text>

            <Animated.View
              style={[
                styles.ctaWrap,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[styles.cta, { backgroundColor: colors.primary }]}
                onPress={handleAddPhotos}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text
                  style={[
                    styles.ctaText,
                    { fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  Choose Photos to Index
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* How it works accordion */}
          <View style={[styles.accordion, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={toggleHowItWorks}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.accordionTitle,
                  {
                    color: colors.foreground,
                    fontFamily: "Inter_500Medium",
                  },
                ]}
              >
                How it works
              </Text>
              <Ionicons
                name={howItWorksOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>

            <Animated.View style={{ height: howItWorksHeight, overflow: "hidden" }}>
              <View
                style={[
                  styles.accordionBody,
                  { borderTopColor: colors.border },
                ]}
              >
                {HOW_IT_WORKS_ITEMS.map((text, i) => (
                  <View key={i} style={styles.accordionRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.accordionText,
                        {
                          color: colors.mutedForeground,
                          fontFamily: "Inter_400Regular",
                        },
                      ]}
                    >
                      {text}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      ) : isIndexing && indexedPhotos.length === 0 ? (
        /* Indexing state with no photos yet — centered message */
        <View style={styles.indexingState}>
          <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />
          <Text
            style={[
              styles.cardTitle,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            Analyzing your photos…
          </Text>
          <Text
            style={[
              styles.cardSub,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            AI is reading each image so you can search them naturally.
          </Text>
        </View>
      ) : (
        /* Populated state — photo grid */
        <FlatList
          data={indexedPhotos}
          keyExtractor={(item) => item.id}
          numColumns={COLS}
          contentContainerStyle={[styles.gridContent, { paddingBottom: 16 }]}
          columnWrapperStyle={{ gap: GAP }}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          renderItem={({ item }) => (
            <PhotoThumbnail uri={item.uri} size={THUMB_SIZE} isIndexed />
          )}
        />
      )}

      {/* ── Bottom button (only when indexing or photos exist) ── */}
      {(isIndexing || indexCount > 0) && (
        <View
          style={[
            styles.buttonBar,
            {
              paddingBottom: bottomInset + 12,
              backgroundColor: colors.background,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.fabInner,
              {
                backgroundColor: isIndexing
                  ? colors.destructive
                  : colors.primary,
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              },
            ]}
            onPress={isIndexing ? handleCancel : handleAddPhotos}
          >
            {isIndexing ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text
                  style={[styles.fabText, { fontFamily: "Inter_600SemiBold" }]}
                >
                  Stop Indexing
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="add" size={22} color="#ffffff" />
                <Text
                  style={[styles.fabText, { fontFamily: "Inter_600SemiBold" }]}
                >
                  Add More Photos
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  /* Header */
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 28 },
  headerCount: { fontSize: 14 },

  /* Wizard */
  wizardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: 4,
  },
  wizardLine: {
    position: "absolute",
    top: 15,
    left: 28,
    right: 28,
    height: 2,
    borderRadius: 1,
  },
  wizardStep: {
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  wizardCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  wizardNum: { fontSize: 13 },
  wizardLabel: { fontSize: 11 },

  /* Progress bar */
  progressContainer: { gap: 6 },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  progressText: { fontSize: 13 },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },

  /* Main card */
  mainCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#EBF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },
  sparkleBox: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  ctaWrap: { width: "100%" },
  cta: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 16,
    gap: 8,
  },
  ctaText: { color: "#fff", fontSize: 17 },

  /* Accordion */
  accordion: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accordionTitle: { fontSize: 15 },
  accordionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  accordionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  accordionText: { fontSize: 14, lineHeight: 20, flex: 1 },

  /* Indexing empty state */
  indexingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 80,
    gap: 0,
  },

  /* Photo grid */
  gridContent: { paddingTop: 4 },

  /* Bottom button bar */
  buttonBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
