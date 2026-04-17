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
  useEffect(() => {
      backendApi.hoteles.listar().then(d => set_HOTELES(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_QUEJAS(d)).catch(() => {});
      backendApi.lealtad.listar().then(d => set_PROGRAMAS_LEALTAD(d)).catch(() => {});
  }, []);

  const [tab, setTab] = useState<Tab>('hoteles');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [hoteles, setHoteles] = useState(HOTELES);
  const [quejas, setQuejas] = useState(QUEJAS);
  const [lealtad, setLealtad] = useState(PROGRAMAS_LEALTAD);
  const TABS = [{k:'hoteles',l:' Hoteles'},{k:'quejas',l:'📬 Quejas'},{k:'lealtad',l:' Lealtad'}];
  const renderContent = () => {
    if (tab==='hoteles') {
      const data = hoteles.filter(h=>`${h.nombre_hotel} ${h.categoria??''}`.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={h=>String(h.id_hotel)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="" />}
        renderItem={({item:h})=>(<DataCard title={h.nombre_hotel} subtitle={`${h.categoria??'—'} · ${h.distancia_km??'—'} km del aeropuerto`}
            badge={<Badge value={h.activo?'ACTIVO':'INACTIVO'} />} meta={`Desde Q ${h.tarifa_noche_desde??'—'}/noche`} accentColor={C.teal}
            onDelete={()=>setHoteles(d=>d.filter(x=>x.id_hotel!==h.id_hotel))}>
            <></>
          </DataCard>)} />;
    }
    if (tab==='quejas') {
      const data = quejas.filter(q2=>`${q2.tipo_contacto} ${q2.descripcion??''}`.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={q2=>String(q2.id_queja)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="📬" />}
        renderItem={({item:q2})=>(<DataCard title={q2.tipo_contacto} subtitle={q2.descripcion??'—'}
            badge={<Badge value={q2.estado} />} meta={q2.fecha_contacto?.split('T')[0]} accentColor={q2.tipo_contacto==='QUEJA'||q2.tipo_contacto==='RECLAMO'?C.danger:q2.tipo_contacto==='FELICITACION'?C.success:C.info}
            onDelete={()=>setQuejas(d=>d.filter(x=>x.id_queja!==q2.id_queja))}>
            <></>
          </DataCard>)} />;
    }
    const data = lealtad.filter(l=>JSON.stringify(l).toLowerCase().includes(q.toLowerCase()));
    return <FlatList data={data} keyExtractor={l=>String(l.id_lealtad)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
      ListEmptyComponent={<EmptyState icon="" />}
      renderItem={({item:l})=>(<DataCard title={`Lealtad #${l.id_lealtad} – Pasajero ${l.id_pasajero}`} subtitle={`Nivel: ${l.nivel_membresia??'—'}`}
          badge={<Badge value={l.activo?'ACTIVO':'INACTIVO'} />} meta={`${l.puntos_acumulados?.toLocaleString()} pts`} accentColor={C.orange}
          onDelete={()=>setLealtad(d=>d.filter(x=>x.id_lealtad!==l.id_lealtad))}>
          <></>
        </DataCard>)} />;
  };
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Servicios al Pasajero" subtitle="Hoteles, quejas y programa de lealtad" onAdd={()=>{setForm({});setModal(true);}} />
      <View style={{flexDirection:'row',backgroundColor:C.bgCard,borderBottomWidth:1,borderBottomColor:C.border}}>
        {TABS.map(t=><View key={t.k} style={{flex:1,borderBottomWidth:2,borderBottomColor:tab===t.k?C.navy:'transparent',paddingVertical:10,alignItems:'center'}}>
          <Text onPress={()=>{setTab(t.k as Tab);setQ('');}} style={{fontSize:11,fontWeight:'600',color:tab===t.k?C.navy:C.muted}}>{t.l}</Text>
        </View>)}
      </View>
      <StatsRow>
        <StatCard label="Hoteles" value={hoteles.length} color={C.teal} bg={C.tealBg} icon="" />
        <StatCard label="Quejas" value={quejas.filter(q2=>q2.tipo_contacto==='QUEJA'||q2.tipo_contacto==='RECLAMO').length} color={C.danger} bg={C.dangerBg} icon="📬" />
        <StatCard label="Programa Lealtad" value={lealtad.length} color={C.orange} bg={C.orangeBg} icon="" />
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


