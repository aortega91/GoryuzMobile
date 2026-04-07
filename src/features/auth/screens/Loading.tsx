import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import useTheme from '@hooks/useTheme';
import GoryuzLogo from '@assets/GoryuzLogo';

function Loading() {
  const theme = useTheme();

  // Pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Rotation animation for the partial arc in the logo
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse: scale 1 → 1.08 → 1, looping
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    // Slow continuous rotation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    pulse.start();
    rotate.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, [pulseAnim, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.auth.background }]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.auth.background}
      />
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [
              { scale: pulseAnim },
              { rotate: rotation },
            ],
          },
        ]}
      >
        <GoryuzLogo size={96} color={theme.auth.logoColor} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loading;
