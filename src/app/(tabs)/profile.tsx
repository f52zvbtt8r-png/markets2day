import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StampBadge, type StampStatus } from '@/components/stamp-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type Profile = {
  name: string | null;
  hometown: string | null;
};

function getInitials(name: string | null, email: string | undefined) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    return (first + last).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return '?';
}

type Badge = {
  title: string;
  description: string;
  earned: boolean;
};

type ManagedMarket = {
  id: string;
  name: string;
};

type SavedMarket = {
  id: string;
  name: string;
  subtitle: string;
};

type Review = {
  id: string;
  market: string;
  rating: number;
  text: string;
};

const STARS = [1, 2, 3, 4, 5];

const MARKET_EXPLORER_MARKETS_THRESHOLD = 5;
const MARKET_EXPLORER_CONFIRMATIONS_THRESHOLD = 10;
const LOCAL_EXPERT_MARKETS_THRESHOLD = 15;
const LOCAL_EXPERT_CONFIRMATIONS_THRESHOLD = 50;

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const safeAreaInsets = useSafeAreaInsets();
  const { toastMessage, showToast } = useToast();
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHometown, setEditHometown] = useState('');

  const [savedMarkets, setSavedMarkets] = useState<SavedMarket[]>([]);
  const [myMarkets, setMyMarkets] = useState<ManagedMarket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [marketsAdded, setMarketsAdded] = useState(0);
  const [confirmationsCount, setConfirmationsCount] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      const [
        profileResult,
        savedResult,
        myMarketsResult,
        reviewsResult,
        marketsAddedResult,
        confirmationsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('name, hometown').eq('id', user.id).single(),
        supabase
          .from('saved_markets')
          .select('created_at, markets(id, name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('markets')
          .select('id, name')
          .eq('organiser_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('id, stars, text, markets(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('markets')
          .select('id', { count: 'exact', head: true })
          .eq('created_by', user.id),
        supabase
          .from('confirmations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      if (cancelled) {
        return;
      }

      if (!profileResult.error && profileResult.data) {
        setProfile(profileResult.data);
      }

      setSavedMarkets(
        (savedResult.data ?? [])
          .filter((row: any) => row.markets)
          .map((row: any) => ({
            id: row.markets.id,
            name: row.markets.name,
            subtitle: '',
          }))
      );

      setMyMarkets(myMarketsResult.data ?? []);

      setReviews(
        (reviewsResult.data ?? []).map((row: any) => ({
          id: row.id,
          market: row.markets?.name ?? 'Unknown market',
          rating: row.stars,
          text: row.text ?? '',
        }))
      );

      setMarketsAdded(marketsAddedResult.count ?? 0);
      setConfirmationsCount(confirmationsResult.count ?? 0);

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const points = marketsAdded * 2 + confirmationsCount + reviews.length;

  const badges: Badge[] = [
    {
      title: 'Market Explorer',
      description: 'Added 5 markets, confirmed 10, added 25 photos',
      earned:
        marketsAdded >= MARKET_EXPLORER_MARKETS_THRESHOLD ||
        confirmationsCount >= MARKET_EXPLORER_CONFIRMATIONS_THRESHOLD,
    },
    {
      title: 'Local Market Expert',
      description: '15 markets added or 50+ confirmations',
      earned:
        marketsAdded >= LOCAL_EXPERT_MARKETS_THRESHOLD ||
        confirmationsCount >= LOCAL_EXPERT_CONFIRMATIONS_THRESHOLD,
    },
  ];

  const visibleReviews = reviewsExpanded ? reviews : reviews.slice(0, 1);

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

  const openEditForm = () => {
    setEditName(profile?.name ?? '');
    setEditHometown(profile?.hometown ?? '');
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }
    const nextName = editName.trim() || null;
    const nextHometown = editHometown.trim() || null;

    const { error } = await supabase
      .from('profiles')
      .update({ name: nextName, hometown: nextHometown })
      .eq('id', user.id);

    if (error) {
      showToast(error.message);
      return;
    }

    setProfile({ name: nextName, hometown: nextHometown });
    setIsEditing(false);
    showToast('Profile updated');
  };

  const displayName = profile?.name || user?.email || '';
  const initials = getInitials(profile?.name ?? null, user?.email);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.loadingScreen, { backgroundColor: theme.background }]}>
        <ThemedText type="default" themeColor="textSecondary">
          Loading profile…
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <View style={styles.content}>
          <View style={styles.profileRow}>
            <ThemedView type="accent" style={styles.avatar}>
              <ThemedText type="default" themeColor="background" style={styles.avatarText}>
                {initials}
              </ThemedText>
            </ThemedView>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <ThemedText type="default" style={styles.nameText}>
                  {displayName}
                </ThemedText>
                <Pressable hitSlop={Spacing.two} onPress={openEditForm}>
                  <Feather name="edit-3" size={14} color={theme.textSecondary} />
                </Pressable>
              </View>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={!profile?.hometown && styles.hometownPlaceholder}>
                {profile?.hometown || 'Add your hometown'} · {points} points
              </ThemedText>
            </View>
          </View>

          {isEditing && (
            <View style={styles.editForm}>
              <ThemedTextInput value={editName} onChangeText={setEditName} placeholder="Name" />
              <ThemedTextInput
                value={editHometown}
                onChangeText={setEditHometown}
                placeholder="Hometown"
              />
              <Pressable onPress={handleSaveProfile}>
                <ThemedView type="accent" style={styles.saveButton}>
                  <ThemedText type="default" themeColor="background" style={styles.saveButtonText}>
                    Save
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </View>
          )}

          <View style={styles.section}>
            <ThemedText type="smallBold">Badges</ThemedText>
            <View style={styles.list}>
              {badges.map((badge) => (
                <ThemedView
                  key={badge.title}
                  type="backgroundElement"
                  style={[styles.badgeCard, !badge.earned && styles.unearned]}>
                  {!badge.earned && <StampBadge status="pending" />}
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
            <ThemedText type="smallBold">My markets</ThemedText>
            {myMarkets.length === 0 ? (
              <ThemedText type="default" themeColor="textSecondary">
                You haven&apos;t claimed any markets yet
              </ThemedText>
            ) : (
              <View style={styles.list}>
                {myMarkets.map((market) => (
                  <Pressable
                    key={market.id}
                    onPress={() =>
                      router.push({ pathname: '/market/[id]/manage', params: { id: market.id } })
                    }>
                    <ThemedView type="backgroundElement" style={styles.savedRow}>
                      <ThemedText type="default" themeColor="text">
                        {market.name}
                      </ThemedText>
                      <Feather name="chevron-right" size={18} color={theme.textSecondary} />
                    </ThemedView>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">Saved markets</ThemedText>
            {savedMarkets.length === 0 ? (
              <ThemedText type="default" themeColor="textSecondary">
                Nothing saved yet
              </ThemedText>
            ) : (
              <View style={styles.list}>
                {savedMarkets.map((market) => (
                  <Pressable
                    key={market.id}
                    onPress={() =>
                      router.push({ pathname: '/market/[id]', params: { id: market.id } })
                    }>
                    <ThemedView type="backgroundElement" style={styles.savedRow}>
                      <View style={styles.savedRowText}>
                        <ThemedText type="default" themeColor="text">
                          {market.name}
                        </ThemedText>
                        {market.subtitle.length > 0 && (
                          <ThemedText type="small" themeColor="textSecondary">
                            {market.subtitle}
                          </ThemedText>
                        )}
                      </View>
                      <MaterialCommunityIcons name="heart" size={20} color={theme.accent} />
                    </ThemedView>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">Markets reviewed</ThemedText>
            {reviews.length === 0 ? (
              <ThemedText type="default" themeColor="textSecondary">
                You haven&apos;t reviewed any markets yet
              </ThemedText>
            ) : (
              <>
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

                {reviews.length > 1 && (
                  <Pressable
                    onPress={() => setReviewsExpanded((current) => !current)}
                    style={styles.toggleRow}>
                    <ThemedText type="small" themeColor="accent">
                      {reviewsExpanded ? 'Show less' : `Show ${reviews.length - 1} more reviews`}
                    </ThemedText>
                    <Feather
                      name={reviewsExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={theme.accent}
                    />
                  </Pressable>
                )}
              </>
            )}
          </View>

          <View style={styles.logoutSection}>
            <Pressable onPress={() => supabase.auth.signOut()}>
              <ThemedView type="backgroundElement" style={styles.logoutButton}>
                <ThemedText type="default" themeColor="accent" style={styles.logoutButtonText}>
                  Log out
                </ThemedText>
              </ThemedView>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Toast message={toastMessage} bottom={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingScreen: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  nameText: {
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 30,
  },
  hometownPlaceholder: {
    fontStyle: 'italic',
  },
  editForm: {
    gap: Spacing.two,
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  saveButtonText: {
    fontWeight: '700',
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
  logoutSection: {
    marginTop: Spacing.four,
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  logoutButtonText: {
    fontWeight: '700',
  },
});
