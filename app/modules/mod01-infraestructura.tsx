import React, { useState } from 'react';
import { View, FlatList, Text, SafeAreaView, Alert } from 'react-native';
import { AEROPUERTOS, PISTAS, PUERTAS } from '@/services/mockData';
import { Aeropuerto, PistaAterrizaje, PuertaEmbarque } from '@/types';
import { ScreenHeader, SearchBar, DataCard, Badge, StatCard, FormModal, FF, FSelect, FToggle, FormSection, EmptyState, TabBar, StatsRow } from '@/components/shared';
import { C } from '@/constants/theme';

type Tab = 'aeropuertos' | 'pistas' | 'puertas';
const TABS = [{ k: 'aeropuertos', l: '🏢 Aeropuertos' }, { k: 'pistas', l: '🛬 Pistas' }, { k: 'puertas', l: '🚪 Puertas' }];

export default function Infraestructura() {
  const [tab, setTab] = useState<Tab>('aeropuertos');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [aeropuertos, setAeropuertos] = useState<Aeropuerto[]>(AEROPUERTOS);
  const [pistas, setPistas] = useState<PistaAterrizaje[]>(PISTAS);
  const [puertas, setPuertas] = useState<PuertaEmbarque[]>(PUERTAS);

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const openNew = () => { setEditItem(null); setForm({}); setModal(true); };
  const openEdit = (item: any) => { setEditItem(item); setForm({ ...item }); setModal(true); };

  const handleSave = () => {
    if (tab === 'aeropuertos') {
      if (!form.codigo_aeropuerto?.trim() || !form.nombre?.trim()) {
        Alert.alert('Campos requeridos', 'Código IATA y nombre son obligatorios.'); return;
      }
      if (editItem) {
        setAeropuertos(d => d.map(x => x.codigo_aeropuerto === editItem.codigo_aeropuerto ? { ...x, ...form } : x));
      } else {
        if (aeropuertos.find(a => a.codigo_aeropuerto === form.codigo_aeropuerto.toUpperCase())) {
          Alert.alert('Código duplicado', 'Ya existe un aeropuerto con ese código IATA.'); return;
        }
        setAeropuertos(d => [...d, { ...form, codigo_aeropuerto: form.codigo_aeropuerto.toUpperCase(), activo: form.activo ?? 1 } as Aeropuerto]);
      }
    } else if (tab === 'pistas') {
      if (!form.numero_pista?.trim()) { Alert.alert('Campo requerido', 'El número de pista es obligatorio.'); return; }
      const entry = {
        id_pista: editItem?.id_pista ?? Date.now(),
        codigo_aeropuerto: form.codigo_aeropuerto || 'GUA',
        numero_pista: form.numero_pista,
        longitud_metros: Number(form.longitud_metros) || 0,
        anchura_metros: Number(form.anchura_metros) || 0,
        superficie: form.superficie || 'ASFALTO',
        orientacion_grados: Number(form.orientacion_grados) || 0,
        categoria_oaci: form.categoria_oaci || '',
        iluminacion_nocturna: form.iluminacion_nocturna ? 1 : 0,
        sistema_ils: form.sistema_ils ? 1 : 0,
        activo: form.activo !== false ? 1 : 0,
      };
      if (editItem) setPistas(d => d.map(x => x.id_pista === editItem.id_pista ? entry : x));
      else setPistas(d => [...d, entry]);
    } else {
      if (!form.numero_puerta?.trim()) { Alert.alert('Campo requerido', 'El número de puerta es obligatorio.'); return; }
      const entry = {
        id_puerta: editItem?.id_puerta ?? Date.now(),
        codigo_aeropuerto: form.codigo_aeropuerto || 'GUA',
        numero_puerta: form.numero_puerta,
        terminal: form.terminal || 'A',
        tipo_puerta: form.tipo_puerta || 'MIXTA',
        capacidad_maxima: Number(form.capacidad_maxima) || 0,
        tiene_pasarela: form.tiene_pasarela ? 1 : 0,
        activo: form.activo !== false ? 1 : 0,
      };
      if (editItem) setPuertas(d => d.map(x => x.id_puerta === editItem.id_puerta ? entry : x));
      else setPuertas(d => [...d, entry]);
    }
    setModal(false); setForm({});
    Alert.alert('✅ Guardado', editItem ? 'Registro actualizado.' : 'Registro creado exitosamente.');
  };

  const codigosAeropuerto = aeropuertos.map(a => ({ label: `${a.codigo_aeropuerto} — ${a.nombre}`, value: a.codigo_aeropuerto }));

  const renderContent = () => {
    if (tab === 'aeropuertos') {
      const data = aeropuertos.filter(a => `${a.nombre} ${a.codigo_aeropuerto} ${a.ciudad} ${a.pais}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={a => a.codigo_aeropuerto}
          contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="🏢" text="Sin aeropuertos" sub="Usa + Nuevo para agregar el primero" />}
          renderItem={({ item: a }) => (
            <DataCard title={a.nombre} subtitle={`${a.codigo_aeropuerto} · ${a.ciudad ?? '—'}, ${a.pais ?? '—'}`}
              badge={<Badge value={a.activo ? 'ACTIVO' : 'INACTIVO'} />}
              meta={a.terminales ? `${a.terminales} terminales` : undefined} accentColor={C.navy}
              onEdit={() => openEdit(a)}
              onDelete={() => setAeropuertos(d => d.filter(x => x.codigo_aeropuerto !== a.codigo_aeropuerto))}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {a.continente && <Text style={{ fontSize: 11, color: C.muted }}>🌍 {a.continente}</Text>}
                {a.huso_horario && <Text style={{ fontSize: 11, color: C.muted }}>⏰ {a.huso_horario}</Text>}
                {a.elevacion_metros && <Text style={{ fontSize: 11, color: C.muted }}>⛰ {a.elevacion_metros} m</Text>}
                {a.latitud && <Text style={{ fontSize: 11, color: C.muted }}>📍 {a.latitud?.toFixed(3)}, {a.longitud?.toFixed(3)}</Text>}
              </View>
            </DataCard>
          )} />
      );
    }
    if (tab === 'pistas') {
      const data = pistas.filter(p => `${p.numero_pista} ${p.codigo_aeropuerto} ${p.superficie}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={p => String(p.id_pista)}
          contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="🛬" text="Sin pistas registradas" />}
          renderItem={({ item: p }) => (
            <DataCard title={`Pista ${p.numero_pista}`} subtitle={`Aeropuerto: ${p.codigo_aeropuerto} · ${p.superficie ?? '—'}`}
              badge={<Badge value={p.activo ? 'ACTIVO' : 'INACTIVO'} />}
              meta={p.longitud_metros ? `${p.longitud_metros} m` : undefined} accentColor={C.teal}
              onEdit={() => openEdit(p)}
              onDelete={() => setPistas(d => d.filter(x => x.id_pista !== p.id_pista))}>
              <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
                {p.anchura_metros ? <Text style={{ fontSize: 11, color: C.muted }}>📏 Ancho: {p.anchura_metros} m</Text> : null}
                {p.categoria_oaci ? <Text style={{ fontSize: 11, color: C.muted }}>📋 Cat. OACI: {p.categoria_oaci}</Text> : null}
                <Text style={{ fontSize: 11, color: p.iluminacion_nocturna ? C.success : C.muted }}>💡 {p.iluminacion_nocturna ? 'Con iluminación' : 'Sin iluminación'}</Text>
                <Text style={{ fontSize: 11, color: p.sistema_ils ? C.success : C.muted }}>📡 ILS: {p.sistema_ils ? 'Sí' : 'No'}</Text>
              </View>
            </DataCard>
          )} />
      );
    }
    const data = puertas.filter(p => `${p.numero_puerta} ${p.terminal} ${p.tipo_puerta}`.toLowerCase().includes(q.toLowerCase()));
    return (
      <FlatList data={data} keyExtractor={p => String(p.id_puerta)}
        contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="🚪" text="Sin puertas registradas" />}
        renderItem={({ item: p }) => (
          <DataCard title={`Puerta ${p.numero_puerta}`} subtitle={`Terminal ${p.terminal ?? '—'} · ${p.tipo_puerta ?? '—'}`}
            badge={<Badge value={p.tipo_puerta ?? 'MIXTA'} />}
            meta={p.capacidad_maxima ? `${p.capacidad_maxima} pax` : undefined} accentColor={C.purple}
            onEdit={() => openEdit(p)}
            onDelete={() => setPuertas(d => d.filter(x => x.id_puerta !== p.id_puerta))}>
            <Text style={{ fontSize: 11, color: p.tiene_pasarela ? C.success : C.muted }}>
              {p.tiene_pasarela ? '✅ Con pasarela de embarque' : '🚶 Acceso directo (sin pasarela)'}
            </Text>
          </DataCard>
        )} />
    );
  };

  const modalTitle = editItem
    ? `Editar ${tab === 'aeropuertos' ? 'Aeropuerto' : tab === 'pistas' ? 'Pista' : 'Puerta'}`
    : `Nuevo ${tab === 'aeropuertos' ? 'Aeropuerto' : tab === 'pistas' ? 'Pista' : 'Puerta de Embarque'}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="Infraestructura Aeroportuaria" subtitle="Aeropuertos, pistas y puertas" onAdd={openNew} />
      <TabBar tabs={TABS} active={tab} onPress={k => { setTab(k as Tab); setQ(''); }} />
      <StatsRow>
        <StatCard label="Aeropuertos" value={aeropuertos.length} color={C.navy} bg={C.infoBg} icon="🏢" />
        <StatCard label="Activos" value={aeropuertos.filter(a => a.activo).length} color={C.success} bg={C.successBg} icon="✅" />
        <StatCard label="Pistas" value={pistas.length} color={C.teal} bg={C.tealBg} icon="🛬" />
        <StatCard label="Puertas" value={puertas.length} color={C.purple} bg={C.purpleBg} icon="🚪" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder={`Buscar ${tab}...`} />
      {renderContent()}

      <FormModal visible={modal} title={modalTitle} onClose={() => setModal(false)} onSave={handleSave}
        saveLabel={editItem ? 'Actualizar' : 'Guardar'}>

        {tab === 'aeropuertos' && <>
          <FormSection title="Identificación" icon="🏷️" />
          <FF label="Código IATA" required value={form.codigo_aeropuerto ?? ''} onChangeText={set('codigo_aeropuerto')} autoCapitalize="characters" placeholder="Ej: GUA" hint="3 letras mayúsculas (estándar IATA)" maxLength={4} />
          <FF label="Nombre del aeropuerto" required value={form.nombre ?? ''} onChangeText={set('nombre')} placeholder="Ej: Aeropuerto Internacional La Aurora" />
          <FormSection title="Ubicación" icon="📍" />
          <FF label="Ciudad" value={form.ciudad ?? ''} onChangeText={set('ciudad')} placeholder="Ej: Ciudad de Guatemala" />
          <FF label="País" value={form.pais ?? ''} onChangeText={set('pais')} placeholder="Ej: Guatemala" />
          <FSelect label="Continente" value={form.continente ?? ''} onChange={set('continente')}
            options={[{label:'América del Norte',value:'América del Norte'},{label:'América del Sur',value:'América del Sur'},{label:'América Central',value:'América Central'},{label:'Europa',value:'Europa'},{label:'Asia',value:'Asia'},{label:'África',value:'África'},{label:'Oceanía',value:'Oceanía'}]} />
          <FF label="Huso horario" value={form.huso_horario ?? ''} onChangeText={set('huso_horario')} placeholder="Ej: America/Guatemala" />
          <FormSection title="Capacidad e infraestructura" icon="🏗️" />
          <FF label="Número de terminales" value={String(form.terminales ?? '')} onChangeText={set('terminales')} keyboardType="numeric" />
          <FF label="Elevación (metros s.n.m.)" value={String(form.elevacion_metros ?? '')} onChangeText={set('elevacion_metros')} keyboardType="numeric" />
          <FF label="Latitud" value={String(form.latitud ?? '')} onChangeText={set('latitud')} keyboardType="decimal-pad" placeholder="Ej: 14.5833" />
          <FF label="Longitud" value={String(form.longitud ?? '')} onChangeText={set('longitud')} keyboardType="decimal-pad" placeholder="Ej: -90.5275" />
          <FToggle label="Aeropuerto activo" value={form.activo !== 0} onChange={v => set('activo')(v ? 1 : 0)} />
        </>}

        {tab === 'pistas' && <>
          <FormSection title="Identificación" icon="🏷️" />
          <FSelect label="Aeropuerto" value={form.codigo_aeropuerto ?? ''} onChange={set('codigo_aeropuerto')} options={codigosAeropuerto} required hint="Selecciona el aeropuerto al que pertenece" />
          <FF label="Número / identificador de pista" required value={form.numero_pista ?? ''} onChangeText={set('numero_pista')} placeholder="Ej: 01L, 19R, 02" hint="Designación oficial de la pista" />
          <FormSection title="Dimensiones" icon="📐" />
          <FF label="Longitud (metros)" value={String(form.longitud_metros ?? '')} onChangeText={set('longitud_metros')} keyboardType="numeric" placeholder="Ej: 2987" />
          <FF label="Anchura (metros)" value={String(form.anchura_metros ?? '')} onChangeText={set('anchura_metros')} keyboardType="numeric" placeholder="Ej: 45" />
          <FF label="Orientación (grados magnéticos)" value={String(form.orientacion_grados ?? '')} onChangeText={set('orientacion_grados')} keyboardType="numeric" placeholder="Ej: 180" />
          <FormSection title="Características técnicas" icon="⚙️" />
          <FSelect label="Superficie" value={form.superficie ?? ''} onChange={set('superficie')}
            options={[{label:'Asfalto',value:'ASFALTO'},{label:'Concreto',value:'CONCRETO'},{label:'Hierba',value:'HIERBA'},{label:'Grava',value:'GRAVA'},{label:'Tierra compactada',value:'TIERRA'}]} />
          <FF label="Categoría OACI" value={form.categoria_oaci ?? ''} onChangeText={set('categoria_oaci')} placeholder="Ej: 4E" hint="Código de referencia de aeródromo" />
          <FToggle label="Iluminación nocturna" value={!!form.iluminacion_nocturna} onChange={v => set('iluminacion_nocturna')(v)} hint="Permite operaciones en horario nocturno" />
          <FToggle label="Sistema ILS instalado" value={!!form.sistema_ils} onChange={v => set('sistema_ils')(v)} hint="Sistema de aterrizaje por instrumentos" />
          <FToggle label="Pista activa" value={form.activo !== 0} onChange={v => set('activo')(v ? 1 : 0)} />
        </>}

        {tab === 'puertas' && <>
          <FormSection title="Identificación" icon="🏷️" />
          <FSelect label="Aeropuerto" value={form.codigo_aeropuerto ?? ''} onChange={set('codigo_aeropuerto')} options={codigosAeropuerto} required />
          <FF label="Número de puerta" required value={form.numero_puerta ?? ''} onChangeText={set('numero_puerta')} placeholder="Ej: A1, B12, C05" />
          <FF label="Terminal" value={form.terminal ?? ''} onChangeText={set('terminal')} placeholder="Ej: A, B, Internacional" />
          <FormSection title="Configuración" icon="⚙️" />
          <FSelect label="Tipo de puerta" value={form.tipo_puerta ?? ''} onChange={set('tipo_puerta')}
            options={[{label:'Nacional',value:'NACIONAL'},{label:'Internacional',value:'INTERNACIONAL'},{label:'Mixta',value:'MIXTA'}]} />
          <FF label="Capacidad máxima de pasajeros" value={String(form.capacidad_maxima ?? '')} onChangeText={set('capacidad_maxima')} keyboardType="numeric" placeholder="Ej: 200" />
          <FToggle label="Cuenta con pasarela (jetway)" value={!!form.tiene_pasarela} onChange={v => set('tiene_pasarela')(v)} hint="Manga telescópica de acceso directo" />
          <FToggle label="Puerta activa" value={form.activo !== 0} onChange={v => set('activo')(v ? 1 : 0)} />
        </>}
      </FormModal>
    </SafeAreaView>
  );
}
