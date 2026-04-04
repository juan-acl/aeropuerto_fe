import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { VUELOS, RETRASOS, CANCELACIONES, INCIDENTES_VUELO, COMBUSTIBLES } from '@/services/mockData';
import { ScreenHeader, SearchBar, DataCard, Badge, StatCard, FormModal, FF, EmptyState, ProgressBar, TabBar, StatsRow, AlertBanner } from '@/components/shared';
import { FlightCard } from '@/components/FlightCard';
import { C } from '@/constants/theme';

type Tab = 'vuelos' | 'retrasos' | 'cancelaciones' | 'incidentes' | 'combustible';

const TABS = [
  { k: 'vuelos',         l: '✈️ Vuelos' },
  { k: 'retrasos',       l: '⏱️ Retrasos' },
  { k: 'cancelaciones',  l: '❌ Cancelaciones' },
  { k: 'incidentes',     l: '⚠️ Incidentes' },
  { k: 'combustible',    l: '⛽ Combustible' },
];

const ESTADO_OPTIONS = ['PROGRAMADO','EN_VUELO','ATERRIZADO','DEMORADO','CANCELADO','DESVIADO'];

export default function Mod05() {
  const [tab, setTab] = useState<Tab>('vuelos');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [vuelos, setVuelos] = useState(VUELOS);
  const [retrasos, setRetrasos] = useState(RETRASOS);
  const [cancelaciones, setCancelaciones] = useState(CANCELACIONES);
  const [incidentes, setIncidentes] = useState(INCIDENTES_VUELO);
  const [combustibles, setCombustibles] = useState(COMBUSTIBLES);

  const stats = useMemo(() => ({
    enVuelo:    vuelos.filter(v => v.estado_vuelo === 'EN_VUELO').length,
    demorados:  vuelos.filter(v => v.estado_vuelo === 'DEMORADO').length,
    cancelados: vuelos.filter(v => v.estado_vuelo === 'CANCELADO').length,
    minRetraso: retrasos.reduce((s, r) => s + (r.minutos_retraso ?? 0), 0),
  }), [vuelos, retrasos]);

  const handleSave = () => {
    if (tab === 'retrasos') {
      if (!form.id_vuelo || !form.minutos) { Alert.alert('Error', 'ID Vuelo y minutos son requeridos'); return; }
      setRetrasos(d => [...d, {
        id_retraso: Date.now(), id_vuelo: Number(form.id_vuelo),
        tipo_retraso: form.tipo || 'OPERATIVO', causa: form.causa || '',
        minutos_retraso: Number(form.minutos), responsable: form.responsable || '',
        compensacion_pasajeros: 0,
      }]);
    } else if (tab === 'incidentes') {
      if (!form.id_vuelo || !form.desc) { Alert.alert('Error', 'ID Vuelo y descripción requeridos'); return; }
      setIncidentes(d => [...d, {
        id_incidente_vuelo: Date.now(), id_vuelo: Number(form.id_vuelo),
        tipo_incidente: form.tipo || 'TECNICO', descripcion: form.desc,
        gravedad: form.gravedad || 'BAJA', acciones_tomadas: form.acciones || '',
        reportado_por: form.reportado || '', fecha_incidente: new Date().toISOString(),
      }]);
    } else if (tab === 'cancelaciones') {
      if (!form.id_vuelo || !form.motivo) { Alert.alert('Error', 'ID Vuelo y motivo requeridos'); return; }
      setCancelaciones(d => [...d, {
        id_cancelacion: Date.now(), id_vuelo: Number(form.id_vuelo),
        motivo_principal: form.motivo, motivo_detallado: form.detalle || '',
        fecha_cancelacion: new Date().toISOString().split('T')[0],
        pasajeros_reubicados: Number(form.reubicados || 0),
        costo_compensacion: Number(form.costo || 0),
        notificado_a_pasajeros: 0,
      }]);
    }
    setModal(false); setForm({});
    Alert.alert('✅ Registrado', 'El registro fue guardado exitosamente.');
  };

  const changeEstadoVuelo = (id: number, actual: string) => {
    const options = ESTADO_OPTIONS.filter(e => e !== actual);
    Alert.alert('Cambiar Estado', `Estado actual: ${actual}`, [
      ...options.map(e => ({ text: e, onPress: () => {
        setVuelos(d => d.map(v => v.id_vuelo === id ? { ...v, estado_vuelo: e } : v));
        Alert.alert('✅ Actualizado', `Estado cambiado a ${e}`);
      }})),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const renderContent = () => {
    if (tab === 'vuelos') {
      const data = vuelos.filter(v => `${v.numero_vuelo} ${v.aeropuerto_origen} ${v.aeropuerto_destino}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={v => String(v.id_vuelo)}
          contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="✈️" text="Sin vuelos" sub="No hay vuelos que coincidan con la búsqueda" />}
          renderItem={({ item }) => (
            <View>
              <FlightCard vuelo={item} />
              <TouchableOpacity
                style={s.changeBtn}
                onPress={() => changeEstadoVuelo(item.id_vuelo, item.estado_vuelo)}
                activeOpacity={0.8}
              >
                <Text style={s.changeBtnT}>🔄 Cambiar estado</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      );
    }
    if (tab === 'retrasos') {
      const data = retrasos.filter(r => `${r.id_vuelo} ${r.tipo_retraso} ${r.causa}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={r => String(r.id_retraso)}
          contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="⏱️" text="Sin retrasos registrados" />}
          renderItem={({ item: r }) => (
            <DataCard
              title={`Vuelo #${r.id_vuelo} — ${r.tipo_retraso}`}
              subtitle={r.causa ?? 'Sin causa registrada'}
              badge={<Badge value={r.tipo_retraso} />}
              meta={`${r.minutos_retraso} min`}
              accentColor={C.warning}
              onDelete={() => setRetrasos(d => d.filter(x => x.id_retraso !== r.id_retraso))}
            >
              <Text style={s.cardDetail}>👤 Responsable: {r.responsable ?? '—'}</Text>
              <Text style={s.cardDetail}>💰 Compensación: {r.compensacion_pasajeros ? '✅ Aplicada' : '❌ Sin compensación'}</Text>
            </DataCard>
          )}
        />
      );
    }
    if (tab === 'cancelaciones') {
      const data = cancelaciones.filter(c => `${c.id_vuelo} ${c.motivo_principal}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={c => String(c.id_cancelacion)}
          contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="❌" text="Sin cancelaciones" />}
          renderItem={({ item: c }) => (
            <DataCard
              title={`Vuelo #${c.id_vuelo} — Cancelado`}
              subtitle={c.motivo_principal ?? '—'}
              badge={<Badge value={c.notificado_a_pasajeros ? 'ACTIVO' : 'PENDIENTE'} />}
              meta={c.costo_compensacion ? `Q ${(c.costo_compensacion).toLocaleString()}` : undefined}
              accentColor={C.danger}
              onDelete={() => setCancelaciones(d => d.filter(x => x.id_cancelacion !== c.id_cancelacion))}
            >
              <Text style={s.cardDetail}>✈️ {c.motivo_detallado ?? '—'}</Text>
              <Text style={s.cardDetail}>🧍 Reubicados: {c.pasajeros_reubicados ?? 0} pasajeros</Text>
              <Text style={s.cardDetail}>📅 {c.fecha_cancelacion}</Text>
            </DataCard>
          )}
        />
      );
    }
    if (tab === 'incidentes') {
      const data = incidentes.filter(i => `${i.id_vuelo} ${i.tipo_incidente} ${i.descripcion}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={i => String(i.id_incidente_vuelo)}
          contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="⚠️" text="Sin incidentes registrados" />}
          renderItem={({ item: i }) => (
            <DataCard
              title={`Vuelo #${i.id_vuelo} — ${i.tipo_incidente}`}
              subtitle={i.descripcion ?? '—'}
              badge={<Badge value={i.gravedad} />}
              meta={i.fecha_incidente?.split('T')[0]}
              accentColor={i.gravedad === 'ALTA' || i.gravedad === 'CRITICA' ? C.danger : C.warning}
              onDelete={() => setIncidentes(d => d.filter(x => x.id_incidente_vuelo !== i.id_incidente_vuelo))}
            >
              <Text style={s.cardDetail}>🔧 Acciones: {i.acciones_tomadas ?? '—'}</Text>
              <Text style={s.cardDetail}>👤 Reportado por: {i.reportado_por ?? '—'}</Text>
            </DataCard>
          )}
        />
      );
    }
    // Combustible
    const data = combustibles.filter(c => `${c.id_vuelo} ${c.tipo_combustible} ${c.proveedor}`.toLowerCase().includes(q.toLowerCase()));
    return (
      <FlatList data={data} keyExtractor={c => String(c.id_combustible)}
        contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="⛽" text="Sin registros de combustible" />}
        renderItem={({ item: c }) => (
          <DataCard
            title={`Vuelo #${c.id_vuelo} — ${c.tipo_combustible ?? 'JET-A1'}`}
            subtitle={`Proveedor: ${c.proveedor ?? '—'}`}
            badge={<Badge value={c.tipo_combustible ?? 'JET_A1'} />}
            meta={`Q ${(c.costo_total ?? 0).toLocaleString()}`}
            accentColor={C.orange}
            onDelete={() => setCombustibles(d => d.filter(x => x.id_combustible !== c.id_combustible))}
          >
            <ProgressBar
              value={c.combustible_real_litros ?? 0}
              max={c.combustible_planeado_litros ?? 1}
              label={`${(c.combustible_real_litros ?? 0).toLocaleString()} / ${(c.combustible_planeado_litros ?? 0).toLocaleString()} L`}
            />
          </DataCard>
        )}
      />
    );
  };

  const addLabel = tab === 'vuelos' ? undefined : '+ Registrar';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader
        title="Operaciones de Vuelo"
        subtitle="Vuelos, retrasos, cancelaciones e incidentes"
        onAdd={tab !== 'vuelos' ? () => { setForm({}); setModal(true); } : undefined}
        addLabel={addLabel}
      />
      <TabBar tabs={TABS} active={tab} onPress={(k) => { setTab(k as Tab); setQ(''); }} />

      {tab === 'vuelos' && stats.demorados > 0 && (
        <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
          <AlertBanner type="warning" message={`${stats.demorados} vuelo${stats.demorados > 1 ? 's' : ''} con retraso. Retraso total acumulado: ${stats.minRetraso} min.`} />
        </View>
      )}

      <StatsRow>
        <StatCard label="En Vuelo"  value={stats.enVuelo}           color={C.success} bg={C.successBg} icon="✈️" />
        <StatCard label="Demorados" value={stats.demorados}         color={C.warning} bg={C.warningBg} icon="⏱️" />
        <StatCard label="Cancelados" value={stats.cancelados}       color={C.danger}  bg={C.dangerBg}  icon="❌" />
        <StatCard label="Incidentes" value={incidentes.length}      color={C.orange}  bg={C.orangeBg}  icon="⚠️" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar en operaciones..." />
      {renderContent()}

      <FormModal visible={modal} title={
        tab === 'retrasos' ? 'Registrar Retraso' :
        tab === 'incidentes' ? 'Registrar Incidente' : 'Registrar Cancelación'
      } onClose={() => setModal(false)} onSave={handleSave}>
        <FF label="ID Vuelo" value={form.id_vuelo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, id_vuelo: t }))} keyboardType="numeric" required hint="Número de ID del vuelo afectado" />
        {tab === 'retrasos' && <>
          <FF label="Tipo de Retraso" value={form.tipo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, tipo: t }))} hint="Ej: OPERATIVO, METEOROLOGICO, TECNICO" />
          <FF label="Minutos de Retraso" value={form.minutos ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, minutos: t }))} keyboardType="numeric" required />
          <FF label="Causa" value={form.causa ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, causa: t }))} multiline />
          <FF label="Responsable" value={form.responsable ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, responsable: t }))} />
        </>}
        {tab === 'incidentes' && <>
          <FF label="Tipo de Incidente" value={form.tipo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, tipo: t }))} hint="Ej: TECNICO, SEGURIDAD, MEDICO" />
          <FF label="Gravedad" value={form.gravedad ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, gravedad: t }))} hint="BAJA / MEDIA / ALTA / CRITICA" required />
          <FF label="Descripción" value={form.desc ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, desc: t }))} multiline required />
          <FF label="Acciones Tomadas" value={form.acciones ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, acciones: t }))} multiline />
          <FF label="Reportado Por" value={form.reportado ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, reportado: t }))} />
        </>}
        {tab === 'cancelaciones' && <>
          <FF label="Motivo Principal" value={form.motivo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, motivo: t }))} required hint="Ej: METEOROLOGICO, TECNICO, HUELGA" />
          <FF label="Detalle" value={form.detalle ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, detalle: t }))} multiline />
          <FF label="Pasajeros Reubicados" value={form.reubicados ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, reubicados: t }))} keyboardType="numeric" />
          <FF label="Costo Compensación (Q)" value={form.costo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, costo: t }))} keyboardType="decimal-pad" />
        </>}
      </FormModal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  changeBtn: { marginTop: -6, marginBottom: 10, marginHorizontal: 2, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  changeBtnT: { fontSize: 13, fontWeight: '600', color: C.textSub },
  cardDetail: { fontSize: 12, color: C.muted, marginTop: 3, fontWeight: '500' },
});
