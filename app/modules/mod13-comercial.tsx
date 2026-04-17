import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';
type Tab = 'concesiones'|'ventas'|'salones'|'estacionamiento';
export default function Mod13() {
  const [CONCESIONES, set_CONCESIONES] = useState<any[]>([]);
  const [VENTAS, set_VENTAS] = useState<any[]>([]);
  const [SALONES_VIP, set_SALONES_VIP] = useState<any[]>([]);
  const [ESTACIONAMIENTOS, set_ESTACIONAMIENTOS] = useState<any[]>([]);
  useEffect(() => {
      backendApi.vuelos.listar().then(d => set_CONCESIONES(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_VENTAS(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_SALONES_VIP(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_ESTACIONAMIENTOS(d)).catch(() => {});
  }, []);

  const [tab, setTab] = useState<Tab>('concesiones');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [concesiones, setConcesiones] = useState(CONCESIONES);
  const [ventas, setVentas] = useState(VENTAS);
  const [salones, setSalones] = useState(SALONES_VIP);
  const [estacionamientos, setEstacionamientos] = useState(ESTACIONAMIENTOS);
  const TABS = [{k:'concesiones',l:' Concesiones'},{k:'ventas',l:'💳 Ventas'},{k:'salones',l:'🛋️ VIP'},{k:'estacionamiento',l:'🚗 Estacion.'}];
  const renderContent = () => {
    if (tab==='concesiones') {
      const data = concesiones.filter(c=>`${c.nombre_comercial} ${c.tipo_negocio}`.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={c=>String(c.id_concesion)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="" />}
        renderItem={({item:c})=>(
          <DataCard title={c.nombre_comercial} subtitle={`${c.tipo_negocio} · ${c.ubicacion_terminal??'—'}`}
            badge={<Badge value={c.activo?'ACTIVO':'INACTIVO'} />} meta={`Q ${c.canon_mensual?.toLocaleString()}/mes`} accentColor={C.orange}
            onDelete={()=>setConcesiones(d=>d.filter(x=>x.id_concesion!==c.id_concesion))}>
            <Text style={{fontSize:11,color:C.muted}}>Empresa: {c.empresa??'—'}</Text>
          </DataCard>
        )} />;
    }
    if (tab==='ventas') {
      const data = ventas.filter(v=>JSON.stringify(v).toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={v=>String(v.id_venta)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="💳" />}
        renderItem={({item:v})=>(
          <DataCard title={`Venta #${v.id_venta}`} subtitle={`${v.fecha_venta?.split('T')[0]??'—'} · ${v.tipo_cliente??'—'}`}
            badge={<Badge value={v.tipo_cliente??'PASAJERO'} />} meta={`Q ${v.total??0}`} accentColor={C.green}
            onDelete={()=>setVentas(d=>d.filter(x=>x.id_venta!==v.id_venta))}>
            <Text style={{fontSize:11,color:C.muted}}>Subtotal: {v.subtotal} · IVA: {v.impuestos} · Pago: {v.metodo_pago??'—'}</Text>
          </DataCard>
        )} />;
    }
    if (tab==='salones') {
      const data = salones.filter(s=>s.nombre_salon.toLowerCase().includes(q.toLowerCase()));
      return <FlatList data={data} keyExtractor={s=>String(s.id_salon)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="🛋️" />}
        renderItem={({item:s})=>(
          <DataCard title={s.nombre_salon} subtitle={`${s.ubicacion??'—'} · Cap: ${s.capacidad??'—'}`}
            badge={<Badge value={s.activo?'ACTIVO':'INACTIVO'} />} meta={`${s.horario_apertura??'—'} – ${s.horario_cierre??'—'}`} accentColor={C.purple}
            onDelete={()=>setSalones(d=>d.filter(x=>x.id_salon!==s.id_salon))} />
        )} />;
    }
    const data = estacionamientos.filter(e=>JSON.stringify(e).toLowerCase().includes(q.toLowerCase()));
    return <FlatList data={data} keyExtractor={e=>String(e.id_estacionamiento)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
      ListEmptyComponent={<EmptyState icon="🚗" />}
      renderItem={({item:e})=>(
        <DataCard title={`Espacio ${e.numero_espacio}`} subtitle={e.tipo_espacio}
          badge={<Badge value={e.disponible?'DISPONIBLE':'OCUPADO'} />}
          meta={`Q ${e.tarifa_por_hora}/h`} accentColor={e.disponible?C.success:C.danger}
          onDelete={()=>setEstacionamientos(d=>d.filter(x=>x.id_estacionamiento!==e.id_estacionamiento))}>
          <Text style={{fontSize:11,color:C.muted}}>Tarifa diaria: Q {e.tarifa_diaria}</Text>
        </DataCard>
      )} />;
  };
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Área Comercial" subtitle="Concesiones, ventas, VIP y estacionamiento" onAdd={()=>{setForm({});setModal(true);}} />
      <View style={{flexDirection:'row',backgroundColor:C.bgCard,borderBottomWidth:1,borderBottomColor:C.border}}>
        {TABS.map(t=><View key={t.k} style={{flex:1,borderBottomWidth:2,borderBottomColor:tab===t.k?C.navy:'transparent',paddingVertical:8,alignItems:'center'}}>
          <Text onPress={()=>{setTab(t.k as Tab);setQ('');}} style={{fontSize:10,fontWeight:'600',color:tab===t.k?C.navy:C.muted}}>{t.l}</Text>
        </View>)}
      </View>
      <StatsRow>
        <StatCard label="Concesiones" value={concesiones.length} color={C.orange} bg={C.orangeBg} icon="" />
        <StatCard label="Ventas" value={ventas.length} color={C.green} bg={C.greenBg} icon="💳" />
        <StatCard label="Disponibles" value={estacionamientos.filter(e=>e.disponible).length} color={C.success} bg={C.successBg} icon="🚗" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar en área comercial..." />
      {renderContent()}
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={()=>{Alert.alert('OK','Registro guardado');setModal(false);}}>
        <FF label="Nombre / Descripción" value={form.nombre??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,nombre:t}))} />
        <FF label="Tipo" value={form.tipo??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,tipo:t}))} />
        <FF label="Ubicación" value={form.ubicacion??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,ubicacion:t}))} />
        <FF label="Costo / Tarifa (Q)" value={String(form.costo??'')} onChangeText={(t:string)=>setForm((f:any)=>({...f,costo:t}))} keyboardType="decimal-pad" />
      </FormModal>
    </SafeAreaView>
  );
}


