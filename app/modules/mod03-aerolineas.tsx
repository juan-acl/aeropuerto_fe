import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert} from 'react-native';
import { useBackend } from '@/hooks/useBackend';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [AEROLINEAS, set_AEROLINEAS] = useState<any[]>([]);
  useEffect(() => {
      backendApi.aerolineas.listar().then(d => set_AEROLINEAS(d)).catch(() => {});
  }, []);

  const { aerolineas: alData } = useBackend();
  const beAerolineas = alData.source === 'backend' ? alData.data : null;
  const [tab, setTab] = useState('aerolineas');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [aerolineas, setAerolineas] = useState<any[]>(AEROLINEAS);

  const TABS = [{k:'aerolineas', l:'🛫 Aerolíneas'}];

  const renderContent = () => {

    if (tab === 'aerolineas') return (
      <FlatList data={aerolineas.filter(m => JSON.stringify(m).toLowerCase().includes(q.toLowerCase()))}
        keyExtractor={m => String(m.id_aerolinea)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item: m }) => (
          <DataCard title={m.nombre_aerolinea} subtitle={`${m.codigo_iata ?? '—'} / ${m.codigo_oaci ?? '—'} · ${m.pais_origen ?? '—'}`}
            badge={<Badge value={m.activo ? 'ACTIVO' : 'INACTIVO'} />}
            meta={`${m.flota_total ?? 0} aviones`} accentColor={C.info}
            onDelete={()=>setAerolineas(d=>d.filter((x:any)=>x!==m))}>
            <Badge value={m.alianza ?? 'NINGUNA'} />
          </DataCard>
        )}
      />
    );
    return null;
  };

  const handleSave = () => {
    Alert.alert(' Guardado', 'Registro creado exitosamente.');
    setModal(false);
    setForm({});
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor:C.bg}}>
      <ScreenHeader title="Aerolíneas y Operaciones" subtitle="Aerolíneas y alianzas" onAdd={()=>{setForm({});setModal(true);}} />
      
        
      
      <StatsRow>
        <StatCard label='Aerolíneas' value={aerolineas.length} color={C.info} bg={C.infoBg} icon='🛫' />
        <StatCard label='Activas' value={aerolineas.filter(a=>a.activo).length} color={C.success} bg={C.successBg} icon='' />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar..." />
      {renderContent()}
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={handleSave}>
        <>
          <FormSection title="Identificación" icon="🛫" />
          <FF label="Código IATA de aerolínea" required value={form.codigo_iata??''} onChangeText={set('codigo_iata')} autoCapitalize="characters" placeholder="Ej: AA, UA, AV" maxLength={3} hint="2-3 letras mayúsculas" />
          <FF label="Nombre de la aerolínea" required value={form.nombre??''} onChangeText={set('nombre')} placeholder="Ej: American Airlines" />
          <FF label="País de origen" value={form.pais_origen??''} onChangeText={set('pais_origen')} placeholder="Ej: Estados Unidos" />
          <FormSection title="Detalles operativos" icon="" />
          <FSelect label="Tipo de aerolínea" value={form.tipo_aerolinea??''} onChange={set('tipo_aerolinea')}
          options={[{label:'Full service / Línea regular',value:'FULL_SERVICE'},{label:'Low cost / Bajo costo',value:'LOW_COST'},{label:'Chárter',value:'CHARTER'},{label:'Carga',value:'CARGA'},{label:'Regional',value:'REGIONAL'}]} />
          <FSelect label="Alianza" value={form.alianza??''} onChange={set('alianza')}
          options={[{label:'Star Alliance',value:'STAR_ALLIANCE'},{label:'SkyTeam',value:'SKYTEAM'},{label:'Oneworld',value:'ONEWORLD'},{label:'Sin alianza',value:'NINGUNA'}]} />
          <FF label="Hub principal" value={form.hub_principal??''} onChangeText={set('hub_principal')} placeholder="Ej: GUA, MIA, BOG" />
          <FF label="Sitio web" value={form.sitio_web??''} onChangeText={set('sitio_web')} autoCapitalize="none" keyboardType="url" />
          <FToggle label="Aerolínea activa" value={form.activo!==false&&form.activo!==0} onChange={v=>set('activo')(v)} />
        </>
      </FormModal>
    </SafeAreaView>
  );
}


