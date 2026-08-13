import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { CATEGORIES } from '@/constants/categories';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DogsAllowed = 'yes' | 'no' | null;

export default function AddMarketScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [marketName, setMarketName] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => new Set());
  const [openingDays, setOpeningDays] = useState('');
  const [openingTimes, setOpeningTimes] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [dogsAllowed, setDogsAllowed] = useState<DogsAllowed>(null);

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
          <Pressable>
            <ThemedView
              type="backgroundElement"
              style={[styles.locationPicker, { borderColor: theme.backgroundSelected }]}>
              <Feather name="map-pin" size={16} color={theme.textSecondary} />
              <ThemedText type="default" themeColor="textSecondary">
                Tap to drop a pin on the map
              </ThemedText>
            </ThemedView>
          </Pressable>
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
                  onPress={() => setDogsAllowed((current) => (current === option ? null : option))}>
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

        <Pressable>
          <ThemedView type="accent" style={styles.submitButton}>
            <ThemedText type="default" themeColor="background" style={styles.submitButtonText}>
              Submit market
            </ThemedText>
          </ThemedView>
        </Pressable>
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
  submitButtonText: {
    fontWeight: '700',
  },
});
