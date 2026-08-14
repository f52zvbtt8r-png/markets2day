import { useLocalSearchParams } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function ManageMarketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ScreenPlaceholder title={`Manage market: ${id}`} />;
}
