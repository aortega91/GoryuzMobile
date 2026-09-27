import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useScheduleTheme from '@hooks/useScheduleTheme';
import { SunIcon, CloudIcon, CloudRainIcon, MapPinIcon } from '@assets/icons';

interface Props {
  type: string;
  max: number;
  min: number;
  /** Icon only — the week grid prints the temperatures on their own line */
  minimal?: boolean;
  /** Icon size (default 12 minimal / 16 full, like zena's WeatherIcon) */
  size?: number;
}

export function WeatherIcon({ type, size = 12 }: { type: string; size?: number }) {
  const theme = useScheduleTheme();
  const s = theme.schedule;

  if (type === 'rainy' || type === 'snowy') {
    return <CloudRainIcon size={size} color={s.weatherRainy} />;
  }
  if (type === 'cloudy') {
    return <CloudIcon size={size} color={s.weatherCloudy} />;
  }
  return <SunIcon size={size} color={s.weatherSunny} />;
}

/** "max°/min°" under the icon, with a pin when it's the destination's weather. */
export function WeatherTemps({ max, min, away }: { max: number; min: number; away?: boolean }) {
  const theme = useScheduleTheme();
  const s = theme.schedule;
  return (
    <View style={styles.tempsRow}>
      {away && <MapPinIcon size={8} color={s.weatherTemp} />}
      <Text style={[styles.tempsSmall, { color: s.weatherTemp }]}>
        {max}°/{min}°
      </Text>
    </View>
  );
}

function WeatherBadge({ type, max, min, minimal = false, size }: Props) {
  const theme = useScheduleTheme();
  const s = theme.schedule;

  if (minimal) {
    return <WeatherIcon type={type} size={size ?? 12} />;
  }

  return (
    <View style={styles.row}>
      <WeatherIcon type={type} size={size ?? 16} />
      <Text style={[styles.max, { color: s.weatherTemp }]}>{max}°</Text>
      <Text style={[styles.slash, { color: s.emptyIcon }]}>/</Text>
      <Text style={[styles.min, { color: s.weatherTemp }]}>{min}°</Text>
    </View>
  );
}

// zena WeatherIcon: full = 16px icon + `text-[10px]` max / min; the week grid
// line is `text-[8px] leading-none mt-0.5` with a `gap-0.5` 8px pin.
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  max: { fontSize: 10, lineHeight: 15, fontWeight: '500' },
  slash: { fontSize: 10, lineHeight: 15 },
  min: { fontSize: 10, lineHeight: 15 },
  tempsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  tempsSmall: { fontSize: 8, lineHeight: 9, fontWeight: '500' },
});

export default WeatherBadge;
