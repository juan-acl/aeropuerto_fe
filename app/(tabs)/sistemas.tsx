import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { C, MOD_COLORS } from '@/constants/theme';
import { ModuleHubCard } from '@/components/shared';
import { useSesion, PERMISOS_POR_ROL } from '@/context/session';

const GRUPOS = [{"grupo": "Sistemas y Monitoreo", "emoji": "📡", "items": [{"mod": 21, "title": "Operaciones en Tiempo Real", "desc": "Slots, retrasos y pistas", "route": "/modules/mod21-tiempo-real"}, {"mod": 22, "title": "Control de Combustible", "desc": "Tanques, pedidos e inventario", "route": "/modules/mod22-combustible"}, {"mod": 23, "title": "Gestión Ambiental", "desc": "Huella de carbono y residuos", "route": "/modules/mod23-ambiental"}, {"mod": 24, "title": "Seguridad Informática", "desc": "Usuarios, roles e incidentes IT", "route": "/modules/mod24-seguridad-info"}]}, {"grupo": "Marketing y Documental", "emoji": "📣", "items": [{"mod": 25, "title": "Marketing y Fidelización", "desc": "Campañas, segmentos y canjes", "route": "/modules/mod25-marketing"}, {"mod": 26, "title": "Gestión Documental", "desc": "Contratos, normativas y cumplimiento", "route": "/modules/mod26-documental"}]}, {"grupo": "Emergencias e Internacional", "emoji": "🚨", "items": [{"mod": 28, "title": "Gestión de Emergencias", "desc": "Planes, equipos y activaciones", "route": "/modules/mod28-emergencias"}, {"mod": 29, "title": "Interoperabilidad OACI", "desc": "Reportes y certificaciones internacionales", "route": "/modules/mod29-oaci"}]}];

export default function SistemasTab() {
  const router = useRouter();
  const { usuario } = useSesion();
  const [q, setQ] = useState('');

  const permisos = PERMISOS_POR_ROL[usuario?.rol ?? 'CLIENTE'].modulosOperativos;
  const grupos = GRUPOS
    .map(g => ({ ...g, items: g.items.filter((i: any) => permisos.includes(i.mod)) }))
    .filter(g => g.items.length > 0);
  const filtrados = q.trim()
    ? grupos.map((g: any) => ({ ...g, items: g.items.filter((i: any) => i.title.toLowerCase().includes(q.toLowerCase()) || i.desc.toLowerCase().includes(q.toLowerCase())) })).filter((g: any) => g.items.length > 0)
    : grupos;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View style={s.orb1} /><View style={s.orb2} />
        <Text style={s.headerBrand}>AEROPUERTO LA AURORA</Text>
        <Text style={s.headerTitle}>Sistemas y Monitoreo</Text>
      </View>
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Buscar sección..." placeholderTextColor={C.placeholder}
            value={q} onChangeText={setQ} clearButtonMode="while-editing" />
        </View>
      </View>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {filtrados.map((g: any) => (
          <View key={g.grupo}>
            <View style={s.grupoHeader}>
              <Text style={s.grupoEmoji}>{g.emoji}</Text>
              <Text style={s.grupoTitle}>{g.grupo}</Text>
              <View style={s.grupoBadge}><Text style={s.grupoBadgeT}>{g.items.length}</Text></View>
            </View>
            {g.items.map((item: any) => {
              const mc = MOD_COLORS[item.mod] ?? { color: C.electric, bg: C.infoBg, icon: '📋' };
              return (
                <ModuleHubCard key={item.route} title={item.title} desc={item.desc}
                  color={mc.color} bg={mc.bg} icon={mc.icon}
                  onPress={() => router.push(item.route as any)} />
              );
            })}
          </View>
        ))}
        {filtrados.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 50 }}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>{q ? '🔍' : '🔒'}</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.textSub }}>{q ? `Sin resultados` : 'Sin secciones asignadas'}</Text>
            {!q && <Text style={{ fontSize: 12, color: C.muted, marginTop: 6, textAlign: 'center' }}>Tu rol no tiene acceso a secciones en esta área.</Text>}
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { backgroundColor: C.navyL, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22, overflow: 'hidden' },
  orb1: { position: 'absolute', top: -30, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: C.electric, opacity: 0.07 },
  orb2: { position: 'absolute', bottom: -20, left: 20, width: 90, height: 90, borderRadius: 45, backgroundColor: C.cyan, opacity: 0.05 },
  headerBrand: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: C.border },
  searchIcon: { fontSize: 15, marginRight: 8, color: C.muted },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: C.text },
  body: { padding: 16, paddingBottom: 30 },
  grupoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 10 },
  grupoEmoji: { fontSize: 18 },
  grupoTitle: { fontSize: 13, fontWeight: '800', color: C.textSub, flex: 1, textTransform: 'uppercase', letterSpacing: 0.5 },
  grupoBadge: { backgroundColor: C.bgElevated, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: C.border },
  grupoBadgeT: { fontSize: 11, fontWeight: '700', color: C.muted },
});
