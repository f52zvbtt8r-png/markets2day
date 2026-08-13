import Feather from '@expo/vector-icons/Feather';
import { Slider } from '@expo/ui/community/slider';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DateFilter = 'Today' | 'This weekend' | 'Choose date';

const DATE_FILTERS: DateFilter[] = ['Today', 'This weekend', 'Choose date'];

const CATEGORIES = ['Farmers', 'Flea', 'Vintage', 'Food', 'Artisan', 'Flowers', 'Fashion', 'Seasonal'];

const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 30;

export default function MapScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilter>('Today');
  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => new Set(['Farmers']));
  const [radiusKm, setRadiusKm] = useState(15);

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
          <ThemedText type="default" themeColor="textSecondary">
            Map preview
          </ThemedText>
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
  },
});
