import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { SearchBar } from "@/components/SearchBar";
import { usePhotoIndex } from "@/context/PhotoIndexContext";
import { useColors } from "@/hooks/useColors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GAP = 2;
const COLS = 3;
const THUMB_SIZE = (SCREEN_WIDTH - GAP * (COLS - 1)) / COLS;

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const {
    indexedPhotos,
    indexCount,
    performSearch,
    searchResults,
    isSearching,
    clearSearch,
    recentSearches,
    addRecentSearch,
  } = usePhotoIndex();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addRecentSearch(query);
    performSearch(query);
  }, [query, performSearch, addRecentSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
    clearSearch();
  }, [clearSearch]);

  const handleRecentTap = useCallback(
    (text: string) => {
      setQuery(text);
      addRecentSearch(text);
      performSearch(text);
    },
    [performSearch, addRecentSearch],
  );

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const matchedPhotos = React.useMemo(() => {
    if (!searchResults) return null;
    const resultMap = new Map(
      searchResults.map((r) => [r.id, r]),
    );
    return indexedPhotos
      .filter((p) => resultMap.has(p.id))
      .sort(
        (a, b) =>
          (resultMap.get(b.id)?.relevanceScore ?? 0) -
          (resultMap.get(a.id)?.relevanceScore ?? 0),
      )
      .map((p) => ({ ...p, score: resultMap.get(p.id)?.relevanceScore ?? 0, reason: resultMap.get(p.id)?.matchReason ?? "" }));
  }, [searchResults, indexedPhotos]);

  const renderHeader = () => (
    <View
      style={[
        styles.header,
        {
          paddingTop: topInset + 12,
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colors.foreground, fontFamily: "Inter_700Bold" },
        ]}
      >
        Photo Search
      </Text>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSearch}
        onClear={handleClear}
        placeholder="a beach sunset, my dog, birthday cake…"
      />
    </View>
  );

  if (isSearching) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[
              styles.statusText,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            Searching photos…
          </Text>
        </View>
      </View>
    );
  }

  if (matchedPhotos !== null) {
    return (
      <Animated.View
        style={[
          styles.flex,
          { backgroundColor: colors.background, opacity: fadeAnim },
        ]}
      >
        {renderHeader()}
        {matchedPhotos.length === 0 ? (
          <View style={styles.center}>
            <Text
              style={[
                styles.emptyTitle,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              No matches found
            </Text>
            <Text
              style={[
                styles.emptySub,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Try different words or add more photos in the Library tab
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.resultCount,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {matchedPhotos.length} {matchedPhotos.length === 1 ? "photo" : "photos"} found
            </Text>
            <FlatList
              data={matchedPhotos}
              keyExtractor={(item) => item.id}
              numColumns={COLS}
              contentContainerStyle={styles.gridContent}
              columnWrapperStyle={{ gap: GAP }}
              ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
              renderItem={({ item }) => (
                <PhotoThumbnail
                  uri={item.uri}
                  size={THUMB_SIZE}
                  isIndexed
                  relevanceScore={item.score}
                />
              )}
            />
          </>
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.flex,
        { backgroundColor: colors.background, opacity: fadeAnim },
      ]}
    >
      {renderHeader()}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.statsRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.statItem}>
            <Text
              style={[
                styles.statNumber,
                { color: colors.primary, fontFamily: "Inter_700Bold" },
              ]}
            >
              {indexCount}
            </Text>
            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Photos Indexed
            </Text>
          </View>
        </View>

        {indexCount === 0 && (
          <View
            style={[
              styles.tipBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.tipTitle,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Get started
            </Text>
            <Text
              style={[
                styles.tipText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Go to the Library tab and tap "Add Photos" to select photos from
              your gallery and make them searchable with AI.
            </Text>
          </View>
        )}

        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Recent searches
            </Text>
            <View style={styles.chipsRow}>
              {recentSearches.slice(0, 8).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: colors.secondary,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleRecentTap(s)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.foreground, fontFamily: "Inter_400Regular" },
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {indexCount > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Try searching for
            </Text>
            <View style={styles.chipsRow}>
              {[
                "sunset at the beach",
                "birthday celebration",
                "food at a restaurant",
                "my pet",
                "mountain hike",
                "family gathering",
              ].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: colors.secondary,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleRecentTap(s)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: colors.foreground,
                        fontFamily: "Inter_400Regular",
                      },
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  title: { fontSize: 28 },
  statsRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    gap: 4,
  },
  statNumber: { fontSize: 36 },
  statLabel: { fontSize: 13 },
  tipBox: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  tipTitle: { fontSize: 15 },
  tipText: { fontSize: 14, lineHeight: 20 },
  section: { marginTop: 24, gap: 12 },
  sectionTitle: { fontSize: 17, paddingHorizontal: 16 },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 14 },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 12,
  },
  gridContent: {
    paddingBottom: 100,
    paddingHorizontal: 2,
    paddingTop: 4,
  },
  resultCount: {
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  emptyTitle: { fontSize: 18 },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  statusText: { fontSize: 15, marginTop: 12 },
});
