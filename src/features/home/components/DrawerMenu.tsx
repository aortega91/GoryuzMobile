import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
import { teardownPush } from '@utilities/push';

import Touchable from '@components/Touchable';
import useHomeTheme from '@hooks/useHomeTheme';
import GoryuzLogo from '@assets/GoryuzLogo';
import {
  ArchiveIcon,
  CalendarIcon,
  HomeIcon,
  LifeBuoyIcon,
  ShirtIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
} from '@assets/icons';
import { ActiveModule } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;

// ─── Nav items definition ─────────────────────────────────────────────────────

interface NavItem {
  module: ActiveModule;
  labelKey: string;
  icon: (color: string) => React.ReactNode;
  /** Hidden items stay defined (and routable) but are not shown in the drawer */
  hidden?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    module: 'home',
    labelKey: 'menu.lookbook',
    icon: color => <HomeIcon size={20} color={color} />,
    hidden: true,
  },
  {
    module: 'closet',
    labelKey: 'menu.closet',
    icon: color => <ShirtIcon size={20} color={color} />,
  },
  {
    module: 'styles',
    labelKey: 'menu.styles',
    icon: color => <StarIcon size={20} color={color} />,
  },
  {
    module: 'schedule',
    labelKey: 'menu.schedule',
    icon: color => <CalendarIcon size={20} color={color} />,
  },
  {
    module: 'discover',
    labelKey: 'menu.discover',
    icon: color => <SparklesIcon size={20} color={color} />,
    hidden: true,
  },
  {
    module: 'second_life',
    labelKey: 'menu.secondLife',
    icon: color => <ArchiveIcon size={20} color={color} />,
  },
  {
    module: 'community',
    labelKey: 'menu.community',
    icon: color => <UsersIcon size={20} color={color} />,
  },
  {
    module: 'support',
    labelKey: 'menu.support',
    icon: color => <LifeBuoyIcon size={20} color={color} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export interface DrawerMenuHandle {
  open: () => void;
  close: () => void;
}

interface DrawerMenuProps {
  isOpen: boolean;
  activeModule: ActiveModule;
  onClose: () => void;
  onNavigate: (module: ActiveModule) => void;
  onLogout?: () => void;
}

const DrawerMenu = forwardRef<DrawerMenuHandle, DrawerMenuProps>(
  ({ isOpen, activeModule, onClose, onNavigate, onLogout }, ref) => {
  const theme = useHomeTheme();
  const dt = theme.home;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const animateOpen = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, backdropOpacity]);

  const animateClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 150,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, backdropOpacity]);

  useImperativeHandle(ref, () => ({ open: animateOpen, close: animateClose }));

  useEffect(() => {
    if (isOpen) animateOpen();
    else animateClose();
  }, [isOpen, animateOpen, animateClose]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => { animateClose(); onClose(); }} activeOpacity={1} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          { backgroundColor: dt.drawerBackground, transform: [{ translateX }] },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: dt.drawerBorder, paddingTop: insets.top + 24 }]}>
          <View style={styles.logoRow}>
            <GoryuzLogo size={40} color="#FFFFFF" />
            <Text style={styles.logoText}>GORYUZ</Text>
          </View>
          <Text style={[styles.tagline, { color: dt.drawerSubtitle }]}>
            ZENITH OF STYLE
          </Text>
        </View>

        {/* Nav items */}
        <View style={styles.nav}>
          {NAV_ITEMS.filter(item => !item.hidden).map(item => {
            const isActive = activeModule === item.module;
            return (
              <Touchable
                key={item.module}
                onPress={() => { animateClose(); onNavigate(item.module); }}
                borderRadius={10}
                style={[
                  styles.navItem,
                  isActive && { backgroundColor: dt.drawerActiveBackground },
                ]}
              >
                {item.icon(isActive ? dt.drawerActiveText : dt.drawerIcon)}
                <Text style={[
                  styles.navLabel,
                  { color: isActive ? dt.drawerActiveText : dt.drawerText },
                  isActive && styles.navLabelActive,
                ]}>
                  {t(item.labelKey)}
                </Text>
              </Touchable>
            );
          })}
        </View>

        {/* Logout button — pinned to bottom */}
        <View style={[styles.logoutSection, { borderTopColor: dt.drawerBorder, paddingBottom: insets.bottom + 12 }]}>
          <Touchable
            style={styles.logoutButton}
            borderRadius={10}
            onPress={async () => {
              animateClose();
              onClose();
              await teardownPush();
              await auth().signOut();
              onLogout?.();
            }}
          >
            <Text style={styles.logoutText}>{t('home.signOut')}</Text>
          </Touchable>
        </View>
      </Animated.View>
    </View>
  );
});

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
    flexDirection: 'column',
  },
  header: {
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
  nav: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
    gap: 2,
  },
  logoutSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logoutButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
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
  navLabelActive: {
    fontWeight: '700',
  },
});

export default DrawerMenu;
