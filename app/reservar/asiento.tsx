/**
 * Paso 2: Mapa de asientos — Diseño visual de cabina real
 * Layout: Económica 30 filas × 6 cols (A-F), Ejecutiva 6 filas × 4 cols (A-D)
 * Features: aisle divider, exit rows highlight, legend, occupied random seed
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';
import { useVueloDetalle } from '@/hooks/useVuelos';

const SCREEN_W = Dimensions.get('window').width;

type SeatStatus = 'available' | 'occupied' | 'selected' | 'exit' | 'unavailable';
type Clase = 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE';

interface Seat {
  id:     string;
  fila:   number;
  letra:  string;
  letter?: string; // alias
  status: SeatStatus;
  extra?: boolean; // exit row legroom
}

const ECO_COLS   = ['A','B','C','D','E','F'];
const EJE_COLS   = ['A','B','C','D'];
const PRIM_COLS  = ['A','B'];

// Deterministic "occupied" seats seeded by vuelo id
function buildSeats(clase: Clase, vueloId: number): Seat[] {
  const isEje  = clase === 'EJECUTIVA';
  const isPrim = clase === 'PRIMERA_CLASE';
  const cols   = isPrim ? PRIM_COLS : isEje ? EJE_COLS : ECO_COLS;
  const rows   = isPrim ? 3 : isEje ? 6 : 30;
  const start  = isPrim ? 1 : isEje ? 1 : 7;

  // Exit rows for eco
  const exitRows = new Set([14, 15]);

  // Pseudo-random occupied based on vueloId seed
  const seed = vueloId % 97 + 11;
  const occupied = new Set<string>();
  for (let i = 0; i < rows * cols.length * 0.35; i++) {
    const r = start + ((seed * (i + 1) * 7) % rows);
    const c = cols[(seed * (i + 3)) % cols.length];
    occupied.add(`${r}${c}`);
  }

  const seats: Seat[] = [];
  for (let f = start; f < start + rows; f++) {
    for (const l of cols) {
      const id = `${f}${l}`;
      let status: SeatStatus = occupied.has(id) ? 'occupied' : 'available';
      if (exitRows.has(f) && !isEje && !isPrim) status = status === 'available' ? 'exit' : 'occupied';
      seats.push({ id, fila: f, letra: l, status, extra: exitRows.has(f) });
    }
  }
  return seats;
}

const STATUS_STYLE: Record<SeatStatus, { bg: string; border: string; text: string }> = {
  available:   { bg: C.successBg,  border: C.success,  text: C.success  },
  occupied:    { bg: C.grayBg,     border: C.border,    text: C.light    },
  selected:    { bg: C.electric,   border: C.electricL, text: C.white    },
  exit:        { bg: C.warningBg,  border: C.warning,   text: C.warning  },
  unavailable: { bg: C.bgElevated, border: C.border,    text: C.light    },
};

function SeatBtn({ seat, onPress }: { seat: Seat; onPress: () => void }) {
  const cfg    = STATUS_STYLE[seat.status];
  const seatW  = Math.min(40, (SCREEN_W - 80) / 7);
  const press  = seat.status === 'available' || seat.status === 'exit' || seat.status === 'selected';
  return (
    <TouchableOpacity
      style={[sb.btn, { width: seatW, height: seatW, backgroundColor: cfg.bg, borderColor: cfg.border }]}
      onPress={onPress} disabled={!press} activeOpacity={press ? 0.75 : 1}
    >
      <Text style={[sb.txt, { color: cfg.text, fontSize: seatW * 0.3 }]}>
        {seat.status === 'selected' ? '✓' : seat.letter ?? seat.letra}
      </Text>
    </TouchableOpacity>
  );
}

const sb = StyleSheet.create({
  btn: { borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', margin: 2 },
  txt: { fontWeight: '800' },
});

export default function SeleccionarAsiento() {
  const router   = useRouter();
  const { id, clase = 'ECONOMICA', precio = '285' } =
    useLocalSearchParams<{ id: string; clase: string; precio: string }>();
  const { vuelo } = useVueloDetalle(Number(id));
  const [selected, setSelected] = useState<string | null>(null);

  const clase_t = clase as Clase;
  const claseLabel = clase_t === 'PRIMERA_CLASE' ? 'Primera Clase'
                   : clase_t === 'EJECUTIVA' ? 'Ejecutiva' : 'Económica';

  const allSeats = useMemo(() => buildSeats(clase_t, Number(id) || 1), [clase_t, id]);
  const cols     = clase_t === 'PRIMERA_CLASE' ? PRIM_COLS
                 : clase_t === 'EJECUTIVA' ? EJE_COLS : ECO_COLS;

  // Group by row
  const rows = useMemo(() => {
    const map: Record<number, Seat[]> = {};
    allSeats.forEach(s => {
      if (!map[s.fila]) map[s.fila] = [];
      map[s.fila].push(s);
    });
    return Object.values(map);
  }, [allSeats]);

  const handleSelect = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    setSelected(prev => prev === seat.id ? null : seat.id);
  };

  const handleContinuar = () => {
    if (!selected) return;
    router.push({
      pathname: '/reservar/pasajero',
      params: { id, clase, precio, asiento: selected },
    } as any);
  };

  const isEco  = clase_t === 'ECONOMICA';
  const isEje  = clase_t === 'EJECUTIVA';
  const isPrim = clase_t === 'PRIMERA_CLASE';

  // Stats
  const available = allSeats.filter(s => s.status === 'available' || s.status === 'exit').length;
  const aisleIdx  = isPrim ? null : isEje ? 2 : 3; // index after which to add aisle gap

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backT}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerMid}>
          <Text style={s.headerTitle}>Elige tu asiento</Text>
          <Text style={s.headerSub}>
            {vuelo?.numero_vuelo ?? `Vuelo #${id}`} · {claseLabel}
          </Text>
        </View>
        <View style={[s.availBadge]}>
          <Text style={s.availN}>{available}</Text>
          <Text style={s.availL}>libres</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Aircraft nose */}
        <View style={s.nose}>
          <View style={s.noseShape}>
            <Text style={{ fontSize: 28 }}>✈️</Text>
          </View>
          <Text style={s.noseLabel}>FRENTE DE LA CABINA</Text>
        </View>

        {/* Column headers */}
        <View style={s.colHeaders}>
          <View style={s.rowNumPlaceholder} />
          {cols.map((c, i) => (
            <React.Fragment key={c}>
              {aisleIdx !== null && i === aisleIdx && <View style={s.aisleHeader} />}
              <Text style={s.colHeader}>{c}</Text>
            </React.Fragment>
          ))}
        </View>

        {/* Seat rows */}
        {rows.map(rowSeats => {
          const fila    = rowSeats[0].fila;
          const isExit  = rowSeats.some(s => s.extra);
          const seatW   = Math.min(40, (SCREEN_W - 80) / 7);
          return (
            <React.Fragment key={fila}>
              {isExit && (
                <View style={s.exitBanner}>
                  <Text style={s.exitBannerT}>🚪 Fila de emergencia — espacio extra</Text>
                </View>
              )}
              <View style={[s.row, isExit && s.rowExit]}>
                <Text style={[s.rowNum, { width: seatW }]}>{fila}</Text>
                {rowSeats.map((seat, i) => (
                  <React.Fragment key={seat.id}>
                    {aisleIdx !== null && i === aisleIdx && <View style={s.aisle} />}
                    <SeatBtn
                      seat={{ ...seat, status: seat.id === selected ? 'selected' : seat.status }}
                      onPress={() => handleSelect(seat)}
                    />
                  </React.Fragment>
                ))}
              </View>
            </React.Fragment>
          );
        })}

        {/* Tail */}
        <View style={s.tail}>
          <Text style={s.tailLabel}>PARTE TRASERA</Text>
          <View style={s.tailShape} />
        </View>

        {/* Legend */}
        <View style={s.legend}>
          {[
            { status: 'available', label: 'Disponible' },
            { status: 'selected',  label: 'Seleccionado' },
            { status: 'occupied',  label: 'Ocupado' },
            { status: 'exit',      label: 'Salida emerg.' },
          ].map(({ status, label }) => {
            const cfg = STATUS_STYLE[status as SeatStatus];
            return (
              <View key={status} style={s.legendItem}>
                <View style={[s.legendBox, { backgroundColor: cfg.bg, borderColor: cfg.border }]} />
                <Text style={s.legendLabel}>{label}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom booking bar */}
      <View style={s.bottomBar}>
        {selected ? (
          <>
            <View>
              <Text style={s.barSeatLabel}>Asiento seleccionado</Text>
              <Text style={s.barSeat}>{selected}</Text>
            </View>
            <View style={s.barRight}>
              <Text style={s.barPrice}>USD {precio}</Text>
              <TouchableOpacity style={s.barBtn} onPress={handleContinuar} activeOpacity={0.88}>
                <Text style={s.barBtnT}>Continuar →</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={s.barHint}>Toca un asiento disponible para seleccionarlo</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: C.bg },
  header:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.navyL, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  back:          { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backT:         { fontSize: 22, color: C.text, fontWeight: '300', marginTop: -2 },
  headerMid:     { flex: 1, paddingHorizontal: 12 },
  headerTitle:   { fontSize: 16, fontWeight: '800', color: C.text },
  headerSub:     { fontSize: 11, color: C.muted, marginTop: 2 },
  availBadge:    { alignItems: 'center', backgroundColor: C.successBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: C.successL },
  availN:        { fontSize: 18, fontWeight: '900', color: C.success },
  availL:        { fontSize: 9, color: C.success, fontWeight: '700', textTransform: 'uppercase' },
  scrollContent: { paddingTop: 8 },
  nose:          { alignItems: 'center', paddingVertical: 16 },
  noseShape:     { width: 80, height: 60, borderTopLeftRadius: 40, borderTopRightRadius: 40, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  noseLabel:     { fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 },
  colHeaders:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginBottom: 4 },
  rowNumPlaceholder: { width: Math.min(40, (Dimensions.get('window').width - 80) / 7), margin: 2 },
  colHeader:     { width: Math.min(40, (Dimensions.get('window').width - 80) / 7), textAlign: 'center', fontSize: 11, fontWeight: '800', color: C.muted, margin: 2 },
  aisleHeader:   { width: 16 },
  row:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginVertical: 1 },
  rowExit:       { backgroundColor: C.warningBg + '40' },
  rowNum:        { textAlign: 'center', fontSize: 10, color: C.light, fontWeight: '600', margin: 2 },
  aisle:         { width: 16 },
  exitBanner:    { backgroundColor: C.warningBg, paddingVertical: 4, paddingHorizontal: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.warningL, marginVertical: 2 },
  exitBannerT:   { fontSize: 10, color: C.warning, fontWeight: '700', textAlign: 'center' },
  tail:          { alignItems: 'center', paddingVertical: 16 },
  tailShape:     { width: 60, height: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border, marginTop: 6 },
  tailLabel:     { fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' },
  legend:        { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14, paddingVertical: 16, paddingHorizontal: 20 },
  legendItem:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox:     { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5 },
  legendLabel:   { fontSize: 11, color: C.textSub, fontWeight: '500' },
  bottomBar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navyL, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.4, shadowRadius: 10 },
  barHint:       { fontSize: 13, color: C.muted, flex: 1, textAlign: 'center' },
  barSeatLabel:  { fontSize: 11, color: C.muted, fontWeight: '600' },
  barSeat:       { fontSize: 26, fontWeight: '900', color: C.electric },
  barRight:      { alignItems: 'flex-end', gap: 6 },
  barPrice:      { fontSize: 18, fontWeight: '900', color: C.text },
  barBtn:        { backgroundColor: C.electric, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, shadowColor: C.electric, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8 },
  barBtnT:       { color: C.white, fontWeight: '900', fontSize: 14 },
});
