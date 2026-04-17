/**
 * FilterPanel — Skyscanner-style collapsible filter sheet
 * Works for both flights and hotels
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal,
  StyleSheet, Switch,
} from 'react-native';
import { C } from '@/constants/theme';
import type { FlightFilters } from '@/hooks/useFlights';
import type { HotelFilters  } from '@/hooks/useHotels';

// ── Slider (pure RN — no external dep) ────────────────────────────────────────
function PriceSlider({ min, max, value, onChange }: {
  min: number; max: number; value: number; onChange: (v: number) => void;
}) {
  const steps   = [min, Math.round(min + (max-min)*0.25), Math.round(min + (max-min)*0.5),
                   Math.round(min + (max-min)*0.75), max];
  return (
    <View style={sl.wrap}>
      <View style={sl.steps}>
        {steps.map(s => (
          <TouchableOpacity key={s} style={[sl.step, value >= s && sl.stepActive]}
            onPress={() => onChange(s)}>
            <Text style={[sl.stepT, value >= s && sl.stepTActive]}>
              {s >= 1000 ? `${(s/1000).toFixed(0)}K` : s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={sl.track}>
        <View style={[sl.fill, { width: `${((value-min)/(max-min))*100}%` as any }]} />
      </View>
      <Text style={sl.val}>Hasta USD {value.toLocaleString()}</Text>
    </View>
  );
}
const sl = StyleSheet.create({
  wrap: { gap: 6 },
  steps: { flexDirection: 'row', justifyContent: 'space-between' },
  step: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border },
  stepActive: { backgroundColor: C.infoBg, borderColor: C.borderE },
  stepT: { fontSize: 10, fontWeight: '700', color: C.muted },
  stepTActive: { color: C.electric },
  track: { height: 4, backgroundColor: C.bgElevated, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: C.electric, borderRadius: 2 },
  val: { fontSize: 11, color: C.textSub, fontWeight: '600', textAlign: 'right' },
});

// ── Sort chips ────────────────────────────────────────────────────────────────
export function SortChips<T extends string>({ options, selected, onSelect }: {
  options: { key: T; label: string }[];
  selected: T;
  onSelect: (k: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}>
      {options.map(o => (
        <TouchableOpacity key={o.key}
          style={[sc.chip, selected === o.key && sc.chipActive]}
          onPress={() => onSelect(o.key)} activeOpacity={0.8}>
          <Text style={[sc.chipT, selected === o.key && sc.chipTActive]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.infoBg, borderColor: C.electric },
  chipT: { fontSize: 13, fontWeight: '600', color: C.muted },
  chipTActive: { color: C.electric, fontWeight: '700' },
});

// ── Filter panel (modal) ──────────────────────────────────────────────────────
type Mode = 'flights' | 'hotels';

interface FlightPanelProps {
  mode: 'flights';
  filters: FlightFilters;
  onApply: (f: FlightFilters) => void;
  priceRange: { min: number; max: number };
  airlines: string[];
}
interface HotelPanelProps {
  mode: 'hotels';
  filters: HotelFilters;
  onApply: (f: HotelFilters) => void;
  priceRange: { min: number; max: number };
}

type Props = (FlightPanelProps | HotelPanelProps) & { onReset: () => void };

function SectionTitle({ title }: { title: string }) {
  return <Text style={fp.sectionTitle}>{title}</Text>;
}

export function FilterPanel(props: Props) {
  const [visible, setVisible] = useState(false);
  const [localF, setLocalF]   = useState(props.filters);

  const applyAndClose = () => {
    if (props.mode === 'flights') (props as FlightPanelProps).onApply(localF as FlightFilters);
    else (props as HotelPanelProps).onApply(localF as HotelFilters);
    setVisible(false);
  };

  const resetAndClose = () => { props.onReset(); setVisible(false); };

  return (
    <>
      <TouchableOpacity style={fp.trigger} onPress={() => { setLocalF(props.filters); setVisible(true); }}>
        <Text style={{ fontSize: 16 }}></Text>
        <Text style={fp.triggerT}>Filtros</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={fp.overlay}>
          <View style={fp.sheet}>
            <View style={fp.handle} />
            <View style={fp.header}>
              <Text style={fp.title}>Filtros</Text>
              <TouchableOpacity onPress={resetAndClose}>
                <Text style={fp.reset}>Limpiar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={fp.body} showsVerticalScrollIndicator={false}>
              {/* PRICE */}
              <SectionTitle title="Precio máximo" />
              <PriceSlider
                min={props.priceRange.min} max={props.priceRange.max}
                value={(localF as any).precioMax || props.priceRange.max}
                onChange={v => setLocalF((f: any) => ({ ...f, precioMax: v }))}
              />

              {props.mode === 'flights' && (() => {
                const f = localF as FlightFilters;
                const setF = (u: Partial<FlightFilters>) => setLocalF((cur: any) => ({ ...cur, ...u }));
                return (
                  <>
                    <SectionTitle title="Escalas" />
                    <View style={fp.toggleRow}>
                      <Text style={fp.toggleLabel}>Solo vuelos directos</Text>
                      <Switch value={f.soloDirectos} onValueChange={v => setF({ soloDirectos: v })}
                        trackColor={{ false: C.bgElevated, true: C.electric }}
                        thumbColor={C.white} />
                    </View>

                    <SectionTitle title="Duración máxima" />
                    <PriceSlider min={60} max={720} value={f.duracionMax}
                      onChange={v => setF({ duracionMax: v })} />

                    {(props as FlightPanelProps).airlines.length > 0 && (
                      <>
                        <SectionTitle title="Aerolínea" />
                        <View style={fp.checkGrid}>
                          {(props as FlightPanelProps).airlines.map(al => (
                            <TouchableOpacity key={al}
                              style={[fp.checkItem, f.aerolíneas.includes(al) && fp.checkItemActive]}
                              onPress={() => setF({
                                aerolíneas: f.aerolíneas.includes(al)
                                  ? f.aerolíneas.filter(x => x !== al)
                                  : [...f.aerolíneas, al]
                              })}>
                              <Text style={[fp.checkT, f.aerolíneas.includes(al) && fp.checkTActive]}>{al}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    )}
                  </>
                );
              })()}

              {props.mode === 'hotels' && (() => {
                const f = localF as HotelFilters;
                const setF = (u: Partial<HotelFilters>) => setLocalF((cur: any) => ({ ...cur, ...u }));
                return (
                  <>
                    <SectionTitle title="Estrellas mínimas" />
                    <View style={fp.starsRow}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <TouchableOpacity key={n}
                          style={[fp.starBtn, f.estrellasMin >= n && fp.starBtnActive]}
                          onPress={() => setF({ estrellasMin: f.estrellasMin === n ? 1 : n })}>
                          <Text style={{ fontSize: 20 }}>★</Text>
                          <Text style={[fp.starLabel, f.estrellasMin >= n && fp.starLabelActive]}>{n}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <SectionTitle title="Puntuación mínima" />
                    <View style={fp.checkGrid}>
                      {[0, 7, 8, 9].map(r => (
                        <TouchableOpacity key={r}
                          style={[fp.checkItem, f.ratingMin === r && fp.checkItemActive]}
                          onPress={() => setF({ ratingMin: r })}>
                          <Text style={[fp.checkT, f.ratingMin === r && fp.checkTActive]}>
                            {r === 0 ? 'Todos' : `${r}+`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <SectionTitle title="Servicios" />
                    <View style={fp.toggleRow}>
                      <Text style={fp.toggleLabel}>Shuttle al aeropuerto</Text>
                      <Switch value={f.soloShuttle} onValueChange={v => setF({ soloShuttle: v })}
                        trackColor={{ false: C.bgElevated, true: C.electric }}
                        thumbColor={C.white} />
                    </View>
                  </>
                );
              })()}
            </ScrollView>

            <View style={fp.footer}>
              <TouchableOpacity style={fp.applyBtn} onPress={applyAndClose} activeOpacity={0.88}>
                <Text style={fp.applyBtnT}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const fp = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: C.bgCard, borderRadius: 99, borderWidth: 1, borderColor: C.border },
  triggerT: { fontSize: 13, fontWeight: '700', color: C.textSub },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%' },
  handle: { width: 40, height: 4, backgroundColor: C.muted, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.borderL },
  title: { fontSize: 17, fontWeight: '800', color: C.text },
  reset: { fontSize: 14, color: C.electric, fontWeight: '700' },
  body: { padding: 20, gap: 6, paddingBottom: 30 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 14, marginBottom: 8 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.bgElevated, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  toggleLabel: { fontSize: 14, color: C.text },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  checkItem: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border },
  checkItemActive: { backgroundColor: C.infoBg, borderColor: C.electric },
  checkT: { fontSize: 13, fontWeight: '600', color: C.muted },
  checkTActive: { color: C.electric, fontWeight: '700' },
  starsRow: { flexDirection: 'row', gap: 8 },
  starBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border },
  starBtnActive: { backgroundColor: C.warningBg, borderColor: C.amber },
  starLabel: { fontSize: 11, color: C.muted, fontWeight: '600', marginTop: 2 },
  starLabelActive: { color: C.amber },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: C.borderL },
  applyBtn: { backgroundColor: C.electric, paddingVertical: 15, borderRadius: 16, alignItems: 'center', shadowColor: C.electric, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  applyBtnT: { color: C.white, fontWeight: '900', fontSize: 15 },
});
