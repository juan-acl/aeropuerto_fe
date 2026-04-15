/**
 * RecommendationCarousel — ML-powered horizontal carousels
 * Variants: destinations, flights, hotels, promos
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';
import type { DestinoPop, VueloRec, HotelRec, PromoRec } from '@/hooks/useRecommendations';

// ─── Destination card ─────────────────────────────────────────────────────────
function DestCard({ d, onPress }: { d: DestinoPop; onPress: () => void }) {
  return (
    <TouchableOpacity style={dc.card} onPress={onPress} activeOpacity={0.85}>
      <View style={dc.imgWrap}>
        <Text style={dc.emoji}>{d.emoji}</Text>
        {d.badge && <View style={dc.badge}><Text style={dc.badgeT}>{d.badge}</Text></View>}
      </View>
      <Text style={dc.city}>{d.city}</Text>
      <Text style={dc.tagline}>{d.tagline}</Text>
      <Text style={dc.price}>desde USD {d.precio}</Text>
    </TouchableOpacity>
  );
}
const dc = StyleSheet.create({
  card: { width: 130, backgroundColor: C.bgCard, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  imgWrap: { height: 90, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  emoji: { fontSize: 36 },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: C.electric, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  badgeT: { fontSize: 8, fontWeight: '800', color: C.white },
  city: { fontSize: 13, fontWeight: '800', color: C.text, paddingHorizontal: 10, paddingTop: 8 },
  tagline: { fontSize: 10, color: C.muted, paddingHorizontal: 10, marginTop: 1 },
  price: { fontSize: 11, fontWeight: '700', color: C.electric, paddingHorizontal: 10, paddingBottom: 10, marginTop: 4 },
});

// ─── Flight rec card ──────────────────────────────────────────────────────────
function FlightRecCard({ v, onPress }: { v: VueloRec; onPress: () => void }) {
  const urgencyColor = v.urgency === 'high' ? C.danger : v.urgency === 'medium' ? C.warning : C.electric;
  return (
    <TouchableOpacity style={frc.card} onPress={onPress} activeOpacity={0.85}>
      {v.badge && (
        <View style={[frc.badge, { backgroundColor: urgencyColor + '20', borderColor: urgencyColor + '40' }]}>
          <Text style={[frc.badgeT, { color: urgencyColor }]}>{v.badge}</Text>
        </View>
      )}
      <Text style={frc.destino}>{v.destino}</Text>
      <Text style={frc.numero}>{v.numero} · {v.salida}</Text>
      <Text style={frc.razon} numberOfLines={1}>{v.razon}</Text>
      <Text style={frc.price}>USD {v.precio}</Text>
    </TouchableOpacity>
  );
}
const frc = StyleSheet.create({
  card: { width: 150, backgroundColor: C.bgCard, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: C.border, gap: 4 },
  badge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, alignSelf: 'flex-start', marginBottom: 4 },
  badgeT: { fontSize: 9, fontWeight: '800' },
  destino: { fontSize: 18, fontWeight: '900', color: C.text },
  numero: { fontSize: 11, color: C.muted, fontWeight: '500' },
  razon: { fontSize: 10, color: C.muted, fontStyle: 'italic' },
  price: { fontSize: 15, fontWeight: '800', color: C.electric, marginTop: 4 },
});

// ─── Hotel rec card ───────────────────────────────────────────────────────────
function HotelRecCard({ h, onPress }: { h: HotelRec; onPress: () => void }) {
  return (
    <TouchableOpacity style={hrc.card} onPress={onPress} activeOpacity={0.85}>
      <View style={hrc.imgWrap}>
        <Text style={{ fontSize: 32 }}>🏨</Text>
        {h.badge && <View style={hrc.badge}><Text style={hrc.badgeT}>{h.badge}</Text></View>}
      </View>
      <View style={hrc.body}>
        <Text style={hrc.name} numberOfLines={2}>{h.nombre}</Text>
        <Text style={hrc.stars}>{'★'.repeat(h.estrellas)}</Text>
        <Text style={hrc.dist}>📍 {h.distancia} km</Text>
        {h.shuttle && <Text style={hrc.shuttle}>🚌 Shuttle gratis</Text>}
        <Text style={hrc.price}>USD {h.precio}/noche</Text>
      </View>
    </TouchableOpacity>
  );
}
const hrc = StyleSheet.create({
  card: { width: 150, backgroundColor: C.bgCard, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  imgWrap: { height: 80, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 6, left: 6, backgroundColor: C.amber, borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  badgeT: { fontSize: 8, fontWeight: '800', color: C.navy },
  body: { padding: 10, gap: 2 },
  name: { fontSize: 12, fontWeight: '800', color: C.text, lineHeight: 16 },
  stars: { fontSize: 10, color: C.amber, marginTop: 2 },
  dist: { fontSize: 10, color: C.muted },
  shuttle: { fontSize: 10, color: C.teal, fontWeight: '600' },
  price: { fontSize: 13, fontWeight: '800', color: C.electric, marginTop: 4 },
});

// ─── Promo card ───────────────────────────────────────────────────────────────
function PromoCard({ p, onPress }: { p: PromoRec; onPress: () => void }) {
  return (
    <TouchableOpacity style={[prc.card, { borderColor: p.color + '40' }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[prc.header, { backgroundColor: p.color + '15' }]}>
        <Text style={{ fontSize: 28 }}>{p.emoji}</Text>
        <View style={[prc.discountBadge, { backgroundColor: p.color }]}>
          <Text style={prc.discountT}>-{p.descuento}%</Text>
        </View>
      </View>
      <View style={prc.body}>
        <Text style={prc.titulo} numberOfLines={2}>{p.titulo}</Text>
        <View style={prc.row}>
          <Text style={prc.dest}>{p.destino}</Text>
          <Text style={prc.vence}>vence {p.vence}</Text>
        </View>
        <Text style={[prc.price, { color: p.color }]}>USD {p.precio}</Text>
      </View>
    </TouchableOpacity>
  );
}
const prc = StyleSheet.create({
  card: { width: 160, backgroundColor: C.bgCard, borderRadius: 18, overflow: 'hidden', borderWidth: 1 },
  header: { height: 80, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  discountBadge: { position: 'absolute', top: 8, right: 8, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  discountT: { fontSize: 10, fontWeight: '900', color: C.white },
  body: { padding: 12, gap: 4 },
  titulo: { fontSize: 13, fontWeight: '800', color: C.text, lineHeight: 17 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dest: { fontSize: 11, fontWeight: '700', color: C.textSub },
  vence: { fontSize: 9, color: C.muted },
  price: { fontSize: 16, fontWeight: '900', marginTop: 4 },
});

// ─── Section wrapper ──────────────────────────────────────────────────────────
function SectionWrap({ title, action, onAction, children }: {
  title: string; action?: string; onAction?: () => void; children: React.ReactNode;
}) {
  return (
    <View style={sw.container}>
      <View style={sw.header}>
        <Text style={sw.title}>{title}</Text>
        {action && onAction && (
          <TouchableOpacity onPress={onAction}>
            <Text style={sw.action}>{action} →</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}
const sw = StyleSheet.create({
  container: { marginBottom: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '800', color: C.text },
  action: { fontSize: 13, color: C.electric, fontWeight: '700' },
});

// ─── Main Carousel export ─────────────────────────────────────────────────────
interface Props {
  destinosPopulares?: DestinoPop[];
  vuelosRec?:          VueloRec[];
  hotelesRec?:         HotelRec[];
  promos?:             PromoRec[];
  loading?:            boolean;
  mensajePersonalizado?:string;
  onSelectDestino?:    (code: string) => void;
  onSelectVuelo?:      (id: number) => void;
  onSelectHotel?:      (id: number) => void;
  onSelectPromo?:      (id: string) => void;
  showAll?:            boolean;
}

export function RecommendationCarousel({
  destinosPopulares = [], vuelosRec = [], hotelesRec = [], promos = [],
  loading = false, mensajePersonalizado,
  onSelectDestino, onSelectVuelo, onSelectHotel, onSelectPromo,
  showAll = true,
}: Props) {
  const router = useRouter();

  if (loading) return (
    <View style={{ padding: 30, alignItems: 'center', gap: 10 }}>
      <ActivityIndicator color={C.electric} size="large" />
      <Text style={{ color: C.muted, fontSize: 13 }}>Calculando recomendaciones...</Text>
    </View>
  );

  return (
    <View style={{ gap: 24 }}>
      {/* AI message */}
      {mensajePersonalizado && (
        <View style={main.aiMsg}>
          <Text style={{ fontSize: 16 }}>🤖</Text>
          <Text style={main.aiMsgT}>{mensajePersonalizado}</Text>
        </View>
      )}

      {/* Destinos populares */}
      {destinosPopulares.length > 0 && (
        <SectionWrap title="Destinos populares" action="Ver todos"
          onAction={() => router.push('/reservar' as any)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {destinosPopulares.map(d => (
              <DestCard key={d.code} d={d} onPress={() => onSelectDestino?.(d.code)} />
            ))}
          </ScrollView>
        </SectionWrap>
      )}

      {/* Vuelos recomendados */}
      {vuelosRec.length > 0 && (
        <SectionWrap title="✈️ Vuelos para ti" action="Ver todos"
          onAction={() => router.push('/reservar' as any)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {vuelosRec.map(v => (
              <FlightRecCard key={v.id_vuelo} v={v}
                onPress={() => onSelectVuelo?.(v.id_vuelo)} />
            ))}
          </ScrollView>
        </SectionWrap>
      )}

      {/* Hoteles */}
      {hotelesRec.length > 0 && (
        <SectionWrap title="🏨 Hoteles destacados" action="Ver todos"
          onAction={() => {}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {hotelesRec.map(h => (
              <HotelRecCard key={h.id_hotel} h={h}
                onPress={() => onSelectHotel?.(h.id_hotel)} />
            ))}
          </ScrollView>
        </SectionWrap>
      )}

      {/* Promos */}
      {promos.length > 0 && (
        <SectionWrap title="🎁 Ofertas exclusivas">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {promos.map(p => (
              <PromoCard key={p.id} p={p}
                onPress={() => onSelectPromo?.(p.id)} />
            ))}
          </ScrollView>
        </SectionWrap>
      )}
    </View>
  );
}

const main = StyleSheet.create({
  aiMsg: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.infoBg, borderRadius: 16, padding: 14, marginHorizontal: 20, borderWidth: 1, borderColor: C.borderE },
  aiMsgT: { flex: 1, fontSize: 13, color: C.electric, fontWeight: '600', lineHeight: 19 },
});
