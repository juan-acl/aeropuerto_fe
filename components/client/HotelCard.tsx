/**
 * HotelCard — Premium hotel card con datos reales del backend Oracle
 *  Rating visual, amenidades chips, badge precio, animación
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/constants/theme';
import type { HotelResult } from '@/hooks/useHotels';

const AMENIDAD_ICONS: Record<string, string> = {
  'Piscina': 'water-outline', 'Gym': 'barbell-outline', 'Spa': 'leaf-outline', 'Restaurant': 'restaurant-outline',
  'WiFi': 'wifi-outline', 'Parking': 'car-outline', 'Bar': 'wine-outline', 'Concierge': 'information-circle-outline',
  'Desayuno': 'cafe-outline', 'Business Center': 'briefcase-outline', 'Pool': 'water-outline', 'Room Service': 'bed-outline',
};

function StarRating({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Ionicons key={i} name={i < stars ? 'star' : 'star-outline'} size={12} color={i < stars ? C.amber : C.muted} />
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
          <Ionicons name="business" size={48} color={C.navyG} />
          {h.badge && (
            <View style={s.imgBadge}>
              <Text style={s.imgBadgeT}>{h.badge}</Text>
            </View>
          )}
          {h.shuttle && (
            <View style={s.shuttleBadge}>
              <Ionicons name="bus" size={10} color={C.teal} style={{ marginRight: 4 }} />
              <Text style={s.shuttleT}>Shuttle</Text>
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
          <View style={s.locationRow}>
            <Ionicons name="location-outline" size={14} color={C.muted} />
            <Text style={s.location}>{h.ciudad} · {h.distancia_km.toFixed(1)} km del aeropuerto</Text>
          </View>

          {/* Rating + reviews */}
          <View style={s.ratingRow}>
            <RatingChip rating={h.rating} />
            <Text style={s.reviews}>{h.reviews} reseñas</Text>
          </View>

          {/* Amenidades chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.amenRow}>
            {h.amenidades.map(a => (
              <View key={a} style={s.amenChip}>
                <Ionicons name={(AMENIDAD_ICONS[a] ?? 'checkmark-outline') as any} size={12} color={C.textSub} />
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
  card:         { backgroundColor: C.bgCard, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  cardSelected: { borderColor: C.electric, borderWidth: 2 },
  imgArea:      { height: 100, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  imgBadge:     { position: 'absolute', top: 10, left: 10, backgroundColor: C.amber, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  imgBadgeT:    { fontSize: 10, fontWeight: '800', color: C.navy },
  shuttleBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: C.tealBg, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.tealL, flexDirection: 'row', alignItems: 'center' },
  shuttleT:     { fontSize: 10, fontWeight: '700', color: C.teal },
  body:         { padding: 10, gap: 6 },
  nameRow:      { gap: 2 },
  name:         { fontSize: 14, fontWeight: '800', color: C.text, lineHeight: 18 },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location:     { fontSize: 12, color: C.muted, fontWeight: '500' },
  ratingRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviews:      { fontSize: 11, color: C.muted },
  amenRow:      { marginHorizontal: -2 },
  amenChip:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bgElevated, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, borderWidth: 1, borderColor: C.border },
  amenT:        { fontSize: 10, color: C.textSub, fontWeight: '600' },
  priceRow:     { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: C.borderL },
  priceLabel:   { fontSize: 10, color: C.muted, marginBottom: 2 },
  priceInner:   { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  currency:     { fontSize: 12, color: C.electric, fontWeight: '700', marginBottom: 3 },
  price:        { fontSize: 20, fontWeight: '900', color: C.electric, lineHeight: 22 },
  night:        { fontSize: 10, color: C.muted, fontWeight: '500', marginBottom: 3 },
  bookBtn:      { backgroundColor: C.electric, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, shadowColor: C.electric, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  bookBtnT:     { color: C.white, fontWeight: '900', fontSize: 14 },
});
