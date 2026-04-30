import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { backendApi } from '@/services/backendApi';
import { Pasajero, PerfilViajero } from '@/types';
import { ScreenHeader, SearchBar, DataCard, Badge, StatCard, FormModal, FF, FSelect, FToggle, FormSection, EmptyState, TabBar, StatsRow } from '@/components/shared';
import { C } from '@/constants/theme';

type Tab = 'pasajeros' | 'perfiles';
const TABS = [{ k: 'pasajeros', l: ' Pasajeros' }, { k: 'perfiles', l: ' Perfiles Viajero' }];
const TIPOS_DOC = [{ label: 'DPI (Documento Personal de Identificación)', value: 'DPI' }, { label: 'Pasaporte', value: 'PASAPORTE' }, { label: 'Cédula extranjera', value: 'CEDULA' }, { label: 'Otro documento', value: 'OTRO' }];
const GENEROS = [{ label: 'Masculino', value: 'M' }, { label: 'Femenino', value: 'F' }, { label: 'Prefiero no indicar', value: 'O' }];
const TIPOS_PERFIL = [{ label: 'Viajero frecuente', value: 'FRECUENTE' }, { label: 'Viajero ocasional', value: 'OCASIONAL' }, { label: 'VIP / Primera clase', value: 'VIP' }, { label: 'Corporativo / Empresarial', value: 'CORPORATIVO' }];
const CATEGORIAS = [{ label: 'Bronce', value: 'BRONCE' }, { label: 'Plata', value: 'PLATA' }, { label: 'Oro', value: 'ORO' }, { label: 'Platino', value: 'PLATINO' }, { label: 'Elite', value: 'ELITE' }];

export default function Pasajeros() {
  const [PASAJEROS, set_PASAJEROS] = useState<any[]>([]);
  const [PERFILES_VIAJERO, set_PERFILES_VIAJERO] = useState<any[]>([]);
  useEffect(() => {
      backendApi.pasajeros.listar().then(d => set_PASAJEROS(d)).catch(() => {});
      backendApi.pasajeros.listar().then(d => set_PERFILES_VIAJERO(d)).catch(() => {});
  }, []);

  const [tab, setTab] = useState<Tab>('pasajeros');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [pasajeros, setPasajeros] = useState<Pasajero[]>(PASAJEROS);
  const [perfiles, setPerfiles] = useState<PerfilViajero[]>(PERFILES_VIAJERO);

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const openNew = () => { setEditItem(null); setForm({ tipo_documento: 'PASAPORTE', genero: 'M' }); setModal(true); };
  const openEdit = (item: any) => { setEditItem(item); setForm({ ...item }); setModal(true); };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (tab === 'pasajeros') {
      if (!form.nombres?.trim() || !form.numero_documento?.trim()) { Alert.alert('Campos requeridos', 'Nombres y número de documento son obligatorios.'); return; }
      if (!form.tipo_documento) { Alert.alert('Campo requerido', 'Selecciona el tipo de documento.'); return; }
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) { Alert.alert('Email inválido', 'Ingresa un correo electrónico válido.'); return; }

      const entry: Pasajero = {
        id_pasajero: editItem?.id_pasajero ?? Date.now(),
        nombres: form.nombres.trim(), apellidos: form.apellidos?.trim() ?? '',
        tipo_documento: form.tipo_documento, numero_documento: form.numero_documento.trim(),
        nacionalidad: form.nacionalidad ?? '', fecha_nacimiento: form.fecha_nacimiento ?? '',
        genero: form.genero ?? 'O', telefono: form.telefono ?? '', email: form.email ?? '',
        ciudad_residencia: form.ciudad_residencia ?? '', pais_residencia: form.pais_residencia ?? '',
      };

      if (!editItem) {
        if (pasajeros.find(p => p.numero_documento === form.numero_documento)) {
          Alert.alert('Documento duplicado', 'Ya existe un pasajero con ese número de documento.'); return;
        }
        // Registrar en backend via SP (valida email, fecha y documento único)
        setSaving(true);
        try {
          await backendApi.pasajeros.registrar({
            Nombre:          form.nombres.trim(),
            Apellidos:       form.apellidos?.trim() ?? '',
            NumeroDocumento: form.numero_documento.trim(),
            Nacionalidad:    form.nacionalidad ?? '',
            FechaNacimiento: form.fecha_nacimiento ?? new Date().toISOString().split('T')[0],
            Email:           form.email?.trim() || undefined,
          });
          // Refrescar lista desde backend
          const lista = await backendApi.pasajeros.listar().catch(() => null);
          if (lista) setPasajeros(lista as any[]);
          else setPasajeros(d => [...d, entry]);
        } catch (e: any) {
          Alert.alert('Error al registrar', e.message ?? 'No se pudo registrar el pasajero.'); setSaving(false); return;
        } finally { setSaving(false); }
      } else {
        setPasajeros(d => d.map(x => x.id_pasajero === editItem.id_pasajero ? entry : x));
      }
    } else {
      if (!form.id_pasajero || !form.tipo_perfil) { Alert.alert('Campos requeridos', 'Pasajero y tipo de perfil son obligatorios.'); return; }
      const entry: PerfilViajero = {
        id_perfil: editItem?.id_perfil ?? Date.now(),
        id_pasajero: Number(form.id_pasajero), tipo_perfil: form.tipo_perfil,
        numero_programa: form.numero_programa ?? `PRG-${Date.now().toString().slice(-6)}`,
        puntos_acumulados: Number(form.puntos_acumulados) || 0, categoria: form.categoria ?? 'BRONCE',
      };
      if (editItem) setPerfiles(d => d.map(x => x.id_perfil === editItem.id_perfil ? entry : x));
      else setPerfiles(d => [...d, entry]);
    }
    setModal(false); setForm({});
    Alert.alert(' Guardado', editItem ? 'Pasajero actualizado.' : 'Pasajero registrado.');
  };

  const pasajeroOptions = pasajeros.map(p => ({ label: `${p.nombres} ${p.apellidos} — ${p.numero_documento}`, value: String(p.id_pasajero) }));

  const renderContent = () => {
    if (tab === 'pasajeros') {
      const data = pasajeros.filter(p => `${p.nombres} ${p.apellidos} ${p.numero_documento} ${p.email ?? ''} ${p.nacionalidad ?? ''}`.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={p => String(p.id_pasajero)} contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="" text="Sin pasajeros registrados" sub="Registra el primer pasajero con + Nuevo" />}
        renderItem={({ item: p }) => (
          <DataCard title={`${p.nombres} ${p.apellidos}`} subtitle={`${p.tipo_documento}: ${p.numero_documento}`}
            badge={<Badge value={p.genero === 'M' ? 'MASCULINO' : p.genero === 'F' ? 'FEMENINO' : 'OTRO'} />}
            meta={p.nacionalidad || undefined} accentColor={C.info}
            onEdit={() => openEdit(p)} onDelete={() => setPasajeros(d => d.filter(x => x.id_pasajero !== p.id_pasajero))}>
            <View style={{ gap: 3 }}>
              {p.email ? <Text style={{ fontSize: 11, color: C.muted }}>✉️ {p.email}</Text> : null}
              {p.telefono ? <Text style={{ fontSize: 11, color: C.muted }}>📞 {p.telefono}</Text> : null}
              {(p.ciudad_residencia || p.pais_residencia) ? <Text style={{ fontSize: 11, color: C.muted }}> {[p.ciudad_residencia, p.pais_residencia].filter(Boolean).join(', ')}</Text> : null}
              {p.fecha_nacimiento ? <Text style={{ fontSize: 11, color: C.muted }}>🎂 {p.fecha_nacimiento}</Text> : null}
            </View>
          </DataCard>
        )} />;
    }
    const data = perfiles.filter(p => JSON.stringify(p).toLowerCase().includes(q.toLowerCase()));
    const paxMap = Object.fromEntries(pasajeros.map(p => [p.id_pasajero, `${p.nombres} ${p.apellidos}`]));
    return <FlatList data={data} keyExtractor={p => String(p.id_perfil)} contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
      ListEmptyComponent={<EmptyState icon="" text="Sin perfiles de viajero" />}
      renderItem={({ item: p }) => (
        <DataCard title={paxMap[p.id_pasajero] ?? `Pasajero #${p.id_pasajero}`}
          subtitle={`Prog: ${p.numero_programa ?? '—'}`}
          badge={<Badge value={p.categoria ?? 'BRONCE'} />}
          meta={`${(p.puntos_acumulados ?? 0).toLocaleString()} pts`}
          accentColor={p.categoria === 'ELITE' || p.categoria === 'PLATINO' ? C.warning : C.orange}
          onEdit={() => openEdit(p)} onDelete={() => setPerfiles(d => d.filter(x => x.id_perfil !== p.id_perfil))}>
          <Badge value={p.tipo_perfil} />
        </DataCard>
      )} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="Gestión de Pasajeros" subtitle="Pasajeros y perfiles de viajero" onAdd={openNew} />
      <TabBar tabs={TABS} active={tab} onPress={k => { setTab(k as Tab); setQ(''); }} />
      <StatsRow>
        <StatCard label="Pasajeros" value={pasajeros.length} color={C.info} bg={C.infoBg} icon="" />
        <StatCard label="Frecuentes" value={perfiles.filter(p => p.tipo_perfil === 'FRECUENTE').length} color={C.purple} bg={C.purpleBg} icon="" />
        <StatCard label="VIP" value={perfiles.filter(p => p.tipo_perfil === 'VIP').length} color={C.warning} bg={C.warningBg} icon="" />
        <StatCard label="Perfiles" value={perfiles.length} color={C.orange} bg={C.orangeBg} icon="🎖️" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar por nombre, documento, email..." />
      {renderContent()}

      <FormModal visible={modal} title={editItem ? 'Editar registro' : tab === 'pasajeros' ? 'Registrar Pasajero' : 'Crear Perfil de Viajero'}
        onClose={() => setModal(false)} onSave={handleSave} saveLabel={editItem ? 'Actualizar' : 'Guardar'}>

        {tab === 'pasajeros' && <>
          <FormSection title="Datos personales" icon="" />
          <FF label="Nombres" required value={form.nombres ?? ''} onChangeText={set('nombres')} placeholder="Ej: María José" />
          <FF label="Apellidos" value={form.apellidos ?? ''} onChangeText={set('apellidos')} placeholder="Ej: García López" />
          <FSelect label="Género" value={form.genero ?? 'M'} onChange={set('genero')} options={GENEROS} />
          <FF label="Fecha de nacimiento" value={form.fecha_nacimiento ?? ''} onChangeText={set('fecha_nacimiento')} placeholder="YYYY-MM-DD" />
          <FF label="Nacionalidad" value={form.nacionalidad ?? ''} onChangeText={set('nacionalidad')} placeholder="Ej: Guatemalteca" />
          <FormSection title="Documento de identidad" icon="🪪" />
          <FSelect label="Tipo de documento" required value={form.tipo_documento ?? 'PASAPORTE'} onChange={set('tipo_documento')} options={TIPOS_DOC} />
          <FF label="Número de documento" required value={form.numero_documento ?? ''} onChangeText={set('numero_documento')} autoCapitalize="characters" placeholder="Ej: 1234567890101" />
          <FormSection title="Contacto y residencia" icon="📬" />
          <FF label="Teléfono" value={form.telefono ?? ''} onChangeText={set('telefono')} keyboardType="phone-pad" placeholder="+502 5555-1234" />
          <FF label="Email" value={form.email ?? ''} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" placeholder="correo@ejemplo.com" />
          <FF label="Ciudad de residencia" value={form.ciudad_residencia ?? ''} onChangeText={set('ciudad_residencia')} />
          <FF label="País de residencia" value={form.pais_residencia ?? ''} onChangeText={set('pais_residencia')} />
        </>}

        {tab === 'perfiles' && <>
          <FormSection title="Pasajero" icon="" />
          <FSelect label="Pasajero" required value={String(form.id_pasajero ?? '')} onChange={set('id_pasajero')} options={pasajeroOptions} hint="Selecciona el pasajero para este perfil" />
          <FormSection title="Programa de fidelización" icon="" />
          <FSelect label="Tipo de perfil" required value={form.tipo_perfil ?? ''} onChange={set('tipo_perfil')} options={TIPOS_PERFIL} />
          <FSelect label="Categoría" value={form.categoria ?? 'BRONCE'} onChange={set('categoria')} options={CATEGORIAS} />
          <FF label="Número de programa" value={form.numero_programa ?? ''} onChangeText={set('numero_programa')} placeholder="Ej: PRG-001234" hint="Se genera automáticamente si se deja vacío" autoCapitalize="characters" />
          <FF label="Puntos acumulados" value={String(form.puntos_acumulados ?? '0')} onChangeText={set('puntos_acumulados')} keyboardType="numeric" hint="Puntos iniciales del programa de lealtad" />
        </>}
      </FormModal>
    </SafeAreaView>
  );
}


