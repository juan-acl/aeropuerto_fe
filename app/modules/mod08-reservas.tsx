import React, { useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { RESERVAS, FACTURAS_DATA, PROMOCIONES_DATA } from '@/services/mockData';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';
type Tab = 'reservas'|'facturas'|'promociones';
export default function Mod08() {
  const [tab, setTab] = useState<Tab>('reservas');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [reservas, setReservas] = useState(RESERVAS);
  const [facturas, setFacturas] = useState(FACTURAS_DATA);
  const [promociones, setPromociones] = useState(PROMOCIONES_DATA);
  const TABS = [{k:'reservas',l:'🎟️ Reservas'},{k:'facturas',l:'🧾 Facturas'},{k:'promociones',l:'🏷️ Promociones'}];
  const renderContent = () => {
    if (tab==='reservas') {
      const data = reservas.filter(r=>`${r.codigo_reserva} ${r.pasajero_nombre??''} ${r.numero_vuelo??''}`.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={r=>String(r.id_reserva)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="🎟️" />}
        renderItem={({item:r})=>(
          <DataCard title={r.codigo_reserva} subtitle={`${r.pasajero_nombre??'Pasajero '+r.id_pasajero} · Vuelo ${r.numero_vuelo??r.id_vuelo}`}
            badge={<Badge value={r.estado_reserva} />} meta={`${r.moneda??'USD'} ${r.precio_pagado??0}`} accentColor={C.purple}
            onDelete={()=>setReservas(d=>d.filter(x=>x.id_reserva!==r.id_reserva))}>
            <Text style={{fontSize:11,color:C.muted}}>Asiento: {r.numero_asiento??'—'} · Clase: {r.clase_servicio??'—'} · Check-in: {r.checkin_realizado?'✅':'❌'}</Text>
          </DataCard>
        )} />;
    }
    if (tab==='facturas') {
      const data = facturas.filter(f=>f.numero_factura.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={f=>String(f.id_factura)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="🧾" />}
        renderItem={({item:f})=>(
          <DataCard title={f.numero_factura} subtitle={`Reserva ID: ${f.id_reserva} · ${f.fecha_emision??'—'}`}
            badge={<Badge value="ACTIVO" />} meta={`${f.moneda??'USD'} ${f.total??0}`} accentColor={C.green}
            onDelete={()=>setFacturas(d=>d.filter(x=>x.id_factura!==f.id_factura))}>
            <Text style={{fontSize:11,color:C.muted}}>Subtotal: {f.subtotal} · IVA: {f.impuestos}</Text>
          </DataCard>
        )} />;
    }
    const data = promociones.filter(p=>`${p.codigo_promocion??''} ${p.nombre_promocion??''}`.toLowerCase().includes(q.toLowerCase()));
    return <FlatList data={data} keyExtractor={p=>String(p.id_promocion)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
      ListEmptyComponent={<EmptyState icon="🏷️" />}
      renderItem={({item:p})=>(
        <DataCard title={p.nombre_promocion??'—'} subtitle={`${p.codigo_promocion??'—'} · ${p.tipo_descuento}`}
          badge={<Badge value={p.activa?'ACTIVO':'INACTIVO'} />}
          meta={`${p.usos_actuales}/${p.uso_maximo??'∞'} usos`} accentColor={C.orange}
          onDelete={()=>setPromociones(d=>d.filter(x=>x.id_promocion!==p.id_promocion))}>
          <Text style={{fontSize:11,color:C.muted}}>{p.fecha_inicio} → {p.fecha_fin} · Descuento: {p.valor_descuento} {p.tipo_descuento==='PORCENTAJE'?'%':'USD'}</Text>
        </DataCard>
      )} />;
  };
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Reservas y Boletería" subtitle="Reservas, facturas y promociones" onAdd={()=>{setForm({});setModal(true);}} />
      <View style={{flexDirection:'row',backgroundColor:C.bgCard,borderBottomWidth:1,borderBottomColor:C.border}}>
        {TABS.map(t=><View key={t.k} style={{flex:1,borderBottomWidth:2,borderBottomColor:tab===t.k?C.navy:'transparent',paddingVertical:10,alignItems:'center'}}>
          <Text onPress={()=>{setTab(t.k as Tab);setQ('');}} style={{fontSize:11,fontWeight:'600',color:tab===t.k?C.navy:C.muted}}>{t.l}</Text>
        </View>)}
      </View>
      <StatsRow>
        <StatCard label="Reservas" value={reservas.length} color={C.purple} bg={C.purpleBg} icon="🎟️" />
        <StatCard label="Confirmadas" value={reservas.filter(r=>r.estado_reserva==='CONFIRMADA'||r.estado_reserva==='ABORDADO').length} color={C.success} bg={C.successBg} icon="✅" />
        <StatCard label="Facturas" value={facturas.length} color={C.green} bg={C.greenBg} icon="🧾" />
        <StatCard label="Promociones" value={promociones.filter(p=>p.activa).length} color={C.orange} bg={C.orangeBg} icon="🏷️" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar reserva, factura..." />
      {renderContent()}
      <FormModal visible={modal} title="Nueva Reserva" onClose={()=>setModal(false)} onSave={()=>{Alert.alert('OK','Use el sistema de reservas del backend');setModal(false);}}>
        <FF label="Código Reserva" value={form.codigo??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,codigo:t}))} />
        <FF label="ID Vuelo" value={String(form.id_vuelo??'')} onChangeText={(t:string)=>setForm((f:any)=>({...f,id_vuelo:t}))} keyboardType="numeric" />
        <FF label="ID Pasajero" value={String(form.id_pasajero??'')} onChangeText={(t:string)=>setForm((f:any)=>({...f,id_pasajero:t}))} keyboardType="numeric" />
        <FF label="Clase Servicio" value={form.clase??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,clase:t}))} />
        <FF label="Precio (USD)" value={String(form.precio??'')} onChangeText={(t:string)=>setForm((f:any)=>({...f,precio:t}))} keyboardType="decimal-pad" />
      </FormModal>
    </SafeAreaView>
  );
}
