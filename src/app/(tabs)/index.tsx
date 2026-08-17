import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StampBadge, type StampStatus } from '@/components/stamp-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

type Filter = 'Today' | 'This weekend' | 'Choose date';

const FILTERS: Filter[] = ['Today', 'This weekend', 'Choose date'];

const CARD_COLORS: ThemeColor[] = ['accent', 'info', 'tertiary'];

type MarketListItem = {
  id: string;
  name: string;
  categories: string[] | null;
  status: StampStatus;
  entry_free: boolean;
};

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<Filter>('Today');
  const [markets, setMarkets] = useState<MarketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    supabase
      .from('markets')
      .select('id, name, categories, status, entry_free')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) {
          return;
        }
        if (!error && data) {
          setMarkets(data);
        }
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

        {isLoading ? (
          <ThemedText type="default" themeColor="textSecondary">
            Loading markets…
          </ThemedText>
        ) : markets.length === 0 ? (
          <ThemedText type="default" themeColor="textSecondary">
            No markets yet — be the first to add one!
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {markets.map((market, index) => (
              <Pressable
                key={market.id}
                onPress={() =>
                  router.push({ pathname: '/market/[id]', params: { id: market.id } })
                }>
                <ThemedView type="backgroundElement" style={styles.card}>
                  <ThemedView
                    type={CARD_COLORS[index % CARD_COLORS.length]}
                    style={styles.cardIcon}
                  />
                  <View style={styles.cardContent}>
                    <ThemedText type="default" style={styles.cardTitle}>
                      {market.name}
                    </ThemedText>
                    <StampBadge status={market.status} />
                    <View style={styles.cardMetaRow}>
                      <ThemedText type="small" themeColor="textSecondary">
                        {market.categories && market.categories.length > 0
                          ? market.categories.join(', ')
                          : '—'}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        ·
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {market.entry_free ? 'Free' : 'Paid'}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        ·
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        —
                      </ThemedText>
                    </View>
                  </View>
                </ThemedView>
              </Pressable>
            ))}
          </View>
        )}
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
