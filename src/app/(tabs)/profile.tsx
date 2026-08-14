import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StampBadge, type StampStatus } from '@/components/stamp-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PROFILE = {
  initials: 'MJ',
  name: 'Maya Jansen',
  location: 'Den Haag',
  points: 128,
};

type Badge = {
  title: string;
  description: string;
  earned: boolean;
  status?: StampStatus;
};

const BADGES: Badge[] = [
  {
    title: 'Market Explorer',
    description: 'Added 5 markets, confirmed 10, added 25 photos',
    earned: true,
  },
  {
    title: 'Local Market Expert',
    description: '15 markets added or 50+ confirmations',
    earned: false,
    status: 'pending',
  },
];

type SavedMarket = {
  id: string;
  name: string;
  date: string;
  place: string;
};

const SAVED_MARKETS: SavedMarket[] = [
  { id: '1', name: 'Grote Markt Vlooienmarkt', date: 'Sat 15 Aug', place: 'Den Haag' },
  {
    id: '2',
    name: 'Zeeheldenkwartier Artisan Market',
    date: 'Sun 16 Aug',
    place: 'Zeeheldenkwartier',
  },
];

type Review = {
  id: string;
  market: string;
  rating: number;
  text: string;
};

const REVIEWS: Review[] = [
  {
    id: '1',
    market: 'De Haagse Markt',
    rating: 5,
    text: 'Amazing variety of fresh produce, went early and it was still buzzing.',
  },
  {
    id: '2',
    market: 'Grote Markt Vlooienmarkt',
    rating: 4,
    text: 'Found some great vintage furniture, gets crowded by midday on Saturdays.',
  },
  {
    id: '3',
    market: 'Zeeheldenkwartier Artisan Market',
    rating: 4,
    text: 'Lovely small market, the coffee stall near the entrance is a must.',
  },
];

const STARS = [1, 2, 3, 4, 5];

export default function ProfileScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

  const visibleReviews = reviewsExpanded ? REVIEWS : REVIEWS.slice(0, 1);

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
        <View style={styles.profileRow}>
          <ThemedView type="accent" style={styles.avatar}>
            <ThemedText type="default" themeColor="background" style={styles.avatarText}>
              {PROFILE.initials}
            </ThemedText>
          </ThemedView>
          <View style={styles.profileInfo}>
            <ThemedText type="default" style={styles.nameText}>
              {PROFILE.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {PROFILE.location} · {PROFILE.points} points
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Badges</ThemedText>
          <View style={styles.list}>
            {BADGES.map((badge) => (
              <ThemedView
                key={badge.title}
                type="backgroundElement"
                style={[styles.badgeCard, !badge.earned && styles.unearned]}>
                {badge.status && <StampBadge status={badge.status} />}
                <ThemedText type="smallBold" themeColor="text">
                  {badge.title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {badge.description}
                </ThemedText>
              </ThemedView>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Saved markets</ThemedText>
          <View style={styles.list}>
            {SAVED_MARKETS.map((market) => (
              <ThemedView key={market.id} type="backgroundElement" style={styles.savedRow}>
                <View style={styles.savedRowText}>
                  <ThemedText type="default" themeColor="text">
                    {market.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {market.date} · {market.place}
                  </ThemedText>
                </View>
                <MaterialCommunityIcons name="heart" size={20} color={theme.accent} />
              </ThemedView>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Markets reviewed</ThemedText>
          <View style={styles.list}>
            {visibleReviews.map((review) => (
              <ThemedView key={review.id} type="backgroundElement" style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <ThemedText type="default" themeColor="text">
                    {review.market}
                  </ThemedText>
                  <View style={styles.reviewStars}>
                    {STARS.map((star) => (
                      <MaterialCommunityIcons
                        key={star}
                        name={star <= review.rating ? 'star' : 'star-outline'}
                        size={14}
                        color={theme.accent}
                      />
                    ))}
                  </View>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  {review.text}
                </ThemedText>
              </ThemedView>
            ))}
          </View>

          {REVIEWS.length > 1 && (
            <Pressable
              onPress={() => setReviewsExpanded((current) => !current)}
              style={styles.toggleRow}>
              <ThemedText type="small" themeColor="accent">
                {reviewsExpanded ? 'Show less' : `Show ${REVIEWS.length - 1} more reviews`}
              </ThemedText>
              <Feather
                name={reviewsExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={theme.accent}
              />
            </Pressable>
          )}
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.display,
    fontSize: 22,
  },
  profileInfo: {
    gap: Spacing.half,
  },
  nameText: {
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 30,
  },
  section: {
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  badgeCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  unearned: {
    opacity: 0.5,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  savedRowText: {
    gap: Spacing.half,
  },
  reviewCard: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: Spacing.half,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
