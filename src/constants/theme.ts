/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2E2015',
    background: '#F3ECDD',
    backgroundElement: '#FBF8F2',
    backgroundSelected: '#E4D9C3',
    textSecondary: '#8A7862',
    accent: '#7A2A34',
    accentDark: '#4A1017',
    info: '#9DBBDA',
    infoDark: '#3E5F82',
    tertiary: '#C9AE82',
    tertiaryDark: '#8F7350',
    neutral: '#4A3423',
  },
  dark: {
    text: '#FBF8F2',
    background: '#2E2015',
    backgroundElement: '#3D2F22',
    backgroundSelected: '#4A3423',
    textSecondary: '#A89882',
    accent: '#D4727E',
    accentDark: '#7A2A34',
    info: '#B8D4ED',
    infoDark: '#9DBBDA',
    tertiary: '#D4C4A8',
    tertiaryDark: '#C9AE82',
    neutral: '#C9AE82',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
    display: 'BebasNeue-Regular',
    body: 'WorkSans-Regular',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    display: 'BebasNeue-Regular',
    body: 'WorkSans-Regular',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
    display: 'BebasNeue-Regular',
    body: 'WorkSans-Regular',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
