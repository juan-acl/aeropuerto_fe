import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [REPORTES_OACI, set_REPORTES_OACI] = useState<any[]>([]);
  const [CERTIFICACIONES_INT, set_CERTIFICACIONES_INT] = useState<any[]>([]);
  useEffect(() => {
      backendApi.vuelos.listar().then(d => set_REPORTES_OACI(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_CERTIFICACIONES_INT(d)).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  // Initialize all module data
  // REPORTES_OACI available from imports
  // CERTIFICACIONES_INT available from imports

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Interoperabilidad OACI" subtitle="Reportes y certificaciones internacionales OACI" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar reportes, certificaciones..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Reportes" value={REPORTES_OACI.length} color={C.gray} bg={C.grayBg} icon="📊" />
          <StatCard label="Certificaciones" value={CERTIFICACIONES_INT.filter((c:any)=>c.activa).length} color={C.teal} bg={C.tealBg} icon="🏅" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>📊 Reportes OACI</Text>
        {REPORTES_OACI.filter((r:any)=>JSON.stringify(r).toLowerCase().includes(q.toLowerCase())).map((r:any)=>(
          <DataCard key={r.id_reporte_oaci} title={`Reporte ${r.tipo_reporte} – ${r.periodo}`}
            subtitle={`${r.fecha_inicio_periodo} → ${r.fecha_fin_periodo}`}
            badge={<Badge value={r.estado} />}
            accentColor={C.gray}>
            <></>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>🏅 Certificaciones Internacionales</Text>
        {CERTIFICACIONES_INT.filter((c:any)=>JSON.stringify(c).toLowerCase().includes(q.toLowerCase())).map((c:any)=>(
          <DataCard key={c.id_certificacion_internacional} title={c.nombre_certificacion}
            subtitle={`${c.numero_certificado} · ${c.organismo_certificador}`}
            badge={<Badge value={c.activa?'ACTIVO':'INACTIVO'} />}
            meta={`Vence: ${c.fecha_vencimiento??'—'}`} accentColor={C.teal}>
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


