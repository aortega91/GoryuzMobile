import React, { useState } from 'react';
import {
  Insets,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

const HIGHLIGHT_COLOR = '#828599';

interface TouchableProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  hitSlop?: Insets;
  borderRadius?: number;
  children: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
}

function Touchable({
  onPress,
  style,
  disabled,
  hitSlop,
  borderRadius = 4,
  children,
  testID,
  accessibilityLabel,
}: TouchableProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <TouchableWithoutFeedback
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={style}>
        {children}
        <View
          pointerEvents="none"
          style={[
            styles.overlay,
            { borderRadius },
            pressed && styles.overlayPressed,
          ]}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  overlayPressed: {
    backgroundColor: HIGHLIGHT_COLOR,
    opacity: 0.20,
  },
});

export default Touchable;
