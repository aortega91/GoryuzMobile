import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import useHomeTheme from '@hooks/useHomeTheme';
import GoryuzLogo from '@assets/GoryuzLogo';
import {
  ArchiveIcon,
  CalendarIcon,
  CloseIcon,
  HomeIcon,
  ShirtIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
} from '@assets/icons';
import { RootStackParamList } from '@navigation/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;

// ─── Nav items definition ─────────────────────────────────────────────────────

type DrawerRoute = keyof RootStackParamList;

interface NavItem {
  route: DrawerRoute;
  labelKey: string;
  icon: (color: string) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    route: 'Home',
    labelKey: 'menu.home',
    icon: color => <HomeIcon size={20} color={color} />,
  },
  {
    route: 'Collection',
    labelKey: 'menu.collection',
    icon: color => <ShirtIcon size={20} color={color} />,
  },
  {
    route: 'Styles',
    labelKey: 'menu.styles',
    icon: color => <StarIcon size={20} color={color} />,
  },
  {
    route: 'Schedule',
    labelKey: 'menu.schedule',
    icon: color => <CalendarIcon size={20} color={color} />,
  },
  {
    route: 'Discover',
    labelKey: 'menu.discover',
    icon: color => <SparklesIcon size={20} color={color} />,
  },
  {
    route: 'SecondLife',
    labelKey: 'menu.secondLife',
    icon: color => <ArchiveIcon size={20} color={color} />,
  },
  {
    route: 'Community',
    labelKey: 'menu.community',
    icon: color => <UsersIcon size={20} color={color} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface DrawerMenuProps {
  isOpen: boolean;
  activeRoute: DrawerRoute;
  onClose: () => void;
  onNavigate: (route: DrawerRoute) => void;
}

function DrawerMenu({ isOpen, activeRoute, onClose, onNavigate }: DrawerMenuProps) {
  const theme = useHomeTheme();
  const dt = theme.home;
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(() => setIsVisible(false));
    }
  }, [isOpen, translateX, backdropOpacity]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          { backgroundColor: dt.drawerBackground, transform: [{ translateX }] },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: dt.drawerBorder }]}>
          <View style={styles.logoRow}>
            <GoryuzLogo size={40} color="#FFFFFF" />
            <Text style={styles.logoText}>GORYUZ</Text>
          </View>
          <Text style={[styles.tagline, { color: dt.drawerSubtitle }]}>
            ZENITH OF STYLE
          </Text>

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <CloseIcon size={20} color={dt.drawerCloseIcon} />
          </TouchableOpacity>
        </View>

        {/* Nav items */}
        <View style={styles.nav}>
          {NAV_ITEMS.map(item => {
            const isActive = activeRoute === item.route;
            const iconColor = isActive ? dt.drawerActiveIcon : dt.drawerIcon;
            const textColor = isActive ? dt.drawerActiveText : dt.drawerText;

            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => onNavigate(item.route)}
                activeOpacity={0.75}
                style={[
                  styles.navItem,
                  isActive && {
                    backgroundColor: dt.drawerActiveBackground,
                  },
                ]}
              >
                {item.icon(iconColor)}
                <Text style={[styles.navLabel, { color: textColor }]}>
                  {t(item.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 4,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    padding: 4,
  },
  nav: {
    paddingTop: 16,
    paddingHorizontal: 12,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 14,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default DrawerMenu;
