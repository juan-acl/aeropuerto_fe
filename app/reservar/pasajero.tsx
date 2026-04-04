/**
 * Paso 3: Datos del pasajero
 */
import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '@/constants/theme';
import { useSesion } from '@/context/session';
import { v } from '@/utils/validators';

export default function DatosPasajero() {
  const router = useRouter();
  const { usuario } = useSesion();
  const params = useLocalSearchParams<{ id: string; clase: string; precio: string; asiento: string }>();

  const [form, setForm] = useState({
    nombres:    usuario?.nombre ?? '',
    apellidos:  usuario?.apellido ?? '',
    documento:  '',
    tipo_doc:   'PASAPORTE' as 'DPI' | 'PASAPORTE',
    email:      usuario?.email ?? '',
    telefono:   '',
    nacionalidad: '',
    fecha_nac:  '',
  });
  const sf = (k: keyof typeof form) => (val: string) => setForm(f => ({ ...f, [k]: val }));
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validar = () => {
    const e: Partial<typeof form> = {};
    if (!v.required(form.nombres))    e.nombres    = 'Requerido';
    if (!v.required(form.apellidos))  e.apellidos  = 'Requerido';
    if (!v.required(form.documento))  e.documento  = 'Requerido';
    if (!v.email(form.email))         e.email      = 'Email inválido';
    if (!v.required(form.telefono))   e.telefono   = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const continuar = () => {
    if (!validar()) { Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios.'); return; }
    router.push({ pathname: '/reservar/pago', params: { ...params, pasajero: JSON.stringify(form) } });
  };

  const Field = ({ label, field, placeholder, type = 'default', required = false }:
    { label: string; field: keyof typeof form; placeholder: string; type?: any; required?: boolean }) => (
    <View style={s.field}>
      <Text style={s.label}>{label}{required && <Text style={{ color: C.danger }}> *</Text>}</Text>
      <TextInput
        style={[s.input, errors[field] && s.inputError]}
        value={form[field]} onChangeText={sf(field)}
        placeholder={placeholder} placeholderTextColor={C.placeholder}
        keyboardType={type} autoCapitalize={type === 'email-address' ? 'none' : 'words'}
      />
      {errors[field] && <Text style={s.errorT}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Text style={s.backT}>‹</Text></TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>Datos del Pasajero</Text>
            <Text style={s.headerSub}>Paso 3 de 4</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Progress bar */}
        <View style={s.progressWrap}>
          {[1,2,3,4].map(n => <View key={n} style={[s.progressDot, n <= 3 && s.progressDotActive]} />)}
        </View>

        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.card}>
            <Text style={s.section}>👤 Información Personal</Text>
            <Field label="Nombres" field="nombres" placeholder="Ej: María José" required />
            <Field label="Apellidos" field="apellidos" placeholder="Ej: García López" required />
            <Field label="Fecha de nacimiento" field="fecha_nac" placeholder="YYYY-MM-DD" />
            <Field label="Nacionalidad" field="nacionalidad" placeholder="Ej: Guatemalteca" />
          </View>

          <View style={s.card}>
            <Text style={s.section}>🪪 Documento de Viaje</Text>
            <View style={s.field}>
              <Text style={s.label}>Tipo de documento <Text style={{ color: C.danger }}>*</Text></Text>
              <View style={s.docToggle}>
                {(['DPI','PASAPORTE'] as const).map(t => (
                  <TouchableOpacity key={t} style={[s.docBtn, form.tipo_doc === t && s.docBtnActive]}
                    onPress={() => sf('tipo_doc')(t)} activeOpacity={0.8}>
                    <Text style={[s.docBtnT, form.tipo_doc === t && s.docBtnTActive]}>{t === 'DPI' ? '🪪 DPI' : '📔 Pasaporte'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Field label="Número de documento" field="documento" placeholder={form.tipo_doc === 'DPI' ? 'Ej: 1234567890101' : 'Ej: GT12345678'} required />
          </View>

          <View style={s.card}>
            <Text style={s.section}>📬 Contacto</Text>
            <Field label="Email" field="email" placeholder="correo@ejemplo.com" type="email-address" required />
            <Field label="Teléfono" field="telefono" placeholder="+502 5555-1234" type="phone-pad" required />
          </View>

          {/* Summary */}
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>Resumen de tu reserva</Text>
            <View style={s.summaryRow}><Text style={s.summaryL}>Vuelo</Text><Text style={s.summaryV}>{params.id}</Text></View>
            <View style={s.summaryRow}><Text style={s.summaryL}>Asiento</Text><Text style={s.summaryV}>{params.asiento}</Text></View>
            <View style={s.summaryRow}><Text style={s.summaryL}>Clase</Text><Text style={s.summaryV}>{params.clase}</Text></View>
            <View style={[s.summaryRow, { borderBottomWidth: 0 }]}><Text style={s.summaryL}>Total</Text><Text style={[s.summaryV, { fontSize: 18, fontWeight: '900', color: C.navy }]}>USD {params.precio}</Text></View>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={s.continueBtn} onPress={continuar} activeOpacity={0.85}>
            <Text style={s.continueBtnT}>Ir al pago →</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navy, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backT: { fontSize: 22, color: C.white, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.white, textAlign: 'center' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 2 },
  progressWrap: { flexDirection: 'row', gap: 6, justifyContent: 'center', paddingVertical: 12, backgroundColor: C.navy, paddingBottom: 14 },
  progressDot: { width: 48, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  progressDotActive: { backgroundColor:C.bgCard },
  body: { padding: 16, gap: 14, paddingBottom: 20 },
  card: { backgroundColor:C.bgCard, borderRadius: 16, padding: 16, elevation: 2, shadowColor: 'rgba(10,22,40,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6 },
  section: { fontSize: 14, fontWeight: '800', color: C.navy, marginBottom: 14 },
  field: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: C.text, backgroundColor: C.bgElevated },
  inputError: { borderColor: C.danger },
  errorT: { fontSize: 11, color: C.danger, marginTop: 4 },
  docToggle: { flexDirection: 'row', gap: 8 },
  docBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', backgroundColor: C.bgElevated },
  docBtnActive: { backgroundColor: C.navy, borderColor: C.navy },
  docBtnT: { fontSize: 13, fontWeight: '600', color: C.muted },
  docBtnTActive: { color: C.white, fontWeight: '800' },
  summaryCard: { backgroundColor: C.infoBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.infoL },
  summaryTitle: { fontSize: 13, fontWeight: '800', color: C.navy, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.infoL },
  summaryL: { fontSize: 13, color: C.muted },
  summaryV: { fontSize: 13, fontWeight: '700', color: C.textSub },
  footer: { backgroundColor:C.bgCard, padding: 16, borderTopWidth: 1, borderTopColor: C.borderL },
  continueBtn: { backgroundColor: C.navy, paddingVertical: 15, borderRadius: 12, alignItems: 'center', elevation: 3, shadowColor: C.navy, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8 },
  continueBtnT: { color: C.white, fontWeight: '800', fontSize: 16 },
});
