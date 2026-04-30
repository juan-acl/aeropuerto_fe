/**
 * Dashboard Tab — Dinámico por rol
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C, MOD_COLORS } from '@/constants/theme';
import { useSesion, PERMISOS_POR_ROL } from '@/context/session';
import { useBackend } from '@/hooks/useBackend';
import { BackendStatus } from '@/components/shared/BackendStatus';
import { backendApi } from '@/services/backendApi';
// Client home is the Skyscanner-style experience
import ClienteHome from '../cliente-home';

function KpiCard({ label, value, icon, color, bg, sub }: {
  label: string; value: string | number; icon: string;
  color: string; bg: string; sub?: string;
}) {
  return (
    <View style={[kpi.card, { borderTopColor: color, borderTopWidth: 3 }]}>
      <View style={[kpi.iconWrap, { backgroundColor: bg }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={[kpi.val, { color }]}>{value}</Text>
      <Text style={kpi.label}>{label}</Text>
      {sub ? <Text style={kpi.sub}>{sub}</Text> : null}
    </View>
  );
}

function SectionHeader({ title, action, onAction }: {
  title: string; action?: string; onAction?: () => void;
}) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {action && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={sh.action}>{action} →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function AlertRow({ text, level }: { text: string; level: 'info' | 'warn' | 'crit' }) {
  const cfgs = {
    info: { bg: C.infoBg, color: C.electric, icon: 'ℹ️', border: C.borderE },
    warn: { bg: C.warningBg, color: C.warning, icon: '', border: C.warningL },
    crit: { bg: C.dangerBg, color: C.danger, icon: '🚨', border: C.dangerL },
  };
  const cfg = cfgs[level];
  return (
    <View style={[ar.row, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={{ fontSize: 16 }}>{cfg.icon}</Text>
      <Text style={[ar.text, { color: cfg.color }]} numberOfLines={2}>{text}</Text>
    </View>
  );
}

// ─── CLIENTE ──────────────────────────────────────────────────────────────────
function DashboardCliente({ PROGRAMAS_LEALTAD, HOTELES, VUELOS }: { PROGRAMAS_LEALTAD: any[]; HOTELES: any[]; VUELOS: any[] }) {
  const { usuario, misReservas } = useSesion();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const lealtad = PROGRAMAS_LEALTAD.find((p: any) => p.IdPasajero === (usuario?.id ?? 100) || p.id_pasajero === (usuario?.id ?? 100));
  const puntos = lealtad?.PuntosAcumulados ?? lealtad?.puntos_acumulados ?? 0;
  const nivel = lealtad?.NivelMembresia ?? lealtad?.nivel_membresia ?? 'BRONCE';

  const NIVEL_CFG: Record<string, { color: string; icon: string; next: number }> = {
    BRONCE: { color: '#B45309', icon: '🥉', next: 5000 },
    PLATA: { color: '#6B7280', icon: '🥈', next: 15000 },
    ORO: { color: '#D97706', icon: '🥇', next: 40000 },
    PLATINO: { color: C.purple, icon: '', next: 999999 },
  };
  const nc = NIVEL_CFG[nivel] ?? NIVEL_CFG.BRONCE;
  const pct = Math.min(100, Math.round((puntos / nc.next) * 100));

  const proximos = [...misReservas]
    .filter(r => r.estado_reserva === 'CONFIRMADA' || r.estado_reserva === 'CHECK_IN')
    .slice(0, 3);

  const hotelesTop = HOTELES.filter((h: any) => h.Activo !== 0).slice(0, 3);
  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <SafeAreaView style={s.container}>
      <View style={s.hero}>
        <View style={s.orb1} /><View style={s.orb2} />
        <Text style={s.heroGreet}>{saludo},</Text>
        <Text style={s.heroName}>{usuario?.nombre ?? 'Pasajero'} {usuario?.apellido ?? ''}</Text>
        <TouchableOpacity
          style={[s.loyaltyCard, { borderColor: nc.color + '50' }]}
          onPress={() => router.push('/lealtad' as any)} activeOpacity={0.85}
        >
          <View style={s.loyaltyL}>
            <Text style={{ fontSize: 24 }}>{nc.icon}</Text>
            <View>
              <Text style={[s.loyaltyNivel, { color: nc.color }]}>Nivel {nivel}</Text>
              <Text style={s.loyaltyPuntos}>{puntos.toLocaleString('es-GT')} pts</Text>
            </View>
          </View>
          <View style={s.loyaltyR}>
            <View style={s.loyaltyTrack}>
              <View style={[s.loyaltyFill, { width: `${pct}%` as any, backgroundColor: nc.color }]} />
            </View>
            <Text style={s.loyaltyPct}>{pct}% al siguiente nivel</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.electric} />}
      >
        <View style={s.quickRow}>
          {[
            { icon: '', label: 'Buscar', path: '/buscar' },
            { icon: '', label: 'Check-in', path: '/reservar/checkin' },
            { icon: '', label: 'Mis viajes', path: '/historial' },
            { icon: '', label: 'Lealtad', path: '/lealtad' },
          ].map(q => (
            <TouchableOpacity key={q.label} style={s.quickBtn}
              onPress={() => router.push(q.path as any)} activeOpacity={0.8}>
              <Text style={{ fontSize: 26 }}>{q.icon}</Text>
              <Text style={s.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionHeader title="Próximos vuelos" action="Ver todos"
          onAction={() => router.push('/historial' as any)} />

        {proximos.length === 0 ? (
          <TouchableOpacity style={s.emptyCard}
            onPress={() => router.push('/reservar' as any)} activeOpacity={0.85}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}></Text>
            <Text style={s.emptyT}>No tienes vuelos próximos</Text>
            <View style={s.emptyBtn}><Text style={s.emptyBtnT}>Reservar ahora →</Text></View>
          </TouchableOpacity>
        ) : proximos.map((r: any, i: number) => {
          const vuelo = VUELOS.find((v: any) => v.IdVuelo === r.id_vuelo || v.id_vuelo === r.id_vuelo);
          return (
            <View key={i} style={s.reservaCard}>
              <View style={[s.reservaAccent, { backgroundColor: C.electric }]} />
              <View style={s.reservaBody}>
                <View style={s.reservaTop}>
                  <Text style={s.reservaNum}>{vuelo?.NumeroVuelo ?? vuelo?.numero_vuelo ?? r.numero_vuelo ?? '—'}</Text>
                  <View style={[s.chipGreen]}>
                    <Text style={s.chipGreenT}>{r.estado_reserva}</Text>
                  </View>
                </View>
                <Text style={s.reservaRuta}>
                  {vuelo?.AeropuertoOrigen ?? vuelo?.aeropuerto_origen ?? 'GUA'} → {vuelo?.AeropuertoDestino ?? vuelo?.aeropuerto_destino ?? '—'}
                </Text>
                <View style={s.reservaMeta}>
                  <Text style={s.reservaMetaT}>💺 {r.numero_asiento ?? '—'}</Text>
                  <Text style={s.reservaMetaT}>🎫 {r.codigo_reserva}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <SectionHeader title="Hoteles recomendados" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
          {hotelesTop.map((h: any) => (
            <View key={h.id_hotel} style={s.hotelCard}>
              <Text style={s.hotelStars}>{'★'.repeat(Number((h.categoria ?? '3*').charAt(0)))}</Text>
              <Text style={s.hotelName} numberOfLines={2}>{h.nombre_hotel}</Text>
              <Text style={s.hotelDist}> {h.distancia_km} km</Text>
              <Text style={s.hotelPrice}>
                desde <Text style={{ color: C.electric, fontWeight: '800' }}>
                  Q {h.tarifa_noche_desde ?? 150}
                </Text>/noche
              </Text>
              {h.tiene_shuttle ? (
                <View style={s.shuttleBadge}>
                  <Text style={s.shuttleBadgeT}> Shuttle gratis</Text>
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── EMPLEADO ─────────────────────────────────────────────────────────────────
function DashboardEmpleado({ VUELOS, ALERTAS_DATA }: { VUELOS: any[]; ALERTAS_DATA: any[] }) {
  const { usuario } = useSesion();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => ({
    enVuelo: VUELOS.filter((v: any) => (v.EstadoVuelo ?? v.estado_vuelo) === 'EN_VUELO').length,
    demorados: VUELOS.filter((v: any) => (v.EstadoVuelo ?? v.estado_vuelo) === 'DEMORADO').length,
    cancelados: VUELOS.filter((v: any) => (v.EstadoVuelo ?? v.estado_vuelo) === 'CANCELADO').length,
    programados: VUELOS.filter((v: any) => (v.EstadoVuelo ?? v.estado_vuelo) === 'PROGRAMADO').length,
  }), [VUELOS]);

  const alertas = (ALERTAS_DATA as any[]).filter((a: any) => !a.Atendida && !a.atendida).slice(0, 4);
  const vuelosHoy = VUELOS.slice(0, 6);
  const permisos = PERMISOS_POR_ROL[usuario?.rol ?? 'OPERACIONES'];

  const STATUS_COLOR: Record<string, string> = {
    EN_VUELO: C.success, PROGRAMADO: C.electric, DEMORADO: C.warning,
    CANCELADO: C.danger, ATERRIZADO: C.gray,
  };

  const ACCESOS: Record<number, { label: string; route: string }> = {
    1: { label: 'Infraestructura', route: '/modules/mod01-infraestructura' },
    3: { label: 'Aerolíneas', route: '/modules/mod03-aerolineas' },
    5: { label: 'Operaciones', route: '/modules/mod05-operaciones' },
    7: { label: 'Pasajeros', route: '/modules/mod07-pasajeros' },
    8: { label: 'Reservas', route: '/modules/mod08-reservas' },
    9: { label: 'Check-in', route: '/modules/mod09-checkin' },
    10: { label: 'Seguridad', route: '/modules/mod10-seguridad' },
    12: { label: 'Objetos perdidos', route: '/modules/mod12-objetos-perdidos' },
  };

  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.opsHero}>
        <View style={s.orb1} /><View style={s.orb2} />
        <View style={s.opsRow}>
          <View>
            <Text style={s.opsBrand}>AEROPUERTO LA AURORA</Text>
            <Text style={s.opsTitle}>Operaciones del Día</Text>
          </View>
          <View style={s.staffPill}>
            <Text style={{ fontSize: 20 }}>{usuario?.avatar ?? ''}</Text>
            <View>
              <Text style={s.staffName}>{usuario?.nombre}</Text>
              <Text style={s.staffDept}>{usuario?.departamento}</Text>
            </View>
          </View>
        </View>
        <View style={s.kpiRow}>
          {[
            { n: stats.enVuelo, l: 'En vuelo', c: C.success },
            { n: stats.programados, l: 'Programados', c: C.electric },
            { n: stats.demorados, l: 'Demorados', c: C.warning },
            { n: stats.cancelados, l: 'Cancelados', c: C.danger },
          ].map(k => (
            <View key={k.l} style={[s.kpiItem, { borderColor: k.c + '30' }]}>
              <Text style={[s.kpiN, { color: k.c }]}>{k.n}</Text>
              <Text style={s.kpiL}>{k.l}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.electric} />}
      >
        {alertas.length > 0 && (
          <>
            <SectionHeader title={" Alertas activas (" + alertas.length + ")"} />
            {alertas.map((a: any, i: number) => (
              <AlertRow key={i}
                text={a.descripcion ?? a.tipo_alerta ?? 'Alerta técnica'}
                level={a.nivel_gravedad === 'CRITICA' ? 'crit' : a.nivel_gravedad === 'ALTA' ? 'warn' : 'info'}
              />
            ))}
          </>
        )}

        <SectionHeader title="Vuelos de hoy" action="Ver todos"
          onAction={() => router.push('/(tabs)' as any)} />
        {vuelosHoy.map(v => {
          const dep = (v.HoraSalidaProgramada ?? v.hora_salida_programada)?.split('T')[1]?.slice(0, 5) ?? '--:--';
          const sc = STATUS_COLOR[(v.EstadoVuelo ?? v.estado_vuelo)] ?? C.gray;
          return (
            <TouchableOpacity key={v.id_vuelo} style={s.vueloRow}
              onPress={() => router.push(('/modules/vuelo-detalle?id=' + v.id_vuelo) as any)}
              activeOpacity={0.82}
            >
              <View style={[s.vuDot, { backgroundColor: sc }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.vuNum}>{v.NumeroVuelo ?? v.numero_vuelo ?? 'FL-' + v.id_vuelo}</Text>
                <Text style={s.vuRuta}>{v.AeropuertoOrigen ?? v.aeropuerto_origen} → {v.AeropuertoDestino ?? v.aeropuerto_destino}</Text>
              </View>
              <Text style={s.vuHora}>{dep}</Text>
              <View style={[s.vuEstado, { backgroundColor: sc + '20', borderColor: sc + '40' }]}>
                <Text style={[s.vuEstadoT, { color: sc }]}>{v.EstadoVuelo ?? v.estado_vuelo}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <SectionHeader title="Accesos rápidos" />
        <View style={s.modulosGrid}>
          {permisos.modulosOperativos.slice(0, 8).map((n: number) => {
            const acc = ACCESOS[n];
            const mc = MOD_COLORS[n];
            if (!acc) return null;
            return (
              <TouchableOpacity key={n}
                style={[s.moduloBtn, { borderColor: (mc?.color ?? C.border) + '30' }]}
                onPress={() => router.push(acc.route as any)} activeOpacity={0.8}
              >
                <Text style={{ fontSize: 22 }}>{mc?.icon ?? '📋'}</Text>
                <Text style={[s.moduloBtnT, { color: mc?.color ?? C.textSub }]}>{acc.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function DashboardAdmin({ VUELOS, ALERTAS_DATA, EMPLEADOS, INGRESOS_DATA, GASTOS_DATA, CANCELACIONES }: {
  VUELOS: any[]; ALERTAS_DATA: any[]; EMPLEADOS: any[];
  INGRESOS_DATA: any[]; GASTOS_DATA: any[]; CANCELACIONES: any[];
}) {
  const { isOnline, temporadas, refresh } = useBackend();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const totalIngresos = (INGRESOS_DATA as any[]).reduce((s: number, i: any) => s + (i.Monto ?? i.monto ?? 0), 0);
  const totalGastos = (GASTOS_DATA as any[]).reduce((s: number, g: any) => s + (g.Monto ?? g.monto ?? 0), 0);
  const balance = totalIngresos - totalGastos;

  const stats = {
    vuelos: VUELOS.length,
    enVuelo: VUELOS.filter((v: any) => (v.EstadoVuelo ?? v.estado_vuelo) === 'EN_VUELO').length,
    empleados: EMPLEADOS.filter((e: any) => e.Activo !== 0).length,
    alertas: (ALERTAS_DATA as any[]).filter((a: any) => !a.Atendida && !a.atendida).length,
    cancelaciones: CANCELACIONES.length,
  };
  const alertasCrit = (ALERTAS_DATA as any[]).filter((a: any) => !a.Atendida && !a.atendida).slice(0, 3);
  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };

  const ADMIN_LINKS = [
    { icon: '📈', label: 'Analytics', path: '/analytics' },
    { icon: '', label: 'Usuarios', path: '/(tabs)/admin' },
    { icon: '', label: 'Finanzas', path: '/modules/mod16-finanzas' },
    { icon: '👥', label: 'RRHH', path: '/modules/mod15-rrhh' },
    { icon: '', label: 'Seg. IT', path: '/modules/mod24-seguridad-info' },
    { icon: '', label: 'Alertas', path: '/notificaciones' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.adminHero}>
        <View style={s.orb1} /><View style={s.orb2} />
        <Text style={s.adminBrand}>AEROPUERTO LA AURORA · GUA</Text>
        <Text style={s.adminTitle}>Dashboard Ejecutivo</Text>
        <Text style={s.adminDate}>{new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        <View style={{ marginTop: 8 }}>
          <BackendStatus isOnline={isOnline} onPress={() => refresh.all()} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.electric} />}
      >
        <SectionHeader title="Finanzas del período" />
        <View style={s.finRow}>
          {[
            { icon: '📈', val: 'Q ' + (totalIngresos / 1000).toFixed(0) + 'K', label: 'Ingresos', c: C.success },
            { icon: '📉', val: 'Q ' + (totalGastos / 1000).toFixed(0) + 'K', label: 'Gastos', c: C.danger },
            { icon: '', val: 'Q ' + (Math.abs(balance) / 1000).toFixed(0) + 'K', label: 'Balance', c: balance >= 0 ? C.electric : C.danger },
          ].map(f => (
            <View key={f.label} style={[s.finCard, { borderColor: f.c + '40' }]}>
              <Text style={{ fontSize: 22 }}>{f.icon}</Text>
              <Text style={[s.finVal, { color: f.c }]}>{f.val}</Text>
              <Text style={s.finLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Indicadores operacionales" />
        <View style={s.kpiGrid}>
          <KpiCard label="Vuelos" value={stats.vuelos} icon="" color={C.electric} bg={C.infoBg} />
          <KpiCard label="En vuelo" value={stats.enVuelo} icon="🛫" color={C.success} bg={C.successBg} />
          <KpiCard label="Personal" value={stats.empleados} icon="👥" color={C.teal} bg={C.tealBg} />
          <KpiCard label="Alertas" value={stats.alertas} icon="" color={C.warning} bg={C.warningBg} sub={stats.alertas > 0 ? 'sin atender' : 'al día'} />
          <KpiCard label="Cancelaciones" value={stats.cancelaciones} icon="❌" color={C.danger} bg={C.dangerBg} />
          <KpiCard label="Módulos" value={29} icon="" color={C.purple} bg={C.purpleBg} sub="activos" />
        </View>

        {alertasCrit.length > 0 && (
          <>
            <SectionHeader title="Alertas sin atender"
              action="Ver todas" onAction={() => router.push('/(tabs)/admin' as any)} />
            {alertasCrit.map((a: any, i: number) => (
              <AlertRow key={i}
                text={a.descripcion ?? a.tipo_alerta ?? 'Alerta técnica'}
                level={i === 0 ? 'crit' : 'warn'}
              />
            ))}
          </>
        )}

        <SectionHeader title="Gestión del sistema" />
        <View style={s.adminActions}>
          {ADMIN_LINKS.map(a => (
            <TouchableOpacity key={a.label} style={s.adminActionBtn}
              onPress={() => router.push(a.path as any)} activeOpacity={0.8}>
              <Text style={{ fontSize: 24 }}>{a.icon}</Text>
              <Text style={s.adminActionT}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function DashboardTab() {
  const [VUELOS, set_VUELOS] = useState<any[]>([]);
  const [ALERTAS_DATA, set_ALERTAS_DATA] = useState<any[]>([]);
  const [EMPLEADOS, set_EMPLEADOS] = useState<any[]>([]);
  const [INGRESOS_DATA, set_INGRESOS_DATA] = useState<any[]>([]);
  const [GASTOS_DATA, set_GASTOS_DATA] = useState<any[]>([]);
  const [PROGRAMAS_LEALTAD, set_PROGRAMAS_LEALTAD] = useState<any[]>([]);
  const [HOTELES, set_HOTELES] = useState<any[]>([]);
  const [CANCELACIONES, set_CANCELACIONES] = useState<any[]>([]);
  useEffect(() => {
    backendApi.vuelos.listar().then(d => set_VUELOS(d)).catch(() => { });
    backendApi.mantenimiento.alertasTecnicas.listar().then(d => set_ALERTAS_DATA(d)).catch(() => { });
    backendApi.empleados.listar().then(d => set_EMPLEADOS(d)).catch(() => { });
    backendApi.ingresos.listar().then(d => set_INGRESOS_DATA(d)).catch(() => { });
    backendApi.gastos.listar().then(d => set_GASTOS_DATA(d)).catch(() => { });
    backendApi.lealtad.listar().then(d => set_PROGRAMAS_LEALTAD(d)).catch(() => { });
    backendApi.hoteles.listar().then(d => set_HOTELES(d)).catch(() => { });
    backendApi.vuelos.listar().then(d => set_CANCELACIONES(d)).catch(() => { });
  }, []);

  const { esCliente, esAdmin } = useSesion();
  if (esAdmin) return <DashboardAdmin VUELOS={VUELOS} ALERTAS_DATA={ALERTAS_DATA} EMPLEADOS={EMPLEADOS} INGRESOS_DATA={INGRESOS_DATA} GASTOS_DATA={GASTOS_DATA} CANCELACIONES={CANCELACIONES} />;
  if (!esCliente) return <DashboardEmpleado VUELOS={VUELOS} ALERTAS_DATA={ALERTAS_DATA} />;
  return <ClienteHome />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  body: { padding: 16, paddingBottom: 40 },
  orb1: { position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: C.electric, opacity: 0.08 },
  orb2: { position: 'absolute', bottom: -20, left: 20, width: 100, height: 100, borderRadius: 50, backgroundColor: C.cyan, opacity: 0.06 },
  hero: { backgroundColor: C.navyL, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20, overflow: 'hidden' },
  heroGreet: { fontSize: 13, color: C.muted, fontWeight: '500' },
  heroName: { fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -0.5, marginTop: 2, marginBottom: 14 },
  loyaltyCard: { backgroundColor: C.bgElevated, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1 },
  loyaltyL: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loyaltyNivel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  loyaltyPuntos: { fontSize: 18, fontWeight: '900', color: C.text, marginTop: 1 },
  loyaltyR: { flex: 1 },
  loyaltyTrack: { height: 6, backgroundColor: C.bg, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  loyaltyFill: { height: 6, borderRadius: 3 },
  loyaltyPct: { fontSize: 10, color: C.muted, fontWeight: '500' },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20, marginTop: 4 },
  quickBtn: { flex: 1, backgroundColor: C.bgCard, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.borderE },
  quickLabel: { fontSize: 11, fontWeight: '700', color: C.textSub },
  emptyCard: { backgroundColor: C.bgCard, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  emptyT: { fontSize: 14, color: C.muted, marginBottom: 12 },
  emptyBtn: { backgroundColor: C.infoBg, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8, borderWidth: 1, borderColor: C.borderE },
  emptyBtnT: { fontSize: 13, fontWeight: '700', color: C.electric },
  reservaCard: { backgroundColor: C.bgCard, borderRadius: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  reservaAccent: { height: 3 },
  reservaBody: { padding: 14 },
  reservaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reservaNum: { fontSize: 18, fontWeight: '900', color: C.text },
  reservaRuta: { fontSize: 13, color: C.muted, marginBottom: 8 },
  reservaMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  reservaMetaT: { fontSize: 11, color: C.textSub, fontWeight: '500' },
  chipGreen: { backgroundColor: C.successBg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: C.success + '40' },
  chipGreenT: { fontSize: 10, fontWeight: '700', color: C.success },
  hotelCard: { width: 160, backgroundColor: C.bgCard, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  hotelStars: { color: C.amber, fontSize: 14, marginBottom: 6 },
  hotelName: { fontSize: 13, fontWeight: '800', color: C.text, marginBottom: 4, lineHeight: 18 },
  hotelDist: { fontSize: 11, color: C.muted, marginBottom: 4 },
  hotelPrice: { fontSize: 12, color: C.muted },
  shuttleBadge: { backgroundColor: C.tealBg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, marginTop: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: C.tealL },
  shuttleBadgeT: { fontSize: 9, fontWeight: '700', color: C.teal },
  opsHero: { backgroundColor: C.navyL, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16, overflow: 'hidden' },
  opsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  opsBrand: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 },
  opsTitle: { fontSize: 22, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  staffPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bgElevated, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: C.border },
  staffName: { fontSize: 12, fontWeight: '700', color: C.text },
  staffDept: { fontSize: 10, color: C.muted },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiItem: { flex: 1, backgroundColor: C.bgElevated, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1 },
  kpiN: { fontSize: 20, fontWeight: '900' },
  kpiL: { fontSize: 9, color: C.muted, marginTop: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  vueloRow: { backgroundColor: C.bgCard, borderRadius: 14, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
  vuDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  vuNum: { fontSize: 15, fontWeight: '800', color: C.text },
  vuRuta: { fontSize: 11, color: C.muted, marginTop: 2 },
  vuHora: { fontSize: 16, fontWeight: '800', color: C.textSub },
  vuEstado: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
  vuEstadoT: { fontSize: 9, fontWeight: '700' },
  modulosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moduloBtn: { width: '23%', aspectRatio: 1, backgroundColor: C.bgCard, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1, flexGrow: 1 },
  moduloBtnT: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  adminHero: { backgroundColor: C.navyL, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20, overflow: 'hidden' },
  adminBrand: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 },
  adminTitle: { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -0.8 },
  adminDate: { fontSize: 12, color: C.muted, marginTop: 4 },
  finRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  finCard: { flex: 1, backgroundColor: C.bgCard, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1 },
  finVal: { fontSize: 20, fontWeight: '900' },
  finLabel: { fontSize: 10, color: C.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  adminActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  adminActionBtn: { width: '30%', backgroundColor: C.bgCard, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border, flexGrow: 1 },
  adminActionT: { fontSize: 11, fontWeight: '700', color: C.textSub },
});

const kpi = StyleSheet.create({
  card: { width: '47%', backgroundColor: C.bgCard, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border, flexGrow: 1 },
  iconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  val: { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  label: { fontSize: 11, color: C.muted, fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 },
  sub: { fontSize: 10, color: C.light, textAlign: 'center' },
});

const sh = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 16 },
  title: { fontSize: 13, fontWeight: '800', color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.8 },
  action: { fontSize: 12, color: C.electric, fontWeight: '700' },
});

const ar = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  text: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 17 },
});