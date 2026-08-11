import type { ColorSchemeName } from 'react-native';

// Dark mode isn't built yet — force light until the light-mode UI is approved.
export function useColorScheme(): ColorSchemeName {
  return 'light';
}
