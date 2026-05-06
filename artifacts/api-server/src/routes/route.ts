import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

type Coord = [number, number]; // [lon, lat]

async function geocode(
  address: string,
): Promise<{ lat: number; lon: number; displayName: string }> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "RouteEats/1.0 (route-planning-app)" },
  });
  if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`);
  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  if (!data.length) throw new Error(`Location not found: "${address}"`);
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

async function getRoute(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
  mode: "driving" | "walking" | "cycling" = "driving",
): Promise<{
  coordinates: Coord[];
  distanceMeters: number;
  durationSeconds: number;
}> {
  const profile =
    mode === "cycling" ? "bike" : mode === "walking" ? "foot" : "car";
  const url = `https://router.project-osrm.org/route/v1/${profile}/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Routing request failed: ${res.status}`);
  const data = (await res.json()) as {
    code: string;
    routes: Array<{
      distance: number;
      duration: number;
      geometry: { coordinates: Coord[] };
    }>;
  };
  if (data.code !== "Ok" || !data.routes.length)
    throw new Error("No route found between these locations");
  const route = data.routes[0];
  return {
    coordinates: route.geometry.coordinates,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sampleRoutePoints(
  coords: Coord[],
  intervalMeters = 2000,
): Coord[] {
  const points: Coord[] = [coords[0]];
  let accumulated = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = coords[i - 1];
    const [lon2, lat2] = coords[i];
    accumulated += haversineMeters(lat1, lon1, lat2, lon2);
    if (accumulated >= intervalMeters) {
      points.push(coords[i]);
      accumulated = 0;
    }
  }
  const last = coords[coords.length - 1];
  if (points[points.length - 1] !== last) points.push(last);
  return points;
}

function minDistanceToRoute(
  lat: number,
  lon: number,
  coords: Coord[],
): number {
  let min = Infinity;
  for (const [clon, clat] of coords) {
    const d = haversineMeters(lat, lon, clat, clon);
    if (d < min) min = d;
  }
  return min;
}

interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  categories: Array<{ title: string; alias: string }>;
  location: { display_address: string[] };
  image_url: string;
  url: string;
  coordinates: { latitude: number; longitude: number };
  price?: string;
  display_phone?: string;
  is_closed?: boolean;
}

async function searchYelp(
  lat: number,
  lon: number,
  radiusMeters = 1600,
): Promise<YelpBusiness[]> {
  const apiKey = process.env["YELP_API_KEY"];
  if (!apiKey) return [];
  const radius = Math.min(Math.round(radiusMeters), 40000);
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}&categories=restaurants,food&radius=${radius}&limit=20&sort_by=rating`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { businesses?: YelpBusiness[] };
  return (data.businesses ?? []).filter((b) => !b.is_closed);
}

router.post("/plan", async (req: Request, res: Response) => {
  const { startAddress, endAddress, mode = "driving" } = req.body as {
    startAddress?: string;
    endAddress?: string;
    mode?: "driving" | "walking" | "cycling";
  };

  if (!startAddress || !endAddress) {
    res.status(400).json({ error: "startAddress and endAddress are required" });
    return;
  }

  try {
    const [startGeo, endGeo] = await Promise.all([
      geocode(startAddress),
      geocode(endAddress),
    ]);

    const routeData = await getRoute(startGeo, endGeo, mode);

    // Sample waypoints every 2km along route (max 5 Yelp queries)
    const waypoints = sampleRoutePoints(routeData.coordinates, 2000).slice(0, 5);

    const yelpResults = await Promise.all(
      waypoints.map(([lon, lat]) => searchYelp(lat, lon, 1600)),
    );

    // Deduplicate
    const seen = new Set<string>();
    const allBusinesses: YelpBusiness[] = [];
    for (const batch of yelpResults) {
      for (const biz of batch) {
        if (!seen.has(biz.id)) {
          seen.add(biz.id);
          allBusinesses.push(biz);
        }
      }
    }

    const MAX_DISTANCE_METERS = 3200; // 2 miles
    const restaurants = allBusinesses
      .map((biz) => {
        const distToRoute = minDistanceToRoute(
          biz.coordinates.latitude,
          biz.coordinates.longitude,
          routeData.coordinates,
        );
        return {
          id: biz.id,
          name: biz.name,
          rating: biz.rating,
          reviewCount: biz.review_count,
          categories: biz.categories.map((c) => c.title).join(", "),
          address: biz.location.display_address.join(", "),
          imageUrl: biz.image_url ?? null,
          yelpUrl: biz.url,
          lat: biz.coordinates.latitude,
          lon: biz.coordinates.longitude,
          distanceMeters: Math.round(distToRoute),
          priceTier: biz.price ?? "",
          phone: biz.display_phone ?? "",
        };
      })
      .filter((r) => r.distanceMeters <= MAX_DISTANCE_METERS)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    res.json({
      start: { lat: startGeo.lat, lon: startGeo.lon, name: startGeo.displayName },
      end: { lat: endGeo.lat, lon: endGeo.lon, name: endGeo.displayName },
      route: {
        coordinates: routeData.coordinates,
        distanceMeters: routeData.distanceMeters,
        durationSeconds: routeData.durationSeconds,
      },
      restaurants,
      hasYelpKey: !!process.env["YELP_API_KEY"],
    });
  } catch (err) {
    req.log.error({ err }, "Route planning failed");
    res.status(500).json({
      error: err instanceof Error ? err.message : "Route planning failed",
    });
  }
});

export default router;
