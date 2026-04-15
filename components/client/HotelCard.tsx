/**
 * HotelCard — Premium hotel card con datos reales del backend Oracle
 * ✅ Rating visual, amenidades chips, badge precio, animación
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { C } from '@/constants/theme';
import type { HotelResult } from '@/hooks/useHotels';

const AMENIDAD_ICONS: Record<string, string> = {
  'Piscina': '🏊', 'Gym': '💪', 'Spa': '💆', 'Restaurant': '🍽️',
  'WiFi': '📶', 'Parking': '🅿️', 'Bar': '🍸', 'Concierge': '🛎️',
  'Desayuno': '🥐', 'Business Center': '💼', 'Pool': '🏊', 'Room Service': '🛏️',
};

function StarRating({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Text key={i} style={{ fontSize: 11, color: i < stars ? C.amber : C.bgElevated }}>
          ★
        </Text>
      ))}
    </View>
  );
}

function RatingChip({ rating }: { rating: number }) {
  const color = rating >= 9 ? C.success : rating >= 7.5 ? C.teal : rating >= 6 ? C.warning : C.danger;
  const label = rating >= 9 ? 'Excelente' : rating >= 7.5 ? 'Muy bueno' : rating >= 6 ? 'Bueno' : 'Regular';
  return (
    <View style={[rc.chip, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <Text style={[rc.score, { color }]}>{rating.toFixed(1)}</Text>
      <Text style={[rc.label, { color }]}>{label}</Text>
    </View>
  );
}
const rc = StyleSheet.create({
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  score: { fontSize: 14, fontWeight: '900' },
  label: { fontSize: 10, fontWeight: '600' },
});

interface Props {
  hotel:    HotelResult;
  onSelect: (h: HotelResult) => void;
  selected?: boolean;
}

export function HotelCard({ hotel: h, onSelect, selected = false }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.97, duration: 80,  useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.00, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [selected]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onSelect(h)}
        activeOpacity={0.9}
        style={[s.card, selected && s.cardSelected]}
      >
        {/* Image area */}
        <View style={s.imgArea}>
          <Text style={s.emoji}>{h.imagen_emoji}</Text>
          {h.badge && (
            <View style={s.imgBadge}>
              <Text style={s.imgBadgeT}>{h.badge}</Text>
            </View>
          )}
          {h.shuttle && (
            <View style={s.shuttleBadge}>
              <Text style={s.shuttleT}>🚌 Shuttle</Text>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={s.body}>
          {/* Name + stars */}
          <View style={s.nameRow}>
            <Text style={s.name} numberOfLines={2}>{h.nombre}</Text>
            <StarRating stars={h.estrellas} />
          </View>

          {/* Location */}
          <Text style={s.location}>📍 {h.ciudad} · {h.distancia_km.toFixed(1)} km del aeropuerto</Text>

          {/* Rating + reviews */}
          <View style={s.ratingRow}>
            <RatingChip rating={h.rating} />
            <Text style={s.reviews}>{h.reviews} reseñas</Text>
          </View>

          {/* Amenidades chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.amenRow}>
            {h.amenidades.map(a => (
              <View key={a} style={s.amenChip}>
                <Text style={s.amenIcon}>{AMENIDAD_ICONS[a] ?? '✓'}</Text>
                <Text style={s.amenT}>{a}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Price row */}
          <View style={s.priceRow}>
            <View>
              <Text style={s.priceLabel}>desde</Text>
              <View style={s.priceInner}>
                <Text style={s.currency}>USD</Text>
                <Text style={s.price}>{h.precio_noche}</Text>
                <Text style={s.night}>/noche</Text>
              </View>
            </View>
            <TouchableOpacity style={s.bookBtn} onPress={() => onSelect(h)} activeOpacity={0.88}>
              <Text style={s.bookBtnT}>Ver →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card:         { backgroundColor: C.bgCard, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  cardSelected: { borderColor: C.electric, borderWidth: 2 },
  imgArea:      { height: 140, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  emoji:        { fontSize: 56 },
  imgBadge:     { position: 'absolute', top: 10, left: 10, backgroundColor: C.amber, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  imgBadgeT:    { fontSize: 10, fontWeight: '800', color: C.navy },
  shuttleBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: C.tealBg, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.tealL },
  shuttleT:     { fontSize: 10, fontWeight: '700', color: C.teal },
  body:         { padding: 14, gap: 8 },
  nameRow:      { gap: 4 },
  name:         { fontSize: 16, fontWeight: '800', color: C.text, lineHeight: 21 },
  location:     { fontSize: 11, color: C.muted, fontWeight: '500' },
  ratingRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviews:      { fontSize: 11, color: C.muted },
  amenRow:      { marginHorizontal: -2 },
  amenChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.bgElevated, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, borderWidth: 1, borderColor: C.border },
  amenIcon:     { fontSize: 12 },
  amenT:        { fontSize: 10, color: C.textSub, fontWeight: '600' },
  priceRow:     { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: C.borderL },
  priceLabel:   { fontSize: 10, color: C.muted, marginBottom: 2 },
  priceInner:   { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  currency:     { fontSize: 12, color: C.electric, fontWeight: '700', marginBottom: 3 },
  price:        { fontSize: 26, fontWeight: '900', color: C.electric, lineHeight: 28 },
  night:        { fontSize: 12, color: C.muted, fontWeight: '500', marginBottom: 3 },
  bookBtn:      { backgroundColor: C.electric, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, shadowColor: C.electric, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  bookBtnT:     { color: C.white, fontWeight: '900', fontSize: 14 },
});
