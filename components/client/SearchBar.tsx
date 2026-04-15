/**
 * SearchBar — Skyscanner-style dual-mode search (flights + hotels)
 * ✅ Airports desde prop (datos reales de useBackend)
 * ✅ Animación de swap, indicador de carga
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  Modal, ScrollView, Animated, ActivityIndicator,
} from 'react-native';
import { C } from '@/constants/theme';

export type SearchMode = 'vuelos' | 'hoteles';
export type ClaseType  = 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE';

export interface AirportOption {
  code: string;
  city: string;
  name: string;
  pais: string;
}

export interface SearchParams {
  origen:      string;
  destino:     string;
  fecha:       string;
  fechaVuelta?: string;
  pasajeros:   number;
  clase:       ClaseType;
  modo:        SearchMode;
}

interface Props {
  onSearch:       (p: SearchParams) => void;
  loading?:       boolean;
  initialParams?: Partial<SearchParams>;
  airports?:      AirportOption[];   // datos reales del backend
  airportsLoading?: boolean;
}

// Fallback estático mínimo (GUA + destinos comunes) cuando Oracle no responde
const FALLBACK_AIRPORTS: AirportOption[] = [
  { code: 'GUA', city: 'Ciudad de Guatemala', name: 'La Aurora Int\'l', pais: 'Guatemala' },
  { code: 'MIA', city: 'Miami',               name: 'Miami International',     pais: 'EEUU' },
  { code: 'BOG', city: 'Bogotá',              name: 'El Dorado',               pais: 'Colombia' },
  { code: 'MEX', city: 'Ciudad de México',    name: 'Benito Juárez',           pais: 'México' },
  { code: 'LAX', city: 'Los Ángeles',         name: 'Los Angeles International',pais: 'EEUU' },
  { code: 'MAD', city: 'Madrid',              name: 'Adolfo Suárez Barajas',   pais: 'España' },
  { code: 'LIM', city: 'Lima',                name: 'Jorge Chávez',            pais: 'Perú' },
  { code: 'SCL', city: 'Santiago',            name: 'Arturo Merino Benítez',   pais: 'Chile' },
  { code: 'CUN', city: 'Cancún',              name: 'Internacional de Cancún', pais: 'México' },
  { code: 'JFK', city: 'Nueva York',          name: 'John F. Kennedy',         pais: 'EEUU' },
];

// ─── Airport Picker Modal ─────────────────────────────────────────────────────
function AirportPicker({ visible, onSelect, onClose, title, airports, loading }: {
  visible:  boolean;
  onSelect: (code: string) => void;
  onClose:  () => void;
  title:    string;
  airports: AirportOption[];
  loading?: boolean;
}) {
  const [q, setQ] = useState('');
  const filtered = airports.filter(a =>
    !q ||
    a.city.toLowerCase().includes(q.toLowerCase()) ||
    a.code.toLowerCase().includes(q.toLowerCase()) ||
    a.name.toLowerCase().includes(q.toLowerCase()) ||
    a.pais.toLowerCase().includes(q.toLowerCase())
  );

  // Agrupar por país
  const grouped = filtered.reduce<Record<string, AirportOption[]>>((acc, a) => {
    if (!acc[a.pais]) acc[a.pais] = [];
    acc[a.pais].push(a);
    return acc;
  }, {});

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={pk.overlay}>
        <View style={pk.sheet}>
          <View style={pk.handle} />
          <View style={pk.titleRow}>
            <Text style={pk.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={pk.closeBtn}>
              <Text style={pk.closeT}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={pk.loadingWrap}>
              <ActivityIndicator color={C.electric} />
              <Text style={pk.loadingT}>Cargando aeropuertos desde Oracle...</Text>
            </View>
          ) : null}

          <View style={pk.search}>
            <Text style={pk.searchIcon}>🔍</Text>
            <TextInput
              style={pk.searchInput} value={q} onChangeText={setQ}
              placeholder="Ciudad, país o código IATA..."
              placeholderTextColor={C.placeholder}
              autoFocus
            />
            {q ? (
              <TouchableOpacity onPress={() => setQ('')}>
                <Text style={{ color: C.muted, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {q ? (
              // Búsqueda plana
              filtered.map(a => (
                <AirportRow key={a.code} a={a} onSelect={() => { onSelect(a.code); onClose(); setQ(''); }} />
              ))
            ) : (
              // Agrupado por país
              Object.entries(grouped).map(([pais, list]) => (
                <View key={pais}>
                  <Text style={pk.groupHeader}>{pais}</Text>
                  {list.map(a => (
                    <AirportRow key={a.code} a={a} onSelect={() => { onSelect(a.code); onClose(); setQ(''); }} />
                  ))}
                </View>
              ))
            )}
            {filtered.length === 0 && !loading && (
              <View style={pk.emptyWrap}>
                <Text style={pk.emptyT}>No se encontraron aeropuertos</Text>
                <Text style={pk.emptySub}>Prueba con otra ciudad o código IATA</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function AirportRow({ a, onSelect }: { a: AirportOption; onSelect: () => void }) {
  return (
    <TouchableOpacity style={pk.item} onPress={onSelect}>
      <View style={pk.itemLeft}>
        <Text style={pk.itemCode}>{a.code}</Text>
        <View>
          <Text style={pk.itemCity}>{a.city}</Text>
          <Text style={pk.itemName} numberOfLines={1}>{a.name}</Text>
        </View>
      </View>
      <Text style={pk.itemArrow}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Main SearchBar ───────────────────────────────────────────────────────────
export function SearchBar({
  onSearch, loading = false, initialParams, airports, airportsLoading = false,
}: Props) {
  const airportList = (airports && airports.length > 0) ? airports : FALLBACK_AIRPORTS;

  const [modo,      setModo]     = useState<SearchMode>(initialParams?.modo ?? 'vuelos');
  const [origen,    setOrigen]   = useState(initialParams?.origen  ?? 'GUA');
  const [destino,   setDestino]  = useState(initialParams?.destino ?? '');
  const [fecha,     setFecha]    = useState(
    initialParams?.fecha ?? new Date().toISOString().split('T')[0]
  );
  const [pasajeros, setPasajeros]= useState(initialParams?.pasajeros ?? 1);
  const [clase,     setClase]    = useState<ClaseType>(initialParams?.clase ?? 'ECONOMICA');
  const [picker,    setPicker]   = useState<'origen' | 'destino' | null>(null);

  // Animación del botón swap
  const swapAnim = useRef(new Animated.Value(0)).current;

  const getCity = (code: string) =>
    airportList.find(a => a.code === code)?.city ?? code;

  const CLASES: { key: ClaseType; label: string; short: string }[] = [
    { key: 'ECONOMICA',     label: 'Económica',     short: 'Eco' },
    { key: 'EJECUTIVA',     label: 'Ejecutiva',     short: 'Eje' },
    { key: 'PRIMERA_CLASE', label: 'Primera Clase', short: '1ra' },
  ];

  const handleSwap = () => {
    // Animación de rotación
    Animated.sequence([
      Animated.timing(swapAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(swapAnim, { toValue: 0, duration: 0,   useNativeDriver: true }),
    ]).start();
    const t = origen;
    setOrigen(destino || 'GUA');
    setDestino(t);
  };

  const handleSearch = () => {
    if (!destino && modo === 'vuelos') return;
    onSearch({ origen, destino, fecha, pasajeros, clase, modo });
  };

  const swapRotate = swapAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={s.container}>
      {/* Source indicator */}
      {!airportsLoading && airports && airports.length > 0 && (
        <View style={s.sourceRow}>
          <View style={[s.sourceDot, { backgroundColor: C.success }]} />
          <Text style={s.sourceT}>Aeropuertos cargados desde Oracle ({airports.length})</Text>
        </View>
      )}
      {airportsLoading && (
        <View style={s.sourceRow}>
          <ActivityIndicator size="small" color={C.electric} style={{ marginRight: 6 }} />
          <Text style={s.sourceT}>Cargando aeropuertos...</Text>
        </View>
      )}

      {/* Mode toggle */}
      <View style={s.modeRow}>
        {(['vuelos', 'hoteles'] as SearchMode[]).map(m => (
          <TouchableOpacity
            key={m}
            style={[s.modeBtn, modo === m && s.modeBtnActive]}
            onPress={() => setModo(m)}
            activeOpacity={0.8}
          >
            <Text style={s.modeIcon}>{m === 'vuelos' ? '✈️' : '🏨'}</Text>
            <Text style={[s.modeBtnT, modo === m && s.modeBtnTActive]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Route row — vuelos */}
      {modo === 'vuelos' && (
        <View style={s.routeRow}>
          <TouchableOpacity style={[s.field, s.fieldFlex]} onPress={() => setPicker('origen')}>
            <Text style={s.fieldLabel}>DESDE</Text>
            <Text style={s.fieldValue}>{getCity(origen)}</Text>
            <Text style={s.fieldCode}>{origen}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.swapBtn} onPress={handleSwap}>
            <Animated.Text style={{ color: C.electric, fontSize: 18, transform: [{ rotate: swapRotate }] }}>
              ⇄
            </Animated.Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.field, s.fieldFlex]} onPress={() => setPicker('destino')}>
            <Text style={s.fieldLabel}>HASTA</Text>
            <Text style={[s.fieldValue, !destino && { color: C.placeholder }]}>
              {destino ? getCity(destino) : 'Elige destino'}
            </Text>
            {destino && <Text style={s.fieldCode}>{destino}</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Destination only — hoteles */}
      {modo === 'hoteles' && (
        <TouchableOpacity style={s.field} onPress={() => setPicker('destino')}>
          <Text style={s.fieldLabel}>DESTINO</Text>
          <Text style={[s.fieldValue, !destino && { color: C.placeholder }]}>
            {destino ? getCity(destino) : 'Ciudad o aeropuerto'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Date + passengers row */}
      <View style={s.routeRow}>
        <View style={[s.field, s.fieldFlex]}>
          <Text style={s.fieldLabel}>FECHA DE IDA</Text>
          <TextInput
            style={s.fieldInput} value={fecha} onChangeText={setFecha}
            placeholder="YYYY-MM-DD" placeholderTextColor={C.placeholder}
          />
        </View>
        <View style={s.fieldDivider} />
        <View style={[s.field, s.fieldFlex]}>
          <Text style={s.fieldLabel}>PASAJEROS · CLASE</Text>
          <View style={s.pasRow}>
            <TouchableOpacity style={s.pasBtn} onPress={() => setPasajeros(Math.max(1, pasajeros - 1))}>
              <Text style={s.pasBtnT}>−</Text>
            </TouchableOpacity>
            <Text style={s.pasN}>{pasajeros}</Text>
            <TouchableOpacity style={s.pasBtn} onPress={() => setPasajeros(Math.min(9, pasajeros + 1))}>
              <Text style={s.pasBtnT}>+</Text>
            </TouchableOpacity>
            <View style={s.clasePill}>
              {CLASES.map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={[s.claseOpt, clase === c.key && s.claseOptActive]}
                  onPress={() => setClase(c.key)}
                >
                  <Text style={[s.claseOptT, clase === c.key && s.claseOptTActive]}>{c.short}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Search button */}
      <TouchableOpacity
        style={[s.searchBtn, loading && { opacity: 0.7 }]}
        onPress={handleSearch}
        disabled={loading}
        activeOpacity={0.88}
      >
        {loading ? (
          <ActivityIndicator color={C.white} style={{ marginRight: 8 }} />
        ) : (
          <Text style={s.searchBtnIcon}>🔍</Text>
        )}
        <Text style={s.searchBtnT}>
          {loading ? 'Buscando...' : modo === 'vuelos' ? 'Buscar vuelos' : 'Buscar hoteles'}
        </Text>
      </TouchableOpacity>

      {/* Airport pickers */}
      <AirportPicker
        visible={picker === 'origen'} title="Ciudad de origen"
        onSelect={setOrigen} onClose={() => setPicker(null)}
        airports={airportList} loading={airportsLoading}
      />
      <AirportPicker
        visible={picker === 'destino'} title="Ciudad de destino"
        onSelect={setDestino} onClose={() => setPicker(null)}
        airports={airportList} loading={airportsLoading}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:      { backgroundColor: C.bgCard, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: C.borderE, gap: 10 },
  sourceRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgElevated, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  sourceDot:      { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  sourceT:        { fontSize: 10, color: C.muted, fontWeight: '500' },
  modeRow:        { flexDirection: 'row', backgroundColor: C.bgElevated, borderRadius: 14, padding: 4, gap: 4 },
  modeBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10 },
  modeBtnActive:  { backgroundColor: C.electric, shadowColor: C.electric, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  modeIcon:       { fontSize: 14 },
  modeBtnT:       { fontSize: 13, fontWeight: '700', color: C.muted },
  modeBtnTActive: { color: C.white },
  routeRow:       { flexDirection: 'row', gap: 8, alignItems: 'center' },
  field:          { backgroundColor: C.bgElevated, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: C.border, gap: 3 },
  fieldFlex:      { flex: 1 },
  fieldLabel:     { fontSize: 9, fontWeight: '800', color: C.muted, letterSpacing: 1.2, textTransform: 'uppercase' },
  fieldValue:     { fontSize: 15, fontWeight: '700', color: C.text },
  fieldCode:      { fontSize: 11, color: C.electric, fontWeight: '700' },
  fieldInput:     { fontSize: 15, fontWeight: '700', color: C.text, padding: 0 },
  fieldDivider:   { width: 1, height: 40, backgroundColor: C.borderL },
  swapBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.borderE },
  pasRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  pasBtn:         { width: 26, height: 26, borderRadius: 13, backgroundColor: C.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  pasBtnT:        { color: C.electric, fontSize: 16, fontWeight: '700', marginTop: -1 },
  pasN:           { fontSize: 16, fontWeight: '800', color: C.text, minWidth: 20, textAlign: 'center' },
  clasePill:      { flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: 99, padding: 2, gap: 2, borderWidth: 1, borderColor: C.border },
  claseOpt:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  claseOptActive: { backgroundColor: C.electric },
  claseOptT:      { fontSize: 10, fontWeight: '700', color: C.muted },
  claseOptTActive:{ color: C.white },
  searchBtn:      { backgroundColor: C.electric, paddingVertical: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: C.electric, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 6 },
  searchBtnIcon:  { fontSize: 18 },
  searchBtnT:     { color: C.white, fontWeight: '900', fontSize: 16, letterSpacing: 0.3 },
});

const pk = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: C.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', paddingBottom: 30 },
  handle:       { width: 40, height: 4, backgroundColor: C.muted, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  titleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  title:        { fontSize: 16, fontWeight: '800', color: C.text },
  closeBtn:     { width: 30, height: 30, borderRadius: 15, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center' },
  closeT:       { color: C.muted, fontSize: 14 },
  loadingWrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
  loadingT:     { fontSize: 12, color: C.muted },
  search:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgElevated, marginHorizontal: 16, borderRadius: 14, paddingHorizontal: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  searchIcon:   { fontSize: 16, marginRight: 8 },
  searchInput:  { flex: 1, paddingVertical: 12, fontSize: 15, color: C.text },
  groupHeader:  { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1.2, textTransform: 'uppercase', paddingHorizontal: 20, paddingVertical: 8, backgroundColor: C.bgElevated },
  item:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.borderL },
  itemLeft:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemCode:     { fontSize: 18, fontWeight: '900', color: C.electric, width: 44 },
  itemCity:     { fontSize: 15, fontWeight: '700', color: C.text },
  itemName:     { fontSize: 11, color: C.muted, marginTop: 1, maxWidth: 220 },
  itemArrow:    { fontSize: 20, color: C.muted },
  emptyWrap:    { alignItems: 'center', padding: 40 },
  emptyT:       { fontSize: 15, fontWeight: '700', color: C.textSub },
  emptySub:     { fontSize: 12, color: C.muted, marginTop: 6 },
});
