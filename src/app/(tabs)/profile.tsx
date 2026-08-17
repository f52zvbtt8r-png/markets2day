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
  points: number;
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

type ManagedMarket = {
  id: string;
  name: string;
};

const MY_MARKETS: ManagedMarket[] = [
  { id: '1', name: 'Grote Markt Vlooienmarkt' },
  { id: '2', name: 'De Haagse Markt' },
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
  const router = useRouter();
  const { user } = useAuth();
  const safeAreaInsets = useSafeAreaInsets();
  const { toastMessage, showToast } = useToast();
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHometown, setEditHometown] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }
    let cancelled = false;
    setIsProfileLoading(true);
    supabase
      .from('profiles')
      .select('name, hometown, points')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) {
          return;
        }
        if (!error && data) {
          setProfile(data);
        }
        setIsProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

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

    setProfile((current) => ({
      points: current?.points ?? 0,
      name: nextName,
      hometown: nextHometown,
    }));
    setIsEditing(false);
    showToast('Profile updated');
  };

  const displayName = profile?.name || user?.email || '';
  const initials = getInitials(profile?.name ?? null, user?.email);

  if (!user) {
    return null;
  }

  if (isProfileLoading) {
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
                {profile?.hometown || 'Add your hometown'} · {profile?.points ?? 0} points
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
            <ThemedText type="smallBold">My markets</ThemedText>
            <View style={styles.list}>
              {MY_MARKETS.map((market) => (
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
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">Saved markets</ThemedText>
            <View style={styles.list}>
              {SAVED_MARKETS.map((market) => (
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
                      <ThemedText type="small" themeColor="textSecondary">
                        {market.date} · {market.place}
                      </ThemedText>
                    </View>
                    <MaterialCommunityIcons name="heart" size={20} color={theme.accent} />
                  </ThemedView>
                </Pressable>
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
