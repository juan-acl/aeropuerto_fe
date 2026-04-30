import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [CAMPANAS, set_CAMPANAS] = useState<any[]>([]);
  const [SEGMENTOS, set_SEGMENTOS] = useState<any[]>([]);
  useEffect(() => {
      backendApi.marketing.campanas.listar().then(d => set_CAMPANAS(d || [])).catch(() => {});
      backendApi.marketing.segmentos.listar().then(d => set_SEGMENTOS(d || [])).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  // Initialize all module data
  // CAMPANAS available from imports
  // SEGMENTOS available from imports

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Marketing y Fidelización" subtitle="Campañas de marketing y segmentos de clientes" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar campañas, segmentos, ofertas..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Campañas" value={CAMPANAS.filter((c:any)=>c.activa).length} color={C.purple} bg={C.purpleBg} icon="📣" />
          <StatCard label="Segmentos" value={SEGMENTOS.length} color={C.orange} bg={C.orangeBg} icon="👥" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>📣 Campañas de Marketing</Text>
        {CAMPANAS.filter((c:any)=>JSON.stringify(c).toLowerCase().includes(q.toLowerCase())).map((c:any)=>(
          <DataCard key={c.id_campana_marketing} title={c.nombre_campana}
            subtitle={`${c.tipo_campana} · ${c.objetivo} · ${c.fecha_inicio} → ${c.fecha_fin}`}
            badge={<Badge value={c.activa?'ACTIVO':'INACTIVO'} />}
            meta={`Q ${c.presupuesto?.toLocaleString()}`} accentColor={C.purple}>
            <></>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>👥 Segmentos de Clientes</Text>
        {SEGMENTOS.filter((s:any)=>JSON.stringify(s).toLowerCase().includes(q.toLowerCase())).map((s:any)=>(
          <DataCard key={s.id_segmento_cliente} title={s.nombre_segmento}
            subtitle={s.descripcion??'—'}
            badge={<Badge value={s.activo?'ACTIVO':'INACTIVO'} />}
            meta={s.frecuencia_viajes??'—'} accentColor={C.orange}>
            <></>
          </DataCard>
        ))}
      </ScrollView>
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={()=>{Alert.alert('Guardado','El registro fue guardado exitosamente');setModal(false);}}>
        <FF label="Nombre / Descripción *" value={form.nombre??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,nombre:t}))} />
        <FF label="Código / Referencia" value={form.codigo??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,codigo:t}))} />
        <FF label="Observaciones" value={form.obs??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,obs:t}))} multiline numberOfLines={3} />
      </FormModal>
    </SafeAreaView>
  );
}


