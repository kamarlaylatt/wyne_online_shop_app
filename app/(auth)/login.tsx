import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { authClient } from '@/services/authClient';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await authClient.signIn.email({ email, password });
      console.log('[login response]', JSON.stringify(result));
      if (result.error) {
        console.error('[login failed]', JSON.stringify(result.error));
        setError(result.error.message ?? 'Login failed');
        setLoading(false);
      } else {
        // Navigate explicitly — useSession() may not update reactively until
        // the server-side expo() plugin is installed.
        console.log('[login] success, navigating to tabs');
        router.replace('/(app)/(drawer)/(tabs)');
      }
    } catch (err) {
      console.error('[login error]', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Wyne Admin
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Sign in to manage your shop
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((v) => !v)}
            />
          }
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading || !email || !password}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    gap: 4,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 4,
  },
});
