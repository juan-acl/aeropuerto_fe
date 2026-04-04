import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { EMPLEADOS, DEPARTAMENTOS, VACACIONES_DATA, EVALUACIONES_DATA, CAPACITACIONES_DATA } from '@/services/mockData';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, InfoRow, ProgressBar, ScoreBar, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  // Initialize all module data
  // EMPLEADOS available from imports
  // DEPARTAMENTOS available from imports
  // VACACIONES_DATA available from imports
  // EVALUACIONES_DATA available from imports
  // CAPACITACIONES_DATA available from imports

  const handleSave = () => {
    Alert.alert('✅ Guardado', 'Registro creado exitosamente.');
    setModal(false);
    setForm({});
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Recursos Humanos" subtitle="Empleados, departamentos, capacitaciones y evaluaciones" onAdd={()=>{setForm({});setModal(true);}} />
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar empleados, evaluaciones..." />
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}>
        
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <StatCard label="Empleados" value={EMPLEADOS.filter((e:any)=>e.activo).length} color={C.navy} bg={C.infoBg} icon="👥" />
          <StatCard label="Departamentos" value={DEPARTAMENTOS.length} color={C.purple} bg={C.purpleBg} icon="🏢" />
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginBottom:8}}>👥 Empleados</Text>
        {EMPLEADOS.filter((e:any)=>JSON.stringify(e).toLowerCase().includes(q.toLowerCase())).map((e:any)=>(
          <DataCard key={e.id} title={`${e.nombres} ${e.apellidos}`}
            subtitle={`${e.codigo} · ${e.cargo} · ${e.departamento}`}
            badge={<Badge value={e.tipo_contrato} />} meta={`Q ${e.salario_base?.toLocaleString()}`}
            accentColor={e.activo?C.navy:C.light}
            onDelete={()=>alert('Eliminar empleado')}>
            <Text style={{fontSize:11,color:C.muted}}>📧 {e.email} · 📞 {e.telefono}</Text>
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>📊 Evaluaciones Recientes</Text>
        {EVALUACIONES_DATA.filter((e:any)=>JSON.stringify(e).toLowerCase().includes(q.toLowerCase())).map((e:any)=>(
          <DataCard key={e.id} title={e.empleado} subtitle={`${e.evaluador} · ${e.periodo}`}
            badge={<Badge value={e.puntuacion_total>=4?'COMPLETADO':e.puntuacion_total>=3?'PENDIENTE':'RECHAZADO'} />}
            meta={`${e.puntuacion_total}/5`} accentColor={e.puntuacion_total>=4?C.success:e.puntuacion_total>=3?C.warning:C.danger}>
            <ScoreBar label="Productividad" value={e.productividad} />
            <ScoreBar label="Calidad" value={e.calidad} />
            <ScoreBar label="Asistencia" value={e.asistencia} />
          </DataCard>
        ))}
        <Text style={{fontSize:13,fontWeight:'700',color:C.navy,marginTop:16,marginBottom:8}}>📅 Vacaciones y Permisos</Text>
        {VACACIONES_DATA.filter((v:any)=>JSON.stringify(v).toLowerCase().includes(q.toLowerCase())).map((v:any)=>(
          <DataCard key={v.id} title={v.empleado} subtitle={`${v.fecha_inicio} → ${v.fecha_fin} · ${v.dias} días`}
            badge={<Badge value={v.estado} />} meta={v.motivo??'—'}
            accentColor={v.estado==='AUTORIZADO'?C.success:v.estado==='PENDIENTE'?C.warning:C.danger}>
            <Badge value={v.tipo} />
          </DataCard>
        ))}
      </ScrollView>
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={handleSave}>
        <>
          <FormSection title="Datos personales" icon="👤" />
          <FF label="Nombres" required value={form.nombres??''} onChangeText={set('nombres')} />
          <FF label="Apellidos" required value={form.apellidos??''} onChangeText={set('apellidos')} />
          <FF label="DPI / Identificación" value={form.dpi??''} onChangeText={set('dpi')} keyboardType="numeric" />
          <FF label="Fecha de nacimiento" value={form.fecha_nacimiento??''} onChangeText={set('fecha_nacimiento')} placeholder="YYYY-MM-DD" />
          <FormSection title="Información laboral" icon="💼" />
          <FF label="Código de empleado" value={form.codigo_empleado??''} onChangeText={set('codigo_empleado')} autoCapitalize="characters" hint="Se asigna automáticamente si se deja vacío" />
          <FF label="Puesto / Cargo" required value={form.puesto??''} onChangeText={set('puesto')} placeholder="Ej: Agente de servicios al pasajero" />
          <FF label="Departamento" value={form.departamento??''} onChangeText={set('departamento')} placeholder="Ej: Operaciones, RR.HH., Finanzas" />
          <FSelect label="Tipo de contrato" value={form.tipo_contrato??''} onChange={set('tipo_contrato')}
          options={[{label:'Tiempo indefinido (permanente)',value:'PERMANENTE'},{label:'Tiempo definido (temporal)',value:'TEMPORAL'},{label:'Prácticas / Pasantía',value:'PRACTICAS'},{label:'Consultor externo',value:'CONSULTOR'}]} />
          <FF label="Fecha de ingreso" value={form.fecha_ingreso??''} onChangeText={set('fecha_ingreso')} placeholder="YYYY-MM-DD" />
          <FF label="Salario mensual (Q)" value={String(form.salario??'')} onChangeText={set('salario')} keyboardType="decimal-pad" />
          <FormSection title="Contacto" icon="📬" />
          <FF label="Email institucional" value={form.email??''} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
          <FF label="Teléfono" value={form.telefono??''} onChangeText={set('telefono')} keyboardType="phone-pad" />
          <FToggle label="Empleado activo" value={form.activo!==false&&form.activo!==0} onChange={v=>set('activo')(v)} />
        </>
      </FormModal>
    </SafeAreaView>
  );
}
