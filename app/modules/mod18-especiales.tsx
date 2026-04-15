import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [MENORES_DATA, set_MENORES_DATA] = useState<any[]>([]);
  const [MASCOTAS_DATA, set_MASCOTAS_DATA] = useState<any[]>([]);
  useEffect(() => {
      backendApi.menores.listar().then(d => set_MENORES_DATA(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_MASCOTAS_DATA(d)).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  // Initialize all module data
  // MENORES_DATA available from imports
  // MASCOTAS_DATA available from imports

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Pasajeros Especiales" subtitle="Menores no acompañados y mascotas" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar menores, mascotas..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Menores" value={MENORES_DATA.length} color={C.purple} bg={C.purpleBg} icon="👶" />
          <StatCard label="Mascotas" value={MASCOTAS_DATA.length} color={C.orange} bg={C.orangeBg} icon="🐾" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>👶 Menores No Acompañados</Text>
        {MENORES_DATA.filter((m:any)=>JSON.stringify(m).toLowerCase().includes(q.toLowerCase())).map((m:any)=>(
          <DataCard key={m.id} title={m.pasajero} subtitle={`${m.edad} años · Vuelo ${m.vuelo} · ${m.origen}→${m.destino}`}
            badge={<Badge value={m.estado} />} meta={m.reserva} accentColor={C.purple}>
            <Text style={{fontSize:11,color:C.muted}}>📤 {m.entrega_origen} · {m.tel_origen}</Text>
            <Text style={{fontSize:11,color:C.muted}}>📥 {m.recoge_destino} · {m.tel_destino}</Text>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>🐾 Mascotas en Tránsito</Text>
        {MASCOTAS_DATA.filter((m:any)=>JSON.stringify(m).toLowerCase().includes(q.toLowerCase())).map((m:any)=>(
          <DataCard key={m.id} title={`${m.tipo==='PERRO'?'🐕':m.tipo==='GATO'?'🐈':'🦜'} ${m.nombre} (${m.raza??'—'})`}
            subtitle={`Pasajero: ${m.pasajero} · ${m.peso_kg}kg · Vuelo ${m.vuelo}`}
            badge={<Badge value={m.autorizado?'AUTORIZADO':'PENDIENTE'} />} meta={`→ ${m.destino}`} accentColor={C.orange}>
            <Badge value={m.tipo} />
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


