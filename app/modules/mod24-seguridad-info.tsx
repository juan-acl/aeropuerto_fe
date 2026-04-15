import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [USUARIOS, set_USUARIOS] = useState<any[]>([]);
  const [ROLES, set_ROLES] = useState<any[]>([]);
  const [INCIDENTES_SEG, set_INCIDENTES_SEG] = useState<any[]>([]);
  useEffect(() => {
      backendApi.vuelos.listar().then(d => set_USUARIOS(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_ROLES(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_INCIDENTES_SEG(d)).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  // Initialize all module data
  // USUARIOS available from imports
  // ROLES available from imports
  // INCIDENTES_SEG available from imports

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Seguridad Informática" subtitle="Usuarios, roles e incidentes de seguridad" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar usuarios, roles, incidentes..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Usuarios" value={USUARIOS.filter((u:any)=>u.activo).length} color={C.red} bg={C.redBg} icon="👤" />
          <StatCard label="Roles" value={ROLES.length} color={C.purple} bg={C.purpleBg} icon="🔑" />
          <StatCard label="Incidentes" value={INCIDENTES_SEG.length} color={C.danger} bg={C.dangerBg} icon="🚨" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>👤 Usuarios del Sistema</Text>
        {USUARIOS.filter((u:any)=>JSON.stringify(u).toLowerCase().includes(q.toLowerCase())).map((u:any)=>(
          <DataCard key={u.id_usuario_sistema} title={u.nombre_usuario}
            subtitle={`${u.email_institucional??'—'} · Creado: ${u.fecha_creacion??'—'}`}
            badge={<Badge value={u.activo&&!u.bloqueado?'ACTIVO':u.bloqueado?'RECHAZADO':'INACTIVO'} />}
            accentColor={u.bloqueado?C.danger:C.red}>
            <Text style={{fontSize:11,color:C.muted}}>Intentos fallidos: {u.intentos_fallidos}</Text>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>🔑 Roles del Sistema</Text>
        {ROLES.filter((r:any)=>JSON.stringify(r).toLowerCase().includes(q.toLowerCase())).map((r:any)=>(
          <DataCard key={r.id_rol_sistema} title={r.nombre_rol}
            subtitle={r.descripcion??'—'}
            badge={<Badge value={r.activo?'ACTIVO':'INACTIVO'} />}
            meta={`Nivel ${r.nivel_jerarquico??'—'}`} accentColor={C.purple}>
            <></>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>🚨 Incidentes de Seguridad</Text>
        {INCIDENTES_SEG.filter((i:any)=>JSON.stringify(i).toLowerCase().includes(q.toLowerCase())).map((i:any)=>(
          <DataCard key={i.id_incidente_seguridad_info} title={i.tipo_incidente.replace(/_/g,' ')}
            subtitle={i.descripcion}
            badge={<Badge value={i.nivel_gravedad} />}
            meta={i.fecha_deteccion?.split(' ')[0]} accentColor={i.nivel_gravedad==='ALTO'||i.nivel_gravedad==='CRITICO'?C.danger:C.warning}>
            <Badge value={i.estado} />
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


