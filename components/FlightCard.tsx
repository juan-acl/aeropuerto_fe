import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { C } from '@/constants/theme';

type EstadoVuelo = 'PROGRAMADO'|'EN_VUELO'|'ATERRIZADO'|'CANCELADO'|'DEMORADO'|'DESVIADO'|'REPROGRAMADO';

const STATUS: Record<EstadoVuelo, { color: string; bg: string; label: string; dot: string }> = {
  PROGRAMADO:  { color: C.electric, bg: C.infoBg,    label: 'A tiempo',    dot: '#2B7FFF' },
  EN_VUELO:    { color: C.success,  bg: C.successBg,  label: 'En vuelo',    dot: '#10B981' },
  ATERRIZADO:  { color: C.gray,     bg: C.grayBg,     label: 'Aterrizado',  dot: '#94A3B8' },
  CANCELADO:   { color: C.danger,   bg: C.dangerBg,   label: 'Cancelado',   dot: '#EF4444' },
  DEMORADO:    { color: C.warning,  bg: C.warningBg,  label: 'Demorado',    dot: '#F59E0B' },
  DESVIADO:    { color: C.orange,   bg: C.orangeBg,   label: 'Desviado',    dot: '#F97316' },
  REPROGRAMADO:{ color: C.purple,   bg: C.purpleBg,   label: 'Reprogr.',    dot: '#A855F7' },
};

interface FlightCardProps {
  retraso_min?: number;  // from real-time polling
  vuelo: any;
  onPress?: () => void;
  modoPublico?: boolean;
}

export function FlightCard({ vuelo, onPress, modoPublico = false, retraso_min }: FlightCardProps) {
  const dep = vuelo.hora_salida_programada?.split('T')[1]?.slice(0,5) ?? '--:--';
  const arr = vuelo.hora_llegada_programada?.split('T')[1]?.slice(0,5) ?? '--:--';
  const cfg = STATUS[vuelo.estado_vuelo as EstadoVuelo] ?? STATUS.PROGRAMADO;
  const pct = vuelo.plazas_ocupadas && vuelo.capacidad_total
    ? Math.round((vuelo.plazas_ocupadas / vuelo.capacidad_total) * 100) : null;

  return (
    <TouchableOpacity
      style={[s.card, onPress && s.cardPressable]}
      onPress={onPress} activeOpacity={onPress ? 0.82 : 1}
    >
      {/* Accent line */}
      <View style={[s.accentLine, { backgroundColor: cfg.dot }]} />

      <View style={s.inner}>
        {/* Top row */}
        <View style={s.topRow}>
          <View>
            <Text style={s.flightNum}>{vuelo.numero_vuelo ?? `FL-${vuelo.id_vuelo}`}</Text>
            {!modoPublico && vuelo.matricula_avion && (
              <Text style={s.matricula}>{vuelo.matricula_avion}</Text>
            )}
          </View>
          <View style={[s.statusPill, { backgroundColor: cfg.bg, borderColor: cfg.color + '40' }]}>
            <View style={[s.statusDot, { backgroundColor: cfg.dot }]} />
            <Text style={[s.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Route */}
        <View style={s.routeRow}>
          <View style={s.endpoint}>
            <Text style={s.airportCode}>{vuelo.aeropuerto_origen ?? 'GUA'}</Text>
            <Text style={s.time}>{dep}</Text>
          </View>

          <View style={s.routeMid}>
            <View style={[s.routeDot, { backgroundColor: cfg.dot }]} />
            <View style={[s.routeTrack, { backgroundColor: cfg.dot + '30' }]}>
              <View style={[s.routeProgress, { backgroundColor: cfg.dot,
                width: vuelo.estado_vuelo === 'EN_VUELO' ? '55%'
                  : vuelo.estado_vuelo === 'ATERRIZADO' ? '100%' : '0%' }]} />
            </View>
            <Text style={[s.planeTxt, { color: cfg.dot }]}></Text>
            <View style={[s.routeTrack, { backgroundColor: cfg.dot + '30' }]}>
              <View style={[s.routeProgress, { backgroundColor: cfg.dot,
                width: vuelo.estado_vuelo === 'ATERRIZADO' ? '100%' : '0%' }]} />
            </View>
            <View style={[s.routeDot, { backgroundColor: cfg.dot }]} />
          </View>

          <View style={[s.endpoint, { alignItems: 'flex-end' }]}>
            <Text style={s.airportCode}>{vuelo.aeropuerto_destino ?? '—'}</Text>
            <Text style={s.time}>{arr}</Text>
          </View>
        </View>

        {/* RT delay badge */}
      {retraso_min != null && retraso_min > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.warningBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginHorizontal: 16, borderWidth: 1, borderColor: C.warningL }}>
          <Text style={{ fontSize: 11 }}></Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.warning }}>
            Retraso de {retraso_min} min
          </Text>
        </View>
      )}
      {/* Footer */}
        <View style={s.footer}>
          <View style={s.footerChip}>
            <Text style={s.footerIcon}>🚪</Text>
            <Text style={s.footerVal}>Puerta {vuelo.id_puerta_salida ?? '—'}</Text>
          </View>
          {!modoPublico && pct != null && (
            <View style={s.footerChip}>
              <Text style={s.footerIcon}>💺</Text>
              <Text style={[s.footerVal, {
                color: pct > 90 ? C.danger : pct > 70 ? C.warning : C.success
              }]}>{pct}% lleno</Text>
            </View>
          )}
          {onPress && (
            <View style={[s.detailBtn, { backgroundColor: cfg.bg, borderColor: cfg.color + '30' }]}>
              <Text style={[s.detailBtnT, { color: cfg.color }]}>Ver detalles →</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.bgCard, borderRadius: 20, marginBottom: 12,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
  },
  cardPressable: { borderColor: C.borderE },
  accentLine: { height: 3, width: '100%' },
  inner: { padding: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  flightNum: { fontSize: 22, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  matricula: { fontSize: 11, color: C.muted, marginTop: 2, fontWeight: '500' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  endpoint: { width: 64 },
  airportCode: { fontSize: 20, fontWeight: '900', color: C.text, letterSpacing: -0.3 },
  time: { fontSize: 13, color: C.muted, marginTop: 3, fontWeight: '600' },
  routeMid: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  routeDot: { width: 7, height: 7, borderRadius: 4 },
  routeTrack: { flex: 1, height: 2, borderRadius: 1, overflow: 'hidden' },
  routeProgress: { height: '100%', borderRadius: 1 },
  planeTxt: { fontSize: 16, marginHorizontal: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.borderL, flexWrap: 'wrap' },
  footerChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.bgElevated, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 },
  footerIcon: { fontSize: 12 },
  footerVal: { fontSize: 11, fontWeight: '600', color: C.textSub },
  detailBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99, borderWidth: 1 },
  detailBtnT: { fontSize: 11, fontWeight: '700' },
});
