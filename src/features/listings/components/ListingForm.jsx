import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { platformFilters } from '@/utils/mockData';

const conditions = ['Like New', 'Very Good', 'Good', 'Fair'];
const listingTypes = ['sale', 'trade'];

const ListingForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isPremium,
  loading
}) => {
  const theme = useTheme();
  const [form, setForm] = useState(
    initialValues || {
      title: '',
      description: '',
      price: '',
      platform: ['PS5'],
      condition: 'Like New',
      listingType: 'sale',
      isBoosted: false
    }
  );

  const canSubmit = useMemo(
    () =>
      form.title.trim() &&
      form.description.trim() &&
      String(form.price).trim() &&
      form.platform.length > 0,
    [form]
  );

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const togglePlatform = (platform) => {
    setForm((current) => ({
      ...current,
      platform: current.platform.includes(platform)
        ? current.platform.filter((item) => item !== platform)
        : [...current.platform, platform]
    }));
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.huge * 2,
        gap: theme.spacing.lg
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: theme.spacing.lg }}>
        <Input
          label="Title"
          value={form.title}
          onChangeText={(value) => setField('title', value)}
          placeholder="What are you listing?"
        />
        <Input
          label="Description"
          value={form.description}
          onChangeText={(value) => setField('description', value)}
          placeholder="Describe condition, included items, and what you want in return."
          multiline
        />
        <Input
          label="Price"
          value={String(form.price)}
          onChangeText={(value) => setField('price', value.replace(/[^0-9.]/g, ''))}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="caption" color={theme.colors.textMuted}>
          Platform
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {platformFilters.map((platform) => {
            const active = form.platform.includes(platform);
            return (
              <Button
                key={platform}
                variant={active ? 'primary' : 'pill'}
                size="sm"
                onPress={() => togglePlatform(platform)}
                style={{ borderRadius: theme.radius.pill }}
              >
                {platform}
              </Button>
            );
          })}
        </View>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="caption" color={theme.colors.textMuted}>
          Listing Type
        </AppText>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {listingTypes.map((type) => (
            <Button
              key={type}
              variant={form.listingType === type ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => setField('listingType', type)}
              style={{ flex: 1 }}
            >
              {type === 'trade' ? 'Swap' : 'Sale'}
            </Button>
          ))}
        </View>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="caption" color={theme.colors.textMuted}>
          Condition
        </AppText>
        <View style={{ gap: theme.spacing.sm }}>
          {conditions.map((condition) => {
            const active = form.condition === condition;
            return (
              <Pressable
                key={condition}
                onPress={() => setField('condition', condition)}
                style={({ pressed }) => ({
                  padding: theme.spacing.lg,
                  borderRadius: theme.radius.xl,
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.borderStrong,
                  opacity: pressed ? 0.86 : 1
                })}
              >
                <AppText variant="bodyBold" color={active ? theme.colors.primary : theme.colors.textPrimary}>
                  {condition}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={{
          padding: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: form.isBoosted ? theme.colors.warning : theme.colors.borderStrong,
          backgroundColor: theme.colors.surface,
          gap: theme.spacing.md
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.lg }}>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <AppText variant="card">Boost listing</AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Premium users unlock boosted placement and analytics.
            </AppText>
          </View>
          <Button
            variant={form.isBoosted ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => {
              if (!isPremium) {
                return;
              }
              setField('isBoosted', !form.isBoosted);
            }}
          >
            {form.isBoosted ? 'Enabled' : isPremium ? 'Enable' : 'Locked'}
          </Button>
        </View>
        {!isPremium ? (
          <AppText variant="micro" color={theme.colors.warning}>
            Upgrade to premium to enable boost placement.
          </AppText>
        ) : null}
      </View>

      <Button
        variant="primary"
        size="lg"
        onPress={() => onSubmit({ ...form, price: Number(form.price || 0) })}
        disabled={!canSubmit}
        loading={loading}
      >
        {submitLabel}
      </Button>
    </ScrollView>
  );
};

export default ListingForm;
