import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSendMagicLink = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: typeof window === 'undefined' ? undefined : { emailRedirectTo: window.location.origin },
    });

    setIsSending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setSentTo(trimmedEmail);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <View
        style={[
          styles.contentContainer,
          { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + Spacing.four },
        ]}>
        <View style={styles.content}>
          <ThemedText type="default" style={styles.brand}>
            markets2day
          </ThemedText>

          {sentTo ? (
            <View style={styles.field}>
              <ThemedText type="smallBold">Check your email for a login link</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                We sent a magic link to {sentTo}. Open it on this device to sign in.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.field}>
              <ThemedText type="smallBold">Email</ThemedText>
              <ThemedTextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                onSubmitEditing={handleSendMagicLink}
              />
              {error && (
                <ThemedText type="small" themeColor="accent">
                  {error}
                </ThemedText>
              )}
              <Pressable onPress={handleSendMagicLink} disabled={isSending}>
                <ThemedView type="accent" style={[styles.button, isSending && styles.buttonDisabled]}>
                  <ThemedText type="default" themeColor="background" style={styles.buttonText}>
                    {isSending ? 'Sending…' : 'Send magic link'}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  brand: {
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 30,
  },
  field: {
    gap: Spacing.two,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: '700',
  },
});
