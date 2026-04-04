import React from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VUELOS, RETRASOS, INCIDENTES_VUELO, COMBUSTIBLES, ESCALAS, TRIPULANTES } from '@/services/mockData';
import { ScreenHeader, Badge, InfoRow, StatCard, AlertBanner, ProgressBar } from '@/components/shared';
import { C } from '@/constants/theme';

const STATUS_CFG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  EN_VUELO:    { color: C.success, bg: C.successBg, label: 'En Vuelo',    icon: '🛫' },
  PROGRAMADO:  { color: C.info,    bg: C.infoBg,    label: 'Programado',  icon: '🕐' },
  ATERRIZADO:  { color: C.gray,    bg: C.grayBg,    label: 'Aterrizado',  icon: '🛬' },
  CANCELADO:   { color: C.danger,  bg: C.dangerBg,  label: 'Cancelado',   icon: '❌' },
  DEMORADO:    { color: C.warning, bg: C.warningBg, label: 'Demorado',    icon: '⏱️' },
  DESVIADO:    { color: C.orange,  bg: C.orangeBg,  label: 'Desviado',    icon: '↗️' },
};

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={s.sectionCard}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionIcon}>{icon}</Text>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function VueloDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const vuelo = VUELOS.find(v => v.id_vuelo === Number(id));

  if (!vuelo) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="Detalle de Vuelo" subtitle="Vuelo no encontrado" />
      <View style={{ alignItems: 'center', paddingVertical: 80 }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>✈️</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.textSub }}>Vuelo no encontrado</Text>
        <Text style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>ID: {id}</Text>
      </View>
    </SafeAreaView>
  );

  const retrasos   = RETRASOS.filter(r => r.id_vuelo === vuelo.id_vuelo);
  const incidentes = INCIDENTES_VUELO.filter(i => i.id_vuelo === vuelo.id_vuelo);
  const combustible = COMBUSTIBLES.find(c => c.id_vuelo === vuelo.id_vuelo);
  const escalas    = ESCALAS.filter(e => e.id_vuelo === vuelo.id_vuelo);
  const cfg        = STATUS_CFG[vuelo.estado_vuelo] ?? STATUS_CFG.PROGRAMADO;
  const ocupacion  = vuelo.plazas_ocupadas && vuelo.capacidad_total
    ? Math.round((vuelo.plazas_ocupadas / vuelo.capacidad_total) * 100) : null;
  const totalRetraso = retrasos.reduce((s, r) => s + (r.minutos_retraso ?? 0), 0);

  const depTime = vuelo.hora_salida_programada?.split('T')[1]?.slice(0, 5) ?? '--:--';
  const arrTime = vuelo.hora_llegada_programada?.split('T')[1]?.slice(0, 5) ?? '--:--';

  return (
    <SafeAreaView style={s.container}>
      <ScreenHeader
        title={`Vuelo ${vuelo.numero_vuelo ?? `#${vuelo.id_vuelo}`}`}
        subtitle="Detalle completo de operación"
      />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={[s.heroCard, { backgroundColor: cfg.color }]}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeIcon}>{cfg.icon}</Text>
            <Text style={s.heroBadgeLabel}>{cfg.label.toUpperCase()}</Text>
          </View>
          <View style={s.heroRoute}>
            <View style={s.heroAirport}>
              <Text style={s.heroCode}>{vuelo.aeropuerto_origen ?? 'GUA'}</Text>
              <Text style={s.heroTime}>{depTime}</Text>
            </View>
            <View style={s.heroCenter}>
              <View style={s.heroLine} />
              <Text style={s.heroPlane}>✈</Text>
              <View style={s.heroLine} />
            </View>
            <View style={[s.heroAirport, { alignItems: 'flex-end' }]}>
              <Text style={s.heroCode}>{vuelo.aeropuerto_destino ?? '—'}</Text>
              <Text style={s.heroTime}>{arrTime}</Text>
            </View>
          </View>
          {vuelo.fecha_vuelo && (
            <Text style={s.heroDate}>{vuelo.fecha_vuelo}</Text>
          )}
        </View>

        {/* Alerts */}
        {vuelo.estado_vuelo === 'DEMORADO' && totalRetraso > 0 && (
          <AlertBanner type="warning" message={`Retraso acumulado: ${totalRetraso} minutos (${retrasos.length} causa${retrasos.length !== 1 ? 's' : ''})`} />
        )}
        {vuelo.estado_vuelo === 'CANCELADO' && (
          <AlertBanner type="error" message="Este vuelo ha sido cancelado. Pasajeros en proceso de reubicación." />
        )}
        {incidentes.length > 0 && (
          <AlertBanner type="warning" message={`${incidentes.length} incidente${incidentes.length !== 1 ? 's' : ''} registrado${incidentes.length !== 1 ? 's' : ''} en este vuelo.`} />
        )}

        {/* KPI stats */}
        <View style={s.statsRow}>
          <StatCard label="Ocupados"  value={vuelo.plazas_ocupadas ?? 0}  color={C.success} bg={C.successBg} icon="🧍" />
          <StatCard label="Vacíos"    value={vuelo.plazas_vacias ?? 0}    color={C.muted}   bg={C.grayBg}   icon="💺" />
          <StatCard label="Retrasos"  value={retrasos.length}              color={retrasos.length > 0 ? C.warning : C.success} bg={retrasos.length > 0 ? C.warningBg : C.successBg} icon="⏱️" />
          <StatCard label="Incidentes" value={incidentes.length}           color={incidentes.length > 0 ? C.danger : C.success} bg={incidentes.length > 0 ? C.dangerBg : C.successBg} icon="⚠️" />
        </View>

        {/* Ocupación visual */}
        {ocupacion != null && (
          <SectionCard title="Ocupación del Vuelo" icon="💺">
            <ProgressBar value={vuelo.plazas_ocupadas ?? 0} max={vuelo.capacidad_total ?? 1}
              label={`${vuelo.plazas_ocupadas} de ${vuelo.capacidad_total} asientos · ${ocupacion}% lleno`} />
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 8, textAlign: 'center' }}>
              {ocupacion >= 90 ? '🔴 Vuelo casi lleno' : ocupacion >= 70 ? '🟡 Buena ocupación' : '🟢 Plazas disponibles'}
            </Text>
          </SectionCard>
        )}

        {/* Información General */}
        <SectionCard title="Información del Vuelo" icon="📋">
          <InfoRow label="ID Vuelo"      value={String(vuelo.id_vuelo)} mono />
          <InfoRow label="Matrícula"     value={vuelo.matricula_avion ?? '—'} mono />
          <InfoRow label="Puerta Salida" value={vuelo.id_puerta_salida ? `Puerta ${vuelo.id_puerta_salida}` : '—'} />
          <InfoRow label="Aerolínea"     value={vuelo.id_aerolinea ? `#${vuelo.id_aerolinea}` : '—'} />
          <InfoRow label="Fecha"         value={vuelo.fecha_vuelo} />
          <InfoRow label="Salida Prog."  value={depTime} highlight />
          <InfoRow label="Llegada Prog." value={arrTime} highlight />
          {vuelo.hora_salida_real && <InfoRow label="Salida Real"  value={vuelo.hora_salida_real.split('T')[1]?.slice(0,5)} />}
          {vuelo.hora_llegada_real && <InfoRow label="Llegada Real" value={vuelo.hora_llegada_real.split('T')[1]?.slice(0,5)} />}
        </SectionCard>

        {/* Combustible */}
        {combustible && (
          <SectionCard title="Combustible" icon="⛽">
            <InfoRow label="Tipo"      value={combustible.tipo_combustible ?? 'JET-A1'} />
            <InfoRow label="Proveedor" value={combustible.proveedor ?? '—'} />
            <InfoRow label="Planeado"  value={`${(combustible.combustible_planeado_litros ?? 0).toLocaleString()} L`} />
            <InfoRow label="Cargado"   value={`${(combustible.combustible_real_litros ?? 0).toLocaleString()} L`} highlight />
            <InfoRow label="Costo"     value={`Q ${(combustible.costo_total ?? 0).toLocaleString()}`} highlight />
            <View style={{ marginTop: 10 }}>
              <ProgressBar
                value={combustible.combustible_real_litros ?? 0}
                max={combustible.combustible_planeado_litros ?? 1}
                label={`${((combustible.combustible_real_litros ?? 0) / (combustible.combustible_planeado_litros ?? 1) * 100).toFixed(0)}% del plan cargado`}
              />
            </View>
          </SectionCard>
        )}

        {/* Retrasos */}
        {retrasos.length > 0 && (
          <SectionCard title={`Retrasos (${retrasos.length})`} icon="⏱️">
            {retrasos.map((r, idx) => (
              <View key={r.id_retraso} style={[s.itemRow, idx < retrasos.length - 1 && s.itemBorder]}>
                <View style={s.itemTop}>
                  <Badge value={r.tipo_retraso} />
                  <View style={s.retrasoTime}>
                    <Text style={{ fontSize: 11, color: C.muted }}>Demora</Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: C.warning }}>{r.minutos_retraso}<Text style={{ fontSize: 12 }}> min</Text></Text>
                  </View>
                </View>
                <Text style={s.itemDesc}>{r.causa ?? '—'}</Text>
                {r.responsable && <Text style={s.itemMeta}>Responsable: {r.responsable}</Text>}
                <Text style={s.itemMeta}>Compensación a pasajeros: {r.compensacion_pasajeros ? '✅ Sí' : '❌ No'}</Text>
              </View>
            ))}
            {totalRetraso > 0 && (
              <View style={{ backgroundColor: C.warningBg, borderRadius: 8, padding: 10, marginTop: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.warning, textAlign: 'center' }}>
                  ⏱️ Total acumulado: {totalRetraso} minutos ({(totalRetraso / 60).toFixed(1)} horas)
                </Text>
              </View>
            )}
          </SectionCard>
        )}

        {/* Incidentes */}
        {incidentes.length > 0 && (
          <SectionCard title={`Incidentes (${incidentes.length})`} icon="⚠️">
            {incidentes.map((i, idx) => (
              <View key={i.id_incidente_vuelo} style={[s.itemRow, idx < incidentes.length - 1 && s.itemBorder]}>
                <View style={s.itemTop}>
                  <Badge value={i.tipo_incidente} />
                  <Badge value={i.gravedad} />
                </View>
                <Text style={s.itemDesc}>{i.descripcion ?? '—'}</Text>
                {i.acciones_tomadas && <Text style={s.itemMeta}>Acciones: {i.acciones_tomadas}</Text>}
                {i.reportado_por && <Text style={s.itemMeta}>Reportado por: {i.reportado_por}</Text>}
              </View>
            ))}
          </SectionCard>
        )}

        {/* Escalas */}
        {escalas.length > 0 && (
          <SectionCard title={`Escalas Técnicas (${escalas.length})`} icon="🛑">
            {escalas.map((e, idx) => (
              <View key={e.id_escala} style={[s.itemRow, idx < escalas.length - 1 && s.itemBorder]}>
                <View style={s.itemTop}>
                  <Text style={s.escalaNum}>Escala #{e.numero_orden}</Text>
                  <View style={{ backgroundColor: C.infoBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.info }}>{e.tiempo_escala_minutos} min</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.text, marginTop: 4 }}>{e.aeropuerto_escala}</Text>
                <Text style={s.itemMeta}>{e.motivo_escala ?? '—'}</Text>
              </View>
            ))}
          </SectionCard>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 14 },

  // Hero
  heroCard: { borderRadius: 18, padding: 20, marginBottom: 14, elevation: 4, shadowColor: C.shadowMd, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, marginBottom: 16 },
  heroBadgeIcon: { fontSize: 14 },
  heroBadgeLabel: { fontSize: 11, fontWeight: '800', color: C.white, letterSpacing: 1 },
  heroRoute: { flexDirection: 'row', alignItems: 'center' },
  heroAirport: { alignItems: 'flex-start', width: 72 },
  heroCode: { fontSize: 26, fontWeight: '900', color: C.white, letterSpacing: -1 },
  heroTime: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 },
  heroCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  heroLine: { flex: 1, height: 1.5, backgroundColor: 'rgba(255,255,255,0.35)' },
  heroPlane: { fontSize: 20, color: C.white, marginHorizontal: 6 },
  heroDate: { fontSize: 12, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 10, fontWeight: '500' },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },

  // Section card
  sectionCard: { backgroundColor: C.bgCard, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1.5, borderBottomColor: C.borderL },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.text },

  // Item rows (retrasos, incidentes, escalas)
  itemRow: { paddingVertical: 12 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: C.borderL },
  itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  itemDesc: { fontSize: 13, color: C.textSub, lineHeight: 18, fontWeight: '500' },
  itemMeta: { fontSize: 11, color: C.muted, marginTop: 4, fontWeight: '500' },
  retrasoTime: { alignItems: 'flex-end' },
  escalaNum: { fontSize: 13, fontWeight: '700', color: C.navy },
});
