import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { useColors } from "@/hooks/useColors";
import { useRoute, type Restaurant } from "@/context/RouteContext";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MAP_HEIGHT = Math.round(SCREEN_HEIGHT * 0.42);

function formatDistance(meters: number): string {
  const miles = meters / 1609.344;
  if (miles < 0.1) return `${Math.round(meters)}m away`;
  return `${miles.toFixed(1)} mi from route`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function formatDistance2(meters: number): string {
  const miles = meters / 1609.344;
  return `${miles.toFixed(1)} mi`;
}

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push("star");
    else if (rating >= i - 0.5) stars.push("star-half");
    else stars.push("star-outline");
  }
  return (
    <View style={{ flexDirection: "row", gap: 1 }}>
      {stars.map((s, i) => (
        <Ionicons key={i} name={s as any} size={12} color="#FF9F0A" />
      ))}
    </View>
  );
}

function generateMapHtml(
  coords: [number, number][],
  restaurants: Restaurant[],
  primaryColor: string,
): string {
  const latLons = coords.map(([lon, lat]) => [lat, lon]);
  const restData = restaurants.map((r) => ({
    id: r.id,
    lat: r.lat,
    lon: r.lon,
    name: r.name,
    rating: r.rating,
  }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
    .rest-marker { width:28px; height:28px; border-radius:50%; background:#FF9500; border:2.5px solid white; display:flex; align-items:center; justify-content:center; font-size:13px; box-shadow:0 2px 8px rgba(0,0,0,0.35); cursor:pointer; transition: transform 0.15s; }
    .rest-marker.selected { background:${primaryColor}; transform:scale(1.3); }
    .start-dot { width:14px; height:14px; border-radius:50%; background:#34C759; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); }
    .end-dot { width:14px; height:14px; border-radius:50%; background:#FF3B30; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var routeCoords = ${JSON.stringify(latLons)};
    var restaurants = ${JSON.stringify(restData)};
    var selectedId = null;
    var markers = {};

    var map = L.map('map', { zoomControl: false, attributionControl: false });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    var poly = L.polyline(routeCoords, {
      color: '${primaryColor}',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    function makeIcon(cls) {
      return L.divIcon({ html: '<div class="' + cls + '"></div>', className: '', iconSize: [14, 14], iconAnchor: [7, 7] });
    }

    if (routeCoords.length > 0) {
      L.marker(routeCoords[0], { icon: makeIcon('start-dot') }).addTo(map);
      L.marker(routeCoords[routeCoords.length - 1], { icon: makeIcon('end-dot') }).addTo(map);
    }

    restaurants.forEach(function(r) {
      var el = document.createElement('div');
      el.className = 'rest-marker';
      el.innerHTML = '&#x1F374;';
      var icon = L.divIcon({ html: el, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
      var m = L.marker([r.lat, r.lon], { icon: icon }).addTo(map);
      markers[r.id] = { marker: m, el: el };
      m.on('click', function() {
        selectRestaurant(r.id);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'select', id: r.id }));
        }
      });
    });

    function selectRestaurant(id) {
      if (selectedId && markers[selectedId]) {
        markers[selectedId].el.classList.remove('selected');
      }
      selectedId = id;
      if (markers[id]) {
        markers[id].el.classList.add('selected');
        map.panTo(markers[id].marker.getLatLng(), { animate: true });
      }
    }

    map.fitBounds(poly.getBounds(), { padding: [40, 40] });

    document.addEventListener('message', function(e) {
      try { var d = JSON.parse(e.data); if (d.type === 'select') selectRestaurant(d.id); } catch(e) {}
    });
    window.addEventListener('message', function(e) {
      try { var d = JSON.parse(e.data); if (d.type === 'select') selectRestaurant(d.id); } catch(e) {}
    });
  </script>
</body>
</html>`;
}

export default function ResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { result } = useRoute();
  const webviewRef = useRef<WebView>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, number>>({});

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === "select" && msg.id) {
          setSelectedId(msg.id);
          Haptics.selectionAsync();
          const y = cardRefs.current[msg.id];
          if (y !== undefined) {
            scrollRef.current?.scrollTo({ y, animated: true });
          }
        }
      } catch {}
    },
    [],
  );

  const selectRestaurant = useCallback(
    (id: string) => {
      setSelectedId(id);
      webviewRef.current?.postMessage(JSON.stringify({ type: "select", id }));
    },
    [],
  );

  if (!result) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>No results. Go back and search.</Text>
      </View>
    );
  }

  const { start, end, route, restaurants, hasYelpKey } = result;
  const mapHtml = generateMapHtml(route.coordinates, restaurants, colors.primary);
  const topInset = Platform.OS === "web" ? 48 : insets.top;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            {restaurants.length} Restaurant{restaurants.length !== 1 ? "s" : ""} Found
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
            {formatDistance2(route.distanceMeters)} · {formatDuration(route.durationSeconds)}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={{ height: MAP_HEIGHT }}>
        <WebView
          ref={webviewRef}
          source={{ html: mapHtml }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
        {/* Route endpoints */}
        <View style={[styles.routeBar, { backgroundColor: colors.card + "F0" }]}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: "#34C759" }]} />
            <Text style={[styles.routePointText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
              {start.name.split(",")[0]}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={12} color={colors.mutedForeground} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: "#FF3B30" }]} />
            <Text style={[styles.routePointText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
              {end.name.split(",")[0]}
            </Text>
          </View>
        </View>
      </View>

      {/* No Yelp key banner */}
      {!hasYelpKey && (
        <View style={[styles.banner, { backgroundColor: "#FFF9E6", borderColor: "#FF9F0A" }]}>
          <Ionicons name="key-outline" size={16} color="#FF9F0A" />
          <Text style={[styles.bannerText, { fontFamily: "Inter_400Regular" }]}>
            Add a Yelp API key to see restaurants along your route
          </Text>
        </View>
      )}

      {/* Restaurant list */}
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {restaurants.length === 0 && hasYelpKey && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No restaurants found
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Try a different route or a longer distance
            </Text>
          </View>
        )}

        {restaurants.map((r, idx) => (
          <TouchableOpacity
            key={r.id}
            activeOpacity={0.85}
            onLayout={(e) => {
              cardRefs.current[r.id] = e.nativeEvent.layout.y;
            }}
            onPress={() => {
              Haptics.selectionAsync();
              selectRestaurant(r.id);
            }}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: selectedId === r.id ? colors.primary : colors.border,
                borderWidth: selectedId === r.id ? 2 : 1,
              },
            ]}
          >
            {/* Position badge */}
            <View style={[styles.positionBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.positionText, { fontFamily: "Inter_700Bold" }]}>{idx + 1}</Text>
            </View>

            {/* Restaurant image */}
            {r.imageUrl ? (
              <Image source={{ uri: r.imageUrl }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder, { backgroundColor: colors.secondary }]}>
                <Ionicons name="restaurant-outline" size={28} color={colors.mutedForeground} />
              </View>
            )}

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
                {r.name}
              </Text>
              <View style={styles.ratingRow}>
                <StarRating rating={r.rating} />
                <Text style={[styles.ratingText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {r.rating.toFixed(1)} ({r.reviewCount.toLocaleString()})
                </Text>
                {r.priceTier && (
                  <Text style={[styles.price, { color: "#34C759", fontFamily: "Inter_500Medium" }]}>
                    {r.priceTier}
                  </Text>
                )}
              </View>
              <Text style={[styles.categories, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                {r.categories}
              </Text>
              <View style={styles.bottomRow}>
                <View style={styles.distRow}>
                  <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.distText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {formatDistance(r.distanceMeters)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.yelpBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}
                  onPress={() => Linking.openURL(r.yelpUrl)}
                >
                  <Text style={[styles.yelpBtnText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                    View on Yelp
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17 },
  headerSub: { fontSize: 13, marginTop: 1 },
  webview: { flex: 1 },
  routeBar: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  routePoint: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routePointText: { fontSize: 12, flex: 1 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerText: { flex: 1, fontSize: 13, color: "#995700" },
  listContent: { paddingHorizontal: 12, paddingTop: 12, gap: 10 },
  emptyState: { alignItems: "center", gap: 10, paddingVertical: 40 },
  emptyTitle: { fontSize: 17 },
  emptySub: { fontSize: 14, textAlign: "center" },
  card: {
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  positionBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  positionText: { color: "#fff", fontSize: 11 },
  cardImage: { width: 90, height: 110 },
  cardImagePlaceholder: { alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1, padding: 12, gap: 4 },
  cardName: { fontSize: 15 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontSize: 12 },
  price: { fontSize: 12 },
  categories: { fontSize: 12 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  distText: { fontSize: 12 },
  yelpBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  yelpBtnText: { fontSize: 12 },
});
