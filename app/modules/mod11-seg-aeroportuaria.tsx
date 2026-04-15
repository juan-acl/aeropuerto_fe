import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [CONTROLES_SEG, set_CONTROLES_SEG] = useState<any[]>([]);
  const [VISITAS_SEG, set_VISITAS_SEG] = useState<any[]>([]);
  useEffect(() => {
      backendApi.vuelos.listar().then(d => set_CONTROLES_SEG(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_VISITAS_SEG(d)).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [data, setData] = useState<any[]>(CONTROLES_SEG);

  const filtered = data.filter((m:any) => JSON.stringify(m).toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Seguridad Aeroportuaria" subtitle="Controles y visitas de seguridad" onAdd={()=>{setForm({});setModal(true);}} />
      <StatsRow>
        <StatCard label="Total" value={data.length} color={C.red} bg={C.redBg} icon="🔒" />
        <StatCard label="Visitas" value={VISITAS_SEG.length} color={C.orange} bg={C.orangeBg} icon="👷" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar..." />
      <FlatList data={filtered} keyExtractor={(m:any)=>String(m.id_control)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="🔒" />}
        renderItem={({item:m})=>(
          <DataCard title={`Control ${m.tipo_control} · ${m.fecha_control}`} subtitle={`Aeropuerto: ${m.codigo_aeropuerto} · Supervisor: ${m.supervisor??'—'}`}
            badge={<Badge value={m.tipo_control} />} meta={`${m.numero_pasajeros_revisados??0} revisados`}
            accentColor={C.red}
            onDelete={()=>setData(d=>d.filter((x:any)=>x!==m))}>
            <Text style={{fontSize:11,color:C.muted}}>{`Incidencias: ${m.numero_incidencias??0}`}</Text>
          </DataCard>
        )}
      />
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={()=>{Alert.alert('OK','Registro guardado');setModal(false);}}>
        <FF label="Tipo Control" value={form.tipo??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,tipo:t}))} /><FF label="Fecha (YYYY-MM-DD)" value={form.fecha??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,fecha:t}))} /><FF label="Código Aeropuerto" value={form.codigo??'GUA'} onChangeText={(t:string)=>setForm((f:any)=>({...f,codigo:t}))} /><FF label="Supervisor" value={form.supervisor??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,supervisor:t}))} />
      </FormModal>
    </SafeAreaView>
  );
}


