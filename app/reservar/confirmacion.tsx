/**
 * Confirmación de reserva exitosa
 */
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';

export default function Confirmacion() {
  const router = useRouter();
  const { codigo, vuelo, asiento } = useLocalSearchParams<{ codigo: string; vuelo: string; asiento: string }>();

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {/* Success icon */}
        <View style={s.successCircle}><Text style={{ fontSize: 52 }}>✅</Text></View>
        <Text style={s.title}>¡Reserva Confirmada!</Text>
        <Text style={s.sub}>Tu vuelo está reservado. Guarda este código de reserva.</Text>

        {/* Booking code */}
        <View style={s.codeBox}>
          <Text style={s.codeLabel}>CÓDIGO DE RESERVA</Text>
          <Text style={s.code}>{codigo ?? 'RES-DEMO'}</Text>
          <Text style={s.codeHint}>Presenta este código en el check-in</Text>
        </View>

        {/* Summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Detalles del vuelo</Text>
          {[['Vuelo ID', vuelo ?? '—'],['Asiento', asiento ?? '—'],['Estado', 'CONFIRMADA'],['Pago', 'Procesado ✅']].map(([l,v]) => (
            <View key={l} style={s.row}><Text style={s.rowL}>{l}</Text><Text style={s.rowV}>{v}</Text></View>
          ))}
        </View>

        {/* Next steps */}
        <View style={s.nextCard}>
          <Text style={s.nextTitle}>Próximos pasos</Text>
          {[
            { n: '1', t: 'Check-in en línea', d: 'Disponible 24h antes del vuelo' },
            { n: '2', t: 'Llega con anticipación', d: 'Mínimo 2 horas antes del vuelo' },
            { n: '3', t: 'Presenta tu código', d: 'En el mostrador o kiosco de check-in' },
          ].map(step => (
            <View key={step.n} style={s.step}>
              <View style={s.stepNum}><Text style={s.stepNumT}>{step.n}</Text></View>
              <View>
                <Text style={s.stepT}>{step.t}</Text>
                <Text style={s.stepD}>{step.d}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.checkinBtn}
          onPress={() => router.push({ pathname: '/reservar/checkin', params: { codigo } })}>
          <Text style={s.checkinBtnT}>Hacer Check-in ahora ✈️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.homeBtn} onPress={() => router.replace('/(tabs)/')}>
          <Text style={s.homeBtnT}>Ir al inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  body: { padding: 20, alignItems: 'center', paddingBottom: 20 },
  successCircle: { width: 110, height: 110, borderRadius: 30, backgroundColor: C.successBg, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 16, elevation: 4, shadowColor: C.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
  title: { fontSize: 26, fontWeight: '900', color: C.text, textAlign: 'center' },
  sub: { fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 20, marginBottom: 20 },
  codeBox: { backgroundColor: C.navy, borderRadius: 20, paddingVertical: 24, paddingHorizontal: 32, alignItems: 'center', width: '100%', marginBottom: 16 },
  codeLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  code: { fontSize: 32, fontWeight: '900', color: C.white, letterSpacing: 4 },
  codeHint: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 8 },
  summaryCard: { backgroundColor:C.bgCard, borderRadius: 16, padding: 16, width: '100%', marginBottom: 14 },
  summaryTitle: { fontSize: 13, fontWeight: '800', color: C.navy, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.borderL },
  rowL: { fontSize: 13, color: C.muted },
  rowV: { fontSize: 13, fontWeight: '700', color: C.textSub },
  nextCard: { backgroundColor:C.bgCard, borderRadius: 16, padding: 16, width: '100%' },
  nextTitle: { fontSize: 13, fontWeight: '800', color: C.navy, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 14 },
  stepNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumT: { fontSize: 14, fontWeight: '800', color: C.white },
  stepT: { fontSize: 14, fontWeight: '700', color: C.text },
  stepD: { fontSize: 12, color: C.muted, marginTop: 2 },
  footer: { backgroundColor:C.bgCard, padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: C.borderL },
  checkinBtn: { backgroundColor: C.navy, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  checkinBtnT: { color: C.white, fontWeight: '800', fontSize: 15 },
  homeBtn: { backgroundColor: C.bg, paddingVertical: 13, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  homeBtnT: { color: C.muted, fontWeight: '700', fontSize: 15 },
});
