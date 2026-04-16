/**
 * Confirmación de reserva — Pase de abordar + resumen + puntos + upgrade
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StyleSheet, Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';
import { useVueloDetalle } from '@/hooks/useVuelos';
import { useSesion } from '@/context/session';
import { backendApi } from '@/services/backendApi';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function Confirmacion() {
  const [PROGRAMAS_LEALTAD, set_PROGRAMAS_LEALTAD] = useState<any[]>([]);
  useEffect(() => {
      backendApi.lealtad.listar().then(d => set_PROGRAMAS_LEALTAD(d)).catch(() => {});
  }, []);

  const router = useRouter();
  const { track } = useAnalytics();
  const { usuario } = useSesion();
  const { codigo, vuelo: vueloId, asiento, puntos, total } =
    useLocalSearchParams<{ codigo: string; vuelo: string; asiento: string; puntos: string; total: string }>();
  const { vuelo, tarifas, loading, error } = useVueloDetalle(Number(vueloId));

  const puntosGanados  = Number(puntos ?? 0);
  const totalPagado    = Number(total ?? 0);
  const salida  = vuelo?.HoraSalidaProgramada?.split('T')[1]?.slice(0,5) ?? '--:--';
  const llegada = vuelo?.HoraLlegadaProgramada?.split('T')[1]?.slice(0,5) ?? '--:--';
  const fecha   = vuelo?.FechaVuelo?.split('T')[0] ?? '—';

  const lealtad = (PROGRAMAS_LEALTAD as any[]).find(l => l.id_pasajero === usuario?.id);
  const nivelActual    = lealtad?.nivel_membresia ?? 'BRONCE';
  const puntosActuales = (lealtad?.puntos_acumulados ?? 0) + puntosGanados;

  // Upgrade suggestion if Oro/Platino
  const puedeUpgrade = nivelActual === 'ORO' || nivelActual === 'PLATINO';

  useEffect(() => {
    track('BOOKING_COMPLETE', { codigo, id_vuelo: vueloId, asiento });
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `✈️ Reserva confirmada: ${codigo}\nVuelo: ${vuelo?.NumeroVuelo ?? vueloId}\nAsiento: ${asiento}\nFecha: ${fecha}\nSalida: ${salida}`,
        title: 'Mi pase de abordar — Aeropuerto La Aurora',
      });
    } catch {}
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* ── Success header ── */}
        <View style={s.successHeader}>
          <View style={s.checkCircle}><Text style={{ fontSize: 42 }}>✅</Text></View>
          <Text style={s.successTitle}>¡Reserva confirmada!</Text>
          <Text style={s.successSub}>
            Se ha enviado la confirmación a{' '}
            <Text style={{ color: C.electric }}>{usuario?.email ?? 'tu email'}</Text>
          </Text>
        </View>

        {/* ── Boarding pass card ── */}
        <View style={s.boardingPass}>
          {/* Header strip */}
          <View style={s.bpHeader}>
            <View style={s.bpOrb} />
            <Text style={s.bpAerolinea}>{vuelo?.NombreAerolinea ?? 'Aerolínea'}</Text>
            <Text style={s.bpNum}>{vuelo?.NumeroVuelo ?? '—'}</Text>
            <View style={[s.bpStatusChip]}>
              <Text style={s.bpStatusT}>CONFIRMADO</Text>
            </View>
          </View>

          {/* Route */}
          <View style={s.bpRoute}>
            <View style={s.bpEndpoint}>
              <Text style={s.bpCode}>{vuelo?.AeropuertoOrigen ?? 'GUA'}</Text>
              <Text style={s.bpTime}>{salida}</Text>
            </View>
            <View style={s.bpMiddle}>
              <Text style={s.bpArrow}>─────── ✈ ───────</Text>
              <Text style={s.bpFecha}>{fecha}</Text>
            </View>
            <View style={[s.bpEndpoint, { alignItems: 'flex-end' }]}>
              <Text style={s.bpCode}>{vuelo?.AeropuertoDestino ?? '—'}</Text>
              <Text style={s.bpTime}>{llegada}</Text>
            </View>
          </View>

          {/* Separator */}
          <View style={s.bpSep}>
            <View style={s.bpSepCircleL} />
            <View style={s.bpSepLine} />
            <View style={s.bpSepCircleR} />
          </View>

          {/* Passenger info grid */}
          <View style={s.bpInfoGrid}>
            {[
              { label: 'PASAJERO', value: `${usuario?.nombre ?? '—'} ${usuario?.apellido ?? ''}` },
              { label: 'ASIENTO',  value: asiento ?? '—' },
              { label: 'CÓDIGO',   value: codigo ?? '—' },
              { label: 'PUERTA',   value: `${vuelo?.IdPuertaSalida ?? '—'}` },
            ].map(item => (
              <View key={item.label} style={s.bpInfoItem}>
                <Text style={s.bpInfoLabel}>{item.label}</Text>
                <Text style={s.bpInfoValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* QR placeholder */}
          <View style={s.bpQrWrap}>
            <View style={s.bpQr}>
              <Text style={{ fontSize: 10, color: C.muted, textAlign: 'center' }}>
                {'▓▒░ QR ░▒▓'}{'\n'}Escanea en el embarque
              </Text>
            </View>
            <Text style={s.bpCodigo}>{codigo}</Text>
          </View>
        </View>

        {/* ── Puntos ganados ── */}
        {puntosGanados > 0 && (
          <TouchableOpacity style={s.puntosCard} onPress={() => router.push('/lealtad' as any)}>
            <View style={s.puntosLeft}>
              <Text style={{ fontSize: 28 }}>🏆</Text>
              <View>
                <Text style={s.puntosTitle}>
                  +{puntosGanados.toLocaleString('es-GT')} puntos ganados
                </Text>
                <Text style={s.puntosTotal}>
                  Total: {puntosActuales.toLocaleString('es-GT')} pts · Nivel {nivelActual}
                </Text>
              </View>
            </View>
            <Text style={{ color: C.amber, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}

        {/* ── Upgrade suggestion ── */}
        {puedeUpgrade && (
          <View style={s.upgradeCard}>
            <Text style={{ fontSize: 24 }}>⬆️</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.upgradeTitle}>¿Quieres mejorar tu asiento?</Text>
              <Text style={s.upgradeSub}>
                Como miembro {nivelActual} tienes acceso a upgrades con descuento.
              </Text>
            </View>
            <TouchableOpacity style={s.upgradeBtn} activeOpacity={0.85}
              onPress={() => router.push('/lealtad' as any)}>
              <Text style={s.upgradeBtnT}>Ver</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Actions ── */}
        <View style={s.actionsGrid}>
          <TouchableOpacity style={s.actionBtn}
            onPress={() => router.push({
              pathname: '/reservar/checkin',
              params: { codigo },
            } as any)}>
            <Text style={{ fontSize: 24 }}>✅</Text>
            <Text style={s.actionBtnT}>Hacer{'\n'}Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={handleShare}>
            <Text style={{ fontSize: 24 }}>📤</Text>
            <Text style={s.actionBtnT}>Compartir{'\n'}Reserva</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn}
            onPress={() => router.push('/historial' as any)}>
            <Text style={{ fontSize: 24 }}>🎟️</Text>
            <Text style={s.actionBtnT}>Mis{'\n'}Viajes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { borderColor: C.danger + '40' }]}
            onPress={() => router.push({
              pathname: '/cancelacion',
              params: { idReserva: '1' },
            } as any)}>
            <Text style={{ fontSize: 24 }}>❌</Text>
            <Text style={[s.actionBtnT, { color: C.danger }]}>Cancelar{'\n'}Reserva</Text>
          </TouchableOpacity>
        </View>

        {/* Home button */}
        <TouchableOpacity style={s.homeBtn}
          onPress={() => router.replace('/(tabs)/dashboard' as any)}>
          <Text style={s.homeBtnT}>Volver al inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: C.bg },
  body:          { padding: 20, paddingBottom: 50 },
  successHeader: { alignItems: 'center', marginBottom: 24 },
  checkCircle:   { width: 88, height: 88, borderRadius: 22, backgroundColor: C.successBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.successL, marginBottom: 14, shadowColor: C.success, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 12 },
  successTitle:  { fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  successSub:    { fontSize: 13, color: C.muted, marginTop: 6, textAlign: 'center' },
  boardingPass:  { backgroundColor: C.bgCard, borderRadius: 22, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14 },
  bpHeader:     { backgroundColor: C.navyL, paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 10, overflow: 'hidden' },
  bpOrb:        { position: 'absolute', top: -20, right: -10, width: 100, height: 100, borderRadius: 50, backgroundColor: C.electric, opacity: 0.12 },
  bpAerolinea:  { flex: 1, fontSize: 13, fontWeight: '700', color: C.textSub },
  bpNum:        { fontSize: 18, fontWeight: '900', color: C.text },
  bpStatusChip: { backgroundColor: C.successBg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: C.successL },
  bpStatusT:    { fontSize: 9, fontWeight: '800', color: C.success, letterSpacing: 1 },
  bpRoute:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18 },
  bpEndpoint:   { width: 70 },
  bpCode:       { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -1 },
  bpTime:       { fontSize: 14, color: C.muted, marginTop: 4, fontWeight: '600' },
  bpMiddle:     { flex: 1, alignItems: 'center' },
  bpArrow:      { fontSize: 12, color: C.electric, letterSpacing: -1 },
  bpFecha:      { fontSize: 11, color: C.muted, marginTop: 4 },
  bpSep:        { flexDirection: 'row', alignItems: 'center', marginHorizontal: -1 },
  bpSepCircleL: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.bg, marginLeft: -10 },
  bpSepLine:    { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: C.border },
  bpSepCircleR: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.bg, marginRight: -10 },
  bpInfoGrid:   { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingVertical: 16, gap: 0 },
  bpInfoItem:   { width: '50%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.borderL },
  bpInfoLabel:  { fontSize: 9, fontWeight: '800', color: C.muted, letterSpacing: 1.5, textTransform: 'uppercase' },
  bpInfoValue:  { fontSize: 15, fontWeight: '800', color: C.text, marginTop: 3 },
  bpQrWrap:     { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: C.borderL, gap: 10 },
  bpQr:         { width: 100, height: 100, backgroundColor: C.bgElevated, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  bpCodigo:     { fontSize: 14, fontWeight: '900', color: C.text, letterSpacing: 2 },
  puntosCard:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.warningBg, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.amber + '40' },
  puntosLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  puntosTitle:  { fontSize: 14, fontWeight: '800', color: C.text },
  puntosTotal:  { fontSize: 11, color: C.muted, marginTop: 2 },
  upgradeCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.purpleBg, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.purple + '40' },
  upgradeTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  upgradeSub:   { fontSize: 11, color: C.muted, marginTop: 2 },
  upgradeBtn:   { backgroundColor: C.purple, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  upgradeBtnT:  { fontSize: 12, fontWeight: '700', color: C.white },
  actionsGrid:  { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn:    { flex: 1, backgroundColor: C.bgCard, borderRadius: 16, paddingVertical: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border },
  actionBtnT:   { fontSize: 10, fontWeight: '700', color: C.textSub, textAlign: 'center' },
  homeBtn:      { backgroundColor: C.bgCard, paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  homeBtnT:     { fontSize: 14, fontWeight: '700', color: C.textSub },
});

