import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';
import { useSesion } from '@/context/session';
import { RESERVAS, VUELOS } from '@/services/mockData';

export default function HistorialScreen() {
  const { usuario, misReservas } = useSesion();
  const router = useRouter();

  const todasReservas = [
    ...misReservas,
    ...RESERVAS.filter(r => r.id_pasajero === (usuario?.id ?? 100)),
  ];

  const ESTADO_CFG: Record<string, { color: string; bg: string }> = {
    CONFIRMADA: { color: C.success, bg: C.successBg },
    PENDIENTE:  { color: C.warning, bg: C.warningBg },
    CANCELADA:  { color: C.danger,  bg: C.dangerBg  },
    CHECK_IN:   { color: C.purple,  bg: C.purpleBg  },
    ABORDADO:   { color: C.teal,    bg: C.tealBg    },
    NO_SHOW:    { color: C.gray,    bg: C.grayBg    },
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backT}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mis Viajes</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={todasReservas}
        keyExtractor={(r, i) => String(r.id_reserva ?? i)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 52, marginBottom: 14 }}>🎫</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.textSub }}>Sin viajes registrados</Text>
            <Text style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Tus reservas aparecerán aquí</Text>
            <TouchableOpacity style={s.reservarBtn} onPress={() => router.push('/reservar' as any)}>
              <Text style={s.reservarBtnT}>Reservar vuelo →</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: r }) => {
          const vuelo = VUELOS.find(v => v.id_vuelo === r.id_vuelo);
          const cfg   = ESTADO_CFG[r.estado_reserva] ?? { color: C.gray, bg: C.grayBg };
          const dep   = vuelo?.hora_salida_programada?.split('T')[1]?.slice(0, 5) ?? '';
          const isCancelled = r.estado_reserva === 'CANCELADA';
          return (
            <View style={[s.card, { borderLeftColor: cfg.color }]}>
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardNum}>{r.numero_vuelo ?? vuelo?.numero_vuelo ?? '—'}</Text>
                  <Text style={s.cardRuta}>
                    {vuelo?.aeropuerto_origen ?? 'GUA'} → {vuelo?.aeropuerto_destino ?? '—'}
                    {dep ? '  ·  ' + dep : ''}
                  </Text>
                </View>
                <View style={[s.estadoChip, { backgroundColor: cfg.bg, borderColor: cfg.color + '40' }]}>
                  <Text style={[s.estadoChipT, { color: cfg.color }]}>{r.estado_reserva}</Text>
                </View>
              </View>
              <View style={s.cardMeta}>
                <Text style={s.cardMetaT}>🎫 {r.codigo_reserva}</Text>
                <Text style={s.cardMetaT}>💺 {r.numero_asiento ?? '—'}</Text>
                <Text style={s.cardMetaT}>💰 USD {r.precio_pagado ?? '—'}</Text>
                <Text style={s.cardMetaT}>📅 {r.fecha_reserva?.split('T')[0] ?? '—'}</Text>
              </View>
              {isCancelled && (
                <TouchableOpacity style={s.reembolsoBtn}
                  onPress={() => router.push(('/cancelacion?idReserva=' + r.id_reserva) as any)}>
                  <Text style={s.reembolsoBtnT}>Ver opciones de reembolso →</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navyL, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  back: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backT: { fontSize: 22, color: C.text, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  reservarBtn: { marginTop: 20, backgroundColor: C.electric, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  reservarBtnT: { color: C.white, fontWeight: '800', fontSize: 14 },
  card: { backgroundColor: C.bgCard, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardNum: { fontSize: 18, fontWeight: '900', color: C.text },
  cardRuta: { fontSize: 12, color: C.muted, marginTop: 2 },
  estadoChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
  estadoChipT: { fontSize: 10, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.borderL },
  cardMetaT: { fontSize: 11, color: C.textSub, fontWeight: '500' },
  reembolsoBtn: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.borderL },
  reembolsoBtnT: { fontSize: 12, fontWeight: '700', color: C.electric },
});
