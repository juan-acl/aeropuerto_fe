import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { backendApi } from '@/services/backendApi';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Mod16() {
  const [PRESUPUESTOS_DATA, set_PRESUPUESTOS_DATA] = useState<any[]>([]);
  const [INGRESOS_DATA, set_INGRESOS_DATA] = useState<any[]>([]);
  const [GASTOS_DATA, set_GASTOS_DATA] = useState<any[]>([]);
  const [PROVEEDORES_DATA, set_PROVEEDORES_DATA] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
      setLoading(true);
      try {
          const [p, i, g, pr] = await Promise.all([
              backendApi.finanzas.presupuestos.listar(),
              backendApi.ingresos.listar(),
              backendApi.gastos.listar(),
              backendApi.proveedores.listar()
          ]);
          set_PRESUPUESTOS_DATA(p || []);
          set_INGRESOS_DATA(i || []);
          set_GASTOS_DATA(g || []);
          set_PROVEEDORES_DATA(pr || []);
      } catch (e) {
          console.error("Error fetching mod16 data:", e);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchAll();
  }, []);

  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = () => {
    Alert.alert(' Guardado', 'Registro creado exitosamente.');
    setModal(false);
    setForm({});
  };

  const totalIngresos = INGRESOS_DATA.reduce((s, i) => s + (i.monto ?? 0), 0);
  const totalGastos = GASTOS_DATA.reduce((s, g) => s + (g.monto ?? 0), 0);

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Finanzas y Contabilidad" subtitle="Presupuestos, ingresos, gastos y proveedores" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar presupuestos, ingresos, gastos..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Ingresos" value={`Q ${(totalIngresos/1000).toFixed(1)}K`} color={C.success} bg={C.successBg} icon="📈" />
          <StatCard label="Gastos" value={`Q ${(totalGastos/1000).toFixed(1)}K`} color={C.danger} bg={C.dangerBg} icon="📉" />
        </View>
        
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>📋 Presupuestos</Text>
        {PRESUPUESTOS_DATA.filter((p:any)=>JSON.stringify(p).toLowerCase().includes(q.toLowerCase())).map((p:any)=>(
          <DataCard key={p.id_presupuesto} title={p.concepto} subtitle={`${p.departamento} · Mes ${p.mes} / ${p.anio}`}
            badge={<Badge value={p.activo ? 'ACTIVO' : 'INACTIVO'} color={p.activo ? C.success : C.muted} />} accentColor={C.green}>
            <ProgressBar value={p.monto_ejecutado} max={p.monto_asignado} />
          </DataCard>
        ))}

        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>💰 Ingresos Recientes</Text>
        {INGRESOS_DATA.filter((i:any)=>JSON.stringify(i).toLowerCase().includes(q.toLowerCase())).map((i:any)=>(
          <DataCard key={i.id_ingreso} title={i.concepto} subtitle={`${i.fecha?.split('T')[0] ?? '—'} · ${i.tipo_ingreso ?? '—'}`}
            badge={<Badge value={i.moneda ?? 'Q'} />} meta={`Q ${(i.monto ?? 0).toLocaleString()}`} accentColor={C.success} />
        ))}

        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>💸 Gastos Recientes</Text>
        {GASTOS_DATA.filter((g:any)=>JSON.stringify(g).toLowerCase().includes(q.toLowerCase())).map((g:any)=>(
          <DataCard key={g.id_gasto} title={g.concepto} subtitle={`${g.proveedor ?? '—'} · ${g.tipo_gasto ?? '—'}`}
            badge={<Badge value={g.moneda ?? 'Q'} />} meta={`Q ${(g.monto ?? 0).toLocaleString()}`} accentColor={C.danger} />
        ))}

        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>🏭 Proveedores</Text>
        {PROVEEDORES_DATA.filter((p:any)=>JSON.stringify(p).toLowerCase().includes(q.toLowerCase())).map((p:any)=>(
          <DataCard key={p.id_proveedor} title={p.nombre} subtitle={`NIT: ${p.nit ?? '—'} · ${p.contacto ?? '—'}`}
            badge={<Badge value={p.activo ? 'ACTIVO' : 'INACTIVO'} color={p.activo ? C.success : C.muted} />} accentColor={C.orange}>
            <Text style={{fontSize:11,color:C.muted}}>📞 {p.telefono ?? '—'} · ✉️ {p.email ?? '—'}</Text>
          </DataCard>
        ))}
      </ScrollView>
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={handleSave}>
        <>
          <FormSection title="Tipo de registro" icon="" />
          <FSelect label="Categoría" required value={form.categoria??''} onChange={set('categoria')}
          options={[{label:'Ingreso operacional',value:'OPERATIVO'},{label:'Ingreso por concesiones',value:'CONCESIONES'},{label:'Ingreso por tasas',value:'TASA_EMBARQUE'},{label:'Gasto operacional',value:'OPERATIVO_G'},{label:'Gasto de personal',value:'PERSONAL'},{label:'Gasto de mantenimiento',value:'MANTENIMIENTO'},{label:'Gasto de combustible',value:'COMBUSTIBLE'},{label:'Inversión en infraestructura',value:'INVERSION'}]} />
          <FormSection title="Detalles financieros" icon="" />
          <FF label="Descripción / Concepto" required value={form.descripcion??''} onChangeText={set('descripcion')} placeholder="Ej: Pago de proveedor combustible, Ingreso tiendas T2..." />
          <FF label="Monto (Q)" required value={String(form.monto??'')} onChangeText={set('monto')} keyboardType="decimal-pad" placeholder="Ej: 15000.00" />
          <FF label="Fecha" value={form.fecha??''} onChangeText={set('fecha')} placeholder="YYYY-MM-DD" />
          <FF label="Referencia / Número de documento" value={form.referencia??''} onChangeText={set('referencia')} autoCapitalize="characters" placeholder="Ej: FAC-2024-0012" />
          <FormSection title="Cuenta y proveedor" icon="🏦" />
          <FF label="Cuenta bancaria" value={form.cuenta??''} onChangeText={set('cuenta')} placeholder="Ej: BAC-001, G&T-002" />
          <FF label="Proveedor / Contraparte" value={form.proveedor??''} onChangeText={set('proveedor')} />
          <FF label="Observaciones" value={form.observaciones??''} onChangeText={set('observaciones')} multiline />
        </>
      </FormModal>
    </SafeAreaView>
  );
}
