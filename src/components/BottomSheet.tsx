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

  // Modal visibility tracks whether the native Modal layer is shown.
  // We keep it true until the slide-out animation is done.
  const [isVisible, setIsVisible] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);

  const slideY = useRef(new Animated.Value(maxHeight)).current;

  const slideIn = useCallback(() => {
    Animated.spring(slideY, {
      toValue: 0,
      damping: 24,
      mass: 0.9,
      stiffness: 260,
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

  // Slide in as soon as the component mounts
  useEffect(() => {
    slideIn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only respond when draggable and content has been measured
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
      onRequestClose={slideOut}
    >
      {/* Backdrop — stays fixed, does NOT participate in the slide animation */}
      <View style={[styles.root, { backgroundColor: backdropColor }]}>
        <TouchableWithoutFeedback onPress={slideOut}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>

        {/* Sliding sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight,
              backgroundColor,
              transform: [{ translateY: slideY }],
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {/* Draggable handle area */}
          {draggable && (
            <View style={styles.handleArea} {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>
          )}

          {/* Content — constrained to keep it inside the sheet */}
          <View
            style={{
              maxHeight:
                maxHeight -
                insets.bottom -
                (draggable ? HANDLE_AREA_HEIGHT : 0),
            }}
            onLayout={({ nativeEvent: { layout } }) =>
              setContentHeight(
                layout.height + (draggable ? HANDLE_AREA_HEIGHT : 0),
              )
            }
          >
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
