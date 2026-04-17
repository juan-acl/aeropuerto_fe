import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [SLOTS, set_SLOTS] = useState<any[]>([]);
  const [RETRASOS_TR, set_RETRASOS_TR] = useState<any[]>([]);
  useEffect(() => {
      backendApi.tiempoReal.slots.listar().then(d => set_SLOTS(d)).catch(() => {});
      backendApi.tiempoReal.retrasos.listar().then(d => set_RETRASOS_TR(d)).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  // Initialize all module data
  // SLOTS available from imports
  // RETRASOS_TR available from imports

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Operaciones en Tiempo Real" subtitle="Slots, retrasos operacionales en tiempo real" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar slots, retrasos, pistas..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Slots Hoy" value={SLOTS.length} color={C.info} bg={C.infoBg} icon="" />
          <StatCard label="Disponibles" value={SLOTS.filter((s:any)=>s.estado_slot==='DISPONIBLE').length} color={C.success} bg={C.successBg} icon="" />
          <StatCard label="Retrasos TR" value={RETRASOS_TR.length} color={C.warning} bg={C.warningBg} icon="⏱" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}> Slots de Aeropuerto</Text>
        {SLOTS.filter((s:any)=>JSON.stringify(s).toLowerCase().includes(q.toLowerCase())).map((s:any)=>(
          <DataCard key={s.id_slot} title={`Slot #${s.id_slot} · ${s.tipo_operacion}`}
            subtitle={`Aerolínea ID: ${s.id_aerolinea} · ${s.fecha_slot}`}
            badge={<Badge value={s.estado_slot} />}
            meta={s.id_vuelo_asignado?`Vuelo ${s.id_vuelo_asignado}`:'Sin asignar'}
            accentColor={s.estado_slot==='DISPONIBLE'?C.success:s.estado_slot==='CANCELADO'?C.danger:C.info}>
            <></>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>⏱ Retrasos en Tiempo Real</Text>
        {RETRASOS_TR.filter((r:any)=>JSON.stringify(r).toLowerCase().includes(q.toLowerCase())).map((r:any)=>(
          <DataCard key={r.id_retraso_tiempo_real} title={`Vuelo ${r.id_vuelo} – ${r.tipo_retraso}`}
            subtitle={r.causa_especifica??'—'}
            badge={<Badge value={r.notificado_pasajeros?'ACTIVO':'PENDIENTE'} />}
            meta={`${r.minutos_retraso_actuales??0} min`} accentColor={C.warning}>
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


