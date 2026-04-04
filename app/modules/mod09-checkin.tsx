import React, { useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { CHECKINS, CONTROLES_ABORDAJE } from '@/services/mockData';
import {Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar} from '@/components/shared';
import { C } from '@/constants/theme';

export default function Screen() {
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [data, setData] = useState<any[]>(CHECKINS);

  const filtered = data.filter((m:any) => JSON.stringify(m).toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
      <ScreenHeader title="Check-in y Abordaje" subtitle="Check-in digital y control de abordaje" onAdd={()=>{setForm({});setModal(true);}} />
      <StatsRow>
        <StatCard label="Total" value={data.length} color={C.success} bg={C.successBg} icon="✅" />
        <StatCard label="Abordajes" value={CONTROLES_ABORDAJE.length} color={C.purple} bg={C.purpleBg} icon="🚪" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar..." />
      <FlatList data={filtered} keyExtractor={(m:any)=>String(m.id_checkin)} contentContainerStyle={{padding:14, paddingBottom:24, flexGrow:1}}
        ListEmptyComponent={<EmptyState icon="✅" />}
        renderItem={({item:m})=>(
          <DataCard title={`Check-in #${m.id_checkin} · Reserva ${m.id_reserva}`} subtitle={`${m.fecha_checkin?.split('T')[0] ?? '—'} · ${m.dispositivo ?? '—'}`}
            badge={<Badge value={m.pase_abordaje_generado ? 'ACTIVO' : 'PENDIENTE'} />} meta={`Email: ${m.enviado_email?'✅':'❌'} · SMS: ${m.enviado_sms?'✅':'❌'}`}
            accentColor={C.success}
            onDelete={()=>setData(d=>d.filter((x:any)=>x!==m))}>
            <></>
          </DataCard>
        )}
      />
      <FormModal visible={modal} title="Nuevo Registro" onClose={()=>setModal(false)} onSave={()=>{Alert.alert('OK','Registro guardado');setModal(false);}}>
        <FF label="ID Reserva" value={String(form.id_reserva??'')} onChangeText={(t:string)=>setForm((f:any)=>({...f,id_reserva:t}))} keyboardType="numeric" /><FF label="Dispositivo" value={form.dispositivo??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,dispositivo:t}))} />
      </FormModal>
    </SafeAreaView>
  );
}
