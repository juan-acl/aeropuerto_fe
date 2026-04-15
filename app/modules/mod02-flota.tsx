import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { backendApi } from '@/services/backendApi';
import { ScreenHeader, SearchBar, DataCard, Badge, StatCard, FormModal, FF, FSelect, FToggle, FormSection, EmptyState, TabBar, StatsRow, AlertBanner } from '@/components/shared';
import { C } from '@/constants/theme';

type Tab = 'modelos' | 'mantenimientos';
const TABS = [{ k: 'modelos', l: '✈️ Modelos' }, { k: 'mantenimientos', l: '🔧 Mantenimientos' }];
const FABRICANTES = [
  { label: 'Boeing', value: 'Boeing' }, { label: 'Airbus', value: 'Airbus' },
  { label: 'Embraer', value: 'Embraer' }, { label: 'Bombardier', value: 'Bombardier' },
  { label: 'ATR', value: 'ATR' }, { label: 'Cessna', value: 'Cessna' }, { label: 'Otro', value: 'Otro' },
];
const TIPOS_MOTOR = [{ label: 'Turbofán', value: 'TURBOFAN' }, { label: 'Turbohélice', value: 'TURBOPROP' }, { label: 'Turborreactor', value: 'TURBOJET' }, { label: 'Pistón', value: 'PISTON' }];
const TIPOS_MANT = [
  { label: 'Mantenimiento preventivo (A-Check)', value: 'PREVENTIVO' },
  { label: 'Mantenimiento correctivo', value: 'CORRECTIVO' },
  { label: 'Mantenimiento mayor (C-Check / D-Check)', value: 'MAYOR' },
  { label: 'Mantenimiento predictivo', value: 'PREDICTIVO' },
  { label: 'Revisión de línea', value: 'LINEA' },
];

export default function FlotaAerea() {
  const [MODELOS_AVIONES, set_MODELOS_AVIONES] = useState<any[]>([]);
  const [MANTENIMIENTOS_AVION, set_MANTENIMIENTOS_AVION] = useState<any[]>([]);
  useEffect(() => {
      backendApi.modelosAvion.listar().then(d => set_MODELOS_AVIONES(d)).catch(() => {});
      backendApi.mantenimientoAviones.listar().then(d => set_MANTENIMIENTOS_AVION(d)).catch(() => {});
  }, []);

  const [tab, setTab] = useState<Tab>('modelos');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [modelos, setModelos] = useState<any[]>(MODELOS_AVIONES);
  const [mantenimientos, setMantenimientos] = useState<any[]>(MANTENIMIENTOS_AVION);

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const openNew = () => { setEditItem(null); setForm({ activo: true }); setModal(true); };
  const openEdit = (item: any) => { setEditItem(item); setForm({ ...item, activo: !!item.activo }); setModal(true); };

  const handleSave = () => {
    if (tab === 'modelos') {
      if (!form.nombre_modelo?.trim()) { Alert.alert('Campo requerido', 'El nombre del modelo es obligatorio.'); return; }
      if (!form.fabricante) { Alert.alert('Campo requerido', 'Selecciona el fabricante.'); return; }
      const entry = { id_modelo: editItem?.id_modelo ?? Date.now(), nombre_modelo: form.nombre_modelo.trim(), fabricante: form.fabricante, codigo_iata: form.codigo_iata ?? '', capacidad_pasajeros: Number(form.capacidad_pasajeros) || 0, capacidad_carga_kg: Number(form.capacidad_carga_kg) || 0, autonomia_km: Number(form.autonomia_km) || 0, velocidad_crucero_kmh: Number(form.velocidad_crucero_kmh) || 0, tripulacion_minima: Number(form.tripulacion_minima) || 2, tipo_motor: form.tipo_motor ?? '', motores_cantidad: Number(form.motores_cantidad) || 2, activo: form.activo ? 1 : 0 };
      if (editItem) setModelos(d => d.map(x => x.id_modelo === editItem.id_modelo ? entry : x));
      else setModelos(d => [...d, entry]);
    } else {
      if (!form.matricula_avion?.trim() || !form.tipo_mantenimiento) { Alert.alert('Campos requeridos', 'Matrícula y tipo de mantenimiento son obligatorios.'); return; }
      const entry = { id_mantenimiento: editItem?.id_mantenimiento ?? Date.now(), matricula_avion: form.matricula_avion.trim().toUpperCase(), tipo_mantenimiento: form.tipo_mantenimiento, fecha_mantenimiento: form.fecha_mantenimiento ?? new Date().toISOString().split('T')[0], fecha_proximo: form.fecha_proximo ?? '', taller: form.taller ?? '', tecnico_responsable: form.tecnico_responsable ?? '', horas_trabajo: Number(form.horas_trabajo) || 0, costo: Number(form.costo) || 0, observaciones: form.observaciones ?? '' };
      if (editItem) setMantenimientos(d => d.map(x => x.id_mantenimiento === editItem.id_mantenimiento ? entry : x));
      else setMantenimientos(d => [...d, entry]);
    }
    setModal(false); setForm({});
    Alert.alert('✅ Guardado', editItem ? 'Registro actualizado.' : 'Registro creado.');
  };

  const proxMant = mantenimientos.filter(m => m.fecha_proximo && m.fecha_proximo <= new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]).length;

  const renderContent = () => {
    if (tab === 'modelos') {
      const data = modelos.filter(m => `${m.nombre_modelo} ${m.fabricante} ${m.codigo_iata ?? ''}`.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={m => String(m.id_modelo)} contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="✈️" text="Sin modelos registrados" />}
        renderItem={({ item: m }) => (
          <DataCard title={m.nombre_modelo} subtitle={`${m.fabricante} · ${m.codigo_iata ?? '—'}`}
            badge={<Badge value={m.activo ? 'ACTIVO' : 'INACTIVO'} />}
            meta={m.capacidad_pasajeros ? `${m.capacidad_pasajeros} pax` : undefined} accentColor={C.teal}
            onEdit={() => openEdit(m)} onDelete={() => setModelos(d => d.filter(x => x.id_modelo !== m.id_modelo))}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {m.autonomia_km ? <Text style={{ fontSize: 11, color: C.muted }}>🛣️ {m.autonomia_km?.toLocaleString()} km</Text> : null}
              {m.velocidad_crucero_kmh ? <Text style={{ fontSize: 11, color: C.muted }}>💨 {m.velocidad_crucero_kmh} km/h</Text> : null}
              {m.tripulacion_minima ? <Text style={{ fontSize: 11, color: C.muted }}>👨‍✈️ Trip. mín: {m.tripulacion_minima}</Text> : null}
              {m.tipo_motor ? <Text style={{ fontSize: 11, color: C.muted }}>⚙️ {m.tipo_motor}</Text> : null}
            </View>
          </DataCard>
        )} />;
    }
    const data = mantenimientos.filter(m => `${m.matricula_avion} ${m.tipo_mantenimiento} ${m.taller ?? ''}`.toLowerCase().includes(q.toLowerCase()));
    return <FlatList data={data} keyExtractor={m => String(m.id_mantenimiento)} contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
      ListEmptyComponent={<EmptyState icon="🔧" text="Sin registros de mantenimiento" />}
      renderItem={({ item: m }) => (
        <DataCard title={`${m.matricula_avion} · ${m.tipo_mantenimiento}`} subtitle={`Taller: ${m.taller ?? '—'} · ${m.fecha_mantenimiento ?? '—'}`}
          badge={<Badge value={m.tipo_mantenimiento} />}
          meta={m.costo ? `Q ${Number(m.costo).toLocaleString()}` : undefined} accentColor={C.warning}
          onEdit={() => openEdit(m)} onDelete={() => setMantenimientos(d => d.filter(x => x.id_mantenimiento !== m.id_mantenimiento))}>
          <View style={{ gap: 3 }}>
            {m.tecnico_responsable ? <Text style={{ fontSize: 11, color: C.muted }}>👷 {m.tecnico_responsable}</Text> : null}
            {m.horas_trabajo ? <Text style={{ fontSize: 11, color: C.muted }}>⏱️ {m.horas_trabajo} horas de trabajo</Text> : null}
            {m.fecha_proximo ? <Text style={{ fontSize: 11, color: C.info }}>📅 Próximo: {m.fecha_proximo}</Text> : null}
            {m.observaciones ? <Text style={{ fontSize: 11, color: C.muted }}>📝 {m.observaciones}</Text> : null}
          </View>
        </DataCard>
      )} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="Flota Aérea" subtitle="Modelos de aeronaves y mantenimientos" onAdd={openNew} />
      <TabBar tabs={TABS} active={tab} onPress={k => { setTab(k as Tab); setQ(''); }} />
      {proxMant > 0 && <View style={{ paddingTop: 10 }}><AlertBanner type="warning" message={`${proxMant} mantenimiento${proxMant > 1 ? 's' : ''} programado${proxMant > 1 ? 's' : ''} en los próximos 7 días.`} /></View>}
      <StatsRow>
        <StatCard label="Modelos" value={modelos.length} color={C.teal} bg={C.tealBg} icon="✈️" />
        <StatCard label="Activos" value={modelos.filter(m => m.activo).length} color={C.success} bg={C.successBg} icon="✅" />
        <StatCard label="Mantenimientos" value={mantenimientos.length} color={C.warning} bg={C.warningBg} icon="🔧" />
        <StatCard label="Próximos" value={proxMant} color={proxMant > 0 ? C.danger : C.success} bg={proxMant > 0 ? C.dangerBg : C.successBg} icon="📅" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder={tab === 'modelos' ? 'Buscar por modelo, fabricante...' : 'Buscar por matrícula, taller...'} />
      {renderContent()}

      <FormModal visible={modal} title={editItem ? 'Editar registro' : tab === 'modelos' ? 'Nuevo Modelo de Aeronave' : 'Registrar Mantenimiento'}
        onClose={() => setModal(false)} onSave={handleSave} saveLabel={editItem ? 'Actualizar' : 'Guardar'}>

        {tab === 'modelos' && <>
          <FormSection title="Identificación del modelo" icon="✈️" />
          <FF label="Nombre del modelo" required value={form.nombre_modelo ?? ''} onChangeText={set('nombre_modelo')} placeholder="Ej: Boeing 737-800, Airbus A320" />
          <FSelect label="Fabricante" required value={form.fabricante ?? ''} onChange={set('fabricante')} options={FABRICANTES} />
          <FF label="Código IATA del modelo" value={form.codigo_iata ?? ''} onChangeText={set('codigo_iata')} placeholder="Ej: 738, 320" autoCapitalize="characters" hint="Código de 3 caracteres para planificación" />
          <FormSection title="Capacidad" icon="💺" />
          <FF label="Capacidad de pasajeros" value={String(form.capacidad_pasajeros ?? '')} onChangeText={set('capacidad_pasajeros')} keyboardType="numeric" placeholder="Ej: 162" />
          <FF label="Capacidad de carga (kg)" value={String(form.capacidad_carga_kg ?? '')} onChangeText={set('capacidad_carga_kg')} keyboardType="numeric" />
          <FF label="Tripulación mínima" value={String(form.tripulacion_minima ?? '2')} onChangeText={set('tripulacion_minima')} keyboardType="numeric" />
          <FormSection title="Rendimiento" icon="⚡" />
          <FF label="Autonomía (km)" value={String(form.autonomia_km ?? '')} onChangeText={set('autonomia_km')} keyboardType="numeric" placeholder="Ej: 5765" />
          <FF label="Velocidad de crucero (km/h)" value={String(form.velocidad_crucero_kmh ?? '')} onChangeText={set('velocidad_crucero_kmh')} keyboardType="numeric" placeholder="Ej: 842" />
          <FSelect label="Tipo de motor" value={form.tipo_motor ?? ''} onChange={set('tipo_motor')} options={TIPOS_MOTOR} />
          <FF label="Cantidad de motores" value={String(form.motores_cantidad ?? '2')} onChangeText={set('motores_cantidad')} keyboardType="numeric" />
          <FToggle label="Modelo activo en flota" value={form.activo !== false && form.activo !== 0} onChange={v => set('activo')(v)} />
        </>}

        {tab === 'mantenimientos' && <>
          <FormSection title="Aeronave" icon="✈️" />
          <FF label="Matrícula de la aeronave" required value={form.matricula_avion ?? ''} onChangeText={set('matricula_avion')} autoCapitalize="characters" placeholder="Ej: TG-ANA, N737BA" hint="Matrícula oficial de la aeronave" />
          <FormSection title="Tipo y fechas" icon="📅" />
          <FSelect label="Tipo de mantenimiento" required value={form.tipo_mantenimiento ?? ''} onChange={set('tipo_mantenimiento')} options={TIPOS_MANT} />
          <FF label="Fecha de realización" value={form.fecha_mantenimiento ?? ''} onChangeText={set('fecha_mantenimiento')} placeholder="YYYY-MM-DD" />
          <FF label="Fecha de próximo mantenimiento" value={form.fecha_proximo ?? ''} onChangeText={set('fecha_proximo')} placeholder="YYYY-MM-DD" hint="Fecha estimada del siguiente mantenimiento" />
          <FormSection title="Ejecución" icon="🔧" />
          <FF label="Taller / Centro de mantenimiento" value={form.taller ?? ''} onChangeText={set('taller')} placeholder="Ej: Hangar Central Aurora, MRO GTM" />
          <FF label="Técnico responsable" value={form.tecnico_responsable ?? ''} onChangeText={set('tecnico_responsable')} placeholder="Nombre del técnico a cargo" />
          <FF label="Horas de trabajo" value={String(form.horas_trabajo ?? '')} onChangeText={set('horas_trabajo')} keyboardType="numeric" placeholder="Ej: 12" />
          <FF label="Costo total (Q)" value={String(form.costo ?? '')} onChangeText={set('costo')} keyboardType="decimal-pad" placeholder="Ej: 15000.00" />
          <FF label="Observaciones técnicas" value={form.observaciones ?? ''} onChangeText={set('observaciones')} multiline placeholder="Piezas reemplazadas, hallazgos, recomendaciones..." />
        </>}
      </FormModal>
    </SafeAreaView>
  );
}


