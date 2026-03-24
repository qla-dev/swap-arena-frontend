import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import useAuthStore from '@/store/authStore';

const LoginScreen = () => {
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login);
  const theme = useTheme();
  const [email, setEmail] = useState('marcus@swaparena.app');
  const [password, setPassword] = useState('demo-pass');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Enter both email and password to continue.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll keyboard contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
      <View style={{ gap: theme.spacing.xxl }}>
        <View style={{ gap: theme.spacing.sm, paddingTop: theme.spacing.xl }}>
          <AppText variant="logo">SwapArena</AppText>
          <AppText variant="page">Welcome back</AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Sign in to manage listings, discovery swipes, chats, and premium features.
          </AppText>
        </View>

        <View style={{ gap: theme.spacing.lg }}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            left={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />}
          />
        </View>

        <View
          style={{
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}
        >
          <AppText variant="caption" color={theme.colors.textMuted}>
            Demo Account
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.sm }}>
            The form is prefilled so the full mobile flow can be tested immediately.
          </AppText>
        </View>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <Button variant="primary" size="lg" loading={loading} onPress={handleLogin}>
          Sign In
        </Button>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <AppText variant="body" color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
            No account yet?{' '}
            <AppText variant="bodyBold" color={theme.colors.primary}>
              Create one
            </AppText>
          </AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

export default LoginScreen;
