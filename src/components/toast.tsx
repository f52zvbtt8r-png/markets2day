import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Toast({ message, bottom }: { message: string | null; bottom: number }) {
  const theme = useTheme();

  if (!message) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { bottom }]} pointerEvents="none">
      <View style={[styles.toast, { backgroundColor: theme.text }]}>
        <ThemedText type="small" themeColor="background">
          {message}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  toast: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
  },
});
