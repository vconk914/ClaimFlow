import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useRoute, type RouteResult } from "@/context/RouteContext";

const RECENT_KEY = "@route_eats_recent_v1";
const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";

const MODES = [
  { id: "driving", label: "Driving", icon: "car-outline" },
  { id: "walking", label: "Walking", icon: "walk-outline" },
  { id: "cycling", label: "Cycling", icon: "bicycle-outline" },
] as const;

type Mode = (typeof MODES)[number]["id"];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setResult } = useRoute();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [mode, setMode] = useState<Mode>("driving");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<Array<{ start: string; end: string }>>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const endRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
    AsyncStorage.getItem(RECENT_KEY).then((v) => {
      if (v) setRecent(JSON.parse(v));
    });
  }, []);

  const swap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStart(end);
    setEnd(start);
  };

  const saveRecent = async (s: string, e: string) => {
    const updated = [{ start: s, end: e }, ...recent.filter((r) => r.start !== s || r.end !== e)].slice(0, 5);
    setRecent(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const search = async () => {
    if (!start.trim() || !end.trim()) {
      setError("Please enter both a start and end location.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError(null);
    setLoading(true);
    try {
      const baseUrl = DOMAIN ? `https://${DOMAIN}` : "";
      const res = await fetch(`${baseUrl}/api/route/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAddress: start.trim(), endAddress: end.trim(), mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Route planning failed");
      await saveRecent(start.trim(), end.trim());
      setResult(data as RouteResult);
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const topInset = Platform.OS === "web" ? 60 : insets.top;

  return (
    <Animated.View
      style={[styles.flex, { backgroundColor: colors.background, opacity: fadeAnim }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topInset + 16, paddingBottom: 60 }]}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Ionicons name="restaurant" size={24} color="#fff" />
          </View>
          <View>
            <Text style={[styles.appName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Route Eats
            </Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Find restaurants along your route
            </Text>
          </View>
        </View>

        {/* Route Input Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Start */}
          <View style={styles.inputRow}>
            <View style={[styles.dot, { backgroundColor: "#34C759" }]} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="Starting location"
              placeholderTextColor={colors.mutedForeground}
              value={start}
              onChangeText={setStart}
              returnKeyType="next"
              onSubmitEditing={() => endRef.current?.focus()}
              autoCapitalize="words"
            />
            {start.length > 0 && (
              <TouchableOpacity onPress={() => setStart("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          {/* Divider + swap */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={[styles.swapBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={swap}
            >
              <Ionicons name="swap-vertical" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* End */}
          <View style={styles.inputRow}>
            <View style={[styles.dot, { backgroundColor: "#FF3B30" }]} />
            <TextInput
              ref={endRef}
              style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="Destination"
              placeholderTextColor={colors.mutedForeground}
              value={end}
              onChangeText={setEnd}
              returnKeyType="search"
              onSubmitEditing={search}
              autoCapitalize="words"
            />
            {end.length > 0 && (
              <TouchableOpacity onPress={() => setEnd("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Mode selector */}
        <View style={styles.modeRow}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.modeChip,
                {
                  backgroundColor: mode === m.id ? colors.primary : colors.card,
                  borderColor: mode === m.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setMode(m.id);
              }}
            >
              <Ionicons
                name={m.icon as any}
                size={16}
                color={mode === m.id ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.modeLabel,
                  {
                    color: mode === m.id ? "#fff" : colors.foreground,
                    fontFamily: "Inter_500Medium",
                  },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: "#FFF2F0", borderColor: "#FF3B30" }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#FF3B30" />
            <Text style={[styles.errorText, { fontFamily: "Inter_400Regular" }]}>{error}</Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: colors.primary }]}
          onPress={search}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="map" size={20} color="#fff" />
          )}
          <Text style={[styles.ctaText, { fontFamily: "Inter_600SemiBold" }]}>
            {loading ? "Finding restaurants…" : "Find Restaurants"}
          </Text>
        </TouchableOpacity>

        {/* Recent routes */}
        {recent.length > 0 && !loading && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Recent routes
            </Text>
            {recent.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.recentRow, { backgroundColor: colors.card }]}
                onPress={() => {
                  setStart(r.start);
                  setEnd(r.end);
                }}
              >
                <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recentFrom, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                    {r.start}
                  </Text>
                  <Text style={[styles.recentTo, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                    → {r.end}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Example routes */}
        {recent.length === 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Try an example
            </Text>
            {[
              { start: "Times Square, New York", end: "Brooklyn Bridge, New York" },
              { start: "Golden Gate Park, San Francisco", end: "Fisherman's Wharf, San Francisco" },
              { start: "Wrigley Field, Chicago", end: "Navy Pier, Chicago" },
            ].map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.recentRow, { backgroundColor: colors.card }]}
                onPress={() => {
                  setStart(ex.start);
                  setEnd(ex.end);
                }}
              >
                <Ionicons name="navigate-outline" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recentFrom, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                    {ex.start}
                  </Text>
                  <Text style={[styles.recentTo, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                    → {ex.end}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 4 },
  logoBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  appName: { fontSize: 26 },
  tagline: { fontSize: 13, marginTop: 1 },
  card: {
    borderRadius: 18,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  input: { flex: 1, fontSize: 16 },
  dividerRow: { flexDirection: "row", alignItems: "center", paddingLeft: 34 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
  },
  modeRow: { flexDirection: "row", gap: 10 },
  modeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  modeLabel: { fontSize: 13 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  errorText: { flex: 1, fontSize: 14, color: "#FF3B30" },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: { color: "#fff", fontSize: 17 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 17 },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recentFrom: { fontSize: 14 },
  recentTo: { fontSize: 13, marginTop: 2 },
});
