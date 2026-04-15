/**
 * Paso 3: Datos del pasajero — validaciones completas de negocio
 */
import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';
import { useSesion } from '@/context/session';

interface PassengerData {
  nombres:          string;
  apellidos:        string;
  tipo_documento:   'DPI' | 'PASAPORTE' | 'CEDULA';
  numero_documento: string;
  email:            string;
  telefono:         string;
  fecha_nacimiento: string;
  nacionalidad:     string;
}

// ─── Field component ──────────────────────────────────────────────────────────
function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label} {required && <Text style={f.req}>*</Text>}</Text>
      {children}
      {error ? <Text style={f.error}>{error}</Text> : null}
    </View>
  );
}
const f = StyleSheet.create({
  wrap:  { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  req:   { color: C.danger },
  error: { fontSize: 11, color: C.danger, marginTop: 4, fontWeight: '600' },
});

// ─── Input component ──────────────────────────────────────────────────────────
function Input({ value, onChange, placeholder, keyboard, maxLen, secure, hasError, onBlur }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  keyboard?: any; maxLen?: number; secure?: boolean; hasError?: boolean; onBlur?: () => void;
}) {
  return (
    <TextInput
      style={[inp.input, hasError && inp.inputError]}
      value={value} onChangeText={onChange}
      placeholder={placeholder} placeholderTextColor={C.placeholder}
      keyboardType={keyboard} maxLength={maxLen} secureTextEntry={secure}
      autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
    />
  );
}
const inp = StyleSheet.create({
  input:      { backgroundColor: C.bgElevated, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.text, borderWidth: 1.5, borderColor: C.border },
  inputError: { borderColor: C.danger },
});

// ─── Validations ──────────────────────────────────────────────────────────────
function validate(data: PassengerData): Record<string, string> {
  const e: Record<string, string> = {};
  if (!data.nombres.trim()) e.nombres = 'Nombre requerido';
  else if (data.nombres.trim().length < 2) e.nombres = 'Mínimo 2 caracteres';
  if (!data.apellidos.trim()) e.apellidos = 'Apellidos requeridos';
  if (!data.numero_documento.trim()) e.numero_documento = 'Documento requerido';
  else if (data.tipo_documento === 'DPI' && !/^\d{13}$/.test(data.numero_documento))
    e.numero_documento = 'DPI debe tener 13 dígitos';
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(data.email)) e.email = 'Email inválido';
  if (data.telefono.replace(/\D/g,'').length < 8) e.telefono = 'Mínimo 8 dígitos';
  if (!data.fecha_nacimiento) e.fecha_nacimiento = 'Fecha de nacimiento requerida';
  else {
    const age = (Date.now() - new Date(data.fecha_nacimiento).getTime()) / (365.25 * 86400000);
    if (age < 0 || age > 120) e.fecha_nacimiento = 'Fecha inválida';
  }
  return e;
}

export default function DatosPasajero() {
  const router = useRouter();
  const { id, clase, precio, asiento } = useLocalSearchParams<{
    id: string; clase: string; precio: string; asiento: string;
  }>();
  const { usuario } = useSesion();

  const [data, setData] = useState<PassengerData>({
    nombres:          usuario?.nombre ?? '',
    apellidos:        usuario?.apellido ?? '',
    tipo_documento:   'DPI',
    numero_documento: '',
    email:            usuario?.email ?? '',
    telefono:         '',
    fecha_nacimiento: '',
    nacionalidad:     'Guatemalteca',
  });
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [touched, setTouched]   = useState<Record<string, boolean>>({});

  const set = (key: keyof PassengerData) => (value: string) => {
    setData(d => ({ ...d, [key]: value }));
    if (touched[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const touch = (key: string) => setTouched(t => ({ ...t, [key]: true }));

  const handleContinuar = () => {
    setTouched(Object.fromEntries(Object.keys(data).map(k => [k, true])));
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      Alert.alert('Datos incompletos', 'Por favor corrige los campos marcados en rojo.');
      return;
    }
    router.push({
      pathname: '/reservar/pago',
      params: { id, clase, precio, asiento, pasajero: JSON.stringify(data) },
    } as any);
  };

  const DOCS = [
    { key: 'DPI',       label: 'DPI Guatemala' },
    { key: 'PASAPORTE', label: 'Pasaporte' },
    { key: 'CEDULA',    label: 'Cédula' },
  ] as const;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backT}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Datos del pasajero</Text>
          <Text style={s.headerSub}>Paso 3 de 5 — Asiento {asiento}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress */}
      <View style={s.progressBar}>
        {[1,2,3,4,5].map(n => (
          <View key={n} style={[s.progressDot, n <= 3 && s.progressDotActive]} />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">

          {/* Auto-fill notice */}
          {usuario && (
            <View style={s.autofillBox}>
              <Text style={{ fontSize: 14 }}>✨</Text>
              <Text style={s.autofillT}>Datos pre-llenados con tu perfil</Text>
            </View>
          )}

          {/* Section: Name */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Nombre completo</Text>
            <Field label="Nombres" required error={touched.nombres ? errors.nombres : undefined}>
              <Input value={data.nombres} onChange={set('nombres')}
                placeholder="Ej: María José" hasError={!!touched.nombres && !!errors.nombres}
                onBlur={() => touch('nombres')} />
            </Field>
            <Field label="Apellidos" required error={touched.apellidos ? errors.apellidos : undefined}>
              <Input value={data.apellidos} onChange={set('apellidos')}
                placeholder="Ej: García López" hasError={!!touched.apellidos && !!errors.apellidos}
                onBlur={() => touch('apellidos')} />
            </Field>
          </View>

          {/* Section: Document */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Documento de identidad</Text>
            <Field label="Tipo de documento" required>
              <View style={s.docTypeRow}>
                {DOCS.map(d => (
                  <TouchableOpacity key={d.key}
                    style={[s.docTypeBtn, data.tipo_documento === d.key && s.docTypeBtnActive]}
                    onPress={() => set('tipo_documento')(d.key)}>
                    <Text style={[s.docTypeBtnT, data.tipo_documento === d.key && s.docTypeBtnTActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            <Field label="Número de documento" required
              error={touched.numero_documento ? errors.numero_documento : undefined}>
              <Input value={data.numero_documento} onChange={set('numero_documento')}
                placeholder={data.tipo_documento === 'DPI' ? '1234567890123 (13 dígitos)' : 'ABC123456'}
                keyboard="numeric" maxLen={data.tipo_documento === 'DPI' ? 13 : 20}
                hasError={!!touched.numero_documento && !!errors.numero_documento} />
            </Field>
          </View>

          {/* Section: Contact */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Contacto</Text>
            <Field label="Email" required error={touched.email ? errors.email : undefined}>
              <Input value={data.email} onChange={set('email')}
                placeholder="correo@ejemplo.com" keyboard="email-address"
                hasError={!!touched.email && !!errors.email} />
            </Field>
            <Field label="Teléfono" required error={touched.telefono ? errors.telefono : undefined}>
              <Input value={data.telefono} onChange={set('telefono')}
                placeholder="+502 1234-5678" keyboard="phone-pad" maxLen={15}
                hasError={!!touched.telefono && !!errors.telefono} />
            </Field>
          </View>

          {/* Section: Personal */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Datos personales</Text>
            <Field label="Fecha de nacimiento" required
              error={touched.fecha_nacimiento ? errors.fecha_nacimiento : undefined}>
              <Input value={data.fecha_nacimiento} onChange={set('fecha_nacimiento')}
                placeholder="YYYY-MM-DD" hasError={!!touched.fecha_nacimiento && !!errors.fecha_nacimiento} />
            </Field>
            <Field label="Nacionalidad">
              <Input value={data.nacionalidad} onChange={set('nacionalidad')}
                placeholder="Guatemalteca" />
            </Field>
          </View>

          <TouchableOpacity style={s.continueBtn} onPress={handleContinuar} activeOpacity={0.88}>
            <Text style={s.continueBtnT}>Continuar a Extras →</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navyL, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  back:         { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backT:        { fontSize: 22, color: C.text, fontWeight: '300', marginTop: -2 },
  headerTitle:  { fontSize: 16, fontWeight: '800', color: C.text, textAlign: 'center' },
  headerSub:    { fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 1 },
  progressBar:  { flexDirection: 'row', gap: 4, paddingHorizontal: 20, paddingVertical: 10 },
  progressDot:  { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.bgElevated },
  progressDotActive: { backgroundColor: C.electric },
  body:         { padding: 20, paddingBottom: 50 },
  autofillBox:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.infoBg, borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: C.borderE },
  autofillT:    { fontSize: 13, color: C.electric, fontWeight: '600' },
  section:      { backgroundColor: C.bgCard, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  docTypeRow:   { flexDirection: 'row', gap: 8 },
  docTypeBtn:   { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  docTypeBtnActive: { backgroundColor: C.infoBg, borderColor: C.electric },
  docTypeBtnT:  { fontSize: 11, fontWeight: '600', color: C.muted },
  docTypeBtnTActive: { color: C.electric, fontWeight: '700' },
  continueBtn:  { backgroundColor: C.electric, paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: C.electric, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  continueBtnT: { color: C.white, fontWeight: '900', fontSize: 15 },
});
