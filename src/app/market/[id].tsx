import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StampBadge, type StampStatus } from '@/components/stamp-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { Fonts, MaxContentWidth, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type MarketRow = {
  id: string;
  name: string;
  categories: string[] | null;
  indoor_outdoor: string | null;
  description: string | null;
  opening_days: string | null;
  opening_times: string | null;
  extra_info: string | null;
  entry_free: boolean;
  entry_price: string | null;
  dogs_allowed: boolean | null;
  dogs_comment: string | null;
  website_url: string | null;
  instagram_url: string | null;
  status: StampStatus;
  confirmation_count: number;
};

const PHOTO_COLORS: ThemeColor[] = ['accent', 'info', 'tertiary'];
const COMMUNITY_VERIFIED_THRESHOLD = 3;
const STARS = [1, 2, 3, 4, 5];

type Tab = 'info' | 'reviews';

type Review = {
  id: number;
  author: string;
  rating: number;
  text: string;
  isAnonymous: boolean;
};

export default function MarketDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [market, setMarket] = useState<MarketRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('info');

  const [confirmations, setConfirmations] = useState(0);
  const [lastConfirmed, setLastConfirmed] = useState('');
  const [status, setStatus] = useState<StampStatus>('pending');
  const [isSaved, setIsSaved] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [draftRating, setDraftRating] = useState(0);
  const [draftText, setDraftText] = useState('');
  const [draftIsAnonymous, setDraftIsAnonymous] = useState(false);
  const nextReviewId = useRef(0);

  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [claimName, setClaimName] = useState('');
  const [claimEmail, setClaimEmail] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [claimConfirmed, setClaimConfirmed] = useState(false);

  const { toastMessage, showToast } = useToast();

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);
    supabase
      .from('markets')
      .select(
        'id, name, categories, indoor_outdoor, description, opening_days, opening_times, extra_info, entry_free, entry_price, dogs_allowed, dogs_comment, website_url, instagram_url, status, confirmation_count'
      )
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) {
          return;
        }
        if (error || !data) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        setMarket(data);
        setConfirmations(data.confirmation_count);
        setStatus(data.status);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleConfirm = () => {
    setConfirmations((current) => {
      const next = current + 1;
      if (status === 'pending' && next >= COMMUNITY_VERIFIED_THRESHOLD) {
        setStatus('community_verified');
      }
      return next;
    });
    setLastConfirmed('today');
    showToast('Thanks for confirming — count updated');
  };

  const handleToggleSave = () => {
    setIsSaved((current) => {
      const next = !current;
      showToast(next ? 'Saved! Reminder set.' : 'Removed from saved');
      return next;
    });
  };

  const handleShare = () => {
    showToast('Opening WhatsApp to share this market…');
  };

  const handlePostReview = () => {
    if (draftRating === 0) {
      return;
    }
    setReviews((current) => [
      {
        id: nextReviewId.current++,
        author: draftIsAnonymous ? 'Anonymous' : 'You',
        rating: draftRating,
        text: draftText.trim(),
        isAnonymous: draftIsAnonymous,
      },
      ...current,
    ]);
    setDraftRating(0);
    setDraftText('');
    setDraftIsAnonymous(false);
  };

  const canSubmitClaim =
    claimName.trim().length > 0 &&
    claimEmail.trim().length > 0 &&
    claimNotes.trim().length > 0 &&
    claimConfirmed;

  const handleSubmitClaim = () => {
    if (!canSubmitClaim) {
      return;
    }
    setIsClaimed(true);
    setIsClaimFormOpen(false);
    setStatus('organiser_verified');
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centered, { backgroundColor: theme.background }]}>
        <ThemedText type="default" themeColor="textSecondary">
          Loading market…
        </ThemedText>
      </View>
    );
  }

  if (notFound || !market) {
    return (
      <View style={[styles.screen, styles.centered, { backgroundColor: theme.background }]}>
        <ThemedText type="default" themeColor="textSecondary">
          Market not found.
        </ThemedText>
      </View>
    );
  }

  const chips = [...(market.categories ?? []), market.indoor_outdoor].filter(
    (value): value is string => Boolean(value)
  );
  const bodyText = market.description || market.extra_info || '';
  const hasOpeningInfo = Boolean(market.opening_days || market.opening_times);
  const hasLinks = Boolean(market.website_url || market.instagram_url);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + Spacing.four },
        ]}>
        <View style={styles.content}>
          <View style={styles.photoRow}>
            {PHOTO_COLORS.map((color) => (
              <ThemedView key={color} type={color} style={styles.photoBox}>
                <Feather name="camera" size={22} color={theme.background} />
              </ThemedView>
            ))}
          </View>

          <View style={styles.titleRow}>
            <ThemedText type="default" style={styles.titleText}>
              {market.name}
            </ThemedText>
            <View style={styles.titleActions}>
              <Pressable hitSlop={Spacing.two} onPress={handleShare}>
                <Feather name="share-2" size={20} color={theme.textSecondary} />
              </Pressable>
              <Pressable hitSlop={Spacing.two} onPress={handleToggleSave}>
                <MaterialCommunityIcons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isSaved ? theme.accent : theme.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          {chips.length > 0 && (
            <View style={styles.chipRow}>
              {chips.map((label) => (
                <ThemedView key={label} type="backgroundElement" style={styles.chip}>
                  <ThemedText type="small" themeColor="text">
                    {label}
                  </ThemedText>
                </ThemedView>
              ))}
            </View>
          )}

          <StampBadge status={status} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText type="small" themeColor="textSecondary">
                👥 {confirmations} confirmations
              </ThemedText>
            </View>
            {lastConfirmed.length > 0 && (
              <View style={styles.infoItem}>
                <View style={[styles.confirmedDot, { backgroundColor: theme.infoDark }]} />
                <ThemedText type="small" themeColor="textSecondary">
                  confirmed {lastConfirmed}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.actionButtonWrapper}>
              <ThemedView type="accent" style={styles.primaryButton}>
                <ThemedText type="default" themeColor="background" style={styles.actionButtonText}>
                  Navigate
                </ThemedText>
              </ThemedView>
            </Pressable>
            <Pressable style={styles.actionButtonWrapper} onPress={handleConfirm}>
              <ThemedView
                type="background"
                style={[styles.secondaryButton, { borderColor: theme.accent }]}>
                <ThemedText type="default" themeColor="accent" style={styles.actionButtonText}>
                  Confirm active
                </ThemedText>
              </ThemedView>
            </Pressable>
          </View>

          <View style={[styles.tabRow, { borderBottomColor: theme.backgroundSelected }]}>
            <Pressable onPress={() => setActiveTab('info')} style={styles.tabButton}>
              <ThemedText
                type={activeTab === 'info' ? 'smallBold' : 'small'}
                themeColor={activeTab === 'info' ? 'text' : 'textSecondary'}
                style={
                  activeTab === 'info' && [
                    styles.tabButtonActive,
                    { borderBottomColor: theme.accent },
                  ]
                }>
                Info
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => setActiveTab('reviews')} style={styles.tabButton}>
              <ThemedText
                type={activeTab === 'reviews' ? 'smallBold' : 'small'}
                themeColor={activeTab === 'reviews' ? 'text' : 'textSecondary'}
                style={
                  activeTab === 'reviews' && [
                    styles.tabButtonActive,
                    { borderBottomColor: theme.accent },
                  ]
                }>
                Reviews ({reviews.length})
              </ThemedText>
            </Pressable>
          </View>

          {activeTab === 'info' ? (
            <View style={styles.infoTab}>
              {bodyText.length > 0 && (
                <ThemedText type="default" themeColor="text">
                  {bodyText}
                </ThemedText>
              )}

              {hasOpeningInfo && (
                <View style={styles.detailRow}>
                  <Feather name="clock" size={16} color={theme.textSecondary} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {[market.opening_days, market.opening_times].filter(Boolean).join(', ')}
                  </ThemedText>
                </View>
              )}

              <View style={styles.detailRow}>
                <Feather name="map-pin" size={16} color={theme.textSecondary} />
                <ThemedText type="small" themeColor="textSecondary">
                  {market.entry_free ? 'Free' : 'Paid'} entry · — away
                </ThemedText>
              </View>

              {market.dogs_allowed !== null && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="dog" size={16} color={theme.textSecondary} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {market.dogs_allowed ? 'Dogs allowed' : 'No dogs allowed'}
                  </ThemedText>
                </View>
              )}

              {hasLinks && (
                <View style={styles.linkRow}>
                  {market.website_url && (
                    <Pressable style={styles.linkItem}>
                      <Feather name="globe" size={16} color={theme.accent} />
                      <ThemedText type="small" themeColor="accent">
                        Website
                      </ThemedText>
                    </Pressable>
                  )}
                  {market.instagram_url && (
                    <Pressable style={styles.linkItem}>
                      <Feather name="instagram" size={16} color={theme.accent} />
                      <ThemedText type="small" themeColor="accent">
                        Instagram
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              )}

              {isClaimed ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Claim submitted! Check your email to set up your organiser profile and start
                  managing this market.
                </ThemedText>
              ) : isClaimFormOpen ? (
                <View style={styles.claimForm}>
                  <ThemedTextInput
                    value={claimName}
                    onChangeText={setClaimName}
                    placeholder="Your name"
                  />
                  <ThemedTextInput
                    value={claimEmail}
                    onChangeText={setClaimEmail}
                    placeholder="Your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <ThemedTextInput
                    multiline
                    numberOfLines={3}
                    value={claimNotes}
                    onChangeText={setClaimNotes}
                    placeholder="How are you connected to this market?"
                  />

                  <Pressable
                    style={styles.anonymousRow}
                    onPress={() => setClaimConfirmed((current) => !current)}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: claimConfirmed ? theme.accent : theme.backgroundSelected,
                          backgroundColor: claimConfirmed
                            ? theme.accent
                            : theme.backgroundElement,
                        },
                      ]}>
                      {claimConfirmed && (
                        <Feather name="check" size={12} color={theme.background} />
                      )}
                    </View>
                    <ThemedText type="default" themeColor="text">
                      I confirm this information is accurate
                    </ThemedText>
                  </Pressable>

                  <Pressable onPress={handleSubmitClaim} disabled={!canSubmitClaim}>
                    <ThemedView
                      type="accent"
                      style={[styles.postReviewButton, !canSubmitClaim && styles.disabledButton]}>
                      <ThemedText
                        type="default"
                        themeColor="background"
                        style={styles.actionButtonText}>
                        Submit claim
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => setIsClaimFormOpen(true)}>
                  <ThemedText type="small" themeColor="accent">
                    Are you the organiser? Claim this market
                  </ThemedText>
                </Pressable>
              )}

              <Pressable style={styles.reportRow}>
                <Feather name="flag" size={14} color={theme.textSecondary} />
                <ThemedText type="small" themeColor="textSecondary">
                  Report incorrect info
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.reviewsTab}>
              <View style={styles.reviewForm}>
                <View style={styles.starPickerRow}>
                  {STARS.map((star) => (
                    <Pressable key={star} onPress={() => setDraftRating(star)} hitSlop={Spacing.one}>
                      <MaterialCommunityIcons
                        name={star <= draftRating ? 'star' : 'star-outline'}
                        size={26}
                        color={star <= draftRating ? theme.accent : theme.textSecondary}
                      />
                    </Pressable>
                  ))}
                </View>

                <ThemedTextInput
                  multiline
                  numberOfLines={3}
                  value={draftText}
                  onChangeText={setDraftText}
                  placeholder="What was it like? Any tips for other visitors?"
                />

                <View style={styles.anonymousGroup}>
                  <Pressable
                    style={styles.anonymousRow}
                    onPress={() => setDraftIsAnonymous((current) => !current)}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: draftIsAnonymous ? theme.accent : theme.backgroundSelected,
                          backgroundColor: draftIsAnonymous ? theme.accent : theme.backgroundElement,
                        },
                      ]}>
                      {draftIsAnonymous && (
                        <Feather name="check" size={12} color={theme.background} />
                      )}
                    </View>
                    <ThemedText type="default" themeColor="text">
                      Post anonymously
                    </ThemedText>
                  </Pressable>
                  <ThemedText type="small" themeColor="textSecondary">
                    Your name won&apos;t be shown publicly, but this still counts toward your
                    contributor points.
                  </ThemedText>
                </View>

                <Pressable onPress={handlePostReview} disabled={draftRating === 0}>
                  <ThemedView
                    type="accent"
                    style={[styles.postReviewButton, draftRating === 0 && styles.disabledButton]}>
                    <ThemedText
                      type="default"
                      themeColor="background"
                      style={styles.actionButtonText}>
                      Post review
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              </View>

              {reviews.length === 0 ? (
                <ThemedText type="default" themeColor="textSecondary">
                  No reviews yet — be the first to share your experience.
                </ThemedText>
              ) : (
                <View style={styles.reviewList}>
                  {reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <ThemedText type="smallBold" themeColor="text">
                          {review.author}
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
                      {review.text.length > 0 && (
                        <ThemedText type="small" themeColor="textSecondary">
                          {review.text}
                        </ThemedText>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Toast message={toastMessage} bottom={insets.bottom + Spacing.three} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
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
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  photoRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  photoBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 34,
  },
  titleActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.three,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  confirmedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButtonWrapper: {
    flex: 1,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
  },
  actionButtonText: {
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    paddingBottom: Spacing.two,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
  },
  infoTab: {
    gap: Spacing.three,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  linkRow: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  claimForm: {
    gap: Spacing.three,
  },
  reviewsTab: {
    gap: Spacing.four,
  },
  reviewForm: {
    gap: Spacing.three,
  },
  starPickerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  anonymousGroup: {
    gap: Spacing.one,
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Spacing.one,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postReviewButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  disabledButton: {
    opacity: 0.5,
  },
  reviewList: {
    gap: Spacing.three,
  },
  reviewCard: {
    gap: Spacing.one,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: Spacing.half,
  },
});
