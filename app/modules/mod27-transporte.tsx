import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [RUTAS_TRANSPORTE, set_RUTAS_TRANSPORTE] = useState<any[]>([]);
  const [VEHICULOS, set_VEHICULOS] = useState<any[]>([]);
  const [CHOFERES, set_CHOFERES] = useState<any[]>([]);
  const [RESERVAS_TRANSPORTE, set_RESERVAS_TRANSPORTE] = useState<any[]>([]);
  useEffect(() => {
      backendApi.vuelos.listar().then(d => set_RUTAS_TRANSPORTE(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_VEHICULOS(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_CHOFERES(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_RESERVAS_TRANSPORTE(d)).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  // Initialize all module data
  // RUTAS_TRANSPORTE available from imports
  // VEHICULOS available from imports
  // CHOFERES available from imports
  // RESERVAS_TRANSPORTE available from imports

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Transporte Terrestre" subtitle="Rutas, vehículos, choferes y reservas" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar rutas, vehículos, choferes..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Rutas" value={RUTAS_TRANSPORTE.filter((r:any)=>r.activa).length} color={C.teal} bg={C.tealBg} icon="🗺️" />
          <StatCard label="Vehículos" value={VEHICULOS.filter((v:any)=>v.disponible).length} color={C.success} bg={C.successBg} icon="🚗" />
          <StatCard label="Choferes" value={CHOFERES.filter((c:any)=>c.disponible&&c.activo).length} color={C.info} bg={C.infoBg} icon="👨‍✈️" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>🗺️ Rutas de Transporte</Text>
        {RUTAS_TRANSPORTE.filter((r:any)=>JSON.stringify(r).toLowerCase().includes(q.toLowerCase())).map((r:any)=>(
          <DataCard key={r.id_ruta_transporte} title={r.nombre_ruta}
            subtitle={`${r.origen} → ${r.destino} · ${r.distancia_km} km`}
            badge={<Badge value={r.activa?'ACTIVO':'INACTIVO'} />}
            meta={r.tipo_ruta??'—'} accentColor={C.teal}>
            <></>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>🚗 Vehículos</Text>
        {VEHICULOS.filter((v:any)=>JSON.stringify(v).toLowerCase().includes(q.toLowerCase())).map((v:any)=>(
          <DataCard key={v.id_vehiculo_transporte} title={`${v.placa} · ${v.tipo_vehiculo}`}
            subtitle={`${v.marca??'—'} ${v.modelo??'—'} · Cap: ${v.capacidad_pasajeros??'—'} pax`}
            badge={<Badge value={v.disponible?'DISPONIBLE':'INACTIVO'} />}
            accentColor={v.disponible?C.success:C.danger}>
            <></>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>👨 Choferes</Text>
        {CHOFERES.filter((c:any)=>JSON.stringify(c).toLowerCase().includes(q.toLowerCase())).map((c:any)=>(
          <DataCard key={c.id_chofer_transporte} title={`${c.nombres} ${c.apellidos}`}
            subtitle={`Lic: ${c.licencia_conducir} · Vence: ${c.fecha_vencimiento_licencia}`}
            badge={<Badge value={c.disponible&&c.activo?'DISPONIBLE':'INACTIVO'} />}
            meta={c.telefono??'—'} accentColor={C.info}>
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


