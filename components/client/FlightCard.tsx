/**
 * FlightCard — Premium visual con datos reales del backend
 * ✅ Badge IATA, barra de duración, urgencia de plazas, animación al seleccionar
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { C } from '@/constants/theme';
import type { FlightResult, ClaseVuelo } from '@/hooks/useFlights';

const IATA_COLORS: Record<string, string> = {
  'AA': '#FF6B35', 'UA': '#002244', 'DL': '#E01933', 'B6': '#003876',
  'WN': '#304CB2', 'AM': '#083F88', 'AV': '#E61932', 'LA': '#C8102E',
  'CM': '#00A3E0', 'IB': '#DD2626', 'BA': '#075AAA', 'LH': '#05164D',
};
function iataColor(cod: string): string {
  return IATA_COLORS[cod] ?? C.electric;
}

function formatDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function PlazasBar({ plazas }: { plazas: number }) {
  const pct  = Math.min(100, Math.max(0, plazas));
  const color = plazas <= 5 ? C.danger : plazas <= 15 ? C.warning : C.success;
  const label = plazas === 0 ? 'Sin plazas' : plazas <= 3 ? `¡Solo ${plazas} left!` :
                plazas <= 10 ? `${plazas} plazas` : undefined;
  return (
    <View style={pb.wrap}>
      <View style={pb.track}>
        <View style={[pb.fill, { width: `${Math.min(100, pct * 3)}%` as any, backgroundColor: color }]} />
      </View>
      {label && <Text style={[pb.label, { color }]}>{label}</Text>}
    </View>
  );
}
const pb = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  track: { flex: 1, height: 3, backgroundColor: C.bgElevated, borderRadius: 2, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 2 },
  label: { fontSize: 9, fontWeight: '800' },
});

interface Props {
  vuelo:    FlightResult;
  clase:    ClaseVuelo;
  onSelect: (v: FlightResult) => void;
  selected?: boolean;
}

export function FlightCard({ vuelo: v, clase, onSelect, selected = false }: Props) {
  const precio   = clase === 'ECONOMICA' ? v.precio_eco : v.precio_eje;
  const acColor  = iataColor(v.cod_iata);

  // Scale animation on select
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.97, duration: 80,  useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.00, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [selected]);

  const borderColor = selected ? C.electric : C.border;
  const bgColor     = selected ? C.infoBg   : C.bgCard;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onSelect(v)}
        activeOpacity={0.9}
        style={[s.card, { borderColor, backgroundColor: bgColor }]}
      >
        {/* Airline badge row */}
        <View style={s.headerRow}>
          <View style={[s.iataBadge, { backgroundColor: acColor + '20', borderColor: acColor + '50' }]}>
            <Text style={[s.iataText, { color: acColor }]}>{v.cod_iata}</Text>
          </View>
          <Text style={s.airline}>{v.aerolinea}</Text>
          {v.estado !== 'PROGRAMADO' && (
            <View style={s.statusBadge}>
              <Text style={s.statusT}>{v.estado}</Text>
            </View>
          )}
          {selected && (
            <View style={s.selectedBadge}>
              <Text style={s.selectedT}>✓ Seleccionado</Text>
            </View>
          )}
        </View>

        {/* Main route row */}
        <View style={s.routeRow}>
          {/* Origin */}
          <View style={s.endpoint}>
            <Text style={s.time}>{v.salida}</Text>
            <Text style={s.code}>{v.origen}</Text>
          </View>

          {/* Duration center */}
          <View style={s.durationWrap}>
            <Text style={s.durationT}>{formatDur(v.duracion_min)}</Text>
            <View style={s.line}>
              <View style={s.lineDot} />
              <Text style={s.planeIcon}>✈</Text>
              <View style={s.lineDot} />
            </View>
            <Text style={v.escalas === 0 ? s.escalasD : s.escalasC}>
              {v.escalas === 0 ? 'Directo' : `${v.escalas} escala${v.escalas > 1 ? 's' : ''}`}
            </Text>
          </View>

          {/* Destination */}
          <View style={[s.endpoint, { alignItems: 'flex-end' }]}>
            <Text style={s.time}>{v.llegada}</Text>
            <Text style={s.code}>{v.destino}</Text>
          </View>
        </View>

        {/* Seats bar */}
        <PlazasBar plazas={v.plazas} />

        {/* Footer: flight number + price */}
        <View style={s.footer}>
          <Text style={s.flightNum}>{v.numero_vuelo}</Text>
          <View style={s.priceWrap}>
            {clase !== 'ECONOMICA' && (
              <Text style={s.claseTag}>
                {clase === 'EJECUTIVA' ? 'Ejecutiva' : 'Primera'}
              </Text>
            )}
            <Text style={s.price}>USD {precio.toLocaleString()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card:         { borderRadius: 20, padding: 16, marginBottom: 10, borderWidth: 1.5, gap: 10 },
  headerRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iataBadge:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  iataText:     { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  airline:      { flex: 1, fontSize: 12, color: C.muted, fontWeight: '600' },
  statusBadge:  { backgroundColor: C.warningBg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  statusT:      { fontSize: 9, color: C.warning, fontWeight: '800' },
  selectedBadge:{ backgroundColor: C.successBg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  selectedT:    { fontSize: 9, color: C.success, fontWeight: '800' },
  routeRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  endpoint:     { alignItems: 'flex-start', minWidth: 60 },
  time:         { fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  code:         { fontSize: 13, fontWeight: '700', color: C.muted, marginTop: 2 },
  durationWrap: { flex: 1, alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  durationT:    { fontSize: 11, color: C.muted, fontWeight: '600' },
  line:         { flexDirection: 'row', alignItems: 'center', gap: 4, width: '100%' },
  lineDot:      { flex: 1, height: 1, backgroundColor: C.border },
  planeIcon:    { fontSize: 14, color: C.electric },
  escalasD:   { fontSize: 10, color: C.success, fontWeight: '500' as const },
  escalasC:   { fontSize: 10, color: C.warning, fontWeight: '500' as const },
  footer:     { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingTop: 4, borderTopWidth: 1, borderTopColor: C.borderL },
  flightNum:  { fontSize: 12, color: C.muted, fontWeight: '600' as const },
  priceWrap:  { alignItems: 'flex-end' as const, gap: 2 },
  claseTag:   { fontSize: 9, color: C.amber, fontWeight: '800' as const, textTransform: 'uppercase' as const },
  price:      { fontSize: 22, fontWeight: '900' as const, color: C.electric },
});
