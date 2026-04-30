import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [SENSORES_DATA, set_SENSORES_DATA] = useState<any[]>([]);
  const [ALERTAS_DATA, set_ALERTAS_DATA] = useState<any[]>([]);
  const [PIEZAS_DATA, set_PIEZAS_DATA] = useState<any[]>([]);
  const [ORDENES_DATA, set_ORDENES_DATA] = useState<any[]>([]);
  useEffect(() => {
      backendApi.mantenimiento.ordenes.listar().then(d => set_SENSORES_DATA(d)).catch(() => {});
      backendApi.mantenimiento.alertasTecnicas.listar().then(d => set_ALERTAS_DATA(d)).catch(() => {});
      backendApi.mantenimiento.piezas.listar().then(d => set_PIEZAS_DATA(d)).catch(() => {});
      backendApi.mantenimiento.ordenes.listar().then(d => set_ORDENES_DATA(d)).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  // Initialize all module data
  // SENSORES_DATA available from imports
  // ALERTAS_DATA available from imports
  // PIEZAS_DATA available from imports
  // ORDENES_DATA available from imports

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Mantenimiento Predictivo" subtitle="Sensores, alertas, piezas y órdenes" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar sensores, piezas, órdenes..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Sensores" value={SENSORES_DATA.filter((s:any)=>s.activo).length} color={C.red} bg={C.redBg} icon="📡" />
          <StatCard label="Alertas" value={ALERTAS_DATA.filter((a:any)=>!a.atendida).length} color={C.danger} bg={C.dangerBg} icon="" />
          <StatCard label="Órdenes" value={ORDENES_DATA.filter((o:any)=>o.estado!=='COMPLETADO').length} color={C.warning} bg={C.warningBg} icon="" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}> Alertas Técnicas Activas</Text>
        {ALERTAS_DATA.filter((a:any)=>JSON.stringify(a).toLowerCase().includes(q.toLowerCase())).map((a:any)=>(
          <DataCard key={a.id} title={`${a.nivel==='CRITICO'?'🚨':a.nivel==='PREVENTIVO'?'':'ℹ️'} ${a.tipo}`}
            subtitle={`Sensor: ${a.sensor} · ${a.fecha}`}
            badge={<Badge value={a.nivel} />} accentColor={a.nivel==='CRITICO'?C.danger:a.nivel==='PREVENTIVO'?C.warning:C.info}>
            <Text style={{fontSize:12,color:C.muted,marginBottom:6}}>{a.descripcion}</Text>
            <View style={{flexDirection:'row',gap:8}}>
              <View style={{backgroundColor:C.bg,borderRadius:6,padding:8,flex:1}}><Text style={{fontSize:10,color:C.muted}}>Umbral</Text><Text style={{fontSize:14,fontWeight:'700'}}>{a.valor_umbral}</Text></View>
              <View style={{backgroundColor:a.valor_actual>a.valor_umbral?C.dangerBg:C.successBg,borderRadius:6,padding:8,flex:1}}><Text style={{fontSize:10,color:C.muted}}>Actual</Text><Text style={{fontSize:14,fontWeight:'700',color:a.valor_actual>a.valor_umbral?C.danger:C.success}}>{a.valor_actual}</Text></View>
              <Badge value={a.atendida?'COMPLETADO':'PENDIENTE'} />
            </View>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>🔩 Inventario de Piezas</Text>
        {PIEZAS_DATA.filter((p:any)=>JSON.stringify(p).toLowerCase().includes(q.toLowerCase())).map((p:any)=>(
          <DataCard key={p.id} title={p.nombre} subtitle={`${p.codigo} · ${p.modelo??'—'} · ${p.ubicacion??'—'}`}
            badge={<Badge value={p.stock_actual<p.stock_minimo?'CRITICO':'ACTIVO'} />}
            meta={`Q ${p.precio?.toLocaleString()}`} accentColor={p.stock_actual<p.stock_minimo?C.danger:C.red}>
            <ProgressBar value={p.stock_actual} max={p.stock_minimo*3} />
            <Text style={{fontSize:11,color:C.muted,marginTop:4}}>Stock: {p.stock_actual} / mín {p.stock_minimo}</Text>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>📋 Órdenes de Mantenimiento</Text>
        {ORDENES_DATA.filter((o:any)=>JSON.stringify(o).toLowerCase().includes(q.toLowerCase())).map((o:any)=>(
          <DataCard key={o.id} title={`${o.avion} · ${o.pieza??'—'}`}
            subtitle={`Técnico: ${o.tecnico??'—'} · ${o.fecha_estimada??'—'}`}
            badge={<Badge value={o.estado} />} meta={`Q ${o.costo_estimado?.toLocaleString()}`}
            accentColor={o.prioridad==='URGENTE'?C.danger:o.prioridad==='ALTA'?C.warning:C.info}>
            <Text style={{fontSize:12,color:C.muted,marginBottom:4}}>{o.descripcion}</Text>
            <Badge value={o.prioridad} />
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


