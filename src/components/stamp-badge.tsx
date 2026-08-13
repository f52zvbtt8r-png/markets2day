import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StampStatus = 'pending' | 'community_verified' | 'organiser_verified';

const STATUS_CONFIG: Record<
  StampStatus,
  { label: string; color: ThemeColor; borderStyle: 'dotted' | 'solid' }
> = {
  pending: { label: 'Pending', color: 'textSecondary', borderStyle: 'dotted' },
  community_verified: { label: 'Community verified', color: 'info', borderStyle: 'solid' },
  organiser_verified: { label: 'Organiser verified', color: 'accent', borderStyle: 'solid' },
};

export function StampBadge({ status }: { status: StampStatus }) {
  const theme = useTheme();
  const config = STATUS_CONFIG[status];
  const color = theme[config.color];

  return (
    <View style={[styles.badge, { borderColor: color, borderStyle: config.borderStyle }]}>
      <ThemedText type="code" style={[styles.label, { color }]}>
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderRadius: Spacing.five,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    transform: [{ rotate: '-2deg' }],
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
