/**
 * /buscar — Motor de búsqueda Skyscanner-style
 *  Airports reales de Oracle
 *  Shimmer skeleton, error con retry
 *  SourceBadge  Oracle /  Demo
 *  Cross-sell automático
 */
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';
import { SearchBar, SearchParams, SearchMode } from '@/components/client/SearchBar';
import { FlightCard } from '@/components/client/FlightCard';
import { HotelCard } from '@/components/client/HotelCard';
import { FilterPanel, SortChips } from '@/components/client/FilterPanel';
import { useFlights, FlightResult, ClaseVuelo } from '@/hooks/useFlights';
import { useHotels, HotelResult } from '@/hooks/useHotels';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useBackend } from '@/hooks/useBackend';
import { BackendStatus } from '@/components/shared/BackendStatus';

// ─── Sort options ─────────────────────────────────────────────────────────────
const FLIGHT_SORTS = [
  { key: 'precio'   as const, label: 'Precio'    },
  { key: 'duracion' as const, label: 'Duración'  },
  { key: 'salida'   as const, label: 'Salida'    },
  { key: 'llegada'  as const, label: 'Llegada'   },
];
const HOTEL_SORTS = [
  { key: 'precio'    as const, label: 'Precio'    },
  { key: 'rating'    as const, label: 'Rating'    },
  { key: 'distancia' as const, label: 'Distancia' },
  { key: 'estrellas' as const, label: 'Estrellas' },
];

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
function Skeleton({ h = 100 }: { h?: number }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    return () => shimmer.stopAnimation();
  }, []);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });
  return (
    <Animated.View style={[sk.card, { height: h, opacity }]}>
      <View style={sk.line} />
      <View style={[sk.line, { width: '60%' }]} />
      <View style={[sk.line, { width: '80%', marginTop: 8 }]} />
    </Animated.View>
  );
}
const sk = StyleSheet.create({
  card: { backgroundColor: C.bgCard, borderRadius: 20, marginBottom: 10, padding: 16, borderWidth: 1, borderColor: C.border },
  line: { height: 12, backgroundColor: C.bgElevated, borderRadius: 6, marginBottom: 8, width: '100%' },
});

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub, action, onAction }: {
  icon: string; title: string; sub: string;
  action?: string; onAction?: () => void;
}) {
  return (
    <View style={es.wrap}>
      <Ionicons name={icon as any} size={48} color={C.muted} style={es.icon} />
      <Text style={es.title}>{title}</Text>
      <Text style={es.sub}>{sub}</Text>
      {action && onAction && (
        <TouchableOpacity style={es.btn} onPress={onAction}>
          <Text style={es.btnT}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const es = StyleSheet.create({
  wrap:  { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 30 },
  icon:  { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: C.textSub, textAlign: 'center' },
  sub:   { fontSize: 12, color: C.muted, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  btn:   { marginTop: 20, backgroundColor: C.electric, paddingHorizontal: 24, paddingVertical: 11, borderRadius: 14 },
  btnT:  { color: C.white, fontWeight: '800', fontSize: 14 },
});

// ─── Error state ─────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={er.wrap}>
      <Ionicons name="warning-outline" size={44} color={C.danger} style={{ marginBottom: 12 }} />
      <Text style={er.title}>Error al conectar</Text>
      <Text style={er.sub}>{message}</Text>
      <TouchableOpacity style={er.btn} onPress={onRetry}>
        <Text style={er.btnT}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
}
const er = StyleSheet.create({
  wrap:  { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 30 },
  title: { fontSize: 17, fontWeight: '800', color: C.danger },
  sub:   { fontSize: 12, color: C.muted, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  btn:   { marginTop: 18, backgroundColor: C.electric, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 14 },
  btnT:  { color: C.white, fontWeight: '800', fontSize: 14 },
});

// ─── Source badge ─────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: string }) {
  const isReal = source === 'backend';
  return (
    <View style={[sb.chip, { backgroundColor: isReal ? C.successBg : C.warningBg }]}>
      <Text style={[sb.t, { color: isReal ? C.success : C.warning }]}>
        {isReal ? ' Oracle' : ' Demo'}
      </Text>
    </View>
  );
}
const sb = StyleSheet.create({
  chip: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  t:    { fontSize: 9, fontWeight: '800' },
});

// ─── Cross-sell banner ────────────────────────────────────────────────────────
function CrossSellBanner({ destino, onPress }: { destino: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={cs.banner} onPress={onPress} activeOpacity={0.88}>
      <View style={cs.left}>
        <Ionicons name="business" size={24} color={C.teal} />
        <View>
          <Text style={cs.title}>¿Hotel en {destino}?</Text>
          <Text style={cs.sub}>Hoteles disponibles cerca del aeropuerto desde Oracle</Text>
        </View>
      </View>
      <View style={cs.btn}><Text style={cs.btnT}>Ver →</Text></View>
    </TouchableOpacity>
  );
}
const cs = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.tealBg, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.tealL },
  left:   { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  title:  { fontSize: 13, fontWeight: '700', color: C.teal },
  sub:    { fontSize: 11, color: C.muted, marginTop: 1 },
  btn:    { backgroundColor: C.teal, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
  btnT:   { fontSize: 12, fontWeight: '700', color: C.white },
});

// ─── Sticky booking bar ───────────────────────────────────────────────────────
function BookingBar({ flight, clase, onBook }: {
  flight: FlightResult; clase: ClaseVuelo; onBook: () => void;
}) {
  const precio = clase === 'ECONOMICA' ? flight.precio_eco : flight.precio_eje;
  return (
    <View style={bb.bar}>
      <View>
        <Text style={bb.flightNum}>{flight.numero_vuelo}</Text>
        <Text style={bb.route}>{flight.origen} → {flight.destino}</Text>
      </View>
      <View style={bb.right}>
        <Text style={bb.price}>USD {precio.toLocaleString()}</Text>
        <TouchableOpacity style={bb.btn} onPress={onBook} activeOpacity={0.88}>
          <Text style={bb.btnT}>Reservar →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const bb = StyleSheet.create({
  bar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navyL, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: C.borderE },
  flightNum: { fontSize: 15, fontWeight: '800', color: C.text },
  route:     { fontSize: 11, color: C.muted, marginTop: 2 },
  right:     { alignItems: 'flex-end', gap: 4 },
  price:     { fontSize: 20, fontWeight: '900', color: C.electric },
  btn:       { backgroundColor: C.electric, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 12 },
  btnT:      { color: C.white, fontWeight: '900', fontSize: 14 },
});

// ─── Results count bar ────────────────────────────────────────────────────────
function ResultBar({ count, label, children }: { count: number; label: string; children: React.ReactNode }) {
  return (
    <View style={rb.bar}>
      <Text style={rb.count}><Text style={rb.n}>{count}</Text> {label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 6 }}>
        {children}
      </ScrollView>
    </View>
  );
}
const rb = StyleSheet.create({
  bar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.borderL, gap: 8, backgroundColor: C.bg },
  count: { fontSize: 11, color: C.muted, minWidth: 56 },
  n:     { fontWeight: '800', color: C.text },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function BuscarScreen() {
  const router  = useRouter();
  const params  = useLocalSearchParams<{
    origen?: string; destino?: string; fecha?: string;
    clase?: string; modo?: SearchMode;
  }>();

  const { track }               = useAnalytics();
  const { isOnline, aeropuertos } = useBackend();
  const flights                 = useFlights();
  const hotels                  = useHotels();

  // Convert backend airports for SearchBar
  const airports = aeropuertos.data.map((a: any) => ({
    code: a.codigo_aeropuerto,
    city: a.ciudad,
    name: a.nombre,
    pais: a.pais ?? 'Guatemala',
  }));

  const [modo, setModo]             = useState<SearchMode>(params.modo ?? 'vuelos');
  const [selectedFlight, setSelF]   = useState<FlightResult | null>(null);
  const [showCrossSell, setShowCS]  = useState(false);
  const [lastSearch, setLastSearch] = useState<{ origen: string; destino: string; fecha: string } | null>(null);

  // Auto-search when arriving with params
  useEffect(() => {
    if (params.modo === 'hoteles') {
      hotels.search(params.destino);
    } else if (params.destino || params.origen) {
      const o = params.origen ?? 'GUA';
      const d = params.destino ?? '';
      const f = params.fecha  ?? new Date().toISOString().split('T')[0];
      setLastSearch({ origen: o, destino: d, fecha: f });
      flights.search(o, d, f, (params.clase as ClaseVuelo) ?? 'ECONOMICA');
    }
  }, []); // eslint-disable-line

  const handleSearch = useCallback((p: SearchParams) => {
    setModo(p.modo); setSelF(null); setShowCS(false);
    track('FLIGHT_SEARCH', { origen: p.origen, destino: p.destino });
    if (p.modo === 'vuelos') {
      setLastSearch({ origen: p.origen, destino: p.destino, fecha: p.fecha });
      flights.search(p.origen, p.destino, p.fecha, p.clase);
    } else {
      hotels.search(p.destino);
    }
  }, [flights, hotels, track]);

  const handleSelectFlight = useCallback((v: FlightResult) => {
    track('FLIGHT_CLICK', { id_vuelo: v.id_vuelo });
    setSelF(v);
    setTimeout(() => { setShowCS(true); hotels.search(v.destino); }, 300);
  }, [track, hotels]);

  const handleBook = useCallback(() => {
    if (!selectedFlight) return;
    track('BOOKING_START', { id_vuelo: selectedFlight.id_vuelo });
    router.push({
      pathname: '/reservar/asiento',
      params: {
        id:     selectedFlight.id_vuelo,
        clase:  flights.clase,
        precio: String(flights.clase === 'ECONOMICA' ? selectedFlight.precio_eco : selectedFlight.precio_eje),
      },
    } as any);
  }, [selectedFlight, flights.clase, track, router]);

  const handleSelectHotel = useCallback((h: HotelResult) => {
    track('FLIGHT_CLICK', { id_hotel: h.id_hotel });
  }, [track]);

  const handleRetryFlights = useCallback(() => {
    if (lastSearch) {
      flights.search(lastSearch.origen, lastSearch.destino, lastSearch.fecha, flights.clase);
    }
  }, [lastSearch, flights]);

  const isLoading = modo === 'vuelos' ? flights.loading : hotels.loading;

  return (
    <SafeAreaView style={s.container}>
      {/* ── Sticky header ── */}
      <View style={s.stickyTop}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.back}>
            <Text style={s.backT}>‹</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{modo === 'vuelos' ? 'Buscar vuelos' : 'Buscar hoteles'}</Text>
          <BackendStatus isOnline={isOnline} />
        </View>
        <View style={s.searchCompact}>
          <SearchBar
            onSearch={handleSearch}
            loading={isLoading}
            airports={airports}
            airportsLoading={aeropuertos.loading}
            initialParams={{ modo, origen: params.origen, destino: params.destino, fecha: params.fecha }}
          />
        </View>
      </View>

      {/* ── VUELOS ── */}
      {modo === 'vuelos' && (
        <View style={{ flex: 1 }}>
          {flights.searched && !flights.loading && (
            <ResultBar count={flights.results.length} label={flights.results.length === 1 ? 'vuelo' : 'vuelos'}>
              <SourceBadge source={flights.source} />
              <SortChips options={FLIGHT_SORTS} selected={flights.sortBy} onSelect={flights.setSortBy} />
              <FilterPanel mode="flights" filters={flights.filters} priceRange={flights.priceRange}
                airlines={flights.airlines} onApply={flights.setFilters} onReset={flights.resetFilters} />
            </ResultBar>
          )}

          {flights.loading ? (
            <ScrollView contentContainerStyle={s.loadPad}>
              {[1,2,3].map(i => <Skeleton key={i} h={150} />)}
            </ScrollView>
          ) : flights.error ? (
            <ErrorState message={flights.error} onRetry={handleRetryFlights} />
          ) : flights.searched && flights.results.length === 0 ? (
            <EmptyState
              icon="airplane-outline"
              title="Sin vuelos en Oracle aún"
              sub={`El endpoint /api/vuelos aún no está implementado en el backend.\nConecta el backend de vuelos para ver resultados reales.`}
              action="Ver hoteles disponibles"
              onAction={() => { setModo('hoteles'); hotels.search(params.destino); }}
            />
          ) : flights.searched ? (
            <FlatList
              data={flights.results}
              keyExtractor={v => String(v.id_vuelo)}
              contentContainerStyle={s.listPad}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                showCrossSell && selectedFlight ? (
                  <CrossSellBanner destino={selectedFlight.destino}
                    onPress={() => { setModo('hoteles'); }} />
                ) : null
              }
              ListEmptyComponent={
                <EmptyState icon="search-outline" title="Sin vuelos disponibles"
                  sub="Prueba con otro destino, fecha o clase de cabina" />
              }
              ListFooterComponent={
                selectedFlight ? (
                  <BookingBar flight={selectedFlight} clase={flights.clase} onBook={handleBook} />
                ) : null
              }
              renderItem={({ item }) => (
                <FlightCard vuelo={item} clase={flights.clase} onSelect={handleSelectFlight}
                  selected={selectedFlight?.id_vuelo === item.id_vuelo} />
              )}
            />
          ) : (
            <EmptyState icon="search-outline" title="Busca tu vuelo"
              sub={"Elige origen, destino y fecha para ver vuelos disponibles en Oracle"} />
          )}
        </View>
      )}

      {/* ── HOTELES ── */}
      {modo === 'hoteles' && (
        <View style={{ flex: 1 }}>
          {hotels.searched && !hotels.loading && (
            <ResultBar count={hotels.results.length} label={hotels.results.length === 1 ? 'hotel' : 'hoteles'}>
              <SourceBadge source={hotels.source} />
              <SortChips options={HOTEL_SORTS} selected={hotels.sortBy} onSelect={hotels.setSortBy} />
              <FilterPanel mode="hotels" filters={hotels.filters} priceRange={hotels.priceRange}
                onApply={hotels.setFilters} onReset={hotels.resetFilters} />
            </ResultBar>
          )}

          {hotels.loading ? (
            <ScrollView contentContainerStyle={s.loadPad}>
              {[1,2,3].map(i => <Skeleton key={i} h={250} />)}
            </ScrollView>
          ) : hotels.error ? (
            <ErrorState message={hotels.error} onRetry={() => hotels.search(params.destino)} />
          ) : hotels.searched ? (
            <FlatList
              data={hotels.results}
              keyExtractor={h => String(h.id_hotel)}
              contentContainerStyle={s.listPad}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyState icon="business-outline" title="Sin hoteles en Oracle"
                  sub="No se encontraron hoteles registrados en la base de datos.\nVerifica el backend o agrega hoteles al sistema." />
              }
              renderItem={({ item }) => (
                <HotelCard hotel={item} onSelect={handleSelectHotel} />
              )}
            />
          ) : (
            <EmptyState icon="search-outline" title="Busca un hotel"
              sub="Ingresa el destino para ver hoteles registrados en Oracle" />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  stickyTop:    { backgroundColor: C.navyL, borderBottomWidth: 1, borderBottomColor: C.border },
  headerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  back:         { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backT:        { fontSize: 22, color: C.text, fontWeight: '300', marginTop: -2 },
  headerTitle:  { fontSize: 16, fontWeight: '800', color: C.text },
  searchCompact:{ paddingHorizontal: 16, paddingBottom: 14 },
  loadPad:      { padding: 16, paddingBottom: 40 },
  listPad:      { padding: 16, paddingBottom: 120 },
});
