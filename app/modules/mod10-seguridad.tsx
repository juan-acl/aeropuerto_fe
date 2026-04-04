import React, { useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { INCIDENTES, PROHIBICIONES, EMERGENCIAS_MEDICAS } from '@/services/mockData';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [data, setData] = useState<any[]>(INCIDENTES);

  const filtered = data.filter((m:any) => JSON.stringify(m).toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Seguridad Operacional" subtitle="Incidentes, prohibiciones y emergencias" onAdd={()=>{setForm({});setModal(true);}} />
      <StatsRow>
        <StatCard label="Total" value={data.length} color={C.danger} bg={C.dangerBg} icon="🛡️" />
        <StatCard label="Prohibiciones" value={PROHIBICIONES.filter((p:any)=>p.activa).length} color={C.red} bg={C.redBg} icon="🚫" /><StatCard label="Emergencias" value={EMERGENCIAS_MEDICAS.length} color={C.orange} bg={C.orangeBg} icon="🚑" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar..." />
      <FlatList data={filtered} keyExtractor={(m:any)=>String(m.id_incidente)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="🛡️" />}
        renderItem={({item:m})=>(
          <DataCard title={`Incidente ${m.id_incidente} – ${m.tipo_incidente}`} subtitle={m.descripcion ?? '—'}
            badge={<Badge value={m.nivel_gravedad} />} meta={m.fecha_incidente?.split('T')[0]}
            accentColor={C.danger}
            onDelete={()=>setData(d=>d.filter((x:any)=>x!==m))}>
            <Text style={{fontSize:11,color:C.muted}}>{`Oficial: ${m.oficial_a_cargo??'—'} · Estado: ${m.estado}`}</Text>
          </DataCard>
        )}
      />
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={()=>{Alert.alert('OK','Registro guardado');setModal(false);}}>
        <FF label="Tipo (ARRESTO/SEGURIDAD/etc)" value={form.tipo??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,tipo:t}))} /><FF label="Nivel Gravedad (BAJO/MEDIO/ALTO/CRITICO)" value={form.nivel??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,nivel:t}))} /><FF label="Descripción *" value={form.desc??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,desc:t}))} multiline numberOfLines={3} /><FF label="Oficial a Cargo" value={form.oficial??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,oficial:t}))} />
      </FormModal>
    </SafeAreaView>
  );
}
