import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { backendApi } from '@/services/backendApi';
import { ScreenHeader, SearchBar, DataCard, Badge, StatCard, FormModal, FF, FSelect, EmptyState, ProgressBar, TabBar, StatsRow, AlertBanner } from '@/components/shared';
import { FlightCard } from '@/components/FlightCard';
import { C } from '@/constants/theme';

type Tab = 'vuelos' | 'retrasos' | 'cancelaciones' | 'incidentes' | 'combustible';
type VueloModal = 'cancelar' | 'reprogramar' | 'puerta' | 'crear' | null;

const TABS = [
  { k: 'vuelos',         l: ' Vuelos' },
  { k: 'retrasos',       l: ' Retrasos' },
  { k: 'cancelaciones',  l: '❌ Cancelaciones' },
  { k: 'incidentes',     l: ' Incidentes' },
  { k: 'combustible',    l: '⛽ Combustible' },
];

const ESTADO_OPTIONS = ['PROGRAMADO','EN_VUELO','ATERRIZADO','DEMORADO','CANCELADO','DESVIADO'];

export default function Mod05() {
  const [VUELOS, set_VUELOS] = useState<any[]>([]);
  const [RETRASOS, set_RETRASOS] = useState<any[]>([]);
  const [CANCELACIONES, set_CANCELACIONES] = useState<any[]>([]);
  const [INCIDENTES_VUELO, set_INCIDENTES_VUELO] = useState<any[]>([]);
  const [COMBUSTIBLES, set_COMBUSTIBLES] = useState<any[]>([]);
  useEffect(() => {
      backendApi.vuelos.listar().then(d => set_VUELOS(d)).catch(() => {});
      backendApi.retrasos.listar().then(d => set_RETRASOS(d)).catch(() => {});
      backendApi.vuelos.listar().then(d => set_CANCELACIONES(d)).catch(() => {});
      backendApi.incidentesVuelo.listar().then(d => set_INCIDENTES_VUELO(d)).catch(() => {});
      backendApi.combustible.cargas.listar().then(d => set_COMBUSTIBLES(d)).catch(() => {});
  }, []);

  const [tab, setTab] = useState<Tab>('vuelos');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [vueloModal, setVueloModal] = useState<VueloModal>(null);
  const [vueloSeleccionado, setVueloSeleccionado] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [vuelos, setVuelos] = useState(VUELOS);
  const [retrasos, setRetrasos] = useState(RETRASOS);
  const [cancelaciones, setCancelaciones] = useState(CANCELACIONES);
  const [incidentes, setIncidentes] = useState(INCIDENTES_VUELO);
  const [combustibles, setCombustibles] = useState(COMBUSTIBLES);

  const stats = useMemo(() => ({
    enVuelo:    vuelos.filter(v => v.estado_vuelo === 'EN_VUELO').length,
    demorados:  vuelos.filter(v => v.estado_vuelo === 'DEMORADO').length,
    cancelados: vuelos.filter(v => v.estado_vuelo === 'CANCELADO').length,
    minRetraso: retrasos.reduce((s, r) => s + (r.minutos_retraso ?? 0), 0),
  }), [vuelos, retrasos]);

  const handleSave = async () => {
    if (tab === 'retrasos') {
      if (!form.id_vuelo || !form.minutos) { Alert.alert('Error', 'ID Vuelo y minutos son requeridos'); return; }
      setRetrasos(d => [...d, {
        id_retraso: Date.now(), id_vuelo: Number(form.id_vuelo),
        tipo_retraso: form.tipo || 'OPERATIVO', causa: form.causa || '',
        minutos_retraso: Number(form.minutos), responsable: form.responsable || '',
        compensacion_pasajeros: 0,
      }]);
    } else if (tab === 'incidentes') {
      if (!form.id_vuelo || !form.desc) { Alert.alert('Error', 'ID Vuelo y descripción requeridos'); return; }
      setIncidentes(d => [...d, {
        id_incidente_vuelo: Date.now(), id_vuelo: Number(form.id_vuelo),
        tipo_incidente: form.tipo || 'TECNICO', descripcion: form.desc,
        gravedad: form.gravedad || 'BAJA', acciones_tomadas: form.acciones || '',
        reportado_por: form.reportado || '', fecha_incidente: new Date().toISOString(),
      }]);
    } else if (tab === 'cancelaciones') {
      if (!form.id_vuelo || !form.motivo) { Alert.alert('Error', 'ID Vuelo y motivo requeridos'); return; }
      setSaving(true);
      try {
        await backendApi.vuelos.cancelar({
          IdVuelo:           Number(form.id_vuelo),
          MotivoCancelacion: form.motivo,
        });
        setCancelaciones(d => [...d, {
          id_cancelacion: Date.now(), id_vuelo: Number(form.id_vuelo),
          motivo_principal: form.motivo, motivo_detallado: form.detalle || '',
          fecha_cancelacion: new Date().toISOString().split('T')[0],
          pasajeros_reubicados: Number(form.reubicados || 0),
          costo_compensacion: Number(form.costo || 0),
          notificado_a_pasajeros: 0,
        }]);
        // Actualizar estado del vuelo en lista local
        setVuelos(d => d.map(v => v.id_vuelo === Number(form.id_vuelo) ? { ...v, estado_vuelo: 'CANCELADO' } : v));
      } catch (e: any) {
        Alert.alert('Error al cancelar', e.message ?? 'No se pudo cancelar el vuelo.'); setSaving(false); return;
      } finally { setSaving(false); }
    }
    setModal(false); setForm({});
    Alert.alert(' Registrado', 'El registro fue guardado exitosamente.');
  };

  // Acciones de negocio sobre un vuelo específico
  const handleVueloAction = async () => {
    if (!vueloSeleccionado && vueloModal !== 'crear') return;
    setSaving(true);
    try {
      if (vueloModal === 'reprogramar') {
        if (!form.nueva_fecha || !form.nueva_salida || !form.nueva_llegada) {
          Alert.alert('Requerido', 'Fecha, hora de salida y llegada son obligatorios.'); setSaving(false); return;
        }
        await backendApi.vuelos.reprogramar({
          IdVuelo:          vueloSeleccionado.id_vuelo,
          NuevaFecha:       form.nueva_fecha,
          NuevaHoraSalida:  form.nueva_salida,
          NuevaHoraLlegada: form.nueva_llegada,
        });
        Alert.alert('Reprogramado', `El vuelo ${vueloSeleccionado.id_vuelo} fue reprogramado.`);
      } else if (vueloModal === 'puerta') {
        if (!form.id_puerta) { Alert.alert('Requerido', 'ID de la puerta es obligatorio.'); setSaving(false); return; }
        await backendApi.vuelos.asignarPuerta({
          IdVuelo:   vueloSeleccionado.id_vuelo,
          IdPuerta:  Number(form.id_puerta),
          TipoVuelo: form.tipo_vuelo ?? 'NACIONAL',
        });
        Alert.alert('Puerta asignada', `Puerta ${form.id_puerta} asignada al vuelo ${vueloSeleccionado.id_vuelo}.`);
      } else if (vueloModal === 'crear') {
        if (!form.id_programa || !form.fecha_vuelo || !form.hora_salida || !form.hora_llegada || !form.id_modelo || !form.matricula) {
          Alert.alert('Requerido', 'Todos los campos son obligatorios.'); setSaving(false); return;
        }
        await backendApi.vuelos.crearVuelo({
          IdPrograma:    Number(form.id_programa),
          FechaVuelo:    form.fecha_vuelo,
          HoraSalida:    form.hora_salida,
          HoraLlegada:   form.hora_llegada,
          IdModeloAvion: Number(form.id_modelo),
          MatriculaAvion:form.matricula.trim().toUpperCase(),
        });
        const lista = await backendApi.vuelos.listar().catch(() => null);
        if (lista) setVuelos(lista);
        Alert.alert('Vuelo creado', 'El vuelo fue programado exitosamente en estado PROGRAMADO.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo completar la operación.'); setSaving(false); return;
    } finally { setSaving(false); }
    setVueloModal(null); setVueloSeleccionado(null); setForm({});
  };

  const cerrarEmbarque = (vuelo: any) => {
    Alert.alert(
      'Cerrar Embarque',
      `¿Cerrar el embarque del vuelo #${vuelo.id_vuelo}? Los pasajeros restantes se marcarán como NO_SHOW.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar embarque', style: 'destructive', onPress: async () => {
          try {
            await backendApi.vuelos.cerrarEmbarque(vuelo.id_vuelo);
            Alert.alert('Embarque cerrado', `Vuelo #${vuelo.id_vuelo}: embarque cerrado.`);
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'No se pudo cerrar el embarque.');
          }
        }},
      ]
    );
  };

  const changeEstadoVuelo = (id: number, actual: string) => {
    const options = ESTADO_OPTIONS.filter(e => e !== actual);
    Alert.alert('Cambiar Estado', `Estado actual: ${actual}`, [
      ...options.map(e => ({ text: e, onPress: () => {
        setVuelos(d => d.map(v => v.id_vuelo === id ? { ...v, estado_vuelo: e as any } : v));
        Alert.alert(' Actualizado', `Estado cambiado a ${e}`);
      }})),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const renderContent = () => {
    if (tab === 'vuelos') {
      const data = vuelos.filter(v => `${v.numero_vuelo} ${v.aeropuerto_origen} ${v.aeropuerto_destino}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={v => String(v.id_vuelo)}
          contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="" text="Sin vuelos" sub="No hay vuelos que coincidan con la búsqueda" />}
          renderItem={({ item }) => (
            <View>
              <FlightCard vuelo={item} />
              <View style={s.vueloActions}>
                <TouchableOpacity style={s.actionChip} onPress={() => changeEstadoVuelo(item.id_vuelo, item.estado_vuelo)}>
                  <Text style={s.actionChipT}>🔄 Estado</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionChip} onPress={() => { setVueloSeleccionado(item); setForm({}); setVueloModal('reprogramar'); }}>
                  <Text style={s.actionChipT}> Reprogramar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionChip} onPress={() => { setVueloSeleccionado(item); setForm({ tipo_vuelo: 'NACIONAL' }); setVueloModal('puerta'); }}>
                  <Text style={s.actionChipT}>🚪 Puerta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionChip, { borderColor: C.danger + '60' }]} onPress={() => cerrarEmbarque(item)}>
                  <Text style={[s.actionChipT, { color: C.danger }]}>🔒 Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      );
    }
    if (tab === 'retrasos') {
      const data = retrasos.filter(r => `${r.id_vuelo} ${r.tipo_retraso} ${r.causa}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={r => String(r.id_retraso)}
          contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="" text="Sin retrasos registrados" />}
          renderItem={({ item: r }) => (
            <DataCard
              title={`Vuelo #${r.id_vuelo} — ${r.tipo_retraso}`}
              subtitle={r.causa ?? 'Sin causa registrada'}
              badge={<Badge value={r.tipo_retraso} />}
              meta={`${r.minutos_retraso} min`}
              accentColor={C.warning}
              onDelete={() => setRetrasos(d => d.filter(x => x.id_retraso !== r.id_retraso))}
            >
              <Text style={s.cardDetail}> Responsable: {r.responsable ?? '—'}</Text>
              <Text style={s.cardDetail}> Compensación: {r.compensacion_pasajeros ? ' Aplicada' : '❌ Sin compensación'}</Text>
            </DataCard>
          )}
        />
      );
    }
    if (tab === 'cancelaciones') {
      const data = cancelaciones.filter(c => `${c.id_vuelo} ${c.motivo_principal}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={c => String(c.id_cancelacion)}
          contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="❌" text="Sin cancelaciones" />}
          renderItem={({ item: c }) => (
            <DataCard
              title={`Vuelo #${c.id_vuelo} — Cancelado`}
              subtitle={c.motivo_principal ?? '—'}
              badge={<Badge value={c.notificado_a_pasajeros ? 'ACTIVO' : 'PENDIENTE'} />}
              meta={c.costo_compensacion ? `Q ${(c.costo_compensacion).toLocaleString()}` : undefined}
              accentColor={C.danger}
              onDelete={() => setCancelaciones(d => d.filter(x => x.id_cancelacion !== c.id_cancelacion))}
            >
              <Text style={s.cardDetail}> {c.motivo_detallado ?? '—'}</Text>
              <Text style={s.cardDetail}> Reubicados: {c.pasajeros_reubicados ?? 0} pasajeros</Text>
              <Text style={s.cardDetail}> {c.fecha_cancelacion}</Text>
            </DataCard>
          )}
        />
      );
    }
    if (tab === 'incidentes') {
      const data = incidentes.filter(i => `${i.id_vuelo} ${i.tipo_incidente} ${i.descripcion}`.toLowerCase().includes(q.toLowerCase()));
      return (
        <FlatList data={data} keyExtractor={i => String(i.id_incidente_vuelo)}
          contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="" text="Sin incidentes registrados" />}
          renderItem={({ item: i }) => (
            <DataCard
              title={`Vuelo #${i.id_vuelo} — ${i.tipo_incidente}`}
              subtitle={i.descripcion ?? '—'}
              badge={<Badge value={i.gravedad} />}
              meta={i.fecha_incidente?.split('T')[0]}
              accentColor={i.gravedad === 'ALTA' || i.gravedad === 'CRITICA' ? C.danger : C.warning}
              onDelete={() => setIncidentes(d => d.filter(x => x.id_incidente_vuelo !== i.id_incidente_vuelo))}
            >
              <Text style={s.cardDetail}> Acciones: {i.acciones_tomadas ?? '—'}</Text>
              <Text style={s.cardDetail}> Reportado por: {i.reportado_por ?? '—'}</Text>
            </DataCard>
          )}
        />
      );
    }
    // Combustible
    const data = combustibles.filter(c => `${c.id_vuelo} ${c.tipo_combustible} ${c.proveedor}`.toLowerCase().includes(q.toLowerCase()));
    return (
      <FlatList data={data} keyExtractor={c => String(c.id_combustible)}
        contentContainerStyle={{ padding: 14, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="⛽" text="Sin registros de combustible" />}
        renderItem={({ item: c }) => (
          <DataCard
            title={`Vuelo #${c.id_vuelo} — ${c.tipo_combustible ?? 'JET-A1'}`}
            subtitle={`Proveedor: ${c.proveedor ?? '—'}`}
            badge={<Badge value={c.tipo_combustible ?? 'JET_A1'} />}
            meta={`Q ${(c.costo_total ?? 0).toLocaleString()}`}
            accentColor={C.orange}
            onDelete={() => setCombustibles(d => d.filter(x => x.id_combustible !== c.id_combustible))}
          >
            <ProgressBar
              value={c.combustible_real_litros ?? 0}
              max={c.combustible_planeado_litros ?? 1}
              label={`${(c.combustible_real_litros ?? 0).toLocaleString()} / ${(c.combustible_planeado_litros ?? 0).toLocaleString()} L`}
            />
          </DataCard>
        )}
      />
    );
  };

  const addLabel = tab === 'vuelos' ? '+ Crear Vuelo' : '+ Registrar';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader
        title="Operaciones de Vuelo"
        subtitle="Vuelos, retrasos, cancelaciones e incidentes"
        onAdd={() => { setForm({}); tab === 'vuelos' ? setVueloModal('crear') : setModal(true); }}
        addLabel={addLabel}
      />
      <TabBar tabs={TABS} active={tab} onPress={(k) => { setTab(k as Tab); setQ(''); }} />

      {tab === 'vuelos' && stats.demorados > 0 && (
        <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
          <AlertBanner type="warning" message={`${stats.demorados} vuelo${stats.demorados > 1 ? 's' : ''} con retraso. Retraso total acumulado: ${stats.minRetraso} min.`} />
        </View>
      )}

      <StatsRow>
        <StatCard label="En Vuelo"  value={stats.enVuelo}           color={C.success} bg={C.successBg} icon="" />
        <StatCard label="Demorados" value={stats.demorados}         color={C.warning} bg={C.warningBg} icon="" />
        <StatCard label="Cancelados" value={stats.cancelados}       color={C.danger}  bg={C.dangerBg}  icon="❌" />
        <StatCard label="Incidentes" value={incidentes.length}      color={C.orange}  bg={C.orangeBg}  icon="" />
      </StatsRow>
      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar en operaciones..." />
      {renderContent()}

      <FormModal visible={modal} title={
        tab === 'retrasos' ? 'Registrar Retraso' :
        tab === 'incidentes' ? 'Registrar Incidente' : 'Registrar Cancelación'
      } onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Guardando...' : 'Guardar'}>
        <FF label="ID Vuelo" value={form.id_vuelo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, id_vuelo: t }))} keyboardType="numeric" required hint="Número de ID del vuelo afectado" />
        {tab === 'retrasos' && <>
          <FF label="Tipo de Retraso" value={form.tipo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, tipo: t }))} hint="Ej: OPERATIVO, METEOROLOGICO, TECNICO" />
          <FF label="Minutos de Retraso" value={form.minutos ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, minutos: t }))} keyboardType="numeric" required />
          <FF label="Causa" value={form.causa ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, causa: t }))} multiline />
          <FF label="Responsable" value={form.responsable ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, responsable: t }))} />
        </>}
        {tab === 'incidentes' && <>
          <FF label="Tipo de Incidente" value={form.tipo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, tipo: t }))} hint="Ej: TECNICO, SEGURIDAD, MEDICO" />
          <FF label="Gravedad" value={form.gravedad ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, gravedad: t }))} hint="BAJA / MEDIA / ALTA / CRITICA" required />
          <FF label="Descripción" value={form.desc ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, desc: t }))} multiline required />
          <FF label="Acciones Tomadas" value={form.acciones ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, acciones: t }))} multiline />
          <FF label="Reportado Por" value={form.reportado ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, reportado: t }))} />
        </>}
        {tab === 'cancelaciones' && <>
          <FF label="Motivo Principal" value={form.motivo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, motivo: t }))} required hint="Ej: METEOROLOGICO, TECNICO, HUELGA" />
          <FF label="Detalle" value={form.detalle ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, detalle: t }))} multiline />
          <FF label="Pasajeros Reubicados" value={form.reubicados ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, reubicados: t }))} keyboardType="numeric" />
          <FF label="Costo Compensación (Q)" value={form.costo ?? ''} onChangeText={(t: string) => setForm((f: any) => ({ ...f, costo: t }))} keyboardType="decimal-pad" />
        </>}
      </FormModal>

      {/* Modal: Crear Vuelo */}
      <FormModal visible={vueloModal === 'crear'} title="Crear Vuelo" onClose={() => { setVueloModal(null); setForm({}); }} onSave={handleVueloAction} saveLabel={saving ? 'Creando...' : 'Crear Vuelo'}>
        <FF label="ID Programa de Vuelo" required value={String(form.id_programa??'')} onChangeText={(t:string)=>setForm((f:any)=>({...f,id_programa:t}))} keyboardType="numeric" hint="ID del programa (ruta programada)" />
        <FF label="Fecha de vuelo" required value={form.fecha_vuelo??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,fecha_vuelo:t}))} placeholder="YYYY-MM-DD" />
        <FF label="Hora de salida" required value={form.hora_salida??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,hora_salida:t}))} placeholder="HH:MM:SS" />
        <FF label="Hora de llegada" required value={form.hora_llegada??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,hora_llegada:t}))} placeholder="HH:MM:SS" />
        <FF label="ID Modelo de avión" required value={String(form.id_modelo??'')} onChangeText={(t:string)=>setForm((f:any)=>({...f,id_modelo:t}))} keyboardType="numeric" />
        <FF label="Matrícula del avión" required value={form.matricula??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,matricula:t}))} autoCapitalize="characters" placeholder="Ej: TG-ANA" />
      </FormModal>

      {/* Modal: Reprogramar Vuelo */}
      <FormModal visible={vueloModal === 'reprogramar'} title={`Reprogramar Vuelo #${vueloSeleccionado?.id_vuelo ?? ''}`} onClose={() => { setVueloModal(null); setForm({}); }} onSave={handleVueloAction} saveLabel={saving ? 'Reprogramando...' : 'Reprogramar'}>
        <FF label="Nueva fecha" required value={form.nueva_fecha??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,nueva_fecha:t}))} placeholder="YYYY-MM-DD" />
        <FF label="Nueva hora de salida" required value={form.nueva_salida??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,nueva_salida:t}))} placeholder="HH:MM:SS" />
        <FF label="Nueva hora de llegada" required value={form.nueva_llegada??''} onChangeText={(t:string)=>setForm((f:any)=>({...f,nueva_llegada:t}))} placeholder="HH:MM:SS" />
      </FormModal>

      {/* Modal: Asignar Puerta */}
      <FormModal visible={vueloModal === 'puerta'} title={`Asignar Puerta — Vuelo #${vueloSeleccionado?.id_vuelo ?? ''}`} onClose={() => { setVueloModal(null); setForm({}); }} onSave={handleVueloAction} saveLabel={saving ? 'Asignando...' : 'Asignar'}>
        <FF label="ID Puerta de embarque" required value={String(form.id_puerta??'')} onChangeText={(t:string)=>setForm((f:any)=>({...f,id_puerta:t}))} keyboardType="numeric" hint="ID numérico de la puerta en el sistema" />
        <FSelect label="Tipo de vuelo" value={form.tipo_vuelo??'NACIONAL'} onChange={(v:string)=>setForm((f:any)=>({...f,tipo_vuelo:v}))}
          options={[{label:'Nacional',value:'NACIONAL'},{label:'Internacional',value:'INTERNACIONAL'}]} />
      </FormModal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  changeBtn:    { marginTop: -6, marginBottom: 10, marginHorizontal: 2, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  changeBtnT:   { fontSize: 13, fontWeight: '600', color: C.textSub },
  cardDetail:   { fontSize: 12, color: C.muted, marginTop: 3, fontWeight: '500' },
  vueloActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: -4, marginBottom: 10, marginHorizontal: 2 },
  actionChip:   { flex: 1, minWidth: 70, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingVertical: 6, alignItems: 'center' },
  actionChipT:  { fontSize: 11, fontWeight: '700', color: C.textSub },
});


