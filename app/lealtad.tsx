import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';
import { useSesion } from '@/context/session';
import { backendApi } from '@/services/backendApi';

const NIVELES = [
  { key: 'BRONCE',  icon: '🥉', color: '#B45309', min: 0,     max: 5000,  desc: 'Nivel inicial' },
  { key: 'PLATA',   icon: '🥈', color: '#6B7280', min: 5001,  max: 15000, desc: '+1.5x puntos por vuelo' },
  { key: 'ORO',     icon: '🥇', color: '#D97706', min: 15001, max: 40000, desc: '+2x puntos · Salón VIP gratis' },
  { key: 'PLATINO', icon: '', color: '#7C3AED', min: 40001, max: 99999, desc: '+3x puntos · Upgrades · Fast-track' },
];

const CANJES = [
  { pts: 2000,  icon: '🎫', desc: 'Descuento Q50 en próxima reserva',  tipo: 'DESCUENTO' },
  { pts: 5000,  icon: '🛄', desc: 'Equipaje extra 10kg gratis',         tipo: 'EQUIPAJE'  },
  { pts: 8000,  icon: '', desc: 'Acceso salón VIP 1 visita',          tipo: 'VIP'       },
  { pts: 15000, icon: '⬆️', desc: 'Upgrade a clase Ejecutiva',           tipo: 'UPGRADE'   },
  { pts: 25000, icon: '', desc: 'Vuelo nacional gratis',               tipo: 'VUELO'     },
];

export default function LealtadScreen() {
  const [PROGRAMAS_LEALTAD, set_PROGRAMAS_LEALTAD] = useState<any[]>([]);
  const [RESERVAS, set_RESERVAS] = useState<any[]>([]);
  useEffect(() => {
      backendApi.lealtad.listar().then(d => set_PROGRAMAS_LEALTAD(d)).catch(() => {});
      backendApi.reservas.porPasajero(0).then(d => set_RESERVAS(d)).catch(() => {});
  }, []);

  const { usuario } = useSesion();
  const router      = useRouter();
  const [tab, setTab] = useState<'puntos' | 'canjes' | 'historial'>('puntos');

  const lealtad = PROGRAMAS_LEALTAD.find(p => p.id_pasajero === (usuario?.id ?? 100));
  const puntos  = lealtad?.puntos_acumulados ?? 0;
  const millas  = lealtad?.millas_acumuladas ?? 0;
  const nivel   = (lealtad as any)?.nivel_membresia ?? 'BRONCE';

  const nc  = NIVELES.find(n => n.key === nivel) ?? NIVELES[0];
  const nIdx = NIVELES.findIndex(n => n.key === nivel);
  const next = NIVELES[nIdx + 1];
  const pct  = next ? Math.min(100, Math.round(((puntos - nc.min) / (next.min - nc.min)) * 100)) : 100;

  const misReservas = RESERVAS.filter(r => r.id_pasajero === (usuario?.id ?? 100)).slice(0, 5);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backT}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Programa de Lealtad</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[s.hero, { backgroundColor: nc.color + '20', borderBottomColor: nc.color + '30' }]}>
          <View style={[s.nivelBadge, { backgroundColor: nc.color + '30', borderColor: nc.color + '50' }]}>
            <Text style={{ fontSize: 32 }}>{nc.icon}</Text>
            <View>
              <Text style={[s.nivelLabel, { color: nc.color }]}>NIVEL {nivel}</Text>
              <Text style={s.nivelDesc}>{nc.desc}</Text>
            </View>
          </View>
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={[s.heroStatN, { color: nc.color }]}>{puntos?.toLocaleString('es-GT')}</Text>
              <Text style={s.heroStatL}>PUNTOS</Text>
            </View>
            <View style={[s.heroStatDiv]} />
            <View style={s.heroStat}>
              <Text style={[s.heroStatN, { color: nc.color }]}>{millas?.toLocaleString('es-GT')}</Text>
              <Text style={s.heroStatL}>MILLAS</Text>
            </View>
          </View>
          {next && (
            <View style={s.progressWrap}>
              <View style={s.progressRow}>
                <Text style={s.progressLabel}>Próximo nivel: {next.key}</Text>
                <Text style={[s.progressLabel, { color: nc.color }]}>{pct}%</Text>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: nc.color }]} />
              </View>
              <Text style={s.progressSub}>
                Faltan {((next.min - puntos)||0).toLocaleString('es-GT')} puntos para {next.icon} {next.key}
              </Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={s.tabsRow}>
          {(['puntos', 'canjes', 'historial'] as const).map(t => (
            <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]}
              onPress={() => setTab(t)}>
              <Text style={[s.tabBtnT, tab === t && { color: nc.color }]}>
                {t === 'puntos' ? '🏆 Niveles' : t === 'canjes' ? ' Canjear' : '📋 Historial'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16, paddingBottom: 40 }}>
          {/* Niveles */}
          {tab === 'puntos' && NIVELES.map((n, i) => {
            const activo = n.key === nivel;
            const alcanzado = i <= nIdx;
            return (
              <View key={n.key} style={[s.nivelCard,
                activo && { borderColor: n.color, borderWidth: 2 },
                !alcanzado && { opacity: 0.5 }
              ]}>
                <Text style={{ fontSize: 28 }}>{n.icon}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.nivelCardRow}>
                    <Text style={[s.nivelCardName, { color: n.color }]}>{n.key}</Text>
                    {activo && <View style={[s.activeBadge, { backgroundColor: n.color + '20', borderColor: n.color + '40' }]}>
                      <Text style={[s.activeBadgeT, { color: n.color }]}>Nivel actual</Text>
                    </View>}
                  </View>
                  <Text style={s.nivelCardDesc}>{n.desc}</Text>
                  <Text style={s.nivelCardRange}>{n.min?.toLocaleString()} – {n.max?.toLocaleString()} puntos</Text>
                </View>
                {alcanzado && <Text style={[s.nivelCheck, { color: n.color }]}>✓</Text>}
              </View>
            );
          })}

          {/* Canjes */}
          {tab === 'canjes' && CANJES.map((c, i) => {
            const puedo = puntos >= c.pts;
            return (
              <View key={i} style={[s.canjeCard, !puedo && { opacity: 0.5 }]}>
                <Text style={{ fontSize: 28 }}>{c.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.canjeDesc}>{c.desc}</Text>
                  <Text style={[s.canjePts, { color: puedo ? nc.color : C.muted }]}>
                    {c.pts?.toLocaleString()} puntos
                  </Text>
                </View>
                <TouchableOpacity
                  style={[s.canjeBtn, puedo
                    ? { backgroundColor: nc.color, borderColor: nc.color }
                    : { backgroundColor: C.bgElevated, borderColor: C.border }]}
                  onPress={() => puedo
                    ? require('react-native').Alert.alert('¡Canje solicitado!', 'Tu canje de "' + c.desc + '" está siendo procesado.')
                    : require('react-native').Alert.alert('Puntos insuficientes', 'Necesitas ' + ((c.pts - puntos)||0).toLocaleString() + ' puntos más.')
                  }
                  activeOpacity={0.85}
                >
                  <Text style={[s.canjeBtnT, { color: puedo ? C.white : C.muted }]}>
                    {puedo ? 'Canjear' : 'Faltan ' + ((c.pts - puntos)||0).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Historial */}
          {tab === 'historial' && (
            misReservas.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={{ fontSize: 36, marginBottom: 10 }}>🎫</Text>
                <Text style={s.emptyT}>Sin historial de viajes</Text>
              </View>
            ) : misReservas.map((r, i) => (
              <View key={i} style={s.histRow}>
                <View style={[s.histIcon, { backgroundColor: C.infoBg }]}>
                  <Text style={{ fontSize: 18 }}></Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.histNum}>{r.numero_vuelo ?? 'Vuelo #' + r.id_vuelo}</Text>
                  <Text style={s.histInfo}>{r.codigo_reserva} · {r.clase_servicio ?? 'ECONOMICA'}</Text>
                  <Text style={s.histFecha}>{r.fecha_reserva?.split('T')[0] ?? '—'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[s.histPts, { color: nc.color }]}>+{Math.floor((r.precio_pagado ?? 100) * 10)}</Text>
                  <Text style={s.histPtsL}>puntos</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navyL, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  back: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backT: { fontSize: 22, color: C.text, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  hero: { padding: 20, borderBottomWidth: 1, gap: 16 },
  nivelBadge: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  nivelLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  nivelDesc: { fontSize: 12, color: C.muted, marginTop: 2 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatN: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  heroStatL: { fontSize: 10, color: C.muted, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  heroStatDiv: { width: 1, height: 40, backgroundColor: C.border },
  progressWrap: { gap: 6 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, color: C.muted, fontWeight: '600' },
  progressTrack: { height: 8, backgroundColor: C.bgElevated, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  progressSub: { fontSize: 11, color: C.muted },
  tabsRow: { flexDirection: 'row', backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.borderL },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: C.electric },
  tabBtnT: { fontSize: 12, fontWeight: '700', color: C.muted },
  nivelCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bgCard, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  nivelCardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  nivelCardName: { fontSize: 15, fontWeight: '900' },
  nivelCardDesc: { fontSize: 12, color: C.muted },
  nivelCardRange: { fontSize: 11, color: C.light, marginTop: 3 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, borderWidth: 1 },
  activeBadgeT: { fontSize: 10, fontWeight: '700' },
  nivelCheck: { fontSize: 22, fontWeight: '900' },
  canjeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bgCard, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  canjeDesc: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 4 },
  canjePts: { fontSize: 12, fontWeight: '600' },
  canjeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  canjeBtnT: { fontSize: 12, fontWeight: '700' },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  histIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  histNum: { fontSize: 14, fontWeight: '800', color: C.text },
  histInfo: { fontSize: 11, color: C.muted, marginTop: 2 },
  histFecha: { fontSize: 11, color: C.light, marginTop: 1 },
  histPts: { fontSize: 16, fontWeight: '900' },
  histPtsL: { fontSize: 10, color: C.muted },
  emptyBox: { alignItems: 'center', paddingVertical: 50 },
  emptyT: { fontSize: 14, color: C.muted, marginTop: 8 },
});


