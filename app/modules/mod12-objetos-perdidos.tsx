import React, { useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { OBJETOS_PERDIDOS } from '@/services/mockData';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [data, setData] = useState<any[]>(OBJETOS_PERDIDOS);

  const filtered = data.filter((m:any) => JSON.stringify(m).toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Objetos Perdidos" subtitle="Registro y seguimiento de objetos perdidos" onAdd={()=>{setForm({});setModal(true);}} />
      <StatsRow>
        <StatCard label="Total" value={data.length} color={C.orange} bg={C.orangeBg} icon="🔍" />
        <StatCard label="Encontrados" value={data.filter((o:any)=>o.estado==='ENCONTRADO').length} color={C.warning} bg={C.warningBg} icon="📦" /><StatCard label="Entregados" value={data.filter((o:any)=>o.estado==='ENTREGADO').length} color={C.success} bg={C.successBg} icon="✅" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar..." />
      <FlatList data={filtered} keyExtractor={(m:any)=>String(m.id_objeto)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="🔍" />}
        renderItem={({item:m})=>(
          <DataCard title={m.descripcion} subtitle={`${m.lugar_encontrado??'—'} · ${m.fecha_reporte}`}
            badge={<Badge value={m.estado} />} meta={`Q ${m.valor_estimado??0}`}
            accentColor={C.orange}
            onDelete={()=>setData(d=>d.filter((x:any)=>x!==m))}>
            <Text style={{fontSize:11,color:C.muted}}>{`Encontrado por: ${m.encontrado_por??'—'} · Cat: ${m.categoria_objeto??'—'}`}</Text>
          </DataCard>
        )}
      />
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={()=>{Alert.alert('OK','Registro guardado');setModal(false);}}>
        <FF label="Descripción *" value={form.desc??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,desc:t}))} /><FF label="Categoría" value={form.cat??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,cat:t}))} /><FF label="Lugar (AEROPUERTO/VUELO/SALA_ESPERA/etc)" value={form.lugar??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,lugar:t}))} /><FF label="Encontrado por" value={form.quien??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,quien:t}))} /><FF label="Valor Estimado (Q)" value={String(form.valor??'')} onChangeText={(t:string)=>setForm((f:any)=>({...f,valor:t}))} keyboardType="numeric" />
      </FormModal>
    </SafeAreaView>
  );
}
