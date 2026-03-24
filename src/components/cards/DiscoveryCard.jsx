import React from 'react';
import { Dimensions, ImageBackground, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { useTheme } from '@/app/ThemeProvider';
import Badge from '@/components/ui/Badge';
import AppText from '@/components/ui/AppText';
import { formatCurrency } from '@/utils/formatters';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.24;

const DiscoveryCard = ({
  listing,
  index,
  isTop,
  onPress,
  onSwipeLeft,
  onSwipeRight
}) => {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(index * 6);
  const rotate = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      if (!isTop) {
        return;
      }
      translateX.value = ctx.startX + event.translationX;
      rotate.value = interpolate(translateX.value, [-240, 0, 240], [-10, 0, 10]);
    },
    onEnd: () => {
      if (!isTop) {
        return;
      }

      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withTiming(screenWidth * 1.2, { duration: 180 }, () => {
          runOnJS(onSwipeRight)();
          translateX.value = 0;
          rotate.value = 0;
        });
        return;
      }

      if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-screenWidth * 1.2, { duration: 180 }, () => {
          runOnJS(onSwipeLeft)();
          translateX.value = 0;
          rotate.value = 0;
        });
        return;
      }

      translateX.value = withSpring(0);
      rotate.value = withSpring(0);
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: withSpring(translateY.value) },
      { rotate: `${rotate.value}deg` },
      { scale: withSpring(isTop ? 1 : 0.96 - index * 0.03) }
    ],
    opacity: withSpring(index > 2 ? 0 : 1)
  }));

  const rightLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [16, 100], [0, 1], 'clamp')
  }));

  const leftLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-100, -16], [1, 0], 'clamp')
  }));

  return (
    <PanGestureHandler enabled={isTop} onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: screenWidth - 40,
            height: 540,
            borderRadius: theme.radius.xxl,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.colors.borderStrong
          },
          theme.shadows.floating,
          animatedStyle
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onPress}>
          <ImageBackground source={{ uri: listing.imageUrl }} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.28)'
              }}
            />
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: theme.spacing.xxl,
                  top: theme.spacing.xxl,
                  transform: [{ rotate: '-18deg' }],
                  borderWidth: 3,
                  borderColor: theme.colors.success,
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.sm,
                  backgroundColor: 'rgba(0,0,0,0.25)'
                },
                rightLabelStyle
              ]}
            >
              <AppText variant="section" color={theme.colors.success}>
                SWAP
              </AppText>
            </Animated.View>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  right: theme.spacing.xxl,
                  top: theme.spacing.xxl,
                  transform: [{ rotate: '18deg' }],
                  borderWidth: 3,
                  borderColor: theme.colors.danger,
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.sm,
                  backgroundColor: 'rgba(0,0,0,0.25)'
                },
                leftLabelStyle
              ]}
            >
              <AppText variant="section" color={theme.colors.danger}>
                PASS
              </AppText>
            </Animated.View>

            <View
              style={{
                padding: theme.spacing.xxl,
                gap: theme.spacing.lg,
                backgroundColor: 'rgba(0,0,0,0.52)'
              }}
            >
              <View style={{ flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                {listing.platform.map((platform) => (
                  <Badge key={`${listing.id}-${platform}`} label={platform} tone="primary" />
                ))}
              </View>
              <View style={{ gap: theme.spacing.sm }}>
                <AppText variant="hero" color={theme.colors.white}>
                  {listing.title}
                </AppText>
                <AppText variant="body" color="rgba(255,255,255,0.82)" numberOfLines={2}>
                  {listing.description}
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ gap: theme.spacing.xs }}>
                  <AppText variant="bodyBold" color={theme.colors.white}>
                    {formatCurrency(listing.price)}
                  </AppText>
                  <AppText variant="micro" color="rgba(255,255,255,0.72)">
                    {listing.seller.name} - {listing.region}
                  </AppText>
                </View>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Ionicons name="information-circle-outline" size={24} color={theme.colors.white} />
                </View>
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default DiscoveryCard;
