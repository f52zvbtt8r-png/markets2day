import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Filter = 'Today' | 'This weekend' | 'Choose date';

const FILTERS: Filter[] = ['Today', 'This weekend', 'Choose date'];

type Market = {
  id: string;
  name: string;
  color: ThemeColor;
  distance: string;
  price: string;
  day: string;
};

const MARKETS: Market[] = [
  { id: '1', name: 'Grote Markt', color: 'accent', distance: '1.2 km', price: 'Free', day: 'Today' },
  {
    id: '2',
    name: 'Zeeheldenkwartier Market',
    color: 'info',
    distance: '2.5 km',
    price: '€2',
    day: 'Today',
  },
  {
    id: '3',
    name: 'Vlooienmarkt Vrijenban',
    color: 'tertiary',
    distance: '4.8 km',
    price: 'Free',
    day: 'Saturday',
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<Filter>('Today');

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
        <ThemedText type="default" style={styles.brand}>
          markets2day
        </ThemedText>

        <View style={styles.locationRow}>
          <ThemedText type="default">Den Haag, NL</ThemedText>
          <Pressable hitSlop={Spacing.two}>
            <Feather name="edit-3" size={14} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <Pressable key={filter} onPress={() => setActiveFilter(filter)}>
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

        <View style={styles.list}>
          {MARKETS.map((market) => (
            <ThemedView key={market.id} type="backgroundElement" style={styles.card}>
              <ThemedView type={market.color} style={styles.cardIcon} />
              <View style={styles.cardContent}>
                <ThemedText type="default" style={styles.cardTitle}>
                  {market.name}
                </ThemedText>
                <View style={styles.cardMetaRow}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {market.distance}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    ·
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {market.price}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    ·
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {market.day}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  brand: {
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 30,
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
  list: {
    gap: Spacing.three,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  cardIcon: {
    width: Spacing.five,
    height: Spacing.five,
    borderRadius: Spacing.two,
  },
  cardContent: {
    flex: 1,
    gap: Spacing.half,
  },
  cardTitle: {
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 22,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
