/**
 * BackendStatus — Shows connection status for all 3 backends
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '@/constants/theme';
import type { BackendStatus as BS } from '@/hooks/useBackend';

interface SingleProps { label: string; status: BS; }
function Dot({ label, status }: SingleProps) {
  const color = status === 'online' ? C.success : status === 'checking' ? C.warning : C.danger;
  const icon  = status === 'online' ? '' : status === 'checking' ? '' : '🔴';
  return (
    <View style={s.dot}>
      <Text style={{ fontSize: 8 }}>{icon}</Text>
      <Text style={[s.dotL, { color }]}>{label}</Text>
    </View>
  );
}

interface Props {
  isOnline?:    boolean | null;
  health?:      { develop: BS; gerson: BS; modulos: BS };
  compact?:     boolean;
  onPress?:     () => void;
}

export function BackendStatus({ isOnline, health, compact = false, onPress }: Props) {
  if (compact || !health) {
    const color = isOnline === null ? C.warning : isOnline ? C.success : C.danger;
    const icon  = isOnline === null ? '' : isOnline ? '' : '🔴';
    const label = isOnline === null ? 'Conectando...' : isOnline ? 'Oracle Online' : 'Sin conexión';
    return (
      <TouchableOpacity style={[s.pill, { borderColor: color + '40', backgroundColor: color + '14' }]}
        onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
        <Text style={{ fontSize: 10 }}>{icon}</Text>
        <Text style={[s.label, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={s.multi} onPress={onPress} disabled={!onPress} activeOpacity={0.8}>
      <Dot label="Core"   status={health.develop} />
      <Dot label="Client" status={health.gerson}  />
      <Dot label="Ops"    status={health.modulos} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  pill:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
  label: { fontSize: 10, fontWeight: '700' },
  multi: { flexDirection: 'row', gap: 8, backgroundColor: C.bgElevated, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  dot:   { alignItems: 'center', gap: 1 },
  dotL:  { fontSize: 8, fontWeight: '700' },
});
