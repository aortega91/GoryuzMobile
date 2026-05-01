import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@utilities/store';

function useAppColorScheme(): 'light' | 'dark' {
  const preference = useSelector((state: RootState) => state.appTheme.preference);
  const deviceScheme = useColorScheme();

  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return deviceScheme === 'dark' ? 'dark' : 'light';
}

export default useAppColorScheme;
