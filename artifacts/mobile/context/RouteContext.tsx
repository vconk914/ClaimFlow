import React, { createContext, useContext, useState } from "react";

export type Restaurant = {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  categories: string;
  address: string;
  imageUrl: string | null;
  yelpUrl: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  priceTier: string;
  phone: string;
};

export type RouteResult = {
  start: { lat: number; lon: number; name: string };
  end: { lat: number; lon: number; name: string };
  route: {
    coordinates: [number, number][];
    distanceMeters: number;
    durationSeconds: number;
  };
  restaurants: Restaurant[];
  hasYelpKey: boolean;
};

type RouteContextType = {
  result: RouteResult | null;
  setResult: (r: RouteResult | null) => void;
};

const RouteContext = createContext<RouteContextType | null>(null);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [result, setResult] = useState<RouteResult | null>(null);
  return (
    <RouteContext.Provider value={{ result, setResult }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRoute must be used within RouteProvider");
  return ctx;
}
