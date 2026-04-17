/**
 * Paso 4: Pago — Desglose completo con pricing dinámico + extras + promo
 */
import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';
import { useBookingManager, ExtraService } from '@/hooks/useBookingManager';
import { useVueloDetalle } from '@/hooks/useVuelos';
import { fmt } from '@/utils/format';

// ─── Progress bar ─────────────────────────────────────────────────────────────
function Progress({ step }: { step: number }) {
  const STEPS = ['Vuelo','Asiento','Pasajero','Extras','Pago'];
  return (
    <View style={pg.row}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <View style={[pg.dot, i < step && pg.dotDone, i === step && pg.dotActive]}>
            <Text style={[pg.dotT, (i < step || i === step) && pg.dotTDone]}>
              {i < step ? '✓' : String(i + 1)}
            </Text>
          </View>
          {i < STEPS.length - 1 && (
            <View style={[pg.line, i < step && pg.lineDone]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}
const pg = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  dot:       { width: 26, height: 26, borderRadius: 13, backgroundColor: C.bgElevated, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  dotActive: { backgroundColor: C.infoBg, borderColor: C.electric },
  dotDone:   { backgroundColor: C.successBg, borderColor: C.success },
  dotT:      { fontSize: 10, fontWeight: '700', color: C.muted },
  dotTDone:  { color: C.success },
  line:      { flex: 1, height: 1.5, backgroundColor: C.border, marginHorizontal: 2 },
  lineDone:  { backgroundColor: C.success },
});

// ─── Price breakdown row ──────────────────────────────────────────────────────
function PriceRow({ label, value, color, bold }: {
  label: string; value: string; color?: string; bold?: boolean;
}) {
  return (
    <View style={pr.row}>
      <Text style={[pr.label, bold && pr.bold]}>{label}</Text>
      <Text style={[pr.val, bold && pr.bold, color && { color }]}>{value}</Text>
    </View>
  );
}
const pr = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.borderL },
  label: { fontSize: 13, color: C.textSub },
  val:   { fontSize: 13, fontWeight: '600', color: C.text },
  bold:  { fontWeight: '900', fontSize: 15, color: C.text },
});

// ─── Extra service card ───────────────────────────────────────────────────────
function ExtraCard({ extra, onToggle }: { extra: ExtraService; onToggle: () => void }) {
  return (
    <TouchableOpacity
      style={[ec.card, extra.seleccionado && ec.cardActive]}
      onPress={onToggle} activeOpacity={0.85}
    >
      <Text style={{ fontSize: 24 }}>{extra.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={ec.name}>{extra.nombre}</Text>
        <Text style={ec.desc}>{extra.descripcion}</Text>
      </View>
      <View style={ec.right}>
        <Text style={[ec.price, extra.seleccionado && { color: C.electric }]}>
          +USD {extra.precio}
        </Text>
        <View style={[ec.check, extra.seleccionado && ec.checkActive]}>
          <Text style={{ fontSize: 10, color: extra.seleccionado ? C.white : C.muted }}>
            {extra.seleccionado ? '✓' : '+'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const ec = StyleSheet.create({
  card:        { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  cardActive:  { borderColor: C.electric, backgroundColor: C.infoBg + '18' },
  name:        { fontSize: 13, fontWeight: '700', color: C.text },
  desc:        { fontSize: 11, color: C.muted, marginTop: 2 },
  right:       { alignItems: 'flex-end', gap: 6 },
  price:       { fontSize: 12, fontWeight: '700', color: C.textSub },
  check:       { width: 22, height: 22, borderRadius: 11, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  checkActive: { backgroundColor: C.electric, borderColor: C.electric },
});

// ─── Payment method ───────────────────────────────────────────────────────────
const METODOS = [
  { key: 'TARJETA',       label: 'Tarjeta',     icon: '💳', sub: 'Crédito o débito' },
  { key: 'TRANSFERENCIA', label: 'Transferencia',icon: '🏦', sub: 'Bancaria' },
  { key: 'EFECTIVO',      label: 'Efectivo',     icon: '💵', sub: 'En agencia' },
  { key: 'PUNTOS',        label: 'Puntos',       icon: '', sub: 'Programa lealtad' },
];

export default function PagoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string; clase: string; precio: string; asiento: string; pasajero: string;
  }>();

  const mgr    = useBookingManager();
  const { vuelo } = useVueloDetalle(Number(params.id ?? 0));

  // Hydrate manager from params if not already set
  const pricing = mgr.pricing ?? { total: Number(params.precio ?? 285), subtotal: Number(params.precio ?? 285), impuestos: 0, descuentoLealtad: 0, descuentoAnticip: 0, descuentoPromo: 0, ahorro: 0, badge: undefined };

  const [metodo,  setMetodo]  = useState('TARJETA');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCvv]     = useState('');
  const [promo,   setPromo]   = useState('');
  const [promoMsg, setPromoMsg] = useState('');

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
  };

  const handlePromo = async () => {
    const ok = await Promise.resolve(mgr.validarPromo(promo));
    setPromoMsg(ok ? ' Código aplicado' : '❌ Código inválido');
  };

  const procesar = async () => {
    if (metodo === 'TARJETA') {
      if (cardNum.replace(/\s/g,'').length < 16) {
        Alert.alert('Número inválido','Ingresa los 16 dígitos de tu tarjeta.'); return;
      }
      if (!cardExp.match(/^\d{2}\/\d{2}$/)) {
        Alert.alert('Fecha inválida','Formato: MM/AA'); return;
      }
      if (cardCvv.length < 3) {
        Alert.alert('CVV inválido','Ingresa el código de seguridad (3-4 dígitos).'); return;
      }
    }

    const pasajeroData = params.pasajero ? (() => { try { return JSON.parse(params.pasajero!); } catch { return null; } })() : null;
    if (pasajeroData) mgr.guardarPasajero(pasajeroData);

    const resultado = await mgr.confirmarPago(metodo, cardNum.slice(-4) || 'N/A');
    const resData = await Promise.resolve(resultado);
    if (resData) {
      router.replace({
        pathname: '/reservar/confirmacion',
        params: {
          codigo:       (resData as any).CodigoReserva,
          vuelo:        params.id,
          asiento:      params.asiento,
          puntos:       String(mgr.puntosGanados),
          total:        String(mgr.totalFinal),
        },
      } as any);
    }
  };

  const precioBase = Number(params.precio ?? 285);
  const extCosto   = mgr.extrasSeleccionados.reduce((s, e) => s + e.precio, 0);
  const descTotal  = (pricing.descuentoLealtad + pricing.descuentoAnticip + pricing.descuentoPromo) * precioBase;
  const subtotal   = precioBase - descTotal;
  const iva        = Math.round(subtotal * 0.16);
  const total      = subtotal + iva + extCosto;

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backT}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Confirmar y pagar</Text>
          <Text style={s.headerSub}>{vuelo?.NumeroVuelo ?? 'Vuelo'} · Asiento {params.asiento}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <Progress step={4} />

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Desglose de precio ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}> Resumen de precio</Text>
          <PriceRow label={`Tarifa base (${params.clase ?? 'ECONOMICA'})`} value={`USD ${precioBase}`} />
          {descTotal > 0 && (
            <PriceRow label="Descuentos aplicados" value={`- USD ${Math.round(descTotal)}`} color={C.success} />
          )}
          {extCosto > 0 && (
            <PriceRow label="Extras seleccionados" value={`+ USD ${extCosto}`} />
          )}
          <PriceRow label="Subtotal" value={`USD ${subtotal + extCosto}`} />
          <PriceRow label="IVA (16%)" value={`USD ${iva}`} color={C.muted} />
          <PriceRow label="TOTAL A PAGAR" value={`USD ${total}`} bold />
          {mgr.puntosGanados > 0 && (
            <View style={s.puntosWrap}>
              <Text style={s.puntosT}>🏆 Ganarás {mgr.puntosGanados.toLocaleString('es-GT')} puntos</Text>
            </View>
          )}
          {pricing.badge && (
            <View style={s.badgeWrap}>
              <Text style={s.badgeT}>{pricing.badge}</Text>
            </View>
          )}
        </View>

        {/* ── Servicios extra ── */}
        <Text style={s.sectionTitle}> Servicios adicionales</Text>
        {mgr.extras.map(extra => (
          <ExtraCard key={extra.id} extra={extra} onToggle={() => mgr.toggleExtra(extra.id)} />
        ))}

        {/* ── Código promocional ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🎫 Código promocional</Text>
          <View style={s.promoRow}>
            <TextInput
              style={s.promoInput}
              value={promo}
              onChangeText={setPromo}
              placeholder="AURORA20, LAUNCH15..."
              placeholderTextColor={C.placeholder}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={s.promoBtn} onPress={handlePromo}>
              <Text style={s.promoBtnT}>Aplicar</Text>
            </TouchableOpacity>
          </View>
          {promoMsg ? <Text style={[s.promoMsg, promoMsg.startsWith('') && { color: C.success }]}>{promoMsg}</Text> : null}
          <Text style={s.promoHint}>Códigos válidos: AURORA20 · LAUNCH15 · VIP25 · FIDELIDAD</Text>
        </View>

        {/* ── Método de pago ── */}
        <Text style={s.sectionTitle}>💳 Método de pago</Text>
        <View style={s.metodosRow}>
          {METODOS.map(m => (
            <TouchableOpacity key={m.key}
              style={[s.metodoBtn, metodo === m.key && s.metodoBtnActive]}
              onPress={() => setMetodo(m.key)} activeOpacity={0.8}>
              <Text style={{ fontSize: 20 }}>{m.icon}</Text>
              <Text style={[s.metodoBtnT, metodo === m.key && s.metodoBtnTActive]}>{m.label}</Text>
              <Text style={s.metodoBtnSub}>{m.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Formulario tarjeta ── */}
        {metodo === 'TARJETA' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Datos de tarjeta</Text>
            <TextInput style={s.input} value={cardNum} onChangeText={v => setCardNum(formatCard(v))}
              placeholder="1234 5678 9012 3456" placeholderTextColor={C.placeholder}
              keyboardType="numeric" maxLength={19} />
            <View style={s.cardRow}>
              <TextInput style={[s.input, { flex: 1 }]} value={cardExp}
                onChangeText={v => setCardExp(formatExp(v))}
                placeholder="MM/AA" placeholderTextColor={C.placeholder}
                keyboardType="numeric" maxLength={5} />
              <TextInput style={[s.input, { flex: 1 }]} value={cardCvv}
                onChangeText={setCvv}
                placeholder="CVV" placeholderTextColor={C.placeholder}
                keyboardType="numeric" maxLength={4} secureTextEntry />
            </View>
            <Text style={s.secureNote}>🔒 Pago procesado con cifrado SSL 256-bit</Text>
          </View>
        )}

        {metodo === 'PUNTOS' && (
          <View style={[s.card, { backgroundColor: C.purpleBg + '40', borderColor: C.purple + '40' }]}>
            <Text style={{ fontSize: 18 }}></Text>
            <Text style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>
              Se descontarán {(total * 100).toLocaleString('es-GT')} puntos de tu saldo de lealtad.
            </Text>
          </View>
        )}

        {/* Error */}
        {mgr.error && (
          <View style={s.errorBox}>
            <Text style={s.errorT}> {mgr.error}</Text>
          </View>
        )}

        {/* Confirm button */}
        <TouchableOpacity style={[s.confirmBtn, mgr.loading && { opacity: 0.7 }]}
          onPress={procesar} disabled={mgr.loading} activeOpacity={0.88}>
          {mgr.loading ? <ActivityIndicator color={C.white} /> : (
            <Text style={s.confirmBtnT}>
              Pagar USD {total} →
            </Text>
          )}
        </TouchableOpacity>

        <Text style={s.legal}>
          Al confirmar aceptas los términos y condiciones de Aeropuerto La Aurora
          y la política de reembolsos IATA.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navyL, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  back:         { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backT:        { fontSize: 22, color: C.text, fontWeight: '300', marginTop: -2 },
  headerTitle:  { fontSize: 16, fontWeight: '800', color: C.text, textAlign: 'center' },
  headerSub:    { fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 1 },
  body:         { padding: 16, paddingBottom: 50 },
  card:         { backgroundColor: C.bgCard, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border, gap: 0 },
  cardTitle:    { fontSize: 13, fontWeight: '800', color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  puntosWrap:   { backgroundColor: C.successBg, borderRadius: 10, padding: 10, marginTop: 12, borderWidth: 1, borderColor: C.successL },
  puntosT:      { fontSize: 13, fontWeight: '700', color: C.success, textAlign: 'center' },
  badgeWrap:    { backgroundColor: C.warningBg, borderRadius: 10, padding: 8, marginTop: 8, borderWidth: 1, borderColor: C.warningL },
  badgeT:       { fontSize: 11, fontWeight: '700', color: C.warning, textAlign: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  promoRow:     { flexDirection: 'row', gap: 8, marginTop: 4 },
  promoInput:   { flex: 1, backgroundColor: C.bgElevated, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text, borderWidth: 1, borderColor: C.border },
  promoBtn:     { backgroundColor: C.infoBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.borderE, justifyContent: 'center' },
  promoBtnT:    { fontSize: 13, fontWeight: '700', color: C.electric },
  promoMsg:     { fontSize: 12, color: C.danger, marginTop: 6, fontWeight: '600' },
  promoHint:    { fontSize: 10, color: C.light, marginTop: 4 },
  metodosRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  metodoBtn:    { width: '47%', backgroundColor: C.bgCard, borderRadius: 14, padding: 14, alignItems: 'center', gap: 3, borderWidth: 1, borderColor: C.border },
  metodoBtnActive: { backgroundColor: C.infoBg, borderColor: C.electric },
  metodoBtnT:   { fontSize: 13, fontWeight: '700', color: C.muted },
  metodoBtnTActive: { color: C.electric, fontWeight: '800' },
  metodoBtnSub: { fontSize: 10, color: C.light },
  input:        { backgroundColor: C.bgElevated, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  cardRow:      { flexDirection: 'row', gap: 10 },
  secureNote:   { fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 4 },
  errorBox:     { backgroundColor: C.dangerBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.dangerL, marginBottom: 14 },
  errorT:       { fontSize: 13, fontWeight: '600', color: C.danger },
  confirmBtn:   { backgroundColor: C.electric, paddingVertical: 18, borderRadius: 18, alignItems: 'center', shadowColor: C.electric, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 },
  confirmBtnT:  { color: C.white, fontWeight: '900', fontSize: 17, letterSpacing: 0.3 },
  legal:        { fontSize: 10, color: C.light, textAlign: 'center', marginTop: 14, lineHeight: 16 },
});
