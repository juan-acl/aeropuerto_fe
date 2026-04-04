/**
 * Paso 2: Seleccionar asiento
 */
import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';
import { useVueloDetalle } from '@/hooks/useVuelos';
import { fmt } from '@/utils/format';

type SeatStatus = 'available' | 'occupied' | 'selected' | 'exit';

function generarAsientos(clase: string) {
  const filas = clase === 'EJECUTIVA' ? 6 : 20;
  const inicio = clase === 'EJECUTIVA' ? 1 : 7;
  const letras = ['A','B','C','D','E','F'];
  const ocupados = new Set(['7C','7D','8A','9F','12B','12C','15D','18A','18F','19E','20B']);
  const salidas = new Set(['7A','7F','14A','14F']);
  const seats: Array<{ id: string; fila: number; letra: string; status: SeatStatus }> = [];
  for (let f = inicio; f < inicio + filas; f++) {
    for (const l of letras) {
      const id = `${f}${l}`;
      const status: SeatStatus = salidas.has(id) ? 'exit' : ocupados.has(id) ? 'occupied' : 'available';
      seats.push({ id, fila: f, letra: l, status });
    }
  }
  return seats;
}

export default function SeleccionarAsiento() {
  const router = useRouter();
  const { id, clase = 'ECONOMICA', precio = '285' } = useLocalSearchParams<{ id: string; clase: string; precio: string }>();
  const { vuelo } = useVueloDetalle(Number(id));
  const [selected, setSelected] = useState<string | null>(null);

  const asientos = useMemo(() => generarAsientos(clase), [clase]);
  const filas = useMemo(() => {
    const map: Record<number, typeof asientos> = {};
    asientos.forEach(s => { if (!map[s.fila]) map[s.fila] = []; map[s.fila].push(s); });
    return Object.entries(map).map(([f, s]) => ({ fila: Number(f), asientos: s }));
  }, [asientos]);

  const COLORES: Record<SeatStatus, { bg: string; border: string; text: string }> = {
    available: { bg: C.successBg, border: C.success, text: C.success },
    occupied:  { bg: C.grayBg,    border: C.grayL,   text: C.muted  },
    selected:  { bg: C.navy,      border: C.navy,     text: C.white  },
    exit:      { bg: C.warningBg, border: C.warning,  text: C.warning},
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backT}>‹</Text></TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Seleccionar Asiento</Text>
          <Text style={s.headerSub}>{vuelo?.numero_vuelo ?? 'Vuelo'} · {clase === 'EJECUTIVA' ? 'Ejecutiva' : 'Económica'}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avion nose */}
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
          <Text style={{ fontSize: 36 }}>✈️</Text>
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Selecciona tu asiento</Text>
        </View>

        {/* Legend */}
        <View style={s.legend}>
          {[['available','Disponible'],['occupied','Ocupado'],['selected','Tu asiento'],['exit','Salida']] .map(([status,label]) => (
            <View key={status} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: COLORES[status as SeatStatus].bg, borderColor: COLORES[status as SeatStatus].border }]} />
              <Text style={s.legendT}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Seat map */}
        <View style={s.seatMap}>
          <View style={s.letraRow}>
            {['A','B','C','','D','E','F'].map((l,i) => (
              <Text key={i} style={[s.letraT, l === '' && { width: 16 }]}>{l}</Text>
            ))}
          </View>
          {filas.map(({ fila, asientos: row }) => (
            <View key={fila} style={s.filaRow}>
              <Text style={s.filaNum}>{fila}</Text>
              {row.map((seat, idx) => {
                const isSelected = selected === seat.id;
                const status: SeatStatus = isSelected ? 'selected' : seat.status;
                const cfg = COLORES[status];
                const isOccupied = seat.status === 'occupied';
                return (
                  <React.Fragment key={seat.id}>
                    {idx === 3 && <View style={{ width: 16 }} />}
                    <TouchableOpacity
                      style={[s.seat, { backgroundColor: cfg.bg, borderColor: cfg.border }]}
                      onPress={() => !isOccupied && setSelected(isSelected ? null : seat.id)}
                      activeOpacity={isOccupied ? 1 : 0.75}
                      disabled={isOccupied}
                    >
                      <Text style={[s.seatT, { color: cfg.text }]}>{seat.letra}</Text>
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.footer}>
        {selected ? (
          <>
            <View>
              <Text style={s.footerAsiento}>Asiento {selected}</Text>
              <Text style={s.footerPrecio}>{fmt.moneda(Number(precio))} · {clase === 'EJECUTIVA' ? 'Ejecutiva' : 'Económica'}</Text>
            </View>
            <TouchableOpacity style={s.continueBtn}
              onPress={() => router.push({ pathname: '/reservar/pasajero', params: { id, clase, precio, asiento: selected } })}>
              <Text style={s.continueBtnT}>Continuar →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={s.footerHint}>Toca un asiento disponible para seleccionarlo</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navy, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backT: { fontSize: 22, color: C.white, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.white, textAlign: 'center' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 2 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingHorizontal: 16, marginBottom: 16, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 14, height: 14, borderRadius: 4, borderWidth: 1.5 },
  legendT: { fontSize: 11, color: C.muted },
  seatMap: { paddingHorizontal: 16 },
  letraRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginBottom: 6, marginLeft: 28 },
  letraT: { width: 34, textAlign: 'center', fontSize: 11, fontWeight: '800', color: C.muted },
  filaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 5 },
  filaNum: { width: 24, textAlign: 'right', fontSize: 11, color: C.muted, marginRight: 4 },
  seat: { width: 34, height: 34, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  seatT: { fontSize: 11, fontWeight: '700' },
  footer: { backgroundColor:C.bgCard, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: C.borderL, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 8, shadowColor: 'rgba(10,22,40,0.12)', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 1, shadowRadius: 8 },
  footerHint: { fontSize: 13, color: C.muted, flex: 1, textAlign: 'center' },
  footerAsiento: { fontSize: 18, fontWeight: '900', color: C.navy },
  footerPrecio: { fontSize: 12, color: C.muted, marginTop: 2 },
  continueBtn: { backgroundColor: C.navy, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 12, elevation: 2, shadowColor: C.navy, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 5 },
  continueBtnT: { color: C.white, fontWeight: '800', fontSize: 15 },
});
