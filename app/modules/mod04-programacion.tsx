import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, SafeAreaView, Alert } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

type Tab = 'programas' | 'temporadas' | 'restricciones';

export default function Mod04() {
  const [PROGRAMAS_VUELO, set_PROGRAMAS_VUELO] = useState<any[]>([]);
  const [TEMPORADAS, set_TEMPORADAS] = useState<any[]>([]);
  const [RESTRICCIONES_VUELO, set_RESTRICCIONES_VUELO] = useState<any[]>([]);
  const [AEROLINEAS, set_AEROLINEAS] = useState<any[]>([]);
  useEffect(() => {
      backendApi.programasVuelo.listar().then(d => set_PROGRAMAS_VUELO(d)).catch(() => {});
      backendApi.temporadas.listar().then(d => set_TEMPORADAS(d)).catch(() => {});
      backendApi.frecuenciasVuelo.listar().then(d => set_RESTRICCIONES_VUELO(d)).catch(() => {});
      backendApi.aerolineas.listar().then(d => set_AEROLINEAS(d)).catch(() => {});
  }, []);

  const [tab, setTab] = useState<Tab>('programas');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [programas, setProgramas] = useState(PROGRAMAS_VUELO);
  const [temporadas, setTemporadas] = useState(TEMPORADAS);
  const [restricciones, setRestricciones] = useState(RESTRICCIONES_VUELO);

  const TABS = [{ k: 'programas', l: '📋 Programas' }, { k: 'temporadas', l: '📅 Temporadas' }, { k: 'restricciones', l: '⛔ Restricciones' }];

  const getAerolinea = (id: number) => AEROLINEAS.find(a => a.id_aerolinea === id)?.nombre_aerolinea ?? `Aerolínea ${id}`;

  const handleSave = () => {
    if (tab === 'programas') {
      if (!form.numero_vuelo) { Alert.alert('Error', 'Número de vuelo requerido'); return; }
      setProgramas(d => [...d, { id_programa: Date.now(), numero_vuelo: form.numero_vuelo, id_aerolinea: 1, aeropuerto_origen: form.origen || 'GUA', aeropuerto_destino: form.destino || '', tipo_vuelo: form.tipo_vuelo || 'INTERNACIONAL', duracion_estimada_minutos: Number(form.duracion || 0), distancia_km: Number(form.distancia || 0), clase_servicio: 'MIXTA', activo: 1 }]);
    } else if (tab === 'temporadas') {
      if (!form.nombre_temporada) { Alert.alert('Error', 'Nombre requerido'); return; }
      setTemporadas(d => [...d, { id_temporada: Date.now(), nombre_temporada: form.nombre_temporada, fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin, factor_demanda: Number(form.factor_demanda || 1), activa: 1 }]);
    } else {
      if (!form.descripcion) { Alert.alert('Error', 'Descripción requerida'); return; }
      setRestricciones(d => [...d, { id_restriccion: Date.now(), id_programa: Number(form.id_programa || 1), tipo_restriccion: form.tipo_restriccion || 'TECNICA', descripcion: form.descripcion, fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin, activa: 1 }]);
    }
    setModal(false); setForm({});
  };

  const renderContent = () => {
    if (tab === 'programas') {
      const data = programas.filter(p => `${p.numero_vuelo} ${p.aeropuerto_origen} ${p.aeropuerto_destino}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={p => String(p.id_programa)} contentContainerStyle={{ padding: 14 }}
          ListEmptyComponent={<EmptyState icon="📋" />}
          renderItem={({ item: p }) => (
            <DataCard title={`${p.numero_vuelo} – ${p.aeropuerto_origen} → ${p.aeropuerto_destino}`}
              subtitle={`${getAerolinea(p.id_aerolinea)} · ${p.tipo_vuelo}`}
              badge={<Badge value={p.activo ? 'ACTIVO' : 'INACTIVO'} />}
              meta={`${p.duracion_estimada_minutos ?? 0} min`} accentColor={C.purple}
              onDelete={() => setProgramas(d => d.filter(x => x.id_programa !== p.id_programa))}>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <Badge value={p.clase_servicio ?? 'ECONOMICA'} />
                {p.distancia_km ? <Text style={{ fontSize: 11, color: C.muted }}>📏 {p.distancia_km} km</Text> : null}
              </View>
            </DataCard>
          )} />
      );
    }
    if (tab === 'temporadas') {
      const data = temporadas.filter(t => (t.nombre_temporada ?? '').toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={t => String(t.id_temporada)} contentContainerStyle={{ padding: 14 }}
          ListEmptyComponent={<EmptyState icon="📅" />}
          renderItem={({ item: t }) => (
            <DataCard title={t.nombre_temporada ?? '—'} subtitle={`${t.fecha_inicio ?? '—'} → ${t.fecha_fin ?? '—'}`}
              badge={<Badge value={t.activa ? 'ACTIVO' : 'INACTIVO'} />}
              meta={`Factor: ${t.factor_demanda ?? 1}x`} accentColor={C.orange}
              onDelete={() => setTemporadas(d => d.filter(x => x.id_temporada !== t.id_temporada))} />
          )} />
      );
    }
    const data = restricciones.filter(r => (r.descripcion ?? '').toLowerCase().includes(q.toLowerCase()));
    return (
      <FlatList data={data} keyExtractor={r => String(r.id_restriccion)} contentContainerStyle={{ padding: 14 }}
        ListEmptyComponent={<EmptyState icon="⛔" />}
        renderItem={({ item: r }) => (
          <DataCard title={r.tipo_restriccion ?? '—'} subtitle={r.descripcion ?? '—'}
            badge={<Badge value={r.activa ? 'ACTIVO' : 'INACTIVO'} />}
            meta={`${r.fecha_inicio ?? '—'} → ${r.fecha_fin ?? '—'}`} accentColor={C.danger}
            onDelete={() => setRestricciones(d => d.filter(x => x.id_restriccion !== r.id_restriccion))} />
        )} />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="Programación de Vuelos" subtitle="Vuelos, temporadas y restricciones" onAdd={() => { setForm({}); setModal(true); }} />
      <View style={{ flexDirection: 'row', backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border }}>
        {TABS.map(t => (
          <View key={t.k} style={{ flex: 1, borderBottomWidth: 2, borderBottomColor: tab === t.k ? C.navy : 'transparent', paddingVertical: 10, alignItems: 'center' }}>
            <Text onPress={() => { setTab(t.k as Tab); setQ(''); }} style={{ fontSize: 11, fontWeight: '600', color: tab === t.k ? C.navy : C.muted }}>{t.l}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 10, padding: 12, backgroundColor:C.bgCard }}>
        <StatCard label="Programas" value={programas.length} color={C.purple} bg={C.purpleBg} icon="📋" />
        <StatCard label="Temporadas" value={temporadas.length} color={C.orange} bg={C.orangeBg} icon="📅" />
        <StatCard label="Restricciones" value={restricciones.filter(r => r.activa).length} color={C.danger} bg={C.dangerBg} icon="⛔" />
      </View>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar..." />
      {renderContent()}
      <FormModal visible={modal} title={`Nuevo – ${TABS.find(t => t.k === tab)?.l}`} onClose={() => setModal(false)} onSave={handleSave}>
        {tab === 'programas' && <>
          <FF label="Número de Vuelo *" value={form.numero_vuelo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, numero_vuelo: t }))} autoCapitalize="characters" />
          <FF label="Origen (cód. aeropuerto)" value={form.origen ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, origen: t }))} />
          <FF label="Destino (cód. aeropuerto)" value={form.destino ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, destino: t }))} />
          <FF label="Tipo (NACIONAL/INTERNACIONAL)" value={form.tipo_vuelo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, tipo_vuelo: t }))} />
          <FF label="Duración estimada (min)" value={String(form.duracion ?? '')} onChangeText={(t: string) => setForm((f: any) => ({ ...f, duracion: t }))} keyboardType="numeric" />
          <FF label="Distancia (km)" value={String(form.distancia ?? '')} onChangeText={(t: string) => setForm((f: any) => ({ ...f, distancia: t }))} keyboardType="numeric" />
        </>}
        {tab === 'temporadas' && <>
          <FF label="Nombre Temporada *" value={form.nombre_temporada ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, nombre_temporada: t }))} />
          <FF label="Fecha Inicio (YYYY-MM-DD)" value={form.fecha_inicio ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, fecha_inicio: t }))} />
          <FF label="Fecha Fin (YYYY-MM-DD)" value={form.fecha_fin ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, fecha_fin: t }))} />
          <FF label="Factor Demanda (0.5–2.0)" value={String(form.factor_demanda ?? '')} onChangeText={(t: string) => setForm((f: any) => ({ ...f, factor_demanda: t }))} keyboardType="decimal-pad" />
        </>}
        {tab === 'restricciones' && <>
          <FF label="ID Programa" value={String(form.id_programa ?? '')} onChangeText={(t: string) => setForm((f: any) => ({ ...f, id_programa: t }))} keyboardType="numeric" />
          <FF label="Tipo (CLIMATICA/POLITICA/SEGURIDAD/TECNICA)" value={form.tipo_restriccion ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, tipo_restriccion: t }))} />
          <FF label="Descripción *" value={form.descripcion ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, descripcion: t }))} multiline numberOfLines={2} />
          <FF label="Fecha Inicio" value={form.fecha_inicio ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, fecha_inicio: t }))} />
          <FF label="Fecha Fin" value={form.fecha_fin ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, fecha_fin: t }))} />
        </>}
      </FormModal>
    </SafeAreaView>
  );
}


