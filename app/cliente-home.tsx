/**
 * /cliente-home — Pantalla principal del cliente (Skyscanner-style)
 * ✅ Hero animado + SearchBar con airports reales (Oracle)
 * ✅ Indicador 🟢 Oracle / 🟡 Demo
 * ✅ Recomendaciones con datos reales
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, StatusBar, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';
import { useSesion } from '@/context/session';
import { SearchBar, SearchParams } from '@/components/client/SearchBar';
import { RecommendationCarousel } from '@/components/client/RecommendationCarousel';
import { BackendStatus } from '@/components/shared/BackendStatus';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useBackend } from '@/hooks/useBackend';
import { useNotifications } from '@/hooks/useNotifications';

// ─── Quick action card ────────────────────────────────────────────────────────
function QuickCard({
  icon, label, badge, color, onPress,
}: {
  icon: string; label: string; badge?: number; color?: string; onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const accentColor = color ?? C.electric;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.00, duration: 120, useNativeDriver: true }),
    ]).start(() => onPress());
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={{ flex: 1 }}>
      <Animated.View style={[qa.card, { transform: [{ scale: scaleAnim }], borderColor: accentColor + '30' }]}>
        <View style={[qa.iconWrap, { backgroundColor: accentColor + '18' }]}>
          <Text style={{ fontSize: 22 }}>{icon}</Text>
          {badge && badge > 0 ? (
            <View style={qa.badge}>
              <Text style={qa.badgeT}>{badge > 9 ? '9+' : badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[qa.label, { color: C.textSub }]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
const qa = StyleSheet.create({
  card:     { backgroundColor: C.bgCard, borderRadius: 18, paddingVertical: 14, alignItems: 'center', gap: 6, borderWidth: 1, position: 'relative' },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge:    { position: 'absolute', top: -4, right: -8, backgroundColor: C.danger, borderRadius: 99, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeT:   { fontSize: 9, color: '#fff', fontWeight: '800' },
  label:    { fontSize: 11, fontWeight: '700', textAlign: 'center' },
});

// ─── Source indicator chip ────────────────────────────────────────────────────
function SourceChip({ isOnline }: { isOnline: boolean | null }) {
  const color = isOnline === true ? C.success : isOnline === false ? C.warning : C.muted;
  const label = isOnline === true ? '🟢 Oracle' : isOnline === false ? '🟡 Demo' : '⏳ Conectando...';
  return (
    <View style={[sc.chip, { borderColor: color + '40' }]}>
      <Text style={[sc.t, { color }]}>{label}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  chip: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  t:    { fontSize: 11, fontWeight: '700' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ClienteHome() {
  const router   = useRouter();
  const { usuario } = useSesion();
  const recs     = useRecommendations();
  const { track } = useAnalytics();
  const backend  = useBackend();
  const { isOnline, aeropuertos } = backend;
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  // Hero fade-in on mount
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide   = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(heroSlide,   { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const hora   = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const nombre = usuario?.nombre ?? 'Viajero';

  // Convert backend airports to SearchBar format
  const airports = aeropuertos.data.map((a: any) => ({
    code: a.codigo_aeropuerto,
    city: a.ciudad,
    name: a.nombre,
    pais: a.pais ?? 'Guatemala',
  }));

  const handleSearch = useCallback((p: SearchParams) => {
    track('FLIGHT_SEARCH', { origen: p.origen, destino: p.destino, modo: p.modo });
    router.push({
      pathname: '/buscar',
      params: { origen: p.origen, destino: p.destino, fecha: p.fecha, clase: p.clase, modo: p.modo },
    } as any);
  }, [track, router]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    backend.refresh.all().finally(() => setRefreshing(false));
  }, [backend.refresh]);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.electric}
            title="Actualizando desde Oracle..."
            titleColor={C.muted}
          />
        }
      >
        {/* ── Hero ── */}
        <View style={s.hero}>
          {/* Decorative orbs */}
          <View style={s.orb1} />
          <View style={s.orb2} />
          <View style={s.orb3} />

          {/* Animated content */}
          <Animated.View
            style={[s.heroContent, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}
          >
            {/* Top row: greeting + source indicator + notifications */}
            <View style={s.heroTopRow}>
              <View>
                <Text style={s.heroGreet}>{saludo}, {nombre} ✈️</Text>
                <Text style={s.heroTitle}>¿A dónde{'\n'}viajas hoy?</Text>
              </View>
              <View style={s.heroRight}>
                <SourceChip isOnline={isOnline} />
                <TouchableOpacity
                  style={s.notifBtn}
                  onPress={() => router.push('/notificaciones' as any)}
                >
                  <Text style={{ fontSize: 18 }}>🔔</Text>
                  {unreadCount > 0 && (
                    <View style={s.notifBadge}>
                      <Text style={s.notifBadgeT}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Backend multi-status (developer view) */}
            <View style={s.healthRow}>
              <BackendStatus isOnline={isOnline} />
              <View style={s.healthChips}>
                {(['develop','gerson','modulos'] as const).map(k => (
                  <View key={k} style={[s.hChip, {
                    backgroundColor: backend.health[k] === 'online' ? C.successBg :
                                     backend.health[k] === 'offline' ? C.dangerBg : C.warningBg,
                  }]}>
                    <Text style={[s.hChipT, {
                      color: backend.health[k] === 'online' ? C.success :
                             backend.health[k] === 'offline' ? C.danger : C.warning,
                    }]}>
                      {k === 'develop' ? ':5087' : k === 'gerson' ? ':5088' : ':5089'}
                      {' '}{backend.health[k] === 'online' ? '●' : backend.health[k] === 'offline' ? '○' : '◌'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Search bar with real airports */}
            <View style={s.searchWrap}>
              <SearchBar
                onSearch={handleSearch}
                airports={airports}
                airportsLoading={aeropuertos.loading}
              />
            </View>
          </Animated.View>
        </View>

        {/* ── Quick actions ── */}
        <View style={s.quickSection}>
          <Text style={s.sectionTitle}>Acceso rápido</Text>
          <View style={s.quickRow}>
            <QuickCard
              icon="✅" label="Check-in"
              color={C.success}
              onPress={() => router.push('/reservar/checkin' as any)}
            />
            <QuickCard
              icon="🎟️" label="Mis viajes"
              color={C.electric}
              onPress={() => router.push('/historial' as any)}
            />
            <QuickCard
              icon="💎" label="Lealtad"
              color={C.amber}
              onPress={() => router.push('/lealtad' as any)}
            />
            <QuickCard
              icon="🔔" label="Alertas"
              badge={unreadCount}
              color={C.purple}
              onPress={() => router.push('/notificaciones' as any)}
            />
          </View>
        </View>

        {/* ── Data source info banner ── */}
        {isOnline === false && (
          <View style={s.offlineBanner}>
            <Text style={{ fontSize: 16 }}>⚠️</Text>
            <View>
              <Text style={s.offlineTitle}>Backend no disponible</Text>
              <Text style={s.offlineSub}>
                Mostrando datos de demostración. Levanta los backends para conectar con Oracle.
              </Text>
            </View>
          </View>
        )}

        {/* ── ML Recommendations ── */}
        <View style={s.recsWrap}>
          <RecommendationCarousel
            destinosPopulares={recs.destinosPopulares}
            vuelosRec={recs.vuelosRecomendados}
            hotelesRec={recs.hotelesRecomendados}
            promos={recs.promos}
            loading={recs.loading}
            mensajePersonalizado={recs.mensajePersonalizado}
            onSelectDestino={code => {
              track('FLIGHT_SEARCH', { destino: code });
              router.push({ pathname: '/buscar', params: { destino: code, modo: 'vuelos' } } as any);
            }}
            onSelectVuelo={id => {
              track('FLIGHT_CLICK', { id_vuelo: id });
              router.push({ pathname: '/buscar', params: { modo: 'vuelos' } } as any);
            }}
            onSelectHotel={() =>
              router.push({ pathname: '/buscar', params: { modo: 'hoteles' } } as any)
            }
            onSelectPromo={id => {
              track('PROMO_CLICK', { promo_id: id });
              router.push({ pathname: '/buscar', params: { modo: 'vuelos' } } as any);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  hero:         { backgroundColor: C.navyL, paddingBottom: 20, overflow: 'hidden' },
  orb1:         { position: 'absolute', top: -60, right: -30, width: 220, height: 220, borderRadius: 110, backgroundColor: C.electric, opacity: 0.09 },
  orb2:         { position: 'absolute', top: 20, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: C.cyan, opacity: 0.06 },
  orb3:         { position: 'absolute', bottom: 30, right: 40, width: 90, height: 90, borderRadius: 45, backgroundColor: C.purple, opacity: 0.07 },
  heroContent:  { paddingTop: 14 },
  heroTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 10 },
  heroGreet:    { fontSize: 13, color: C.muted, fontWeight: '500', marginBottom: 4 },
  heroTitle:    { fontSize: 30, fontWeight: '900', color: C.text, letterSpacing: -1, lineHeight: 34 },
  heroRight:    { alignItems: 'flex-end', gap: 8, paddingTop: 4 },
  notifBtn:     { width: 40, height: 40, borderRadius: 12, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border, position: 'relative' },
  notifBadge:   { position: 'absolute', top: -3, right: -3, backgroundColor: C.danger, borderRadius: 99, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  notifBadgeT:  { fontSize: 9, color: '#fff', fontWeight: '800' },
  healthRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  healthChips:  { flexDirection: 'row', gap: 4 },
  hChip:        { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  hChipT:       { fontSize: 9, fontWeight: '700' },
  searchWrap:   { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 12 },
  quickSection: { paddingHorizontal: 16, paddingTop: 20 },
  quickRow:     { flexDirection: 'row', gap: 10 },
  offlineBanner:{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, margin: 16, backgroundColor: C.warningBg, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.warningL },
  offlineTitle: { fontSize: 13, fontWeight: '800', color: C.warning },
  offlineSub:   { fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 16 },
  recsWrap:     { paddingTop: 24 },
});
