import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

type Tab = 'hoteles'|'quejas'|'lealtad';

export default function Mod14() {
  const [HOTELES, set_HOTELES] = useState<any[]>([]);
  const [QUEJAS, set_QUEJAS] = useState<any[]>([]);
  const [PROGRAMAS_LEALTAD, set_PROGRAMAS_LEALTAD] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
      setLoading(true);
      try {
          const [h, q, l] = await Promise.all([
              backendApi.hoteles.listar(),
              backendApi.quejas.listar(),
              backendApi.lealtad.listar()
          ]);
          set_HOTELES(h || []);
          set_QUEJAS(q || []);
          set_PROGRAMAS_LEALTAD(l || []);
      } catch (e) {
          console.error("Error fetching mod14 data:", e);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchAll();
  }, []);

  const [tab, setTab] = useState<Tab>('hoteles');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const renderContent = () => {
    if (tab === 'hoteles') {
      const data = HOTELES.filter(h => `${h.nombre_hotel} ${h.categoria ?? ''}`.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={h => String(h.id_hotel)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="" />}
        renderItem={({item:h}) => (
          <DataCard title={h.nombre_hotel} subtitle={`${h.categoria ?? '—'} · ${h.distancia_km ?? '—'} km del aeropuerto`}
            badge={<Badge value={h.activo ? 'ACTIVO' : 'INACTIVO'} color={h.activo ? C.success : C.muted} />} 
            meta={`Desde Q ${h.tarifa_noche_desde ?? '—'}/noche`} accentColor={C.teal}
            onDelete={() => set_HOTELES(d => d.filter(x => x.id_hotel !== h.id_hotel))}>
            <></>
          </DataCard>
        )} />;
    }
    if (tab === 'quejas') {
      const data = QUEJAS.filter(q2 => `${q2.tipo_contacto} ${q2.descripcion ?? ''}`.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={q2 => String(q2.id_queja)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="📬" />}
        renderItem={({item:q2}) => (
          <DataCard title={q2.tipo_contacto} subtitle={q2.descripcion ?? '—'}
            badge={<Badge value={q2.estado || 'PENDIENTE'} />} 
            meta={q2.fecha_contacto?.split('T')[0]} 
            accentColor={q2.tipo_contacto === 'QUEJA' || q2.tipo_contacto === 'RECLAMO' ? C.danger : q2.tipo_contacto === 'FELICITACION' ? C.success : C.info}
            onDelete={() => set_QUEJAS(d => d.filter(x => x.id_queja !== q2.id_queja))}>
            <></>
          </DataCard>
        )} />;
    }
    const data = PROGRAMAS_LEALTAD.filter(l => JSON.stringify(l).toLowerCase().includes(q.toLowerCase()));
    return <FlatList data={data} keyExtractor={l => String(l.id_lealtad)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
      ListEmptyComponent={<EmptyState icon="" />}
      renderItem={({item:l}) => (
        <DataCard title={`Lealtad #${l.id_lealtad} – Pasajero ${l.id_pasajero}`} subtitle={`Nivel: ${l.nivel_membresia ?? '—'}`}
          badge={<Badge value={l.activo ? 'ACTIVO' : 'INACTIVO'} color={l.activo ? C.success : C.muted} />} 
          meta={`${(l.puntos_acumulados ?? 0).toLocaleString()} pts`} accentColor={C.orange}
          onDelete={() => set_PROGRAMAS_LEALTAD(d => d.filter(x => x.id_lealtad !== l.id_lealtad))}>
          <></>
        </DataCard>
      )} />;
  };

  const TABS = [{k:'hoteles',l:'🏨 Hoteles'},{k:'quejas',l:'📬 Quejas'},{k:'lealtad',l:'⭐ Lealtad'}];

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Servicios al Pasajero" subtitle="Hoteles, quejas y programa de lealtad" onAdd={()=>{setForm({});setModal(true);}} />
      <View style={{flexDirection:'row',backgroundColor:C.bgCard,borderBottomWidth:1,borderBottomColor:C.border}}>
        {TABS.map(t=><View key={t.k} style={{flex:1,borderBottomWidth:2,borderBottomColor:tab===t.k?C.navy:'transparent',paddingVertical:10,alignItems:'center'}}>
          <Text onPress={()=>{setTab(t.k as Tab);setQ('');}} style={{fontSize:11,fontWeight:'600',color:tab===t.k?C.navy:C.muted}}>{t.l}</Text>
        </View>)}
      </View>
      <StatsRow>
        <StatCard label="Hoteles" value={HOTELES.length} color={C.teal} bg={C.tealBg} icon="🏨" />
        <StatCard label="Quejas" value={QUEJAS.filter(q2=>q2.tipo_contacto==='QUEJA'||q2.tipo_contacto==='RECLAMO').length} color={C.danger} bg={C.dangerBg} icon="📬" />
        <StatCard label="Lealtad" value={PROGRAMAS_LEALTAD.length} color={C.orange} bg={C.orangeBg} icon="⭐" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar servicios..." />
      {renderContent()}
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={()=>{Alert.alert('OK','Guardado');setModal(false);}}>
        <FF label="Nombre / Descripción" value={form.nombre??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,nombre:t}))} />
        <FF label="Tipo" value={form.tipo??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,tipo:t}))} />
      </FormModal>
    </SafeAreaView>
  );
}
