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

const RegisterScreen = () => {
  const navigation = useNavigation();
  const register = useAuthStore((state) => state.register);
  const theme = useTheme();
  const [form, setForm] = useState({
    username: 'marcus_trades',
    email: 'marcus@swaparena.app',
    password: 'demo-pass'
  });
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleRegister = async () => {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert('Missing details', 'Complete every field before creating your account.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll keyboard contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
      <View style={{ gap: theme.spacing.xxl }}>
        <View style={{ gap: theme.spacing.sm, paddingTop: theme.spacing.xl }}>
          <AppText variant="page">Create account</AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Set up your seller profile, wishlist, and premium-ready marketplace account.
          </AppText>
        </View>

        <View style={{ gap: theme.spacing.lg }}>
          <Input
            label="Username"
            value={form.username}
            onChangeText={(value) => updateField('username', value)}
            placeholder="marcus_trades"
            left={<Ionicons name="at-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Email"
            value={form.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="name@example.com"
            keyboardType="email-address"
            left={<Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />}
          />
          <Input
            label="Password"
            value={form.password}
            onChangeText={(value) => updateField('password', value)}
            placeholder="Choose a password"
            secureTextEntry
            left={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />}
          />
        </View>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <Button variant="primary" size="lg" loading={loading} onPress={handleRegister}>
          Create Account
        </Button>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <AppText variant="body" color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
            Already registered?{' '}
            <AppText variant="bodyBold" color={theme.colors.primary}>
              Sign in
            </AppText>
          </AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

export default RegisterScreen;
