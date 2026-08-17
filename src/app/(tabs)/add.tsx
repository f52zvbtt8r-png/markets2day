import Feather from '@expo/vector-icons/Feather';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { CATEGORIES } from '@/constants/categories';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type DogsAllowed = 'yes' | 'no' | null;

export default function AddMarketScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const safeAreaInsets = useSafeAreaInsets();
  const { toastMessage, showToast } = useToast();
  const [marketName, setMarketName] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => new Set());
  const [openingDays, setOpeningDays] = useState('');
  const [openingTimes, setOpeningTimes] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [dogsAllowed, setDogsAllowed] = useState<DogsAllowed>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!user || isSubmitting) {
      return;
    }
    if (!marketName.trim()) {
      showToast('Market name is required');
      return;
    }

    setIsSubmitting(true);

    const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
    if (permissionStatus !== 'granted') {
      showToast('Location permission is needed to add a market');
      setIsSubmitting(false);
      return;
    }

    let position;
    try {
      position = await Location.getCurrentPositionAsync({});
    } catch {
      showToast('Could not determine your location');
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.rpc('create_market_with_location', {
      market_name: marketName.trim(),
      market_categories: Array.from(activeCategories),
      market_opening_days: openingDays.trim() || null,
      market_opening_times: openingTimes.trim() || null,
      market_extra_info: extraInfo.trim() || null,
      market_dogs_allowed: dogsAllowed === 'yes' ? true : dogsAllowed === 'no' ? false : null,
      market_dogs_comment: null,
      market_lat: position.coords.latitude,
      market_lng: position.coords.longitude,
      market_created_by: user.id,
    });

    setIsSubmitting(false);

    if (error) {
      showToast(error.message);
      return;
    }

    showToast('Market submitted as Pending — thanks for contributing!');
    setMarketName('');
    setActiveCategories(new Set());
    setOpeningDays('');
    setOpeningTimes('');
    setExtraInfo('');
    setDogsAllowed(null);

    setTimeout(() => router.replace('/'), 1200);
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
    <View style={styles.screen}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <View style={styles.content}>
          <View style={styles.field}>
            <ThemedText type="smallBold">Market name</ThemedText>
            <ThemedTextInput
              value={marketName}
              onChangeText={setMarketName}
              placeholder="e.g. Grote Markt"
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Categories</ThemedText>
            <View style={styles.categoryWrap}>
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
            </View>
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Location</ThemedText>
            <ThemedView
              type="backgroundElement"
              style={[styles.locationPicker, { borderColor: theme.backgroundSelected }]}>
              <Feather name="map-pin" size={16} color={theme.textSecondary} />
              <ThemedText type="default" themeColor="textSecondary">
                We&apos;ll use your current location when you submit
              </ThemedText>
            </ThemedView>
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Opening dates &amp; times (optional)</ThemedText>
            <View style={styles.row}>
              <ThemedTextInput
                style={styles.rowInput}
                value={openingDays}
                onChangeText={setOpeningDays}
                placeholder="e.g. Every Saturday"
              />
              <ThemedTextInput
                style={styles.rowInput}
                value={openingTimes}
                onChangeText={setOpeningTimes}
                placeholder="e.g. 9:00–14:00"
              />
            </View>
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Extra info (optional)</ThemedText>
            <ThemedTextInput
              multiline
              numberOfLines={4}
              value={extraInfo}
              onChangeText={setExtraInfo}
              placeholder="e.g. small local market with mostly food stalls and live music"
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Dogs allowed (optional)</ThemedText>
            <View style={styles.row}>
              {(['yes', 'no'] as const).map((option) => {
                const isActive = dogsAllowed === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() =>
                      setDogsAllowed((current) => (current === option ? null : option))
                    }>
                    <ThemedView
                      type={isActive ? 'accent' : 'backgroundElement'}
                      style={styles.toggleButton}>
                      <ThemedText type="small" themeColor={isActive ? 'background' : 'text'}>
                        {option === 'yes' ? 'Yes' : 'No'}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Photos</ThemedText>
            <Pressable>
              <ThemedView
                type="backgroundElement"
                style={[styles.photosPicker, { borderColor: theme.backgroundSelected }]}>
                <Feather name="camera" size={20} color={theme.textSecondary} />
                <ThemedText type="small" themeColor="textSecondary">
                  Add photos
                </ThemedText>
              </ThemedView>
            </Pressable>
          </View>

          <Pressable onPress={handleSubmit} disabled={isSubmitting}>
            <ThemedView
              type="accent"
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}>
              <ThemedText type="default" themeColor="background" style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting…' : 'Submit market'}
              </ThemedText>
            </ThemedView>
          </Pressable>
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
  field: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rowInput: {
    flex: 1,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  categoryChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  locationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
  },
  toggleButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
  },
  photosPicker: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    borderRadius: Spacing.three,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontWeight: '700',
  },
});
