import React from 'react';
import { ImageBackground, Pressable, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { useTheme } from '@/app/ThemeProvider';
import Badge from '@/components/ui/Badge';
import AppText from '@/components/ui/AppText';

const DiscoveryCard = ({
  listing,
  index,
  isTop,
  onPress,
  onSwipeLeft,
  onSwipeRight
}) => {
  const theme = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth - theme.spacing.xxl * 2, 388);
  const cardHeight = Math.min(
    Math.max(cardWidth * 1.22, 404),
    windowHeight * 0.58
  );
  const swipeThreshold = cardWidth * 0.24;

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const rotate = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      rotate.value = interpolate(translateX.value, [-240, 0, 240], [-10, 0, 10]);
    })
    .onEnd(() => {
      if (translateX.value > swipeThreshold) {
        translateX.value = withTiming(windowWidth * 1.2, { duration: 180 }, () => {
          runOnJS(onSwipeRight)();
        });
        return;
      }

      if (translateX.value < -swipeThreshold) {
        translateX.value = withTiming(-windowWidth * 1.2, { duration: 180 }, () => {
          runOnJS(onSwipeLeft)();
        });
        return;
      }

      translateX.value = withSpring(0);
      rotate.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        translateY: withSpring(index * 10, {
          damping: 18,
          stiffness: 180
        })
      },
      { rotate: `${rotate.value}deg` },
      {
        scale: withSpring(isTop ? 1 : 0.96 - index * 0.02, {
          damping: 18,
          stiffness: 180
        })
      }
    ],
    opacity: withTiming(index > 2 ? 0 : 1, { duration: 180 })
  }));

  const rightLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [16, 100], [0, 1], 'clamp')
  }));

  const leftLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-100, -16], [1, 0], 'clamp')
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: cardWidth,
            height: cardHeight,
            zIndex: 10 - index,
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
                WISHLIST
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
                SKIP
              </AppText>
            </Animated.View>

            <View
              style={{
                padding: theme.spacing.xxl,
                gap: theme.spacing.md,
                backgroundColor: 'rgba(0,0,0,0.52)'
              }}
            >
              <View style={{ flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                {listing.platform.map((platform) => (
                  <Badge key={`${listing.id}-${platform}`} label={platform} tone="primary" />
                ))}
              </View>

              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="hero" color={theme.colors.white}>
                  {listing.title}
                </AppText>
              </View>

              <AppText variant="body" color="rgba(255,255,255,0.82)" numberOfLines={2}>
                {listing.description}
              </AppText>
            </View>
          </ImageBackground>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

export default DiscoveryCard;
