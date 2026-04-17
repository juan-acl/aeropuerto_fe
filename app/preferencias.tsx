/**
 * PreferenciasScreen — User preferences & profile editor
 * Sections: personal info, travel preferences, notifications, accessibility
 */
import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Switch, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';
import { useSesion } from '@/context/session';

type ClasePreferida = 'ECONOMICA' | 'EJECUTIVA' | 'PRIMERA_CLASE';
type AsientoPreferido = 'VENTANA' | 'PASILLO' | 'INDIFERENTE';
type ComidaPreferida  = 'ESTANDAR' | 'VEGETARIANA' | 'VEGANA' | 'KOSHER' | 'HALAL' | 'SIN_GLUTEN';

interface Preferencias {
  clase:         ClasePreferida;
  asiento:       AsientoPreferido;
  comida:        ComidaPreferida;
  equipaje_extra:boolean;
  prioridad_abordaje:boolean;
  notif_vuelo:   boolean;
  notif_ofertas: boolean;
  notif_checkin: boolean;
  notif_lealtad: boolean;
  accesibilidad: boolean;
  idioma:        'ES' | 'EN';
}

const DEFAULT_PREFS: Preferencias = {
  clase: 'ECONOMICA', asiento: 'VENTANA', comida: 'ESTANDAR',
  equipaje_extra: false, prioridad_abordaje: false,
  notif_vuelo: true, notif_ofertas: true, notif_checkin: true, notif_lealtad: true,
  accesibilidad: false, idioma: 'ES',
};

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <View style={sec.wrap}>
      <View style={sec.header}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
        <Text style={sec.title}>{title}</Text>
      </View>
      <View style={sec.body}>{children}</View>
    </View>
  );
}
const sec = StyleSheet.create({
  wrap:   { marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  title:  { fontSize: 14, fontWeight: '800', color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.8 },
  body:   { backgroundColor: C.bgCard, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
});

function OptionRow({ label, sub, value, onToggle }: {
  label: string; sub?: string; value: boolean; onToggle: (v: boolean) => void;
}) {
  return (
    <View style={or.row}>
      <View style={{ flex: 1 }}>
        <Text style={or.label}>{label}</Text>
        {sub && <Text style={or.sub}>{sub}</Text>}
      </View>
      <Switch value={value} onValueChange={onToggle}
        trackColor={{ false: C.bgElevated, true: C.electric }}
        thumbColor={C.white} />
    </View>
  );
}
const or = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.borderL },
  label: { fontSize: 14, fontWeight: '600', color: C.text },
  sub:   { fontSize: 11, color: C.muted, marginTop: 2 },
});

function ChipRow<T extends string>({ label, options, selected, onSelect }: {
  label: string;
  options: { key: T; label: string; icon?: string }[];
  selected: T;
  onSelect: (k: T) => void;
}) {
  return (
    <View style={cr.wrap}>
      <Text style={cr.label}>{label}</Text>
      <View style={cr.chips}>
        {options.map(o => (
          <TouchableOpacity key={o.key}
            style={[cr.chip, selected === o.key && cr.chipActive]}
            onPress={() => onSelect(o.key)} activeOpacity={0.8}>
            {o.icon && <Text style={{ fontSize: 14 }}>{o.icon}</Text>}
            <Text style={[cr.chipT, selected === o.key && cr.chipTActive]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const cr = StyleSheet.create({
  wrap:       { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.borderL },
  label:      { fontSize: 12, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  chips:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, backgroundColor: C.bgElevated, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.infoBg, borderColor: C.electric },
  chipT:      { fontSize: 13, fontWeight: '600', color: C.muted },
  chipTActive:{ color: C.electric, fontWeight: '700' },
});

export default function PreferenciasScreen() {
  const router        = useRouter();
  const { usuario }   = useSesion();
  const [prefs, setPrefs] = useState<Preferencias>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [email,  setEmail ] = useState(usuario?.email  ?? '');

  const set = <K extends keyof Preferencias>(key: K, val: Preferencias[K]) =>
    setPrefs(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    // In production: PATCH /api/usuarios/{id}/preferencias
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    Alert.alert(' Guardado', 'Tus preferencias han sido actualizadas.');
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backT}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mis preferencias</Text>
        <TouchableOpacity onPress={handleSave} style={[s.saveBtn, saved && s.saveBtnDone]}>
          <Text style={s.saveBtnT}>{saved ? '✓' : 'Guardar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* Personal info */}
        <Section title="Datos personales" emoji="">
          <View style={or.row}>
            <View style={{ flex: 1 }}>
              <Text style={or.label}>Nombre</Text>
              <TextInput style={s.inlineInput} value={nombre} onChangeText={setNombre}
                placeholderTextColor={C.placeholder} />
            </View>
          </View>
          <View style={or.row}>
            <View style={{ flex: 1 }}>
              <Text style={or.label}>Email</Text>
              <TextInput style={s.inlineInput} value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none"
                placeholderTextColor={C.placeholder} />
            </View>
          </View>
        </Section>

        {/* Travel preferences */}
        <Section title="Preferencias de viaje" emoji="">
          <ChipRow label="Clase preferida"
            selected={prefs.clase}
            onSelect={k => set('clase', k)}
            options={[
              { key: 'ECONOMICA',     label: 'Económica', icon: '💺' },
              { key: 'EJECUTIVA',     label: 'Ejecutiva', icon: '🎩' },
              { key: 'PRIMERA_CLASE', label: 'Primera',   icon: '' },
            ]}
          />
          <ChipRow label="Asiento preferido"
            selected={prefs.asiento}
            onSelect={k => set('asiento', k)}
            options={[
              { key: 'VENTANA',     label: 'Ventana',     icon: '🪟' },
              { key: 'PASILLO',     label: 'Pasillo',     icon: '🚶' },
              { key: 'INDIFERENTE', label: 'Indiferente', icon: '🎲' },
            ]}
          />
          <ChipRow label="Preferencia alimentaria"
            selected={prefs.comida}
            onSelect={k => set('comida', k)}
            options={[
              { key: 'ESTANDAR',    label: 'Estándar'   },
              { key: 'VEGETARIANA', label: 'Vegetariana'},
              { key: 'VEGANA',      label: 'Vegana'      },
              { key: 'SIN_GLUTEN',  label: 'Sin gluten'  },
              { key: 'KOSHER',      label: 'Kosher'      },
              { key: 'HALAL',       label: 'Halal'       },
            ]}
          />
          <OptionRow label="Equipaje extra" sub="Añadir maleta adicional automáticamente"
            value={prefs.equipaje_extra} onToggle={v => set('equipaje_extra', v)} />
          <OptionRow label="Prioridad de abordaje" sub="Solicitar abordaje preferencial"
            value={prefs.prioridad_abordaje} onToggle={v => set('prioridad_abordaje', v)} />
        </Section>

        {/* Notifications */}
        <Section title="Notificaciones" emoji="">
          <OptionRow label="Actualizaciones de vuelo" sub="Retrasos, cancelaciones, puertas"
            value={prefs.notif_vuelo} onToggle={v => set('notif_vuelo', v)} />
          <OptionRow label="Recordatorio de check-in" sub="2 horas antes del vuelo"
            value={prefs.notif_checkin} onToggle={v => set('notif_checkin', v)} />
          <OptionRow label="Puntos y lealtad" sub="Canjes y nuevos beneficios"
            value={prefs.notif_lealtad} onToggle={v => set('notif_lealtad', v)} />
          <OptionRow label="Ofertas exclusivas" sub="Promociones personalizadas"
            value={prefs.notif_ofertas} onToggle={v => set('notif_ofertas', v)} />
        </Section>

        {/* Accessibility */}
        <Section title="Accesibilidad" emoji="♿">
          <OptionRow label="Asistencia especial" sub="Solicitar ayuda en movilidad y embarque"
            value={prefs.accesibilidad} onToggle={v => set('accesibilidad', v)} />
          <ChipRow label="Idioma de la app"
            selected={prefs.idioma}
            onSelect={k => set('idioma', k)}
            options={[
              { key: 'ES', label: '🇬🇹 Español' },
              { key: 'EN', label: '🇺🇸 English' },
            ]}
          />
        </Section>

        {/* Danger zone */}
        <Section title="Cuenta" emoji="">
          <TouchableOpacity style={or.row} onPress={() =>
            Alert.alert('Cambiar contraseña', 'Se enviará un enlace a tu email para cambiar la contraseña.')}>
            <View style={{ flex: 1 }}>
              <Text style={or.label}>Cambiar contraseña</Text>
              <Text style={or.sub}>Enviar enlace de restablecimiento</Text>
            </View>
            <Text style={{ color: C.electric, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={or.row} onPress={() =>
            Alert.alert('Descargar datos', 'Se preparará un archivo con todos tus datos personales y viajes.')}>
            <View style={{ flex: 1 }}>
              <Text style={or.label}>Exportar mis datos</Text>
              <Text style={or.sub}>GDPR — Descarga tu información</Text>
            </View>
            <Text style={{ color: C.electric, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[or.row, { borderBottomWidth: 0 }]} onPress={() =>
            Alert.alert('Eliminar cuenta', '¿Seguro? Esta acción es irreversible.', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Eliminar', style: 'destructive', onPress: () => {} },
            ])}>
            <View style={{ flex: 1 }}>
              <Text style={[or.label, { color: C.danger }]}>Eliminar cuenta</Text>
              <Text style={or.sub}>Elimina todos tus datos permanentemente</Text>
            </View>
            <Text style={{ color: C.danger, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navyL, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  back:         { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backT:        { fontSize: 22, color: C.text, fontWeight: '300', marginTop: -2 },
  headerTitle:  { fontSize: 16, fontWeight: '800', color: C.text },
  saveBtn:      { backgroundColor: C.infoBg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: C.borderE },
  saveBtnDone:  { backgroundColor: C.successBg, borderColor: C.success + '40' },
  saveBtnT:     { fontSize: 13, fontWeight: '700', color: C.electric },
  body:         { padding: 16, paddingBottom: 40 },
  inlineInput:  { fontSize: 15, color: C.text, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.borderE, marginTop: 2 },
});
