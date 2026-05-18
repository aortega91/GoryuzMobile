import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useTheme from '@hooks/useTheme';
import toast, { ToastPayload, ToastType } from '@utilities/toast';

const DEFAULT_DURATION = 2500;

function Toast() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');

  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 80, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [translateY, opacity]);

  const present = useCallback((payload: ToastPayload) => {
    if (dismissTimer.current) { clearTimeout(dismissTimer.current); }

    setMessage(payload.message);
    setType(payload.type ?? 'info');
    setVisible(true);

    translateY.setValue(80);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    dismissTimer.current = setTimeout(dismiss, payload.duration ?? DEFAULT_DURATION);
  }, [translateY, opacity, dismiss]);

  useEffect(() => {
    const unsubscribe = toast.subscribe(present);
    return () => {
      unsubscribe();
      if (dismissTimer.current) { clearTimeout(dismissTimer.current); }
    };
  }, [present]);

  if (!visible) { return null; }

  const bg =
    type === 'success' ? theme.common.toastSuccessBackground :
    type === 'error' ? theme.common.toastErrorBackground :
    theme.common.toastInfoBackground;

  const textColor =
    type === 'success' ? theme.common.toastSuccessText :
    type === 'error' ? theme.common.toastErrorText :
    theme.common.toastInfoText;

  return (
    <TouchableWithoutFeedback onPress={dismiss}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: bg, bottom: insets.bottom + 16 },
          { transform: [{ translateY }], opacity },
        ]}
      >
        <Text style={[styles.message, { color: textColor }]} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Toast;
