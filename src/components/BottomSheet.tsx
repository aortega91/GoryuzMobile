/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const HANDLE_AREA_HEIGHT = 32;
// Minimum bottom padding to cover the home-indicator / nav-bar area.
// useSafeAreaInsets can report 0 inside a transparent Modal even on devices
// that have a home indicator, so we enforce a safe floor.
const MIN_BOTTOM_PADDING = 34;

interface BottomSheetProps {
  /** Called after the slide-out animation completes — parent should unmount the sheet */
  onClose: () => void;
  children: React.ReactNode;
  backgroundColor: string;
  backdropColor?: string;
  /** Max height as a fraction of screen height (default 0.90) */
  maxHeightRatio?: number;
  /** Allow drag-to-dismiss via the handle bar (default true) */
  draggable?: boolean;
}

function BottomSheet({
  onClose,
  children,
  backgroundColor,
  backdropColor = 'rgba(0,0,0,0.55)',
  maxHeightRatio = 0.9,
  draggable = true,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const maxHeight = SCREEN_HEIGHT * maxHeightRatio;
  // Use the larger of the reported inset and the safe floor so the sheet
  // background always covers the home-indicator / navigation-bar area.
  const bottomPadding = Math.max(insets.bottom, MIN_BOTTOM_PADDING);

  const [isVisible, setIsVisible] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);

  const slideY = useRef(new Animated.Value(maxHeight)).current;

  const slideIn = useCallback(() => {
    Animated.timing(slideY, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [slideY]);

  const slideOut = useCallback(() => {
    Animated.timing(slideY, {
      toValue: maxHeight,
      useNativeDriver: true,
      duration: 200,
      easing: Easing.in(Easing.quad),
    }).start(() => {
      setIsVisible(false);
      onClose();
    });
  }, [slideY, maxHeight, onClose]);

  useEffect(() => {
    slideIn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => draggable && contentHeight > 0,
        onPanResponderMove: (_e, gesture) => {
          if (!draggable || gesture.dy <= 0) {
            return;
          }
          Animated.timing(slideY, {
            toValue: gesture.dy,
            useNativeDriver: true,
            duration: 0,
          }).start();
        },
        onPanResponderRelease: (_e, gesture) => {
          if (!draggable) {
            return;
          }
          const fastSwipe = gesture.vy > 1.2;
          const crossedThreshold = gesture.dy >= contentHeight * 0.25;
          if (fastSwipe || crossedThreshold) {
            slideOut();
          } else {
            slideIn();
          }
        },
      }),
    [contentHeight, draggable, slideIn, slideOut, slideY],
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={slideOut}
    >
      {/* Full-screen backdrop */}
      <TouchableWithoutFeedback onPress={slideOut}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: backdropColor }]} />
      </TouchableWithoutFeedback>

      {/* Sheet — absolutely anchored to the screen bottom.
          No overflow:hidden here: on iOS it clips paddingBottom which is
          needed to cover the home-indicator area. Border radius is top-only
          so no content clips against the rounded corners. */}
      <Animated.View
        style={[
          styles.sheet,
          {
            maxHeight,
            backgroundColor,
            paddingBottom: bottomPadding,
            transform: [{ translateY: slideY }],
          },
        ]}
      >
        {/* Draggable handle */}
        {draggable && (
          <View style={styles.handleArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
        )}

        {/* Content — capped so it never overflows into the bottom padding */}
        <View
          style={[
            styles.contentWrapper,
            {
              maxHeight:
                maxHeight -
                bottomPadding -
                (draggable ? HANDLE_AREA_HEIGHT : 0),
            },
          ]}
          onLayout={({ nativeEvent: { layout } }) =>
            setContentHeight(
              layout.height +
                (draggable ? HANDLE_AREA_HEIGHT : 0) +
                bottomPadding,
            )
          }
        >
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentWrapper: {
    overflow: 'hidden',
  },
  handleArea: {
    height: HANDLE_AREA_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
});

export default BottomSheet;
