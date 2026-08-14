import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { CATEGORIES } from '@/constants/categories';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';

const MARKET = {
  name: 'De Haagse Markt',
  categories: ['Farmers', 'Food'],
  setting: 'Outdoor' as const,
  description:
    'One of the largest street markets in Europe. Fresh produce, spices, textiles and street food stalls stretching for blocks.',
  openingDays: 'Every Tue, Wed, Fri & Sat',
  openingTimes: '9:00–17:00',
  entry: 'Free' as const,
  price: '',
  dogsAllowed: true,
  website: 'https://dehaagsemarkt.nl',
  instagram: 'https://instagram.com/dehaagsemarkt',
};

const SETTINGS = ['Indoor', 'Outdoor', 'Both'] as const;
const ENTRY_OPTIONS = ['Free', 'Paid'] as const;

export default function ManageMarketScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { toastMessage, showToast } = useToast();

  const [marketName, setMarketName] = useState(MARKET.name);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => new Set(MARKET.categories)
  );
  const [setting, setSetting] = useState<(typeof SETTINGS)[number]>(MARKET.setting);
  const [description, setDescription] = useState(MARKET.description);
  const [openingDays, setOpeningDays] = useState(MARKET.openingDays);
  const [openingTimes, setOpeningTimes] = useState(MARKET.openingTimes);
  const [entry, setEntry] = useState<(typeof ENTRY_OPTIONS)[number]>(MARKET.entry);
  const [price, setPrice] = useState(MARKET.price);
  const [dogsAllowed, setDogsAllowed] = useState<'yes' | 'no'>(MARKET.dogsAllowed ? 'yes' : 'no');
  const [website, setWebsite] = useState(MARKET.website);
  const [instagram, setInstagram] = useState(MARKET.instagram);

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

  const handleSave = () => {
    showToast('Changes saved');
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + Spacing.four },
        ]}>
        <View style={styles.content}>
          <ThemedText type="default" themeColor="textSecondary">
            Manage your market&apos;s details. Changes are visible to visitors once saved.
          </ThemedText>

          <View style={styles.field}>
            <ThemedText type="smallBold">Market name</ThemedText>
            <ThemedTextInput value={marketName} onChangeText={setMarketName} />
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
            <ThemedText type="smallBold">Indoor/outdoor</ThemedText>
            <View style={styles.row}>
              {SETTINGS.map((option) => {
                const isActive = setting === option;
                return (
                  <Pressable key={option} onPress={() => setSetting(option)}>
                    <ThemedView
                      type={isActive ? 'accent' : 'backgroundElement'}
                      style={styles.toggleButton}>
                      <ThemedText type="small" themeColor={isActive ? 'background' : 'text'}>
                        {option}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Description</ThemedText>
            <ThemedTextInput
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Opening dates &amp; times</ThemedText>
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
            <ThemedText type="smallBold">Entry</ThemedText>
            <View style={styles.row}>
              {ENTRY_OPTIONS.map((option) => {
                const isActive = entry === option;
                return (
                  <Pressable key={option} onPress={() => setEntry(option)}>
                    <ThemedView
                      type={isActive ? 'accent' : 'backgroundElement'}
                      style={styles.toggleButton}>
                      <ThemedText type="small" themeColor={isActive ? 'background' : 'text'}>
                        {option}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>
            {entry === 'Paid' && (
              <ThemedTextInput value={price} onChangeText={setPrice} placeholder="e.g. €2" />
            )}
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Dogs allowed</ThemedText>
            <View style={styles.row}>
              {(['yes', 'no'] as const).map((option) => {
                const isActive = dogsAllowed === option;
                return (
                  <Pressable key={option} onPress={() => setDogsAllowed(option)}>
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
            <ThemedText type="smallBold">Website URL</ThemedText>
            <ThemedTextInput
              value={website}
              onChangeText={setWebsite}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Instagram URL</ThemedText>
            <ThemedTextInput
              value={instagram}
              onChangeText={setInstagram}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
            />
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

          <Pressable onPress={handleSave}>
            <ThemedView type="accent" style={styles.saveButton}>
              <ThemedText type="default" themeColor="background" style={styles.saveButtonText}>
                Save changes
              </ThemedText>
            </ThemedView>
          </Pressable>
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
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  saveButtonText: {
    fontWeight: '700',
  },
});
