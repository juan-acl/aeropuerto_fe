import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';
import { useFlightStatusList } from '@/hooks/useFlightStatus';
import { FlightCard } from '@/components/FlightCard';
import { useSesion } from '@/context/session';
import { backendApi } from '@/services/backendApi';

const FILTERS = [
  { k: 'TODOS', l: 'Todos', icon: '' },
  { k: 'EN_VUELO', l: 'En Vuelo', icon: '' },
  { k: 'PROGRAMADO', l: 'Programado', icon: '🔵' },
  { k: 'DEMORADO', l: 'Demorado', icon: '' },
  { k: 'CANCELADO', l: 'Cancelado', icon: '🔴' },
  { k: 'ATERRIZADO', l: 'Aterrizado', icon: '⚫' },
];

function VistaPasajero({ VUELOS }: { VUELOS: any[] }) {
  const { statuses: rtStatuses, lastUpdate } = useFlightStatusList();
  const getRtStatus = (id: number) => rtStatuses.find(s => s.id_vuelo === id);
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<'SALIDAS' | 'LLEGADAS'>('SALIDAS');
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });

  const data = useMemo(() =>
    VUELOS.filter((v: any) => {
      const match = !q || `${v.NumeroVuelo ?? ''} ${v.AeropuertoOrigen ?? ''} ${v.AeropuertoDestino ?? ''}`.toLowerCase().includes(q.toLowerCase());
      const visible = ['PROGRAMADO','EN_VUELO','DEMORADO','CANCELADO','ATERRIZADO'].includes(v.EstadoVuelo ?? '');
      const dir = filtro === 'SALIDAS' ? (v.AeropuertoOrigen === 'GUA') : v.AeropuertoDestino === 'GUA';
      return match && visible && (q ? true : dir);
    }), [q, filtro, VUELOS]);

  const enVuelo = VUELOS.filter((v: any) => v.EstadoVuelo === 'EN_VUELO').length;
  const demorados = VUELOS.filter((v: any) => v.EstadoVuelo === 'DEMORADO').length;
  const cancelados = VUELOS.filter((v: any) => v.EstadoVuelo === 'CANCELADO').length;

  return (
    <SafeAreaView style={s.container}>
      {/* Hero Header */}
      <View style={s.hero}>
        {/* Decorative orbs */}
        <View style={s.orb1} />
        <View style={s.orb2} />

        <View style={s.heroContent}>
          <Text style={s.heroBrand}> LA AURORA · GUA</Text>
          <Text style={s.heroTitle}>Tablero de{'\n'}Vuelos</Text>
          <Text style={s.heroDate}>{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</Text>

          {/* Live stats */}
          <View style={s.statsRow}>
            {[
              { n: enVuelo, l: 'En vuelo', c: C.success },
              { n: demorados, l: 'Demorados', c: C.warning },
              { n: cancelados, l: 'Cancelados', c: C.danger },
            ].map(st => (
              <View key={st.l} style={s.statItem}>
                <Text style={[s.statN, { color: st.c }]}>{st.n}</Text>
                <Text style={s.statL}>{st.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Salidas / Llegadas toggle */}
        <View style={s.toggle}>
          {(['SALIDAS', 'LLEGADAS'] as const).map(t => (
            <TouchableOpacity key={t} style={[s.toggleBtn, filtro === t && s.toggleActive]}
              onPress={() => setFiltro(t)} activeOpacity={0.8}>
              <Text style={s.toggleIcon}>{t === 'SALIDAS' ? '🛫' : ''}</Text>
              <Text style={[s.toggleT, filtro === t && s.toggleTActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CTA Banner */}
      <TouchableOpacity style={s.ctaBanner} onPress={() => router.push('/buscar' as any)} activeOpacity={0.88}>
        <View style={s.ctaGlow} />
        <Text style={s.ctaIcon}></Text>
        <View style={{ flex: 1 }}>
          <Text style={s.ctaTitle}>Reservar vuelo</Text>
          <Text style={s.ctaSub}>Busca, elige tu asiento y paga en minutos</Text>
        </View>
        <View style={s.ctaArrow}>
          <Text style={{ color: C.electric, fontSize: 18, fontWeight: '800' }}>›</Text>
        </View>
      </TouchableOpacity>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Text style={s.searchIcon}></Text>
          <TextInput style={s.searchInput} placeholder="Vuelo, destino, origen..."
            placeholderTextColor={C.placeholder} value={q} onChangeText={setQ} clearButtonMode="while-editing" />
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(v: any) => (v.IdVuelo ?? v.id_vuelo ?? Math.random()).toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 30, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <FlightCard vuelo={item} modoPublico />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 52, marginBottom: 14 }}></Text>
            <Text style={s.emptyT}>{q ? 'Sin resultados' : `No hay ${filtro.toLowerCase()}`}</Text>
            <Text style={s.emptyS}>{q ? 'Ajusta tu búsqueda' : 'Consulta más tarde'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function VistaPersonal({ VUELOS }: { VUELOS: any[] }) {
  const { usuario } = useSesion();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState('TODOS');

  const stats = useMemo(() => ({
    enVuelo:    VUELOS.filter((v: any) => v.EstadoVuelo === 'EN_VUELO').length,
    programado: VUELOS.filter((v: any) => v.EstadoVuelo === 'PROGRAMADO').length,
    demorado:   VUELOS.filter((v: any) => v.EstadoVuelo === 'DEMORADO').length,
    cancelado:  VUELOS.filter((v: any) => v.EstadoVuelo === 'CANCELADO').length,
  }), [VUELOS]);

  const data = useMemo(() =>
    VUELOS.filter((v: any) => {
      const m = !q || `${v.NumeroVuelo ?? ''} ${v.AeropuertoOrigen ?? ''} ${v.AeropuertoDestino ?? ''} ${v.MatriculaAvion ?? ''}`.toLowerCase().includes(q.toLowerCase());
      const f = filtro === 'TODOS' || v.EstadoVuelo === filtro;
      return m && f;
    }), [q, filtro, VUELOS]);

  return (
    <SafeAreaView style={s.container}>
      {/* Operational Header */}
      <View style={s.opsHeader}>
        <View style={s.orb1} />
        <View style={s.orb2} />
        <View style={s.opsHeaderContent}>
          <View>
            <Text style={s.opsBrand}>AEROPUERTO LA AURORA</Text>
            <Text style={s.opsTitle}>Panel Operacional</Text>
          </View>
          <View style={s.staffPill}>
            <Text style={s.staffPillIcon}>{usuario?.avatar ?? ''}</Text>
            <View>
              <Text style={s.staffPillName}>{usuario?.nombre}</Text>
              <Text style={s.staffPillRol}>{usuario?.departamento ?? ''}</Text>
            </View>
          </View>
        </View>

        {/* KPI strip */}
        <View style={s.kpiStrip}>
          {[
            { n: stats.enVuelo, l: 'En vuelo', c: C.success },
            { n: stats.programado, l: 'Programados', c: C.electric },
            { n: stats.demorado, l: 'Demorados', c: C.warning },
            { n: stats.cancelado, l: 'Cancelados', c: C.danger },
          ].map(k => (
            <View key={k.l} style={[s.kpiItem, { borderColor: k.c + '30' }]}>
              <Text style={[s.kpiN, { color: k.c }]}>{k.n}</Text>
              <Text style={s.kpiL}>{k.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Text style={s.searchIcon}></Text>
          <TextInput style={s.searchInput} placeholder="Vuelo, matrícula, destino..."
            placeholderTextColor={C.placeholder} value={q} onChangeText={setQ} clearButtonMode="while-editing" />
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={s.filtersBar} contentContainerStyle={s.filtersContent}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.k} style={[s.filterChip, filtro === f.k && s.filterChipActive]}
            onPress={() => setFiltro(f.k)} activeOpacity={0.75}>
            <Text style={s.filterIcon}>{f.icon}</Text>
            <Text style={[s.filterT, filtro === f.k && s.filterTActive]}>{f.l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={data}
        keyExtractor={(v: any) => (v.IdVuelo ?? v.id_vuelo ?? Math.random()).toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FlightCard vuelo={item} onPress={() => router.push(`/modules/vuelo-detalle?id=${item.id_vuelo}` as any)} />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 52, marginBottom: 14 }}></Text>
            <Text style={s.emptyT}>Sin vuelos</Text>
            <Text style={s.emptyS}>Ajusta los filtros</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

export default function VuelosTab() {
  const [VUELOS, set_VUELOS] = useState<any[]>([]);
  useEffect(() => {
      backendApi.vuelos.listar().then(d => set_VUELOS(d)).catch(() => {});
  }, []);

  const { esCliente } = useSesion();
  return esCliente ? <VistaPasajero VUELOS={VUELOS} /> : <VistaPersonal VUELOS={VUELOS} />;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── Hero ──
  hero: { backgroundColor: C.navyL, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20, overflow: 'hidden' },
  orb1: { position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: 80, backgroundColor: C.electric, opacity: 0.08 },
  orb2: { position: 'absolute', bottom: -30, left: 10, width: 100, height: 100, borderRadius: 50, backgroundColor: C.cyan, opacity: 0.06 },
  heroContent: { marginBottom: 16 },
  heroBrand: { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 },
  heroTitle: { fontSize: 34, fontWeight: '900', color: C.text, letterSpacing: -1.5, lineHeight: 38 },
  heroDate: { fontSize: 12, color: C.muted, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 16 },
  statItem: { alignItems: 'center' },
  statN: { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  statL: { fontSize: 10, color: C.muted, marginTop: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  toggle: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 14, padding: 4, gap: 4 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10 },
  toggleActive: { backgroundColor: C.electric, shadowColor: C.electric, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  toggleIcon: { fontSize: 14 },
  toggleT: { fontSize: 13, fontWeight: '700', color: C.muted },
  toggleTActive: { color: C.white },

  // ── CTA Banner ──
  ctaBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 12, marginBottom: 4, backgroundColor: C.bgCard, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.borderE, overflow: 'hidden' },
  ctaGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.electric, opacity: 0.04 },
  ctaIcon: { fontSize: 28 },
  ctaTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  ctaSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  ctaArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.infoBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.borderE },

  // ── Search ──
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: C.border },
  searchIcon: { fontSize: 16, marginRight: 8, color: C.muted },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: C.text },

  // ── Filters ──
  filtersBar: { maxHeight: 52 },
  filtersContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  filterChipActive: { backgroundColor: C.infoBg, borderColor: C.borderE },
  filterIcon: { fontSize: 11 },
  filterT: { fontSize: 12, fontWeight: '600', color: C.muted },
  filterTActive: { color: C.electric, fontWeight: '700' },

  // ── Ops header ──
  opsHeader: { backgroundColor: C.navyL, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16, overflow: 'hidden' },
  opsHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  opsBrand: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 },
  opsTitle: { fontSize: 22, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  staffPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bgElevated, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: C.border },
  staffPillIcon: { fontSize: 20 },
  staffPillName: { fontSize: 12, fontWeight: '700', color: C.text },
  staffPillRol: { fontSize: 10, color: C.muted },
  kpiStrip: { flexDirection: 'row', gap: 8 },
  kpiItem: { flex: 1, backgroundColor: C.bgElevated, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1 },
  kpiN: { fontSize: 22, fontWeight: '900', letterSpacing: -1 },
  kpiL: { fontSize: 9, color: C.muted, marginTop: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  // ── Empty ──
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyT: { fontSize: 16, fontWeight: '800', color: C.textSub },
  emptyS: { fontSize: 13, color: C.muted, marginTop: 6 },
});


