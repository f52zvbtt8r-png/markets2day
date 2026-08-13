import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StampBadge } from '@/components/stamp-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MARKET = {
  name: 'De Haagse Markt',
  categories: ['Farmers', 'Food'],
  setting: 'Outdoor',
  description:
    'One of the largest street markets in Europe. Fresh produce, spices, textiles and street food stalls stretching for blocks.',
  recurring: 'Every Tue, Wed, Fri & Sat',
  time: '9:00–17:00',
  entry: 'Free',
  dogsAllowed: true,
  organiser: null,
  status: 'pending' as const,
  confirmations: 4,
  lastConfirmed: 'today',
  rating: 4.6,
  distance: '1.2 km',
};

const PHOTO_COLORS: ThemeColor[] = ['accent', 'info', 'tertiary'];

type Tab = 'info' | 'reviews';

export default function MarketDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('info');

  return (
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
            {MARKET.name}
          </ThemedText>
          <View style={styles.titleActions}>
            <Pressable hitSlop={Spacing.two}>
              <Feather name="share-2" size={20} color={theme.textSecondary} />
            </Pressable>
            <Pressable hitSlop={Spacing.two}>
              <Feather name="heart" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.chipRow}>
          {[...MARKET.categories, MARKET.setting].map((label) => (
            <ThemedView key={label} type="backgroundElement" style={styles.chip}>
              <ThemedText type="small" themeColor="text">
                {label}
              </ThemedText>
            </ThemedView>
          ))}
        </View>

        <StampBadge status={MARKET.status} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Feather name="star" size={16} color={theme.accent} />
            <ThemedText type="small" themeColor="text">
              {MARKET.rating.toFixed(1)}
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <ThemedText type="small" themeColor="textSecondary">
              👥 {MARKET.confirmations} confirmations
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <View style={[styles.confirmedDot, { backgroundColor: theme.info }]} />
            <ThemedText type="small" themeColor="textSecondary">
              confirmed {MARKET.lastConfirmed}
            </ThemedText>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButtonWrapper}>
            <ThemedView type="accent" style={styles.primaryButton}>
              <ThemedText type="default" themeColor="background" style={styles.actionButtonText}>
                Navigate
              </ThemedText>
            </ThemedView>
          </Pressable>
          <Pressable style={styles.actionButtonWrapper}>
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
                activeTab === 'info' && [styles.tabButtonActive, { borderBottomColor: theme.accent }]
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
              Reviews (0)
            </ThemedText>
          </Pressable>
        </View>

        {activeTab === 'info' ? (
          <View style={styles.infoTab}>
            <ThemedText type="default" themeColor="text">
              {MARKET.description}
            </ThemedText>

            <View style={styles.detailRow}>
              <Feather name="clock" size={16} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {MARKET.recurring}, {MARKET.time}
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <Feather name="map-pin" size={16} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {MARKET.entry} entry · {MARKET.distance} away
              </ThemedText>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="dog" size={16} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {MARKET.dogsAllowed ? 'Dogs allowed' : 'No dogs allowed'}
              </ThemedText>
            </View>

            <View style={styles.linkRow}>
              <Pressable style={styles.linkItem}>
                <Feather name="globe" size={16} color={theme.accent} />
                <ThemedText type="small" themeColor="accent">
                  Website
                </ThemedText>
              </Pressable>
              <Pressable style={styles.linkItem}>
                <Feather name="instagram" size={16} color={theme.accent} />
                <ThemedText type="small" themeColor="accent">
                  Instagram
                </ThemedText>
              </Pressable>
            </View>

            <Pressable>
              <ThemedText type="small" themeColor="accent">
                Are you the organiser? Claim this market
              </ThemedText>
            </Pressable>

            <Pressable style={styles.reportRow}>
              <Feather name="flag" size={14} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                Report incorrect info
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <ThemedText type="default" themeColor="textSecondary">
            No reviews yet — be the first to share your experience.
          </ThemedText>
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
});
