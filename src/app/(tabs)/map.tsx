import Feather from '@expo/vector-icons/Feather';
import { Slider } from '@expo/ui/community/slider';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORIES } from '@/constants/categories';
import { BottomTabInset, MaxContentWidth, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

type DateFilter = 'Today' | 'This weekend' | 'Choose date';

const DATE_FILTERS: DateFilter[] = ['Today', 'This weekend', 'Choose date'];

const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 30;
const RADIUS_FETCH_DEBOUNCE_MS = 300;
const PIN_COLORS: ThemeColor[] = ['accent', 'info', 'tertiary'];

type NearbyMarket = {
  id: string;
  name: string;
  categories: string[] | null;
  status: string;
  entry_free: boolean;
  distance_km: number;
};

type LocationStatus = 'requesting' | 'granted' | 'denied';

function hashToAngle(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 360;
  }
  return (hash / 360) * Math.PI * 2;
}

export default function MapScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilter>('Today');
  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => new Set(['Farmers']));
  const [radiusKm, setRadiusKm] = useState(15);

  const [locationStatus, setLocationStatus] = useState<LocationStatus>('requesting');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [markets, setMarkets] = useState<NearbyMarket[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('denied');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      setLocationStatus('granted');
    })();
  }, []);

  useEffect(() => {
    if (!coords) {
      return;
    }
    setIsLoadingMarkets(true);
    const timeout = setTimeout(() => {
      supabase
        .rpc('nearby_markets', {
          user_lat: coords.lat,
          user_lng: coords.lng,
          radius_km: radiusKm,
        })
        .then(({ data, error }) => {
          setIsLoadingMarkets(false);
          if (error) {
            setFetchError(error.message);
            setMarkets([]);
            return;
          }
          setFetchError(null);
          setMarkets(data ?? []);
        });
    }, RADIUS_FETCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [coords, radiusKm]);

  const toggleCategory = (category: string) => {
    setActiveCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const filteredMarkets =
    activeCategories.size === 0
      ? markets
      : markets.filter((market) => market.categories?.some((category) => activeCategories.has(category)));

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  let mapStatusMessage: string | null = null;
  if (locationStatus === 'requesting') {
    mapStatusMessage = 'Getting your location…';
  } else if (locationStatus === 'denied') {
    mapStatusMessage = 'Location access needed to show nearby markets';
  } else if (fetchError) {
    mapStatusMessage = fetchError;
  } else if (isLoadingMarkets) {
    mapStatusMessage = 'Loading markets…';
  } else if (filteredMarkets.length === 0) {
    mapStatusMessage = 'No markets found in this area — try increasing the radius';
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <View style={styles.content}>
        <View style={styles.locationRow}>
          <ThemedText type="default">Den Haag, NL</ThemedText>
          <Pressable hitSlop={Spacing.two}>
            <Feather name="edit-3" size={14} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {DATE_FILTERS.map((filter) => {
            const isActive = filter === activeDateFilter;
            return (
              <Pressable key={filter} onPress={() => setActiveDateFilter(filter)}>
                <ThemedView
                  type={isActive ? 'accent' : 'backgroundElement'}
                  style={styles.filterButton}>
                  <ThemedText type="small" themeColor={isActive ? 'background' : 'text'}>
                    {filter}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map((category) => {
            const isActive = activeCategories.has(category);
            return (
              <Pressable key={category} onPress={() => toggleCategory(category)}>
                <ThemedView
                  type={isActive ? 'accent' : 'backgroundElement'}
                  style={styles.categoryChip}>
                  <ThemedText type="small" themeColor={isActive ? 'background' : 'text'}>
                    {category}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.radiusRow}>
          <ThemedText type="default">Radius</ThemedText>
          <Slider
            style={styles.radiusSlider}
            value={radiusKm}
            minimumValue={MIN_RADIUS_KM}
            maximumValue={MAX_RADIUS_KM}
            step={1}
            minimumTrackTintColor={theme.accent}
            onValueChange={setRadiusKm}
          />
          <ThemedText type="small" themeColor="textSecondary">
            {Math.round(radiusKm)} km
          </ThemedText>
        </View>

        <ThemedView
          type="backgroundElement"
          style={[styles.mapPlaceholder, { borderColor: theme.backgroundSelected }]}>
          {mapStatusMessage ? (
            <ThemedText
              type="default"
              themeColor="textSecondary"
              style={styles.mapStatusMessage}>
              {mapStatusMessage}
            </ThemedText>
          ) : (
            filteredMarkets.map((market, index) => {
              const normalizedDistance = Math.min(market.distance_km / radiusKm, 1);
              const angle = hashToAngle(market.id);
              const radiusPercent = normalizedDistance * 40;
              const left = 50 + radiusPercent * Math.cos(angle);
              const top = 50 + radiusPercent * Math.sin(angle);

              return (
                <Pressable
                  key={market.id}
                  style={[styles.pinWrapper, { left: `${left}%`, top: `${top}%` }]}
                  onPress={() =>
                    router.push({ pathname: '/market/[id]', params: { id: market.id } })
                  }>
                  <ThemedView
                    type={PIN_COLORS[index % PIN_COLORS.length]}
                    style={[styles.pin, { borderColor: theme.backgroundElement }]}
                  />
                </Pressable>
              );
            })
          )}
        </ThemedView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  filterButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  categoryChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  radiusSlider: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    minHeight: 200,
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  mapStatusMessage: {
    paddingHorizontal: Spacing.four,
    textAlign: 'center',
  },
  pinWrapper: {
    position: 'absolute',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  pin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
});
