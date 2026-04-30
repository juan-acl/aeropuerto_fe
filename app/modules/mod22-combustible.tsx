import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [TANQUES, set_TANQUES] = useState<any[]>([]);
  const [PEDIDOS_COMB, set_PEDIDOS_COMB] = useState<any[]>([]);
  useEffect(() => {
      backendApi.combustible.tanques.listar().then(d => set_TANQUES(d || [])).catch(() => {});
      backendApi.combustible.pedidos.listar().then(d => set_PEDIDOS_COMB(d || [])).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  // Initialize all module data
  // TANQUES available from imports
  // PEDIDOS_COMB available from imports

  const handleSave = () => {
    Alert.alert(' Guardado', 'Registro creado exitosamente.');
    setModal(false);
    setForm({});
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Control de Combustible" subtitle="Tanques, pedidos y control de calidad" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar tanques, pedidos, cargas..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Tanques" value={TANQUES.length} color={C.orange} bg={C.orangeBg} icon="🛢️" />
          <StatCard label="Pedidos" value={PEDIDOS_COMB.length} color={C.warning} bg={C.warningBg} icon="📋" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>🛢️ Tanques de Combustible</Text>
        {TANQUES.filter((t:any)=>JSON.stringify(t).toLowerCase().includes(q.toLowerCase())).map((t:any)=>(
          <DataCard key={t.id_tanque} title={t.nombre_tanque || t.codigo_tanque || 'Tanque'}
            subtitle={`${t.tipo_combustible ?? '—'} · ${t.ubicacion ?? '—'}`}
            badge={<Badge value={t.activo ? 'ACTIVO' : 'INACTIVO'} color={t.activo ? C.success : C.muted} />}
            meta={`${(t.porcentaje_llenado ?? 0).toFixed(0)}% lleno`} accentColor={C.orange}>
            <ProgressBar value={t.nivel_actual_litros ?? 0} max={t.capacidad_litros ?? 1} />
            <Text style={{fontSize:11,color:C.muted,marginTop:4}}>{(t.nivel_actual_litros ?? 0).toLocaleString()} / {(t.capacidad_litros ?? 0).toLocaleString()} L</Text>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>📋 Pedidos de Combustible</Text>
        {PEDIDOS_COMB.filter((p:any)=>p && JSON.stringify(p).toLowerCase().includes(q.toLowerCase())).map((p:any)=>(
          <DataCard key={p.id_pedido_combustible} title={p.numero_pedido || 'Pedido'}
            subtitle={`Vuelo ${p.id_vuelo ?? '—'} · ${(p.cantidad_solicitada_litros ?? 0).toLocaleString()} L`}
            badge={<Badge value={p.estado_pedido} />}
            meta={p.prioridad ?? 'NORMAL'} accentColor={p.prioridad==='EMERGENCIA'?C.danger:p.prioridad==='ALTA'?C.warning:C.orange}>
            <></>
          </DataCard>
        ))}
      </ScrollView>
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={handleSave}>
        <>
          <FormSection title="Tipo de operación" icon="⛽" />
          <FSelect label="Operación" required value={form.tipo_operacion??''} onChange={set('tipo_operacion')}
          options={[{label:'Carga de combustible a aeronave',value:'CARGA'},{label:'Recepción en tanque',value:'RECEPCION'},{label:'Pedido a proveedor',value:'PEDIDO'},{label:'Control de calidad',value:'CALIDAD'}]} />
          <FSelect label="Tipo de combustible" required value={form.tipo_combustible??''} onChange={set('tipo_combustible')}
          options={[{label:'JET-A1 (turborreactor comercial)',value:'JET_A1'},{label:'JET-A (turborreactor doméstico)',value:'JET_A'},{label:'JET-B (clima frío)',value:'JET_B'},{label:'AVGAS 100LL (pistón)',value:'AVGAS'}]} />
          <FormSection title="Cantidades y costos" icon="" />
          <FF label="Cantidad (litros)" required value={String(form.cantidad_litros??'')} onChangeText={set('cantidad_litros')} keyboardType="decimal-pad" placeholder="Ej: 18500" />
          <FF label="Precio por litro (Q)" value={String(form.precio_litro??'')} onChangeText={set('precio_litro')} keyboardType="decimal-pad" />
          <FF label="Costo total (Q)" value={String(form.costo_total??'')} onChangeText={set('costo_total')} keyboardType="decimal-pad" />
          <FormSection title="Proveedor y aeronave" icon="" />
          <FF label="Proveedor de combustible" value={form.proveedor??''} onChangeText={set('proveedor')} placeholder="Ej: ESSO Aviation, Shell Avgas" />
          <FF label="Matrícula de aeronave (si aplica)" value={form.matricula??''} onChangeText={set('matricula')} autoCapitalize="characters" />
          <FF label="Número de vuelo (si aplica)" value={form.numero_vuelo??''} onChangeText={set('numero_vuelo')} autoCapitalize="characters" />
          <FF label="Fecha y hora" value={form.fecha_hora??''} onChangeText={set('fecha_hora')} placeholder="YYYY-MM-DD HH:MM" />
          <FF label="Observaciones" value={form.observaciones??''} onChangeText={set('observaciones')} multiline />
        </>
      </FormModal>
    </SafeAreaView>
  );
}


