import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useScheduleTheme from '@hooks/useScheduleTheme';
import { SunIcon, CloudIcon, CloudRainIcon } from '@assets/icons';
import { weatherCodeToType } from '../types';

interface Props {
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  minimal?: boolean;
}

function WeatherBadge({ weatherCode, tempMax, tempMin, minimal = false }: Props) {
  const theme = useScheduleTheme();
  const s = theme.schedule;
  const type = weatherCodeToType(weatherCode);

  let color = s.weatherSunny;
  let Icon = SunIcon;
  if (type === 'rainy' || type === 'snowy') {
    color = s.weatherRainy;
    Icon = CloudRainIcon;
  } else if (type === 'cloudy') {
    color = s.weatherCloudy;
    Icon = CloudIcon;
  } else if (type === 'partly-cloudy') {
    color = s.weatherSunny;
    Icon = CloudIcon;
  }

  if (minimal) {
    return <Icon size={12} color={color} />;
  }

  return (
    <View style={styles.row}>
      <Icon size={13} color={color} />
      <Text style={[styles.temp, { color: s.weatherTemp }]}>
        {tempMax}°/{tempMin}°
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  temp: { fontSize: 10, fontWeight: '500' },
});

export default WeatherBadge;
