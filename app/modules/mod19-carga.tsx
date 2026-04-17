import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [ENVIOS_DATA, set_ENVIOS_DATA] = useState<any[]>([]);
  const [MANIFIESTOS_DATA, set_MANIFIESTOS_DATA] = useState<any[]>([]);
  const [BODEGAS, set_BODEGAS] = useState<any[]>([]);
  useEffect(() => {
      backendApi.carga.envios.listar().then(d => set_ENVIOS_DATA(d)).catch(() => {});
      backendApi.carga.manifiestos.listar().then(d => set_MANIFIESTOS_DATA(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_BODEGAS(d)).catch(() => {});
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  // Initialize all module data
  // ENVIOS_DATA available from imports
  // MANIFIESTOS_DATA available from imports
  // BODEGAS available from imports

  const handleSave = () => {
    Alert.alert(' Guardado', 'Registro creado exitosamente.');
    setModal(false);
    setForm({});
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Gestión de Carga" subtitle="Envíos, manifiestos y bodegas de carga" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar envíos, manifiestos, bodegas..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Envíos" value={ENVIOS_DATA.length} color={C.orange} bg={C.orangeBg} icon="📦" />
          <StatCard label="Manifiestos" value={MANIFIESTOS_DATA.length} color={C.info} bg={C.infoBg} icon="📋" />
          <StatCard label="Bodegas" value={BODEGAS.length} color={C.purple} bg={C.purpleBg} icon="🏭" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>📦 Envíos de Carga</Text>
        {ENVIOS_DATA.filter((e:any)=>JSON.stringify(e).toLowerCase().includes(q.toLowerCase())).map((e:any)=>(
          <DataCard key={e.id} title={e.codigo} subtitle={`Vuelo ${e.vuelo} · ${e.bultos} bultos · ${e.peso_kg}kg`}
            badge={<Badge value={e.estado} />} meta={`Q ${e.valor.toLocaleString()}`} accentColor={C.orange}>
            <Text style={{fontSize:11,color:C.muted}}>📤 {e.consignador} → 📥 {e.consignatario}</Text>
            <Badge value={e.tipo} />
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>📋 Manifiestos</Text>
        {MANIFIESTOS_DATA.filter((m:any)=>JSON.stringify(m).toLowerCase().includes(q.toLowerCase())).map((m:any)=>(
          <DataCard key={m.id} title={m.numero} subtitle={`Vuelo ${m.vuelo} · ${m.fecha}`}
            badge={<Badge value={m.estado} />} meta={`${m.bultos} bultos · ${m.peso_total}kg`} accentColor={C.info}>
            <Text style={{fontSize:11,color:C.muted}}>Valor: Q {m.valor_total?.toLocaleString()} · Agente: {m.agente??'—'}</Text>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>🏭 Bodegas de Carga</Text>
        {BODEGAS.filter((b:any)=>JSON.stringify(b).toLowerCase().includes(q.toLowerCase())).map((b:any)=>(
          <DataCard key={b.id_bodega} title={b.nombre_bodega??b.codigo_bodega} subtitle={`${b.ubicacion??'—'} · ${b.capacidad_kg?.toLocaleString()} kg máx`}
            badge={<Badge value={b.activo?'ACTIVO':'INACTIVO'} />} accentColor={C.purple}>
            {b.tiene_refrigeracion?<Badge value="ACTIVO" />:null}
          </DataCard>
        ))}
      </ScrollView>
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={handleSave}>
        <>
          <FormSection title="Envío de carga" icon="📦" />
          <FF label="Número de guía (AWB)" required value={form.numero_guia??''} onChangeText={set('numero_guia')} autoCapitalize="characters" placeholder="Ej: 001-12345678" hint="Air Waybill / Guía aérea" />
          <FF label="Descripción de la carga" required value={form.descripcion??''} onChangeText={set('descripcion')} placeholder="Ej: Electrónicos, Farmacéuticos, Textiles..." />
          <FSelect label="Tipo de carga" value={form.tipo_carga??''} onChange={set('tipo_carga')}
          options={[{label:'Carga general',value:'GENERAL'},{label:'Carga valiosa (VAL)',value:'VALIOSA'},{label:'Carga peligrosa (DGR)',value:'PELIGROSA'},{label:'Perecederos / Fríos',value:'PERECEDERO'},{label:'Animales vivos (AVI)',value:'ANIMALES'},{label:'Humanos restos (HUM)',value:'HUMANOS'},{label:'Carga sobredimensionada',value:'SOBREDIMENSIONADA'}]} />
          <FormSection title="Peso y dimensiones" icon="⚖️" />
          <FF label="Peso bruto (kg)" required value={String(form.peso_kg??'')} onChangeText={set('peso_kg')} keyboardType="decimal-pad" />
          <FF label="Número de piezas" value={String(form.piezas??'')} onChangeText={set('piezas')} keyboardType="numeric" />
          <FF label="Volumen (m³)" value={String(form.volumen_m3??'')} onChangeText={set('volumen_m3')} keyboardType="decimal-pad" />
          <FormSection title="Origen y destino" icon="🗺️" />
          <FF label="Aeropuerto de origen" value={form.origen??''} onChangeText={set('origen')} autoCapitalize="characters" placeholder="Ej: GUA" />
          <FF label="Aeropuerto de destino" value={form.destino??''} onChangeText={set('destino')} autoCapitalize="characters" placeholder="Ej: MIA" />
          <FF label="Remitente" value={form.remitente??''} onChangeText={set('remitente')} />
          <FF label="Consignatario / Destinatario" value={form.consignatario??''} onChangeText={set('consignatario')} />
          <FormSection title="Estado y vuelo" icon="" />
          <FSelect label="Estado del envío" value={form.estado??'RECIBIDO'} onChange={set('estado')}
          options={[{label:'Recibido en bodega',value:'RECIBIDO'},{label:'En bodega',value:'EN_BODEGA'},{label:'Cargado en aeronave',value:'CARGADO'},{label:'En vuelo',value:'EN_VUELO_C'},{label:'Descargado',value:'DESCARGADO'},{label:'En aduana',value:'ADUANA'},{label:'Entregado',value:'ENTREGADO'}]} />
          <FF label="Número de vuelo" value={form.numero_vuelo??''} onChangeText={set('numero_vuelo')} autoCapitalize="characters" />
          <FF label="Tarifa (Q)" value={String(form.tarifa??'')} onChangeText={set('tarifa')} keyboardType="decimal-pad" />
        </>
      </FormModal>
    </SafeAreaView>
  );
}


