import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
const MAPPING = {
  'house.fill': 'home', 'paperplane.fill': 'send', 'chevron.right': 'chevron-right',
  'chevron.left.forwardslash.chevron.right': 'code', 'airplane': 'flight',
  'person.2.fill': 'people', 'dollarsign.circle.fill': 'attach-money',
  'shippingbox.fill': 'inventory', 'wrench.and.screwdriver.fill': 'build',
  'star.fill': 'star', 'shield.fill': 'security', 'gear': 'settings',
  'chart.bar.fill': 'bar-chart', 'bell.fill': 'notifications',
  'doc.fill': 'description', 'car.fill': 'directions-car',
  'flame.fill': 'local-fire-department', 'leaf.fill': 'eco',
  'lock.fill': 'lock', 'megaphone.fill': 'campaign',
} as IconMapping;
export function IconSymbol({ name, size = 24, color, style }: {
  name: keyof typeof MAPPING; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
