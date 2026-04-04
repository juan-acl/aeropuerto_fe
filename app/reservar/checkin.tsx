/**
 * Check-in digital
 */
import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';
import { RESERVAS, VUELOS } from '@/services/mockData';

export default function Checkin() {
  const router = useRouter();
  const { codigo: codigoParam } = useLocalSearchParams<{ codigo?: string }>();
  const [codigo, setCodigo] = useState(codigoParam ?? '');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const buscar = () => {
    if (!codigo.trim()) { Alert.alert('Requerido', 'Ingresa tu código de reserva.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const reserva = RESERVAS.find(r => r.codigo_reserva?.toLowerCase() === codigo.toLowerCase().trim())
        ?? (codigo.startsWith('RES-') ? { codigo_reserva: codigo, id_vuelo: 1, clase_servicio: 'ECONOMICA', numero_asiento: '14A', estado_reserva: 'CONFIRMADA', checkin_realizado: false } : null);
      if (!reserva) { Alert.alert('No encontrado', 'No se encontró ninguna reserva con ese código.'); return; }
      const vuelo = VUELOS.find(v => v.id_vuelo === reserva.id_vuelo) ?? VUELOS[0];
      setResultado({ reserva, vuelo });
    }, 800);
  };

  const confirmarCheckin = () => {
    Alert.alert('Check-in confirmado', `Tu check-in ha sido completado exitosamente.\n\nAsiento: ${resultado?.reserva?.numero_asiento}\nPuerta: ${resultado?.vuelo?.id_puerta_salida ?? 'A1'}`, [
      { text: 'Ver pase de abordaje', onPress: () => setResultado((r: any) => ({ ...r, checkinDone: true })) }
    ]);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backT}>‹</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Check-in Digital</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {!resultado?.checkinDone ? (
          <>
            <View style={s.icon}><Text style={{ fontSize: 52 }}>✅</Text></View>
            <Text style={s.title}>Check-in en línea</Text>
            <Text style={s.sub}>Ingresa tu código de reserva para realizar el check-in hasta 24 horas antes del vuelo.</Text>

            <View style={s.searchCard}>
              <Text style={s.fieldLabel}>CÓDIGO DE RESERVA</Text>
              <View style={s.inputRow}>
                <TextInput style={s.input} value={codigo} onChangeText={setCodigo}
                  placeholder="Ej: RES-123456" placeholderTextColor={C.placeholder}
                  autoCapitalize="characters" returnKeyType="search" onSubmitEditing={buscar} />
                <TouchableOpacity style={[s.searchBtn, loading && { opacity: 0.6 }]} onPress={buscar} disabled={loading}>
                  <Text style={s.searchBtnT}>{loading ? '⏳' : '🔍'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {resultado && (
              <View style={s.resultCard}>
                <View style={s.resultHero}>
                  <Text style={s.resultFlight}>{resultado.vuelo?.numero_vuelo ?? 'Vuelo'}</Text>
                  <Text style={s.resultRoute}>{resultado.vuelo?.aeropuerto_origen} → {resultado.vuelo?.aeropuerto_destino}</Text>
                </View>
                {[['Asiento', resultado.reserva?.numero_asiento ?? '—'],['Clase', resultado.reserva?.clase_servicio ?? '—'],['Vuelo', resultado.vuelo?.numero_vuelo ?? '—'],['Salida', resultado.vuelo?.hora_salida_programada?.split('T')[1]?.slice(0,5) ?? '--:--'],['Estado reserva', resultado.reserva?.estado_reserva ?? '—']].map(([l,v]) => (
                  <View key={l} style={s.row}><Text style={s.rowL}>{l}</Text><Text style={s.rowV}>{v}</Text></View>
                ))}
                <TouchableOpacity style={s.checkinBtn} onPress={confirmarCheckin}>
                  <Text style={s.checkinBtnT}>✅ Confirmar check-in</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          /* Boarding pass */
          <View style={s.pass}>
            <View style={s.passTop}>
              <Text style={s.passTitle}>PASE DE ABORDAJE</Text>
              <Text style={s.passAirline}>✈️ AEROPUERTO LA AURORA</Text>
              <View style={s.passRoute}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={s.passCode}>{resultado?.vuelo?.aeropuerto_origen ?? 'GUA'}</Text>
                  <Text style={s.passCodeL}>Origen</Text>
                </View>
                <Text style={{ fontSize: 28, color: 'rgba(255,255,255,0.4)' }}>→</Text>
                <View style={{ alignItems: 'center' }}>
                  <Text style={s.passCode}>{resultado?.vuelo?.aeropuerto_destino ?? 'MIA'}</Text>
                  <Text style={s.passCodeL}>Destino</Text>
                </View>
              </View>
            </View>
            <View style={s.passDivider} />
            <View style={s.passBottom}>
              {[['Vuelo', resultado?.vuelo?.numero_vuelo ?? '—'],['Asiento', resultado?.reserva?.numero_asiento ?? '—'],['Clase', resultado?.reserva?.clase_servicio ?? '—'],['Puerta', String(resultado?.vuelo?.id_puerta_salida ?? 'A1')],['Hora salida', resultado?.vuelo?.hora_salida_programada?.split('T')[1]?.slice(0,5) ?? '--:--']].map(([l,v]) => (
                <View key={l} style={s.passField}>
                  <Text style={s.passFieldL}>{l.toUpperCase()}</Text>
                  <Text style={s.passFieldV}>{v}</Text>
                </View>
              ))}
            </View>
            {/* QR placeholder */}
            <View style={s.qrBox}>
              <Text style={{ fontSize: 10, color: C.muted, textAlign: 'center', marginBottom: 6 }}>Código QR de abordaje</Text>
              <View style={s.qrPlaceholder}>
                <Text style={{ fontSize: 32 }}>📱</Text>
                <Text style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{codigo}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.homeBtn} onPress={() => router.replace('/(tabs)/')}>
              <Text style={s.homeBtnT}>Finalizar ✓</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navy, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backT: { fontSize: 22, color: C.white, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.white },
  body: { padding: 20, alignItems: 'center', paddingBottom: 30 },
  icon: { width: 90, height: 90, borderRadius: 24, backgroundColor: C.successBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', color: C.text, textAlign: 'center' },
  sub: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: 24, paddingHorizontal: 10 },
  searchCard: { backgroundColor:C.bgCard, borderRadius: 16, padding: 16, width: '100%', marginBottom: 16 },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: C.text, backgroundColor: C.bgElevated },
  searchBtn: { width: 46, height: 46, borderRadius: 10, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  searchBtnT: { fontSize: 18 },
  resultCard: { backgroundColor:C.bgCard, borderRadius: 16, padding: 16, width: '100%' },
  resultHero: { backgroundColor: C.navy, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 14 },
  resultFlight: { fontSize: 24, fontWeight: '900', color: C.white },
  resultRoute: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.borderL },
  rowL: { fontSize: 13, color: C.muted },
  rowV: { fontSize: 13, fontWeight: '700', color: C.textSub },
  checkinBtn: { backgroundColor: C.success, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  checkinBtnT: { color: C.white, fontWeight: '800', fontSize: 15 },
  pass: { backgroundColor:C.bgCard, borderRadius: 20, overflow: 'hidden', width: '100%', elevation: 6, shadowColor: 'rgba(10,22,40,0.2)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 16 },
  passTop: { backgroundColor: C.navy, padding: 24, alignItems: 'center', gap: 8 },
  passTitle: { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, fontWeight: '800' },
  passAirline: { fontSize: 16, fontWeight: '900', color: C.white },
  passRoute: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 8 },
  passCode: { fontSize: 34, fontWeight: '900', color: C.white },
  passCodeL: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  passDivider: { height: 1, backgroundColor: C.borderL, marginHorizontal: 20 },
  passBottom: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  passField: { minWidth: '28%', flex: 1 },
  passFieldL: { fontSize: 9, color: C.muted, fontWeight: '800', letterSpacing: 0.8, marginBottom: 3 },
  passFieldV: { fontSize: 16, fontWeight: '800', color: C.text },
  qrBox: { alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: C.borderL },
  qrPlaceholder: { width: 120, height: 120, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.border, borderStyle: 'dashed' },
  homeBtn: { margin: 16, backgroundColor: C.navy, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  homeBtnT: { color: C.white, fontWeight: '800', fontSize: 15 },
});
