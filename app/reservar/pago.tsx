/**
 * Paso 4: Pago y confirmación
 */
import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';
import { useReservas } from '@/hooks/useReservas';
import { useVueloDetalle } from '@/hooks/useVuelos';
import { fmt } from '@/utils/format';

const METODOS = [
  { key: 'TARJETA', label: 'Tarjeta de crédito/débito', icon: '💳' },
  { key: 'TRANSFERENCIA', label: 'Transferencia bancaria', icon: '🏦' },
  { key: 'EFECTIVO', label: 'Efectivo en agencia', icon: '💵' },
];

export default function Pago() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; clase: string; precio: string; asiento: string; pasajero: string }>();
  const { vuelo } = useVueloDetalle(Number(params.id));
  const { confirmar, loading } = useReservas();
  const pasajero = params.pasajero ? JSON.parse(params.pasajero) : {};

  const [metodo, setMetodo] = useState('TARJETA');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCvv] = useState('');

  const precio = Number(params.precio ?? 285);

  const procesar = async () => {
    if (metodo === 'TARJETA') {
      if (cardNum.length < 16) { Alert.alert('Número inválido', 'Ingresa un número de tarjeta válido.'); return; }
      if (!cardExp.match(/^\d{2}\/\d{2}$/)) { Alert.alert('Fecha inválida', 'Formato: MM/AA'); return; }
      if (cardCvv.length < 3) { Alert.alert('CVV inválido', 'Ingresa el código de seguridad.'); return; }
    }
    try {
      const res = await confirmar({ metodo, referencia: cardNum.slice(-4) || 'N/A' });
      router.replace({ pathname: '/reservar/confirmacion', params: { codigo: res.codigo_reserva, vuelo: params.id, asiento: params.asiento } });
    } catch {}
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backT}>‹</Text></TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Pago</Text>
          <Text style={s.headerSub}>Paso 4 de 4 — Último paso</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.progressWrap}>
        {[1,2,3,4].map(n => <View key={n} style={s.progressDotActive} />)}
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {/* Order summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Resumen del pedido</Text>
          <View style={s.summaryRow}><Text style={s.summaryL}>🛫 Vuelo</Text><Text style={s.summaryV}>{vuelo?.numero_vuelo ?? params.id}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryL}>📍 Ruta</Text><Text style={s.summaryV}>{vuelo?.aeropuerto_origen} → {vuelo?.aeropuerto_destino}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryL}>💺 Asiento</Text><Text style={s.summaryV}>{params.asiento}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryL}>🎫 Clase</Text><Text style={s.summaryV}>{params.clase}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryL}>👤 Pasajero</Text><Text style={s.summaryV}>{pasajero.nombres} {pasajero.apellidos}</Text></View>
          <View style={[s.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>Total a pagar</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: C.navy }}>{fmt.moneda(precio)}</Text>
          </View>
        </View>

        {/* Payment method selector */}
        <Text style={s.sectionT}>Método de pago</Text>
        {METODOS.map(m => (
          <TouchableOpacity key={m.key} style={[s.metodoBtn, metodo === m.key && s.metodoBtnActive]}
            onPress={() => setMetodo(m.key)} activeOpacity={0.8}>
            <Text style={{ fontSize: 22 }}>{m.icon}</Text>
            <Text style={[s.metodoBtnT, metodo === m.key && s.metodoBtnTActive]}>{m.label}</Text>
            <View style={[s.radio, metodo === m.key && s.radioActive]}>
              {metodo === m.key && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Card fields */}
        {metodo === 'TARJETA' && (
          <View style={s.cardForm}>
            <Text style={s.sectionT}>Datos de la tarjeta</Text>
            <View style={s.cardInput}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>💳</Text>
              <TextInput style={{ flex: 1, fontSize: 15, color: C.text }} value={cardNum}
                onChangeText={t => setCardNum(t.replace(/\D/g,'').slice(0,16))}
                placeholder="0000 0000 0000 0000" placeholderTextColor={C.placeholder} keyboardType="numeric" />
            </View>
            <View style={s.cardRow}>
              <View style={[s.cardInput, { flex: 1 }]}>
                <TextInput style={{ flex: 1, fontSize: 15, color: C.text }} value={cardExp}
                  onChangeText={t => {
                    const clean = t.replace(/\D/g,'').slice(0,4);
                    setCardExp(clean.length > 2 ? `${clean.slice(0,2)}/${clean.slice(2)}` : clean);
                  }}
                  placeholder="MM/AA" placeholderTextColor={C.placeholder} keyboardType="numeric" />
              </View>
              <View style={[s.cardInput, { flex: 1 }]}>
                <TextInput style={{ flex: 1, fontSize: 15, color: C.text }} value={cardCvv}
                  onChangeText={t => setCvv(t.slice(0,4))}
                  placeholder="CVV" placeholderTextColor={C.placeholder} keyboardType="numeric" secureTextEntry />
              </View>
            </View>
          </View>
        )}

        {metodo === 'TRANSFERENCIA' && (
          <View style={s.infoBox}>
            <Text style={s.infoBoxT}>🏦 Datos bancarios</Text>
            <Text style={s.infoBoxV}>Banco Industrial · Cuenta: 0123-456-789</Text>
            <Text style={s.infoBoxV}>NIT: 123456-7 · A nombre de: Aeropuerto La Aurora</Text>
            <Text style={s.infoBoxV}>Monto exacto: {fmt.moneda(precio)}</Text>
          </View>
        )}

        {metodo === 'EFECTIVO' && (
          <View style={s.infoBox}>
            <Text style={s.infoBoxT}>💵 Pago en agencia</Text>
            <Text style={s.infoBoxV}>Visita la taquilla del Aeropuerto La Aurora, Terminal A, Nivel 1.</Text>
            <Text style={s.infoBoxV}>Horario: 05:00 – 22:00 hrs.</Text>
            <Text style={[s.infoBoxV, { color: C.warning, fontWeight: '600' }]}>Tu reserva estará pendiente hasta confirmar el pago.</Text>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        <View>
          <Text style={s.footerTotal}>{fmt.moneda(precio)}</Text>
          <Text style={s.footerSub}>Total incluyendo impuestos</Text>
        </View>
        <TouchableOpacity style={[s.payBtn, loading && { opacity: 0.7 }]} onPress={procesar} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={C.white} /> : <Text style={s.payBtnT}>Confirmar pago ✓</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navy, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backT: { fontSize: 22, color: C.white, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.white, textAlign: 'center' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 2 },
  progressWrap: { flexDirection: 'row', gap: 6, justifyContent: 'center', paddingVertical: 12, backgroundColor: C.navy, paddingBottom: 14 },
  progressDotActive: { width: 48, height: 4, borderRadius: 2, backgroundColor:C.bgCard },
  body: { padding: 16, gap: 14, paddingBottom: 24 },
  summaryCard: { backgroundColor:C.bgCard, borderRadius: 16, padding: 16 },
  summaryTitle: { fontSize: 13, fontWeight: '800', color: C.navy, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.borderL },
  summaryL: { fontSize: 13, color: C.muted },
  summaryV: { fontSize: 13, fontWeight: '600', color: C.textSub, maxWidth: '55%', textAlign: 'right' },
  sectionT: { fontSize: 14, fontWeight: '800', color: C.navy, marginBottom: 10 },
  metodoBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor:C.bgCard, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: C.border, marginBottom: 8 },
  metodoBtnActive: { borderColor: C.navy, backgroundColor: C.infoBg },
  metodoBtnT: { flex: 1, fontSize: 14, fontWeight: '600', color: C.muted },
  metodoBtnTActive: { color: C.navy, fontWeight: '700' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.navy },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.navy },
  cardForm: { backgroundColor:C.bgCard, borderRadius: 16, padding: 16 },
  cardInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: C.bgElevated, marginBottom: 10 },
  cardRow: { flexDirection: 'row', gap: 10 },
  infoBox: { backgroundColor: C.infoBg, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.infoL, gap: 6 },
  infoBoxT: { fontSize: 14, fontWeight: '800', color: C.navy, marginBottom: 4 },
  infoBoxV: { fontSize: 13, color: C.textSub, lineHeight: 19 },
  footer: { backgroundColor:C.bgCard, padding: 16, borderTopWidth: 1, borderTopColor: C.borderL, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerTotal: { fontSize: 22, fontWeight: '900', color: C.navy },
  footerSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  payBtn: { backgroundColor: C.success, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 12, elevation: 3, shadowColor: C.success, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8 },
  payBtnT: { color: C.white, fontWeight: '800', fontSize: 15 },
});
