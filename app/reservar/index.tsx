import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';
import { useSesion } from '@/context/session';
import { useVuelos } from '@/hooks/useVuelos';
import { backendApi } from '@/services/backendApi';
import { fmt } from '@/utils/format';

const AEROP_OPTS = AEROPUERTOS.map(a => ({
  code: a.codigo_aeropuerto,
  city: a.ciudad,
  name: a.nombre,
}));

const DESTINOS_POPULARES = [
  { code: 'MIA', name: 'Miami', emoji: '🌊', precio: 385 },
  { code: 'BOG', name: 'Bogotá', emoji: '🏙️', precio: 220 },
  { code: 'MEX', name: 'CDMX', emoji: '🌮', precio: 180 },
  { code: 'LAX', name: 'Los Angeles', emoji: '🎬', precio: 520 },
  { code: 'MAD', name: 'Madrid', emoji: '🏖️', precio: 780 },
];

export default function BuscarVuelo() {
  const [AEROPUERTOS, set_AEROPUERTOS] = useState<any[]>([]);
  useEffect(() => {
      backendApi.aeropuertos.listar().then(d => set_AEROPUERTOS(d)).catch(() => {});
  }, []);

  const router = useRouter();
  const { usuario } = useSesion();
  const { vuelos, loading, buscar } = useVuelos();

  const [origen, setOrigen] = useState('GUA');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [clase, setClase] = useState<'ECONOMICA' | 'EJECUTIVA'>('ECONOMICA');
  const [buscado, setBuscado] = useState(false);
  const [showPicker, setShowPicker] = useState<'origen' | 'destino' | null>(null);

  if (!usuario) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backT}>‹</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Reservar Vuelo</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <View style={s.lockWrap}><Text style={{ fontSize: 44 }}>🔐</Text></View>
          <Text style={s.lockTitle}>Inicia sesión para reservar</Text>
          <Text style={s.lockSub}>Necesitas una cuenta para gestionar reservas y check-in.</Text>
          <TouchableOpacity style={s.lockBtn} onPress={() => router.push('/(tabs)/perfil' as any)}>
            <Text style={s.lockBtnT}>Ir a Mi Cuenta →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBuscar = async () => {
    if (!destino) { Alert.alert('Destino requerido', 'Selecciona un destino.'); return; }
    if (origen === destino) { Alert.alert('Error', 'Origen y destino no pueden ser iguales.'); return; }
    await buscar(origen, destino, fecha);
    setBuscado(true);
  };

  const getPrice = (dest: string) => {
    const pops = { MIA: 385, LAX: 520, BOG: 220, MEX: 180, MAD: 780 } as Record<string, number>;
    const base = pops[dest] ?? 285;
    return clase === 'EJECUTIVA' ? base * 2.3 : base;
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backT}>‹</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Buscar Vuelos</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search form */}
        <View style={s.formCard}>
          <View style={s.orb1} /><View style={s.orb2} />
          <Text style={s.formTitle}>¿A dónde vuela{'\n'}hoy?</Text>

          {/* Origen */}
          <TouchableOpacity style={s.fieldBtn} onPress={() => setShowPicker('origen')}>
            <View style={[s.fieldBtnIcon, { backgroundColor: C.electric + '20' }]}><Text style={{ fontSize: 18 }}>🛫</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldBtnLabel}>DESDE</Text>
              <Text style={s.fieldBtnVal}>{AEROP_OPTS.find(a => a.code === origen)?.city ?? origen}</Text>
            </View>
            <Text style={s.fieldBtnCode}>{origen}</Text>
          </TouchableOpacity>

          {/* Swap */}
          <TouchableOpacity style={s.swapBtn} onPress={() => { const t = origen; setOrigen(destino || 'GUA'); setDestino(t); }}>
            <Text style={{ fontSize: 16, color: C.electric }}>⇅</Text>
          </TouchableOpacity>

          {/* Destino */}
          <TouchableOpacity style={[s.fieldBtn, !destino && s.fieldBtnEmpty]} onPress={() => setShowPicker('destino')}>
            <View style={[s.fieldBtnIcon, { backgroundColor: destino ? C.cyan + '20' : C.bgElevated }]}><Text style={{ fontSize: 18 }}>🛬</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldBtnLabel}>HASTA</Text>
              <Text style={[s.fieldBtnVal, !destino && { color: C.placeholder }]}>
                {destino ? (AEROP_OPTS.find(a => a.code === destino)?.city ?? destino) : 'Seleccionar destino'}
              </Text>
            </View>
            {destino && <Text style={s.fieldBtnCode}>{destino}</Text>}
          </TouchableOpacity>

          {/* Fecha */}
          <View style={[s.fieldBtn, { marginBottom: 0 }]}>
            <View style={[s.fieldBtnIcon, { backgroundColor: C.amber + '20' }]}><Text style={{ fontSize: 18 }}>📅</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldBtnLabel}>FECHA DE SALIDA</Text>
              <TextInput style={[s.fieldBtnVal, { color: C.text }]} value={fecha} onChangeText={setFecha}
                placeholder="YYYY-MM-DD" placeholderTextColor={C.placeholder} />
            </View>
          </View>

          {/* Clase */}
          <View style={s.claseRow}>
            {([['ECONOMICA', '💺', 'Económica'], ['EJECUTIVA', '🎩', 'Ejecutiva']] as const).map(([k, icon, label]) => (
              <TouchableOpacity key={k} style={[s.claseBtn, clase === k && s.claseBtnActive]}
                onPress={() => setClase(k)} activeOpacity={0.8}>
                <Text style={{ fontSize: 18 }}>{icon}</Text>
                <Text style={[s.claseBtnT, clase === k && s.claseBtnTActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[s.searchBtn, loading && { opacity: 0.7 }]} onPress={handleBuscar} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={s.searchBtnT}>🔍  Buscar vuelos</Text>}
          </TouchableOpacity>
        </View>

        {/* Popular destinations */}
        {!buscado && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={s.sectionTitle}>Destinos populares</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {DESTINOS_POPULARES.map(d => (
                <TouchableOpacity key={d.code} style={s.destCard}
                  onPress={() => { setDestino(d.code); setBuscado(false); }} activeOpacity={0.8}>
                  <Text style={{ fontSize: 28 }}>{d.emoji}</Text>
                  <Text style={s.destCardCity}>{d.name}</Text>
                  <Text style={s.destCardCode}>{d.code}</Text>
                  <Text style={s.destCardPrice}>desde {fmt.moneda(d.precio)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Airport picker */}
        {showPicker && (
          <View style={s.pickerCard}>
            <Text style={s.pickerTitle}>{showPicker === 'origen' ? '🛫 Selecciona origen' : '🛬 Selecciona destino'}</Text>
            {AEROP_OPTS.map(a => (
              <TouchableOpacity key={a.code} style={s.pickerItem}
                onPress={() => { showPicker === 'origen' ? setOrigen(a.code) : setDestino(a.code); setShowPicker(null); }}>
                <Text style={s.pickerCode}>{a.code}</Text>
                <View>
                  <Text style={s.pickerCity}>{a.city}</Text>
                  <Text style={s.pickerName}>{a.name.split('Internacional')[1]?.trim() ?? a.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.pickerClose} onPress={() => setShowPicker(null)}>
              <Text style={s.pickerCloseT}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        {buscado && (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={s.sectionTitle}>{vuelos.length} vuelo{vuelos.length !== 1 ? 's' : ''} encontrado{vuelos.length !== 1 ? 's' : ''}</Text>
            {vuelos.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={{ fontSize: 44, marginBottom: 12 }}>😕</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: C.textSub }}>Sin vuelos disponibles</Text>
                <Text style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Intenta otra fecha o destino</Text>
              </View>
            ) : vuelos.map(v => {
              const precio = getPrice(v.aeropuerto_destino ?? '');
              const dep = v.hora_salida_programada?.split('T')[1]?.slice(0,5) ?? '--:--';
              const arr = v.hora_llegada_programada?.split('T')[1]?.slice(0,5) ?? '--:--';
              const avail = (v.plazas_vacias ?? 30) > 0;
              return (
                <TouchableOpacity key={v.id_vuelo} style={[s.vCard, !avail && { opacity: 0.5 }]}
                  onPress={() => avail && router.push({ pathname: '/reservar/asiento', params: { id: v.id_vuelo, clase, precio: String(Math.round(precio)) } })}
                  activeOpacity={avail ? 0.85 : 1}>
                  <View style={[s.vCardAccent, { backgroundColor: avail ? C.electric : C.gray }]} />
                  <View style={s.vCardInner}>
                    <View style={s.vCardTop}>
                      <View>
                        <Text style={s.vCardNum}>{v.numero_vuelo ?? `FL-${v.id_vuelo}`}</Text>
                        <Text style={s.vCardRoute}>{v.aeropuerto_origen} → {v.aeropuerto_destino}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={s.vCardPrice}>{fmt.moneda(Math.round(precio))}</Text>
                        <Text style={s.vCardPriceLabel}>{clase === 'ECONOMICA' ? 'Económica' : 'Ejecutiva'}</Text>
                      </View>
                    </View>
                    <View style={s.vCardHours}>
                      <Text style={s.vCardTime}>{dep}</Text>
                      <View style={s.vCardLine}>
                        <View style={s.vCardLineDot} />
                        <View style={[s.vCardLineBar, { backgroundColor: avail ? C.electric + '40' : C.border }]} />
                        <Text style={{ color: avail ? C.electric : C.muted, fontSize: 14 }}>✈</Text>
                        <View style={[s.vCardLineBar, { backgroundColor: avail ? C.electric + '40' : C.border }]} />
                        <View style={s.vCardLineDot} />
                      </View>
                      <Text style={[s.vCardTime, { textAlign: 'right' }]}>{arr}</Text>
                    </View>
                    <View style={s.vCardFooter}>
                      <Text style={{ fontSize: 11, color: C.muted }}>💺 {v.plazas_vacias ?? '—'} disponibles</Text>
                      {avail ? (
                        <View style={s.vCardCta}>
                          <Text style={s.vCardCtaT}>Seleccionar →</Text>
                        </View>
                      ) : (
                        <View style={[s.vCardCta, { backgroundColor: C.dangerBg, borderColor: C.danger + '40' }]}>
                          <Text style={[s.vCardCtaT, { color: C.danger }]}>Agotado</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navyL, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backT: { fontSize: 22, color: C.text, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.text },

  // Lock screen
  lockWrap: { width: 96, height: 96, borderRadius: 26, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.borderE, marginBottom: 20, shadowColor: C.electric, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  lockTitle: { fontSize: 20, fontWeight: '900', color: C.text, textAlign: 'center' },
  lockSub: { fontSize: 13, color: C.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  lockBtn: { backgroundColor: C.electric, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, marginTop: 24, shadowColor: C.electric, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  lockBtnT: { color: C.white, fontWeight: '800', fontSize: 15 },

  // Form
  formCard: { backgroundColor: C.bgCard, margin: 16, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: C.borderE, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  orb1: { position: 'absolute', top: -30, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: C.electric, opacity: 0.07 },
  orb2: { position: 'absolute', bottom: -20, left: -10, width: 100, height: 100, borderRadius: 50, backgroundColor: C.cyan, opacity: 0.05 },
  formTitle: { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -1, lineHeight: 32, marginBottom: 20 },
  fieldBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bgElevated, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  fieldBtnEmpty: { borderStyle: 'dashed', borderColor: C.borderE },
  fieldBtnIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  fieldBtnLabel: { fontSize: 9, fontWeight: '800', color: C.muted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 },
  fieldBtnVal: { fontSize: 15, fontWeight: '700', color: C.text },
  fieldBtnCode: { fontSize: 20, fontWeight: '900', color: C.electric, letterSpacing: -0.5 },
  swapBtn: { alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.borderE, marginBottom: 10 },
  claseRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 18 },
  claseBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bgElevated },
  claseBtnActive: { backgroundColor: C.electric + '20', borderColor: C.electric },
  claseBtnT: { fontSize: 13, fontWeight: '700', color: C.muted },
  claseBtnTActive: { color: C.electric, fontWeight: '800' },
  searchBtn: { backgroundColor: C.electric, paddingVertical: 16, borderRadius: 14, alignItems: 'center', shadowColor: C.electric, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  searchBtnT: { color: C.white, fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },

  // Popular
  sectionTitle: { fontSize: 14, fontWeight: '800', color: C.textSub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 20 },
  destCard: { width: 110, backgroundColor: C.bgCard, borderRadius: 16, padding: 14, alignItems: 'center', gap: 5, borderWidth: 1, borderColor: C.border },
  destCardCity: { fontSize: 13, fontWeight: '800', color: C.text },
  destCardCode: { fontSize: 11, color: C.electric, fontWeight: '700' },
  destCardPrice: { fontSize: 10, color: C.muted },

  // Picker
  pickerCard: { backgroundColor: C.bgCard, marginHorizontal: 16, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 },
  pickerTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 14 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.borderL },
  pickerCode: { fontSize: 18, fontWeight: '900', color: C.electric, width: 44 },
  pickerCity: { fontSize: 14, fontWeight: '700', color: C.text },
  pickerName: { fontSize: 11, color: C.muted, marginTop: 1 },
  pickerClose: { marginTop: 12, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: C.bgElevated },
  pickerCloseT: { fontSize: 14, fontWeight: '700', color: C.muted },

  // Results
  emptyBox: { alignItems: 'center', paddingVertical: 40, backgroundColor: C.bgCard, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  vCard: { backgroundColor: C.bgCard, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  vCardAccent: { height: 3 },
  vCardInner: { padding: 16 },
  vCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  vCardNum: { fontSize: 20, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  vCardRoute: { fontSize: 11, color: C.muted, marginTop: 2 },
  vCardPrice: { fontSize: 22, fontWeight: '900', color: C.electric },
  vCardPriceLabel: { fontSize: 10, color: C.muted, marginTop: 2 },
  vCardHours: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  vCardTime: { fontSize: 20, fontWeight: '900', color: C.text, width: 55 },
  vCardLine: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  vCardLineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.electric },
  vCardLineBar: { flex: 1, height: 1.5 },
  vCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.borderL, paddingTop: 10 },
  vCardCta: { backgroundColor: C.infoBg, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: C.borderE },
  vCardCtaT: { fontSize: 12, fontWeight: '800', color: C.electric },
});


