import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { backendApi } from '@/services/backendApi';
import { Badge, DataCard, EmptyState, FF, FSelect, FToggle, FormModal, FormSection, ScreenHeader, SearchBar, StatCard, StatsRow, TabBar } from '@/components/shared';
import { C } from '@/constants/theme';

type Tab = 'digital' | 'mostrador' | 'abordaje';

const TABS: { k: Tab; l: string }[] = [
  { k: 'digital',   l: ' Check-in Digital' },
  { k: 'mostrador', l: '🖥️ Mostrador' },
  { k: 'abordaje',  l: '🚪 Abordaje' },
];

export default function Mod09() {
  const [tab, setTab] = useState<Tab>('digital');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const modalTitle = tab === 'digital' ? 'Check-in en Línea' :
    tab === 'mostrador' ? 'Check-in en Mostrador' : 'Registrar Abordaje';

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 'digital') {
        if (!form.codigo_reserva || !form.numero_documento || !form.numero_asiento) {
          Alert.alert('Requerido', 'Código de reserva, documento y asiento son obligatorios.'); setSaving(false); return;
        }
        const resp = await backendApi.reservas.checkIn({
          CodigoReserva:   form.codigo_reserva.trim().toUpperCase(),
          NumeroDocumento: form.numero_documento.trim(),
          NumeroAsiento:   form.numero_asiento.trim().toUpperCase(),
        });
        setResultados(d => [{
          tipo: 'DIGITAL', codigo: form.codigo_reserva.toUpperCase(),
          asiento: form.numero_asiento.toUpperCase(),
          qr: resp.qr_provisional, timestamp: new Date().toLocaleTimeString(),
        }, ...d]);
        Alert.alert('Check-in realizado', resp.mensaje ?? 'Pase de abordar generado correctamente.');

      } else if (tab === 'mostrador') {
        if (!form.codigo_reserva || !form.numero_documento || !form.numero_asiento) {
          Alert.alert('Requerido', 'Código, documento y asiento son obligatorios.'); setSaving(false); return;
        }
        const resp = await backendApi.reservas.checkInMostrador({
          CodigoReserva:    form.codigo_reserva.trim().toUpperCase(),
          NumeroDocumento:  form.numero_documento.trim(),
          NumeroAsiento:    form.numero_asiento.trim().toUpperCase(),
          EquipajeFacturado:Number(form.equipaje_facturado ?? 0),
          EquipajeMano:     Number(form.equipaje_mano ?? 0),
          TipoVuelo:        form.tipo_vuelo ?? 'NACIONAL',
          VisaValida:       form.visa_valida ? 1 : 0,
        });
        setResultados(d => [{
          tipo: 'MOSTRADOR', codigo: form.codigo_reserva.toUpperCase(),
          asiento: form.numero_asiento.toUpperCase(),
          equipaje: `${form.equipaje_facturado ?? 0}kg / ${form.equipaje_mano ?? 0}kg`,
          timestamp: new Date().toLocaleTimeString(),
        }, ...d]);
        Alert.alert('Check-in en mostrador', resp.mensaje ?? 'Completado.');

      } else {
        if (!form.codigo_reserva || !form.numero_documento || !form.puerta_embarque) {
          Alert.alert('Requerido', 'Código, documento y puerta de embarque son obligatorios.'); setSaving(false); return;
        }
        await backendApi.reservas.registrarAbordaje({
          CodigoReserva:   form.codigo_reserva.trim().toUpperCase(),
          NumeroDocumento: form.numero_documento.trim(),
          PuertaEmbarque:  form.puerta_embarque.trim().toUpperCase(),
        });
        setResultados(d => [{
          tipo: 'ABORDAJE', codigo: form.codigo_reserva.toUpperCase(),
          puerta: form.puerta_embarque.toUpperCase(),
          timestamp: new Date().toLocaleTimeString(),
        }, ...d]);
        Alert.alert('Pasajero abordado', 'Abordaje registrado y conteo actualizado.');
      }
      setModal(false); setForm({});
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo completar la operación.');
    } finally { setSaving(false); }
  };

  const TIPO_COLOR: Record<string, string> = {
    DIGITAL: C.electric, MOSTRADOR: C.teal, ABORDAJE: C.success,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader
        title="Check-in y Abordaje"
        subtitle="Check-in digital, mostrador y registro de abordaje"
        onAdd={() => { setForm({}); setModal(true); }}
        addLabel="+ Registrar"
      />
      <TabBar tabs={TABS} active={tab} onPress={k => { setTab(k as Tab); }} />

      <StatsRow>
        <StatCard label="Digital" value={resultados.filter(r => r.tipo === 'DIGITAL').length} color={C.electric} bg={C.infoBg} icon="" />
        <StatCard label="Mostrador" value={resultados.filter(r => r.tipo === 'MOSTRADOR').length} color={C.teal} bg={C.successBg} icon="🖥️" />
        <StatCard label="Abordajes" value={resultados.filter(r => r.tipo === 'ABORDAJE').length} color={C.success} bg={C.successBg} icon="🚪" />
      </StatsRow>

      {/* Historial de operaciones de esta sesión */}
      {resultados.filter(r => r.tipo === tab.toUpperCase()).length === 0
        ? <EmptyState icon={tab === 'digital' ? '' : tab === 'mostrador' ? '🖥️' : '🚪'} text={`Sin registros de ${tab === 'digital' ? 'check-in digital' : tab === 'mostrador' ? 'check-in en mostrador' : 'abordajes'} en esta sesión`} sub="Usa + Registrar para procesar" />
        : resultados.filter(r => r.tipo === tab.toUpperCase()).map((r, i) => (
          <DataCard key={i} title={`${r.codigo}`}
            subtitle={r.asiento ? `Asiento ${r.asiento}` : r.puerta ? `Puerta ${r.puerta}` : ''}
            badge={<Badge value={r.tipo} />}
            meta={r.timestamp}
            accentColor={TIPO_COLOR[r.tipo]}>
            {r.equipaje ? <Text style={{ fontSize: 11, color: C.muted }}>Equipaje: {r.equipaje}</Text> : null}
            {r.qr ? <Text style={{ fontSize: 11, color: C.muted }}>QR: {r.qr}</Text> : null}
          </DataCard>
        ))
      }

      <FormModal
        visible={modal}
        title={modalTitle}
        onClose={() => { setModal(false); setForm({}); }}
        onSave={handleSave}
        saveLabel={saving ? 'Procesando...' : 'Confirmar'}
      >
        <FormSection title="Datos de reserva" icon="" />
        <FF label="Código de reserva" required value={form.codigo_reserva??''} onChangeText={set('codigo_reserva')} autoCapitalize="characters" placeholder="Ej: RES-123456" />
        <FF label="Número de documento" required value={form.numero_documento??''} onChangeText={set('numero_documento')} autoCapitalize="characters" placeholder="DPI o Pasaporte" />

        {(tab === 'digital' || tab === 'mostrador') && (
          <FF label="Número de asiento" required value={form.numero_asiento??''} onChangeText={set('numero_asiento')} autoCapitalize="characters" placeholder="Ej: 14C" />
        )}

        {tab === 'mostrador' && (
          <>
            <FormSection title="Equipaje" icon="🧳" />
            <FF label="Equipaje facturado (kg)" value={String(form.equipaje_facturado??'0')} onChangeText={set('equipaje_facturado')} keyboardType="decimal-pad" />
            <FF label="Equipaje de mano (kg)" value={String(form.equipaje_mano??'0')} onChangeText={set('equipaje_mano')} keyboardType="decimal-pad" />
            <FormSection title="Vuelo" icon="" />
            <FSelect label="Tipo de vuelo" value={form.tipo_vuelo??'NACIONAL'} onChange={set('tipo_vuelo')}
              options={[{label:'Nacional',value:'NACIONAL'},{label:'Internacional',value:'INTERNACIONAL'}]} />
            <FToggle label="Visa válida (si aplica)" value={!!form.visa_valida} onChange={set('visa_valida')} />
          </>
        )}

        {tab === 'abordaje' && (
          <FF label="Puerta de embarque" required value={form.puerta_embarque??''} onChangeText={set('puerta_embarque')} autoCapitalize="characters" placeholder="Ej: A12, B03" />
        )}
      </FormModal>
    </SafeAreaView>
  );
}
