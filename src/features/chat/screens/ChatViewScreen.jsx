import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder
} from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/app/ThemeProvider';
import ChatBubble from '@/components/cards/ChatBubble';
import EmptyState from '@/components/layout/EmptyState';
import Avatar from '@/components/ui/Avatar';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SheetModal from '@/components/ui/SheetModal';
import useChatStore from '@/store/chatStore';
import useListingStore from '@/store/listingStore';

const sendActions = [
  { key: 'text', icon: 'send' },
  { key: 'photo', icon: 'image-outline' },
  { key: 'video', icon: 'videocam-outline' },
  { key: 'voice', icon: 'mic-outline' }
];

const recordingAudioMode = {
  allowsRecording: true,
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
  interruptionMode: 'mixWithOthers'
};

const playbackAudioMode = {
  allowsRecording: false,
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
  interruptionMode: 'mixWithOthers'
};

const formatDuration = (durationMs) => {
  const totalSeconds = Math.max(1, Math.round((durationMs || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');

  return `${minutes}:${seconds}`;
};

const ChatViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const messageInputRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const scrollAnimatedRef = useRef(false);
  const recorderRef = useRef(null);
  const activeRecorderRef = useRef(null);
  const recordingTickerRef = useRef(null);
  const recordingStartedAtRef = useRef(null);
  const recordingDurationRef = useRef(0);
  const recordingUrlRef = useRef(null);
  const recorderReleasedRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const isMountedRef = useRef(true);
  const sendMenuAnimation = useRef(new Animated.Value(0)).current;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    if (status?.url) {
      recordingUrlRef.current = status.url;
    }
  });
  const conversations = useChatStore((state) => state.conversations);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  const sendOffer = useChatStore((state) => state.sendOffer);
  const acceptOffer = useChatStore((state) => state.acceptOffer);
  const declineOffer = useChatStore((state) => state.declineOffer);
  const listings = useListingStore((state) => state.listings);
  const [message, setMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerModalState, setOfferModalState] = useState(null);
  const [mediaActionType, setMediaActionType] = useState(null);
  const [sendMenuOpen, setSendMenuOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [recordingUi, setRecordingUi] = useState({
    isRecording: false,
    durationMs: 0
  });
  const conversationId = route.params?.conversationId;

  const conversation = useMemo(
    () => conversations.find((item) => item.id === conversationId),
    [conversations, conversationId]
  );
  const listing = conversation
    ? listings.find((item) => item.id === conversation.listingId)
    : null;
  const activeOfferListing = offerModalState?.listingId
    ? listings.find((item) => item.id === offerModalState.listingId)
    : null;
  const composerGap = theme.spacing.md;

  const queueScrollToBottom = (animated = false) => {
    InteractionManager.runAfterInteractions(() => {
      flatListRef.current?.scrollToEnd({ animated });
    });
  };

  const clearRecordingTicker = () => {
    if (recordingTickerRef.current) {
      clearInterval(recordingTickerRef.current);
      recordingTickerRef.current = null;
    }
  };

  const resetRecordingSession = () => {
    activeRecorderRef.current = null;
    recordingStartedAtRef.current = null;
    recordingDurationRef.current = 0;
    recordingUrlRef.current = null;

    if (isMountedRef.current) {
      setRecordingUi({
        isRecording: false,
        durationMs: 0
      });
    }
  };

  const finalizeVoiceRecording = async ({ shouldSend }) => {
    const activeRecorder = activeRecorderRef.current;

    if (!activeRecorder || stopRequestedRef.current) {
      return;
    }

    stopRequestedRef.current = true;
    clearRecordingTicker();

    const finalDurationMs =
      recordingDurationRef.current ||
      (recordingStartedAtRef.current ? Date.now() - recordingStartedAtRef.current : 0);

    if (isMountedRef.current) {
      setVoiceBusy(true);
    }

    try {
      await activeRecorder.stop();

      const mediaUri = recordingUrlRef.current || activeRecorder.uri || null;

      if (shouldSend) {
        if (mediaUri) {
          scrollAnimatedRef.current = true;
          sendMediaMessage(conversation.id, 'voice', {
            mediaUri,
            mediaDurationMs: finalDurationMs
          });
        } else if (isMountedRef.current) {
          setFeedbackState({
            title: 'Recording unavailable',
            description: 'The voice message could not be attached. Please try again.'
          });
        }
      }
    } catch (error) {
      if (shouldSend && isMountedRef.current) {
        setFeedbackState({
          title: 'Recording unavailable',
          description: 'The voice message could not be saved. Please try again.'
        });
      }
    } finally {
      resetRecordingSession();
      stopRequestedRef.current = false;
      await setAudioModeAsync(playbackAudioMode).catch(() => undefined);

      if (isMountedRef.current) {
        setVoiceBusy(false);
      }
    }
  };

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    setActiveConversation(conversationId);

    return () => {
      setActiveConversation(null);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!isFocused || !conversationId) {
      return;
    }

    queueScrollToBottom(false);
  }, [conversationId, isFocused]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      setSendMenuOpen(false);
      queueScrollToBottom(false);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      queueScrollToBottom(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    Animated.spring(sendMenuAnimation, {
      toValue: sendMenuOpen ? 1 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.9
    }).start();
  }, [sendMenuAnimation, sendMenuOpen]);

  useEffect(() => {
    recorderRef.current = recorder;
    recorderReleasedRef.current = false;

    return () => {
      clearRecordingTicker();
      recorderReleasedRef.current = true;
      recorderRef.current = null;
    };
  }, [recorder]);

  useEffect(() => () => {
    isMountedRef.current = false;
    clearRecordingTicker();

    const activeRecorder = activeRecorderRef.current;
    activeRecorderRef.current = null;
    const shouldStopRecorder = Boolean(activeRecorder) && !stopRequestedRef.current;
    stopRequestedRef.current = true;
    recordingStartedAtRef.current = null;
    recordingDurationRef.current = 0;
    recordingUrlRef.current = null;

    if (shouldStopRecorder) {
      activeRecorder.stop().catch(() => undefined);
    }

    setAudioModeAsync(playbackAudioMode).catch(() => undefined);
  }, []);

  if (!conversation) {
    return (
      <ScreenFallback
        title="Conversation unavailable"
        description="This thread may have been removed or blocked."
        actionLabel="Back To Chats"
        onPress={() => navigation.goBack()}
      />
    );
  }

  const closeSendMenu = () => {
    setSendMenuOpen(false);
  };

  const closeOfferModal = () => {
    setOfferModalState(null);
    setOfferAmount('');
  };

  const closeMediaModal = () => {
    setMediaActionType(null);
  };

  const openProfile = () => {
    navigation.navigate('ChatUserProfile', {
      participant: conversation.participant,
      listingId: conversation.listingId
    });
  };

  const handleListContentSizeChange = () => {
    const shouldAnimate = scrollAnimatedRef.current;
    scrollAnimatedRef.current = false;
    queueScrollToBottom(shouldAnimate);
  };

  const ensureCameraPermission = async () => {
    const current = await ImagePicker.getCameraPermissionsAsync();

    if (current.granted) {
      return true;
    }

    const requested = await ImagePicker.requestCameraPermissionsAsync();
    return requested.granted;
  };

  const ensureMediaLibraryPermission = async () => {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (current.granted) {
      return true;
    }

    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return requested.granted;
  };

  const ensureRecordingPermission = async () => {
    const requested = await requestRecordingPermissionsAsync();
    return requested.granted;
  };

  const handleSend = () => {
    if (!message.trim() || recordingUi.isRecording || voiceBusy) {
      return;
    }

    scrollAnimatedRef.current = true;
    setSendMenuOpen(false);
    sendMessage(conversation.id, message.trim());
    setMessage('');
  };

  const handleSendPress = () => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    handleSend();
  };

  const handleSendLongPress = () => {
    if (recordingUi.isRecording || voiceBusy) {
      return;
    }

    longPressTriggeredRef.current = true;
    setSendMenuOpen((current) => !current);
  };

  const openOfferModal = (mode, listingId, initialAmount = '') => {
    const offerListing = listings.find((item) => item.id === listingId);

    if (!offerListing) {
      setFeedbackState({
        title: 'Offer unavailable',
        description: 'This chat does not have a listing attached for an offer yet.'
      });
      return;
    }

    closeSendMenu();
    messageInputRef.current?.blur();
    setOfferAmount(initialAmount);
    setOfferModalState({
      mode,
      listingId: offerListing.id
    });
  };

  const handleOpenOffer = () => {
    openOfferModal('send', listing?.id);
  };

  const handleSendOffer = () => {
    const numeric = Number(offerAmount || 0);

    if (!activeOfferListing || !numeric) {
      return;
    }

    scrollAnimatedRef.current = true;
    sendOffer(conversation.id, activeOfferListing.id, numeric);
    closeOfferModal();
  };

  const handleAcceptOffer = (messageId) => {
    scrollAnimatedRef.current = true;
    acceptOffer(conversation.id, messageId);
  };

  const handleDeclineOffer = (messageId) => {
    scrollAnimatedRef.current = true;
    declineOffer(conversation.id, messageId);
  };

  const handleCounterOffer = (listingId, amount) => {
    openOfferModal('counter', listingId || listing?.id, amount ? `${amount}` : '');
  };

  const handleStartVoiceRecording = async () => {
    if (recordingUi.isRecording || voiceBusy || stopRequestedRef.current) {
      return;
    }

    const currentRecorder = recorderRef.current;

    if (!currentRecorder || recorderReleasedRef.current) {
      return;
    }

    closeSendMenu();
    closeMediaModal();

    const permissionGranted = await ensureRecordingPermission();

    if (!permissionGranted) {
      setFeedbackState({
        title: 'Microphone permission needed',
        description: 'Allow microphone access to record and send voice messages.'
      });
      return;
    }

    try {
      setVoiceBusy(true);
      recordingUrlRef.current = null;
      recordingStartedAtRef.current = Date.now();
      recordingDurationRef.current = 0;
      await setAudioModeAsync(recordingAudioMode);

      if (!isMountedRef.current || recorderReleasedRef.current) {
        return;
      }

      await currentRecorder.prepareToRecordAsync();

      if (!isMountedRef.current || recorderReleasedRef.current) {
        return;
      }

      activeRecorderRef.current = currentRecorder;
      currentRecorder.record();

      if (!isMountedRef.current) {
        return;
      }

      setRecordingUi({
        isRecording: true,
        durationMs: 0
      });

      clearRecordingTicker();
      recordingTickerRef.current = setInterval(() => {
        if (!isMountedRef.current || !activeRecorderRef.current || stopRequestedRef.current) {
          return;
        }

        const durationMs = recordingStartedAtRef.current
          ? Date.now() - recordingStartedAtRef.current
          : 0;

        recordingDurationRef.current = durationMs;
        setRecordingUi((current) =>
          current.isRecording
            ? {
                ...current,
                durationMs
              }
            : current
        );
      }, 250);
    } catch (error) {
      clearRecordingTicker();
      resetRecordingSession();
      if (isMountedRef.current) {
        setFeedbackState({
          title: 'Recording unavailable',
          description: 'Voice recording could not start right now. Please try again.'
        });
      }
    } finally {
      if (isMountedRef.current) {
        setVoiceBusy(false);
      }
    }
  };

  const handleStopVoiceRecording = async () => {
    if (!activeRecorderRef.current || voiceBusy || stopRequestedRef.current) {
      return;
    }

    await finalizeVoiceRecording({ shouldSend: true });
  };

  const handleMediaPickerSelection = async (source) => {
    if (!mediaActionType) {
      return;
    }

    const pickerType = mediaActionType;
    const isVideo = pickerType === 'video';
    closeMediaModal();

    try {
      const hasPermission =
        source === 'camera'
          ? await ensureCameraPermission()
          : await ensureMediaLibraryPermission();

      if (!hasPermission) {
        setFeedbackState({
          title: source === 'camera' ? 'Camera permission needed' : 'Photo access needed',
          description:
            source === 'camera'
              ? `Allow camera access to capture a ${pickerType} for chat.`
              : `Allow library access to choose a ${pickerType} for chat.`
        });
        return;
      }

      if (source === 'camera' && isVideo) {
        const microphoneGranted = await ensureRecordingPermission();

        if (!microphoneGranted) {
          setFeedbackState({
            title: 'Microphone permission needed',
            description: 'Allow microphone access so recorded videos can include audio.'
          });
          return;
        }
      }

      const pickerOptions = isVideo
        ? {
            mediaTypes: ['videos'],
            quality: 1,
            videoMaxDuration: 60
          }
        : {
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 5],
            quality: 1
          };

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      scrollAnimatedRef.current = true;
      sendMediaMessage(conversation.id, pickerType, {
        mediaUri: asset.uri,
        mediaFileName: asset.fileName || null,
        mediaMimeType: asset.mimeType || null,
        mediaDurationMs: asset.duration || null
      });
    } catch (error) {
      setFeedbackState({
        title: 'Media unavailable',
        description: 'That media action could not be completed right now. Please try again.'
      });
    }
  };

  const handleComposerAction = (action) => {
    if (voiceBusy) {
      return;
    }

    closeSendMenu();

    if (action === 'text') {
      if (message.trim()) {
        handleSend();
        return;
      }

      messageInputRef.current?.focus();
      return;
    }

    if (action === 'voice') {
      handleStartVoiceRecording();
      return;
    }

    if (recordingUi.isRecording) {
      return;
    }

    messageInputRef.current?.blur();
    setMediaActionType(action);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.background
        }}
      >
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
        </Button>
        <Pressable
          onPress={openProfile}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            opacity: pressed ? 0.88 : 1
          })}
        >
          <Avatar
            uri={conversation.participant.avatar}
            avatarConfig={conversation.participant.avatarConfig}
            label={conversation.participant.name}
            online={conversation.online}
            premium={conversation.participant.isPremium}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="card">{conversation.participant.name}</AppText>
            <AppText variant="micro" color={theme.colors.textSecondary}>
              {conversation.online ? 'Online now' : conversation.participant.responseTime}
            </AppText>
          </View>
        </Pressable>
        <Button
          variant="secondary"
          size="icon"
          onPress={() => navigation.navigate('ChatDetails', { conversationId: conversation.id })}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textPrimary} />
        </Button>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            style={{ flex: 1 }}
            data={conversation.messages}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              gap: theme.spacing.md
            }}
            onContentSizeChange={handleListContentSizeChange}
            onLayout={() => queueScrollToBottom(false)}
            renderItem={({ item }) => {
              const offerListing = item.offerListingId
                ? listings.find((entry) => entry.id === item.offerListingId)
                : null;
              const isMine = item.senderId === 'user-marcus';

              return (
                <ChatBubble
                  message={item}
                  isMine={isMine}
                  listing={offerListing}
                  onPressOffer={() =>
                    navigation.navigate('ListingDetail', { listingId: offerListing?.id || listing?.id })
                  }
                  onAccept={() => handleAcceptOffer(item.id)}
                  onDecline={() => handleDeclineOffer(item.id)}
                  onCounter={() => handleCounterOffer(item.offerListingId, item.offerAmount)}
                />
              );
            }}
            ListHeaderComponent={
              listing ? (
                <Pressable
                  onPress={() => navigation.navigate('ListingDetail', { listingId: listing.id })}
                  style={({ pressed }) => ({
                    marginBottom: theme.spacing.md,
                    padding: theme.spacing.lg,
                    borderRadius: theme.radius.xl,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    opacity: pressed ? 0.88 : 1
                  })}
                >
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    Linked Listing
                  </AppText>
                  <AppText variant="card" style={{ marginTop: theme.spacing.sm }}>
                    {listing.title}
                  </AppText>
                  <AppText variant="bodyBold" color={theme.colors.primary} style={{ marginTop: 4 }}>
                    ${listing.price}
                  </AppText>
                </Pressable>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState title="No messages yet" description="Start the conversation from this listing thread." />
            }
          />

          {sendMenuOpen ? (
            <Pressable
              onPress={closeSendMenu}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1 }}
            />
          ) : null}

          <View
            style={{
              zIndex: 2,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: composerGap,
              paddingBottom: keyboardVisible ? composerGap : Math.max(insets.bottom, theme.spacing.sm),
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.background
            }}
          >
            {recordingUi.isRecording ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: theme.spacing.md,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                  borderRadius: theme.radius.xl,
                  backgroundColor: theme.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: theme.colors.borderStrong
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.colors.danger
                    }}
                  />
                  <AppText variant="bodyBold">Recording {formatDuration(recordingUi.durationMs)}</AppText>
                </View>
                <Button
                  variant="danger"
                  size="sm"
                  onPress={handleStopVoiceRecording}
                  loading={voiceBusy}
                >
                  Stop
                </Button>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-end' }}>
              <Button
                variant="secondary"
                size="icon"
                onPress={handleOpenOffer}
                disabled={voiceBusy || recordingUi.isRecording}
                style={{ alignSelf: 'stretch' }}
              >
                <Ionicons name="pricetag-outline" size={20} color={theme.colors.textPrimary} />
              </Button>
              <View style={{ flex: 1 }}>
                <Input
                  ref={messageInputRef}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type a message..."
                  style={{ gap: 0 }}
                />
              </View>
              <View
                style={{
                  width: 44,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  position: 'relative'
                }}
              >
                {sendActions.map((action, index) => {
                  const distance = (index + 1) * (44 + theme.spacing.sm);

                  return (
                    <Animated.View
                      key={action.key}
                      pointerEvents={sendMenuOpen ? 'auto' : 'none'}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        opacity: sendMenuAnimation,
                        transform: [
                          {
                            translateY: sendMenuAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -distance]
                            })
                          },
                          {
                            scale: sendMenuAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.9, 1]
                            })
                          }
                        ]
                      }}
                    >
                      <Pressable
                        onPress={() => handleComposerAction(action.key)}
                        style={({ pressed }) => [
                          {
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor:
                              action.key === 'text' ? theme.colors.primary : theme.colors.borderStrong,
                            backgroundColor:
                              action.key === 'text' ? theme.colors.primary : theme.colors.surface,
                            opacity: pressed ? 0.82 : 1
                          },
                          action.key === 'text' ? theme.shadows.primary : theme.shadows.card
                        ]}
                      >
                        <Ionicons
                          name={action.icon}
                          size={18}
                          color={action.key === 'text' ? theme.colors.white : theme.colors.textPrimary}
                        />
                      </Pressable>
                    </Animated.View>
                  );
                })}

                <Pressable
                  onPress={handleSendPress}
                  onLongPress={handleSendLongPress}
                  delayLongPress={260}
                  style={({ pressed }) => [
                    {
                      minHeight: 44,
                      width: 44,
                      borderRadius: theme.radius.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.colors.primary,
                      opacity: pressed ? 0.82 : 1
                    },
                    theme.shadows.primary
                  ]}
                >
                  <Ionicons name="send" size={18} color={theme.colors.white} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <SheetModal
        visible={Boolean(offerModalState)}
        onClose={closeOfferModal}
        title={offerModalState?.mode === 'counter' ? 'Counter Offer' : 'Send Offer'}
        description={
          activeOfferListing
            ? `${offerModalState?.mode === 'counter' ? 'Send a counter price for' : 'Propose a price for'} ${activeOfferListing.title}.`
            : 'Propose an offer amount.'
        }
        footer={(
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Button variant="secondary" style={{ flex: 1 }} onPress={closeOfferModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ flex: 1 }}
              onPress={handleSendOffer}
              disabled={!activeOfferListing || !Number(offerAmount || 0)}
            >
              Send Offer
            </Button>
          </View>
        )}
      >
        <Input
          label="Offer Amount"
          value={offerAmount}
          onChangeText={(value) => setOfferAmount(value.replace(/[^0-9.]/g, ''))}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </SheetModal>

      <SheetModal
        visible={Boolean(mediaActionType)}
        onClose={closeMediaModal}
        title={mediaActionType === 'video' ? 'Send Video' : 'Send Photo'}
        description={
          mediaActionType === 'video'
            ? 'Choose how you want to add a video to this chat.'
            : 'Choose how you want to add a photo to this chat.'
        }
        footer={(
          <View style={{ gap: theme.spacing.md }}>
            <Button variant="primary" onPress={() => handleMediaPickerSelection('camera')}>
              Open Camera
            </Button>
            <Button variant="secondary" onPress={() => handleMediaPickerSelection('gallery')}>
              Choose from Gallery
            </Button>
          </View>
        )}
      />

      <SheetModal
        visible={Boolean(feedbackState)}
        onClose={() => setFeedbackState(null)}
        title={feedbackState?.title}
        description={feedbackState?.description}
        showCloseButton={false}
        footer={(
          <Button variant="primary" onPress={() => setFeedbackState(null)}>
            Close
          </Button>
        )}
      />
    </View>
  );
};

const ScreenFallback = ({ title, description, actionLabel, onPress }) => {
  return (
    <View style={{ flex: 1 }}>
      <EmptyState title={title} description={description} actionLabel={actionLabel} onPress={onPress} />
    </View>
  );
};

export default ChatViewScreen;
