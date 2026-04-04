import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { CONTRATOS_DATA, NORMATIVAS } from '@/services/mockData';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  // Initialize all module data
  // CONTRATOS_DATA available from imports
  // NORMATIVAS available from imports

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Gestión Documental" subtitle="Contratos y normativas aplicables" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar contratos, normativas, licencias..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Contratos" value={CONTRATOS_DATA.filter((c:any)=>c.estado==='VIGENTE').length} color={C.navy} bg={C.infoBg} icon="📜" />
          <StatCard label="Normativas" value={NORMATIVAS.filter((n:any)=>n.activa).length} color={C.teal} bg={C.tealBg} icon="⚖️" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>📜 Contratos</Text>
        {CONTRATOS_DATA.filter((c:any)=>JSON.stringify(c).toLowerCase().includes(q.toLowerCase())).map((c:any)=>(
          <DataCard key={c.id_contrato} title={c.nombre_contrato}
            subtitle={`${c.numero_contrato} · ${c.contraparte_nombre}`}
            badge={<Badge value={c.estado} />}
            meta={`Q ${c.monto_total?.toLocaleString()}`} accentColor={C.navy}>
            <Text style={{fontSize:11,color:C.muted}}>{c.tipo_contrato} · {c.fecha_inicio} → {c.fecha_fin}</Text>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>⚖️ Normativas Aplicables</Text>
        {NORMATIVAS.filter((n:any)=>JSON.stringify(n).toLowerCase().includes(q.toLowerCase())).map((n:any)=>(
          <DataCard key={n.id_normativa} title={n.titulo_normativa}
            subtitle={`${n.codigo_normativa} · ${n.entidad_emisora??'—'}`}
            badge={<Badge value={n.activa?'ACTIVO':'INACTIVO'} />}
            meta={n.ambito_aplicacion??'—'} accentColor={C.teal}>
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
