import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert} from 'react-native';
import { useBackend } from '@/hooks/useBackend';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

type Tab = 'aerolineas' | 'aeronaves';

export default function Screen() {
  const [AEROLINEAS, set_AEROLINEAS] = useState<any[]>([]);
  useEffect(() => {
    backendApi.aerolineas.listar().then(d => set_AEROLINEAS(d)).catch(() => {});
  }, []);

  const [tab, setTab] = useState<Tab>('aerolineas');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [aerolineas, setAerolineas] = useState<any[]>(AEROLINEAS);

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const TABS = [
    { k: 'aerolineas', l: '🛫 Aerolíneas' },
    { k: 'aeronaves',  l: '✈️ Aeronaves' },
  ];

  const renderContent = () => {
    if (tab === 'aerolineas') return (
      <FlatList data={aerolineas.filter(m => JSON.stringify(m).toLowerCase().includes(q.toLowerCase()))}
        keyExtractor={m => String(m.id_aerolinea)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item: m }) => (
          <DataCard title={m.nombre_aerolinea} subtitle={`${m.codigo_iata ?? '—'} / ${m.codigo_oaci ?? '—'} · ${m.pais_origen ?? '—'}`}
            badge={<Badge value={m.activo ? 'ACTIVO' : 'INACTIVO'} />}
            meta={`${m.flota_total ?? 0} aviones`} accentColor={C.info}
            onDelete={() => setAerolineas(d => d.filter((x: any) => x !== m))}>
            <Badge value={m.alianza ?? 'NINGUNA'} />
          </DataCard>
        )}
      />
    );
    // aeronaves — solo formulario de registro, listado viene del mod02
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
          Registra aeronaves asignadas a una aerolínea. El listado completo está en Módulo 02 — Flota Aérea.
        </Text>
        <EmptyState icon="✈️" text="Usa + Registrar para dar de alta una aeronave" sub="Matrícula, tipo ICAO, aerolínea y configuración de cabina" />
      </View>
    );
  };

  const handleSave = async () => {
    if (tab === 'aerolineas') {
      if (!form.nombre?.trim() || !form.codigo_iata?.trim() || !form.codigo_oaci?.trim()) {
        Alert.alert('Campos requeridos', 'Nombre, Código IATA y Código OACI son obligatorios.'); return;
      }
      setSaving(true);
      try {
        await backendApi.aerolineas.registrar({
          Nombre:     form.nombre.trim(),
          CodigoIata: form.codigo_iata.trim().toUpperCase(),
          CodigoOaci: form.codigo_oaci.trim().toUpperCase(),
          PaisOrigen: form.pais_origen?.trim() ?? '',
          Contacto:   form.contacto?.trim() ?? '',
        });
        // Refrescar lista
        const lista = await backendApi.aerolineas.listar().catch(() => null);
        if (lista) setAerolineas(lista);
        Alert.alert('Registrada', `Aerolínea "${form.nombre}" registrada exitosamente.`);
      } catch (e: any) {
        Alert.alert('Error', e.message ?? 'No se pudo registrar la aerolínea.'); return;
      } finally { setSaving(false); }
    } else {
      if (!form.matricula?.trim() || !form.codigo_icao?.trim() || !form.id_aerolinea) {
        Alert.alert('Campos requeridos', 'Matrícula, Tipo ICAO e ID Aerolínea son obligatorios.'); return;
      }
      setSaving(true);
      try {
        await backendApi.aerolineas.registrarAeronave({
          Matricula:       form.matricula.trim().toUpperCase(),
          CodigoIcaoTipo:  form.codigo_icao.trim().toUpperCase(),
          IdAerolinea:     Number(form.id_aerolinea),
          NombreAeronave:  form.nombre_aeronave?.trim() || undefined,
          Configuracion:   form.configuracion?.trim() ?? '{}',
          NumeroMotores:   Number(form.numero_motores ?? 2),
          AnioFabricacion: Number(form.anio_fabricacion ?? new Date().getFullYear()),
        });
        Alert.alert('Registrada', `Aeronave ${form.matricula.toUpperCase()} registrada correctamente.`);
      } catch (e: any) {
        Alert.alert('Error', e.message ?? 'No se pudo registrar la aeronave.'); return;
      } finally { setSaving(false); }
    }
    setModal(false); setForm({});
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor:C.bg}}>
      <ScreenHeader
        title="Aerolíneas y Operaciones"
        subtitle="Aerolíneas, alianzas y flota"
        onAdd={() => { setForm({}); setModal(true); }}
        addLabel={tab === 'aeronaves' ? '+ Registrar' : '+ Nueva'}
      />
      <TabBar tabs={TABS} active={tab} onPress={k => { setTab(k as Tab); setQ(''); }} />
      <StatsRow>
        <StatCard label='Aerolíneas' value={aerolineas.length} color={C.info} bg={C.infoBg} icon='🛫' />
        <StatCard label='Activas' value={aerolineas.filter(a=>a.activo).length} color={C.success} bg={C.successBg} icon='' />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar..." />
      {renderContent()}

      {/* Modal Aerolínea */}
      {tab === 'aerolineas' && (
        <FormModal visible={modal} title="Registrar Aerolínea" onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Registrando...' : 'Registrar'}>
          <FormSection title="Identificación" icon="🛫" />
          <FF label="Nombre de la aerolínea" required value={form.nombre??''} onChangeText={set('nombre')} placeholder="Ej: American Airlines" />
          <FF label="Código IATA" required value={form.codigo_iata??''} onChangeText={set('codigo_iata')} autoCapitalize="characters" placeholder="Ej: AA" maxLength={3} hint="2-3 letras mayúsculas" />
          <FF label="Código OACI" required value={form.codigo_oaci??''} onChangeText={set('codigo_oaci')} autoCapitalize="characters" placeholder="Ej: AAL" maxLength={4} hint="3-4 letras" />
          <FF label="País de origen" value={form.pais_origen??''} onChangeText={set('pais_origen')} placeholder="Ej: Estados Unidos" />
          <FF label="Teléfono / contacto" value={form.contacto??''} onChangeText={set('contacto')} keyboardType="phone-pad" placeholder="+1 800 000 0000" />
        </FormModal>
      )}

      {/* Modal Aeronave */}
      {tab === 'aeronaves' && (
        <FormModal visible={modal} title="Registrar Aeronave" onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Registrando...' : 'Registrar'}>
          <FormSection title="Identificación" icon="✈️" />
          <FF label="Matrícula" required value={form.matricula??''} onChangeText={set('matricula')} autoCapitalize="characters" placeholder="Ej: TG-ANA" />
          <FF label="Tipo ICAO" required value={form.codigo_icao??''} onChangeText={set('codigo_icao')} autoCapitalize="characters" placeholder="Ej: B738" maxLength={4} hint="Código ICAO del modelo" />
          <FF label="ID Aerolínea" required value={String(form.id_aerolinea??'')} onChangeText={set('id_aerolinea')} keyboardType="numeric" hint="ID numérico de la aerolínea propietaria" />
          <FF label="Nombre aeronave (opcional)" value={form.nombre_aeronave??''} onChangeText={set('nombre_aeronave')} placeholder="Ej: Ciudad de Guatemala" />
          <FormSection title="Especificaciones" icon="" />
          <FF label="Número de motores" value={String(form.numero_motores??'2')} onChangeText={set('numero_motores')} keyboardType="numeric" />
          <FF label="Año de fabricación" value={String(form.anio_fabricacion??'')} onChangeText={set('anio_fabricacion')} keyboardType="numeric" placeholder={String(new Date().getFullYear())} />
          <FF label="Configuración cabina (JSON)" value={form.configuracion??''} onChangeText={set('configuracion')} multiline placeholder='{"ECONOMICA":150,"EJECUTIVA":20}' hint="Asientos por clase en formato JSON" />
        </FormModal>
      )}
    </SafeAreaView>
  );
}


