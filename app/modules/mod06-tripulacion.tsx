import React, { useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { TRIPULANTES, CERTIFICACIONES_TRIPULACION, DISPONIBILIDADES } from '@/services/mockData';
import { ScreenHeader, SearchBar, DataCard, Badge, StatCard, FormModal, FF, FSelect, FToggle, FormSection, EmptyState, TabBar, StatsRow, AlertBanner } from '@/components/shared';
import { C } from '@/constants/theme';

type Tab = 'tripulantes' | 'certificaciones' | 'disponibilidad';
const TABS = [{ k: 'tripulantes', l: '👨‍✈️ Tripulantes' }, { k: 'certificaciones', l: '🏅 Certificaciones' }, { k: 'disponibilidad', l: '📅 Disponibilidad' }];
const TIPOS_TRIPULANTE = [
  { label: 'Piloto al mando (Capitán)', value: 'PILOTO' },
  { label: 'Copiloto (Primer Oficial)', value: 'COPILOTO' },
  { label: 'Sobrecargo (Jefe cabina)', value: 'SOBRECARGO' },
  { label: 'Ingeniero de vuelo', value: 'INGENIERO' },
  { label: 'Auxiliar de cabina', value: 'AUXILIAR' },
];
const TIPOS_CERT = [
  { label: 'Licencia de Piloto Privado (PPL)', value: 'PPL' },
  { label: 'Licencia de Piloto Comercial (CPL)', value: 'CPL' },
  { label: 'Licencia de Piloto de Transporte de Línea Aérea (ATPL)', value: 'ATPL' },
  { label: 'Habilitación de tipo de aeronave', value: 'TIPO_AERONAVE' },
  { label: 'Certificado médico Clase 1', value: 'MEDICO_CLASE1' },
  { label: 'Certificado médico Clase 2', value: 'MEDICO_CLASE2' },
  { label: 'Certificación de seguridad (Security)', value: 'SEGURIDAD' },
  { label: 'Certificación de emergencias', value: 'EMERGENCIAS' },
  { label: 'Inglés aeronáutico (ICAO)', value: 'INGLES_ICAO' },
];

export default function Tripulacion() {
  const [tab, setTab] = useState<Tab>('tripulantes');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [tripulantes, setTripulantes] = useState(TRIPULANTES);
  const [certs, setCerts] = useState(CERTIFICACIONES_TRIPULACION);
  const [disps, setDisps] = useState(DISPONIBILIDADES);

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const openNew = () => { setEditItem(null); setForm({ activo: true, disponible: true }); setModal(true); };
  const openEdit = (item: any) => { setEditItem(item); setForm({ ...item, activo: !!item.activo, disponible: !!item.disponible, activa: !!item.activa }); setModal(true); };

  const handleSave = () => {
    if (tab === 'tripulantes') {
      if (!form.nombres?.trim() || !form.apellidos?.trim()) { Alert.alert('Campos requeridos', 'Nombres y apellidos son obligatorios.'); return; }
      if (!form.tipo_tripulante) { Alert.alert('Campo requerido', 'Selecciona el tipo de tripulante.'); return; }
      const entry = { id_tripulante: editItem?.id_tripulante ?? Date.now(), nombres: form.nombres.trim(), apellidos: form.apellidos.trim(), tipo_tripulante: form.tipo_tripulante, licencia: form.licencia ?? '', fecha_vencimiento_licencia: form.fecha_vencimiento_licencia ?? '', horas_vuelo_acumuladas: Number(form.horas_vuelo_acumuladas) || 0, nacionalidad: form.nacionalidad ?? '', email: form.email ?? '', telefono: form.telefono ?? '', activo: form.activo ? 1 : 0 };
      if (editItem) setTripulantes(d => d.map(x => x.id_tripulante === editItem.id_tripulante ? entry : x));
      else setTripulantes(d => [...d, entry]);
    } else if (tab === 'certificaciones') {
      if (!form.id_tripulante || !form.tipo_certificacion) { Alert.alert('Campos requeridos', 'Tripulante y tipo de certificación son obligatorios.'); return; }
      const entry = { id_certificacion: editItem?.id_certificacion ?? Date.now(), id_tripulante: Number(form.id_tripulante), tipo_certificacion: form.tipo_certificacion, fecha_obtencion: form.fecha_obtencion ?? '', fecha_vencimiento: form.fecha_vencimiento ?? '', entidad_certificadora: form.entidad_certificadora ?? '', numero_certificado: form.numero_certificado ?? '', activa: form.activa ? 1 : 0 };
      if (editItem) setCerts(d => d.map(x => x.id_certificacion === editItem.id_certificacion ? entry : x));
      else setCerts(d => [...d, entry]);
    } else {
      if (!form.id_tripulante || !form.fecha_inicio || !form.fecha_fin) { Alert.alert('Campos requeridos', 'Tripulante y fechas son obligatorios.'); return; }
      if (form.fecha_inicio > form.fecha_fin) { Alert.alert('Error de fechas', 'La fecha de inicio debe ser anterior a la fecha fin.'); return; }
      const entry = { id_disponibilidad: editItem?.id_disponibilidad ?? Date.now(), id_tripulante: Number(form.id_tripulante), fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin, horas_maximas_diarias: Number(form.horas_maximas_diarias) || 8, disponible: form.disponible ? 1 : 0, observaciones: form.observaciones ?? '' };
      if (editItem) setDisps(d => d.map(x => x.id_disponibilidad === editItem.id_disponibilidad ? entry : x));
      else setDisps(d => [...d, entry]);
    }
    setModal(false); setForm({});
    Alert.alert('✅ Guardado', editItem ? 'Registro actualizado.' : 'Registro creado.');
  };

  const tripOptions = tripulantes.map(t => ({ label: `${t.nombres} ${t.apellidos} (${t.tipo_tripulante})`, value: String(t.id_tripulante) }));
  const hoyVencidos = certs.filter(c => c.fecha_vencimiento && c.fecha_vencimiento < new Date().toISOString().split('T')[0] && c.activa).length;

  const renderContent = () => {
    if (tab === 'tripulantes') {
      const data = tripulantes.filter(t => `${t.nombres} ${t.apellidos} ${t.tipo_tripulante} ${t.licencia ?? ''}`.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={t => String(t.id_tripulante)} contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="👨‍✈️" text="Sin tripulantes" sub="Agrega el primer tripulante con + Nuevo" />}
        renderItem={({ item: t }) => (
          <DataCard title={`${t.nombres} ${t.apellidos}`} subtitle={`Lic: ${t.licencia ?? '—'} · ${t.nacionalidad ?? '—'}`}
            badge={<Badge value={t.tipo_tripulante} />} meta={t.horas_vuelo_acumuladas ? `${t.horas_vuelo_acumuladas?.toLocaleString()} h` : undefined}
            accentColor={t.tipo_tripulante === 'PILOTO' ? C.navy : t.tipo_tripulante === 'COPILOTO' ? C.teal : C.purple}
            onEdit={() => openEdit(t)} onDelete={() => setTripulantes(d => d.filter(x => x.id_tripulante !== t.id_tripulante))}>
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
              {t.email && <Text style={{ fontSize: 11, color: C.muted }}>✉️ {t.email}</Text>}
              {t.telefono && <Text style={{ fontSize: 11, color: C.muted }}>📞 {t.telefono}</Text>}
              {t.fecha_vencimiento_licencia && <Text style={{ fontSize: 11, color: t.fecha_vencimiento_licencia < new Date().toISOString().split('T')[0] ? C.danger : C.muted }}>⏳ Licencia vence: {t.fecha_vencimiento_licencia}</Text>}
            </View>
          </DataCard>
        )} />;
    }
    if (tab === 'certificaciones') {
      const data = certs.filter(c => `${c.tipo_certificacion} ${c.entidad_certificadora}`.toLowerCase().includes(q.toLowerCase()));
      const tripMap = Object.fromEntries(tripulantes.map(t => [t.id_tripulante, `${t.nombres} ${t.apellidos}`]));
      return <FlatList data={data} keyExtractor={c => String(c.id_certificacion)} contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="🏅" text="Sin certificaciones" />}
        renderItem={({ item: c }) => {
          const vencida = c.fecha_vencimiento && c.fecha_vencimiento < new Date().toISOString().split('T')[0];
          return <DataCard title={c.tipo_certificacion ?? '—'} subtitle={tripMap[c.id_tripulante] ?? `Tripulante #${c.id_tripulante}`}
            badge={<Badge value={vencida ? 'VENCIDO' : c.activa ? 'ACTIVO' : 'INACTIVO'} />}
            meta={c.fecha_vencimiento ? `Vence: ${c.fecha_vencimiento}` : undefined}
            accentColor={vencida ? C.danger : C.purple}
            onEdit={() => openEdit(c)} onDelete={() => setCerts(d => d.filter(x => x.id_certificacion !== c.id_certificacion))}>
            <Text style={{ fontSize: 11, color: C.muted }}>🏛️ {c.entidad_certificadora ?? '—'} · Obtenida: {c.fecha_obtencion ?? '—'}</Text>
          </DataCard>;
        }} />;
    }
    const data = disps.filter(d => `${d.fecha_inicio} ${d.fecha_fin} ${d.observaciones ?? ''}`.toLowerCase().includes(q.toLowerCase()));
    const tripMap = Object.fromEntries(tripulantes.map(t => [t.id_tripulante, `${t.nombres} ${t.apellidos}`]));
    return <FlatList data={data} keyExtractor={d => String(d.id_disponibilidad)} contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
      ListEmptyComponent={<EmptyState icon="📅" text="Sin registros de disponibilidad" />}
      renderItem={({ item: d }) => (
        <DataCard title={tripMap[d.id_tripulante] ?? `Tripulante #${d.id_tripulante}`}
          subtitle={`${d.fecha_inicio} → ${d.fecha_fin}`}
          badge={<Badge value={d.disponible ? 'DISPONIBLE' : 'INACTIVO'} />}
          meta={`${d.horas_maximas_diarias ?? 8} h/día`}
          accentColor={d.disponible ? C.success : C.danger}
          onEdit={() => openEdit(d)} onDelete={() => setDisps(x => x.filter(y => y.id_disponibilidad !== d.id_disponibilidad))}>
          {d.observaciones ? <Text style={{ fontSize: 11, color: C.muted }}>📝 {d.observaciones}</Text> : null}
        </DataCard>
      )} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="Gestión de Tripulación" subtitle="Tripulantes, certificaciones y disponibilidad" onAdd={openNew} />
      <TabBar tabs={TABS} active={tab} onPress={k => { setTab(k as Tab); setQ(''); }} />
      {hoyVencidos > 0 && <View style={{ paddingTop: 10 }}><AlertBanner type="error" message={`${hoyVencidos} certificación${hoyVencidos > 1 ? 'es' : ''} vencida${hoyVencidos > 1 ? 's' : ''}. Requieren renovación inmediata.`} /></View>}
      <StatsRow>
        <StatCard label="Total" value={tripulantes.length} color={C.navy} bg={C.infoBg} icon="👨‍✈️" />
        <StatCard label="Activos" value={tripulantes.filter(t => t.activo).length} color={C.success} bg={C.successBg} icon="✅" />
        <StatCard label="Pilotos" value={tripulantes.filter(t => t.tipo_tripulante === 'PILOTO').length} color={C.teal} bg={C.tealBg} icon="🎖️" />
        <StatCard label="Certs." value={certs.length} color={C.purple} bg={C.purpleBg} icon="🏅" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar tripulación..." />
      {renderContent()}

      <FormModal visible={modal} title={editItem ? 'Editar registro' : tab === 'tripulantes' ? 'Nuevo Tripulante' : tab === 'certificaciones' ? 'Nueva Certificación' : 'Registrar Disponibilidad'}
        onClose={() => setModal(false)} onSave={handleSave} saveLabel={editItem ? 'Actualizar' : 'Guardar'}>

        {tab === 'tripulantes' && <>
          <FormSection title="Datos personales" icon="👤" />
          <FF label="Nombres" required value={form.nombres ?? ''} onChangeText={set('nombres')} placeholder="Ej: Carlos Andrés" />
          <FF label="Apellidos" required value={form.apellidos ?? ''} onChangeText={set('apellidos')} placeholder="Ej: López Mendoza" />
          <FF label="Nacionalidad" value={form.nacionalidad ?? ''} onChangeText={set('nacionalidad')} placeholder="Ej: Guatemalteca" />
          <FF label="Email institucional" value={form.email ?? ''} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" placeholder="Ej: c.lopez@aurora.aero" />
          <FF label="Teléfono" value={form.telefono ?? ''} onChangeText={set('telefono')} keyboardType="phone-pad" />
          <FormSection title="Información de vuelo" icon="✈️" />
          <FSelect label="Tipo de tripulante" required value={form.tipo_tripulante ?? ''} onChange={set('tipo_tripulante')} options={TIPOS_TRIPULANTE} />
          <FF label="Número de licencia" value={form.licencia ?? ''} onChangeText={set('licencia')} placeholder="Ej: DGAC-GT-00123" autoCapitalize="characters" />
          <FF label="Vencimiento de licencia" value={form.fecha_vencimiento_licencia ?? ''} onChangeText={set('fecha_vencimiento_licencia')} placeholder="YYYY-MM-DD" hint="Formato: año-mes-día" />
          <FF label="Horas de vuelo acumuladas" value={String(form.horas_vuelo_acumuladas ?? '')} onChangeText={set('horas_vuelo_acumuladas')} keyboardType="numeric" placeholder="Ej: 4500" />
          <FToggle label="Tripulante activo" value={form.activo !== false && form.activo !== 0} onChange={v => set('activo')(v)} />
        </>}

        {tab === 'certificaciones' && <>
          <FormSection title="Tripulante" icon="👨‍✈️" />
          <FSelect label="Tripulante" required value={String(form.id_tripulante ?? '')} onChange={set('id_tripulante')} options={tripOptions} hint="Selecciona a quién se asigna esta certificación" />
          <FormSection title="Certificación" icon="🏅" />
          <FSelect label="Tipo de certificación" required value={form.tipo_certificacion ?? ''} onChange={set('tipo_certificacion')} options={TIPOS_CERT} />
          <FF label="Entidad certificadora" value={form.entidad_certificadora ?? ''} onChangeText={set('entidad_certificadora')} placeholder="Ej: DGAC Guatemala, FAA, EASA" />
          <FF label="Número de certificado" value={form.numero_certificado ?? ''} onChangeText={set('numero_certificado')} autoCapitalize="characters" />
          <FormSection title="Vigencia" icon="📅" />
          <FF label="Fecha de obtención" value={form.fecha_obtencion ?? ''} onChangeText={set('fecha_obtencion')} placeholder="YYYY-MM-DD" />
          <FF label="Fecha de vencimiento" value={form.fecha_vencimiento ?? ''} onChangeText={set('fecha_vencimiento')} placeholder="YYYY-MM-DD" />
          <FToggle label="Certificación activa/vigente" value={form.activa !== false && form.activa !== 0} onChange={v => set('activa')(v)} />
        </>}

        {tab === 'disponibilidad' && <>
          <FormSection title="Tripulante" icon="👨‍✈️" />
          <FSelect label="Tripulante" required value={String(form.id_tripulante ?? '')} onChange={set('id_tripulante')} options={tripOptions} />
          <FormSection title="Período de disponibilidad" icon="📅" />
          <FF label="Fecha inicio" required value={form.fecha_inicio ?? ''} onChangeText={set('fecha_inicio')} placeholder="YYYY-MM-DD" hint="Primer día disponible" />
          <FF label="Fecha fin" required value={form.fecha_fin ?? ''} onChangeText={set('fecha_fin')} placeholder="YYYY-MM-DD" hint="Último día disponible" />
          <FF label="Horas máximas por día" value={String(form.horas_maximas_diarias ?? '8')} onChangeText={set('horas_maximas_diarias')} keyboardType="numeric" hint="Límite reglamentario diario" />
          <FToggle label="Disponible para asignación" value={form.disponible !== false && form.disponible !== 0} onChange={v => set('disponible')(v)} hint="Desactivar si está en descanso obligatorio" />
          <FF label="Observaciones" value={form.observaciones ?? ''} onChangeText={set('observaciones')} multiline placeholder="Ej: Vacaciones programadas, restricción médica temporal..." />
        </>}
      </FormModal>
    </SafeAreaView>
  );
}
