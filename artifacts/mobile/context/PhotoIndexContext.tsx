import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { analyzePhoto, searchPhotos } from "@workspace/api-client-react";

const STORAGE_KEY = "@photo_index_v2";
const RECENT_SEARCHES_KEY = "@recent_searches_v1";

export type IndexedPhoto = {
  id: string;
  uri: string;
  filename: string;
  description: string;
  tags: string[];
  sceneType: string;
  timeOfDay: string;
  indexedAt: number;
};

type IndexingProgress = {
  current: number;
  total: number;
};

type SearchResult = {
  id: string;
  relevanceScore: number;
  matchReason: string;
};

type PhotoIndexContextType = {
  indexedPhotos: IndexedPhoto[];
  isIndexing: boolean;
  indexingProgress: IndexingProgress;
  indexCount: number;
  pickAndIndexPhotos: () => Promise<void>;
  cancelIndexing: () => void;
  searchResults: SearchResult[] | null;
  isSearching: boolean;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
};

const PhotoIndexContext = createContext<PhotoIndexContextType | null>(null);

async function resizeAndBase64(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 512 } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG },
  );
  const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

export function PhotoIndexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [indexedPhotos, setIndexedPhotos] = useState<IndexedPhoto[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState<IndexingProgress>({
    current: 0,
    total: 0,
  });
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const cancelRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setIndexedPhotos(JSON.parse(stored));
        }
        const searches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (searches) {
          setRecentSearches(JSON.parse(searches));
        }
      } catch {}
    })();
  }, []);

  const pickAndIndexPhotos = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 50,
    });

    if (result.canceled || result.assets.length === 0) return;

    cancelRef.current = false;
    setIsIndexing(true);

    const existing = new Set(indexedPhotos.map((p) => p.uri));
    const toIndex = result.assets.filter((a) => !existing.has(a.uri));

    setIndexingProgress({ current: 0, total: toIndex.length });

    const newPhotos = [...indexedPhotos];

    for (let i = 0; i < toIndex.length; i++) {
      if (cancelRef.current) break;

      const asset = toIndex[i];
      setIndexingProgress({ current: i + 1, total: toIndex.length });

      try {
        const imageBase64 = await resizeAndBase64(asset.uri);
        const photoId =
          asset.assetId ??
          `photo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        const analysis = await analyzePhoto({ imageBase64, photoId });

        newPhotos.push({
          id: photoId,
          uri: asset.uri,
          filename: asset.fileName ?? photoId,
          description: analysis.description,
          tags: analysis.tags,
          sceneType: analysis.sceneType,
          timeOfDay: analysis.timeOfDay,
          indexedAt: Date.now(),
        });

        setIndexedPhotos([...newPhotos]);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPhotos));
      } catch {}
    }

    setIsIndexing(false);
  }, [indexedPhotos]);

  const cancelIndexing = useCallback(() => {
    cancelRef.current = true;
    setIsIndexing(false);
  }, []);

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);
      try {
        const photos = indexedPhotos.map((p) => ({
          id: p.id,
          description: p.description,
          tags: p.tags,
          sceneType: p.sceneType,
          timeOfDay: p.timeOfDay,
        }));

        if (photos.length === 0) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        const response = await searchPhotos({ query, photos });
        setSearchResults(response.results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [indexedPhotos],
  );

  const clearSearch = useCallback(() => {
    setSearchResults(null);
  }, []);

  const addRecentSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      const updated = [
        trimmed,
        ...recentSearches.filter((s) => s !== trimmed),
      ].slice(0, 10);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    },
    [recentSearches],
  );

  return (
    <PhotoIndexContext.Provider
      value={{
        indexedPhotos,
        isIndexing,
        indexingProgress,
        indexCount: indexedPhotos.length,
        pickAndIndexPhotos,
        cancelIndexing,
        searchResults,
        isSearching,
        performSearch,
        clearSearch,
        recentSearches,
        addRecentSearch,
      }}
    >
      {children}
    </PhotoIndexContext.Provider>
  );
}

export function usePhotoIndex() {
  const ctx = useContext(PhotoIndexContext);
  if (!ctx)
    throw new Error("usePhotoIndex must be used within PhotoIndexProvider");
  return ctx;
}
