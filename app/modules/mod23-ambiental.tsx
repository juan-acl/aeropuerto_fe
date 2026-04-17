import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [RESIDUOS, set_RESIDUOS] = useState<any[]>([]);
  const [HUELLAS_CARBONO, set_HUELLAS_CARBONO] = useState<any[]>([]);
  useEffect(() => {
      backendApi.vuelos.listar().then(d => set_RESIDUOS(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_HUELLAS_CARBONO(d)).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  // Initialize all module data
  // RESIDUOS available from imports
  // HUELLAS_CARBONO available from imports

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Gestión Ambiental" subtitle="Gestión de residuos y huella de carbono" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar residuos, huellas de carbono..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Residuos" value={RESIDUOS.length} color={C.green} bg={C.greenBg} icon="♻️" />
          <StatCard label="Huellas CO₂" value={HUELLAS_CARBONO.length} color={C.teal} bg={C.tealBg} icon="" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>♻️ Gestión de Residuos</Text>
        {RESIDUOS.filter((r:any)=>JSON.stringify(r).toLowerCase().includes(q.toLowerCase())).map((r:any)=>(
          <DataCard key={r.id_residuo} title={`${r.tipo_residuo} · ${r.fecha_recoleccion}`}
            subtitle={`Origen: ${r.origen} · ${r.empresa_recolectora??'—'}`}
            badge={<Badge value={r.tratamiento??'RECICLAJE'} />}
            meta={`${r.cantidad_kg} kg`} accentColor={C.green}>
            <Text style={{fontSize:11,color:C.muted}}>Costo tratamiento: Q {r.costo_tratamiento??0}</Text>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}> Huella de Carbono por Vuelo</Text>
        {HUELLAS_CARBONO.filter((h:any)=>JSON.stringify(h).toLowerCase().includes(q.toLowerCase())).map((h:any)=>(
          <DataCard key={h.id_huella_carbono} title={`Vuelo ID: ${h.id_vuelo}`}
            subtitle={`${h.categoria_vuelo??'—'} · ${h.distancia_vuelo_km?.toLocaleString()} km`}
            badge={<Badge value={h.categoria_vuelo??'MEDIO'} />}
            meta={`${h.co2_emitido_kg?.toLocaleString()} kg CO₂`} accentColor={C.teal}>
            <Text style={{fontSize:11,color:C.muted}}>Por pasajero: {h.co2_por_pasajero_kg} kg · Combustible: {h.combustible_consumido_litros?.toLocaleString()} L</Text>
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


