import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { PLANES_EMERG, EQUIPOS_EMERG, ACTIVACIONES } from '@/services/mockData';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  // Initialize all module data
  // PLANES_EMERG available from imports
  // EQUIPOS_EMERG available from imports
  // ACTIVACIONES available from imports

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Gestión de Emergencias" subtitle="Planes, equipos y activaciones de emergencia" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar emergencias, planes, equipos..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Planes" value={PLANES_EMERG.filter((p:any)=>p.activo).length} color={C.danger} bg={C.dangerBg} icon="📋" />
          <StatCard label="Equipos" value={EQUIPOS_EMERG.filter((e:any)=>e.estado==='DISPONIBLE').length} color={C.success} bg={C.successBg} icon="🚑" />
          <StatCard label="Activaciones" value={ACTIVACIONES.length} color={C.red} bg={C.redBg} icon="🚨" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>📋 Planes de Emergencia</Text>
        {PLANES_EMERG.filter((p:any)=>JSON.stringify(p).toLowerCase().includes(q.toLowerCase())).map((p:any)=>(
          <DataCard key={p.id_plan_emergencia} title={p.nombre_plan}
            subtitle={`${p.codigo_plan} · ${p.tipo_emergencia.replace(/_/g,' ')}`}
            badge={<Badge value={p.activo?'ACTIVO':'INACTIVO'} />}
            meta={p.nivel_activacion??'—'} accentColor={C.danger}>
            <Text style={{fontSize:11,color:C.muted}}>Responsable: {p.responsable_activacion??'—'}</Text>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>🚑 Equipos de Emergencia</Text>
        {EQUIPOS_EMERG.filter((e:any)=>JSON.stringify(e).toLowerCase().includes(q.toLowerCase())).map((e:any)=>(
          <DataCard key={e.id_equipo_emergencia} title={e.nombre_equipo}
            subtitle={`${e.tipo_equipo.replace(/_/g,' ')} · ${e.ubicacion_habitual??'—'}`}
            badge={<Badge value={e.estado} />}
            accentColor={e.estado==='DISPONIBLE'?C.success:e.estado==='EN_MANTENIMIENTO'?C.warning:C.danger}>
            <></>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>🚨 Historial de Activaciones</Text>
        {ACTIVACIONES.filter((a:any)=>JSON.stringify(a).toLowerCase().includes(q.toLowerCase())).map((a:any)=>(
          <DataCard key={a.id_activacion} title={a.tipo_emergencia.replace(/_/g,' ')}
            subtitle={`${a.lugar_incidente??'—'} · ${a.fecha_hora_activacion?.split('T')[0]}`}
            badge={<Badge value={a.estado==='FINALIZADA'?'FINALIZADA':'ACTIVA_E'} />}
            meta={`${a.personas_afectadas??0} afectados`} accentColor={a.estado==='FINALIZADA'?C.gray:C.danger}>
            <Badge value={a.nivel_activacion} />
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
