import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, Platform, KeyboardAvoidingView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BackendStatus } from '@/components/shared/BackendStatus';
import { useBackend } from '@/hooks/useBackend';
import { C, MOD_COLORS } from '@/constants/theme';
import { useSesion, DEMO_ACCOUNTS, ROL_META, PERMISOS_POR_ROL } from '@/context/session';

const SECCION_NOMBRE: Record<number, string> = {
  1:'Infraestructura',2:'Flota Aérea',3:'Aerolíneas',4:'Programación',
  5:'Operaciones',6:'Tripulación',7:'Pasajeros',8:'Reservas',
  9:'Check-in',10:'Seguridad',11:'Seg. Aeroportuaria',12:'Objetos Perdidos',
  13:'Comercial',14:'Servicios',15:'RRHH',16:'Finanzas',
  18:'Especiales',19:'Carga',20:'Mantenimiento',21:'Tiempo Real',
  22:'Combustible',23:'Ambiental',24:'Seg. IT',25:'Marketing',
  26:'Documental',27:'Transporte',28:'Emergencias',29:'OACI',
};

export default function PerfilTab() {
  const { isOnline } = useBackend();
  const router = useRouter();
  const { usuario, loading, login, loginDemo, logout, misReservas, esCliente } = useSesion();
  const [usr, setUsr] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async () => {
    if (!usr.trim() || !pass.trim()) { Alert.alert('Requerido', 'Completa usuario y contraseña.'); return; }
    setAuthLoading(true);
    const ok = await login(usr.trim().toLowerCase(), pass);
    if (!ok) Alert.alert('Acceso denegado', 'Usuario o contraseña incorrectos.');
    setAuthLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logout();          // synchronous — clears state + bumps sessionKey
            setUsr('');        // reset form fields
            setPass('');
          },
        },
      ],
      { cancelable: true }
    );
  };

  // ── NOT LOGGED IN ─────────────────────────────────────────────────────────
  if (!usuario) return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.loginScroll} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={s.loginHero}>
            <View style={s.loginOrb1} /><View style={s.loginOrb2} />
            <View style={s.loginAvatarWrap}><Text style={{ fontSize: 44 }}></Text></View>
            <Text style={s.loginBrand}>AEROPUERTO LA AURORA</Text>
            <Text style={s.loginTitle}>Bienvenido</Text>
            <Text style={s.loginSub}>Inicia sesión con tu cuenta{'\n'}institucional o de pasajero</Text>
          </View>

          {/* Form card */}
          <View style={s.loginCard}>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>USUARIO</Text>
              <View style={s.inputWrap}>
                <Text style={s.inputIcon}></Text>
                <TextInput style={s.input} value={usr} onChangeText={setUsr}
                  placeholder="ej: cliente, recepcion, admin..." placeholderTextColor={C.placeholder}
                  autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
              </View>
            </View>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>CONTRASEÑA</Text>
              <View style={s.inputWrap}>
                <Text style={s.inputIcon}>🔑</Text>
                <TextInput style={[s.input, { flex: 1 }]} value={pass} onChangeText={setPass}
                  placeholder="••••••••" placeholderTextColor={C.placeholder}
                  secureTextEntry={!showPass} returnKeyType="done" onSubmitEditing={handleLogin} />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={[s.loginBtn, authLoading && { opacity: 0.7 }]}
              onPress={handleLogin} activeOpacity={0.85} disabled={authLoading}>
              {authLoading ? <ActivityIndicator color={C.white} /> : <Text style={s.loginBtnT}>INGRESAR →</Text>}
            </TouchableOpacity>
          </View>

          {/* Demo accounts grid */}
          <View style={s.demoBox}>
            <Text style={s.demoTitle}>Cuentas de demostración · contraseña: 1234</Text>
            <View style={s.demoGrid}>
              {DEMO_ACCOUNTS.map(a => {
                const meta = ROL_META[a.datos.rol as keyof typeof PERMISOS_POR_ROL] || ROL_META['CLIENTE'];
                return (
                  <TouchableOpacity key={a.usuario}
                    style={[s.demoChip, { borderColor: meta.color + '40' }]}
                    onPress={() => { setUsr(a.usuario); setPass(a.pass); }} activeOpacity={0.75}>
                    <Text style={{ fontSize: 18 }}>{a.datos.avatar}</Text>
                    <View>
                      <Text style={[s.demoChipUser, { color: meta.color }]}>{a.usuario}</Text>
                      <Text style={s.demoChipRol}>{meta.label.split(' ')[0]}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // ── LOGGED IN ─────────────────────────────────────────────────────────────
  const meta = ROL_META[usuario.rol as keyof typeof PERMISOS_POR_ROL] || ROL_META['CLIENTE'];
  const perms = PERMISOS_POR_ROL[usuario.rol as keyof typeof PERMISOS_POR_ROL] || PERMISOS_POR_ROL['CLIENTE'];
  const secciones = perms.modulosOperativos;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <View style={s.profileHero}>
          <View style={s.profileOrb1} /><View style={s.profileOrb2} />
          <View style={[s.profileAvatar, { borderColor: meta.color + '50' }]}>
            <Text style={{ fontSize: 48 }}>{usuario.avatar}</Text>
          </View>
          <Text style={s.profileName}>{usuario.nombre} {usuario.apellido}</Text>
          <View style={[s.rolBadge, { backgroundColor: meta.color + '20', borderColor: meta.color + '50' }]}>
            <Text style={[s.rolBadgeT, { color: meta.color }]}>{meta.label}</Text>
          </View>
          {usuario.departamento && <Text style={s.profileDept}> {usuario.departamento}</Text>}
          <Text style={s.profileEmail}>{usuario.email}</Text>
          <View style={{ marginTop: 6 }}><BackendStatus isOnline={isOnline} /></View>
        </View>

        <View style={{ padding: 16, gap: 12 }}>
          {/* CLIENT: Reservations */}
          {esCliente && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>Mis Reservas</Text>
                <View style={[s.countBadge, { backgroundColor: meta.color + '20' }]}>
                  <Text style={[s.countBadgeT, { color: meta.color }]}>{misReservas.length}</Text>
                </View>
              </View>
              {misReservas.length === 0 ? (
                <View style={s.emptyCard}>
                  <Text style={{ fontSize: 36 }}></Text>
                  <Text style={s.emptyCardT}>Aún no tienes reservas</Text>
                  <TouchableOpacity style={[s.emptyBtn, { backgroundColor: meta.color + '20', borderColor: meta.color + '40' }]}
                    onPress={() => router.push('/reservar' as any)}>
                    <Text style={[s.emptyBtnT, { color: meta.color }]}>Reservar vuelo </Text>
                  </TouchableOpacity>
                </View>
              ) : misReservas.slice(0, 5).map((r, i) => (
                <View key={i} style={s.reservaRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.reservaCodigo}>{r.codigo_reserva}</Text>
                    <Text style={s.reservaInfo}>Vuelo #{r.id_vuelo} · Asiento {r.numero_asiento ?? '—'}</Text>
                  </View>
                  <View style={[s.estadoChip, {
                    backgroundColor: r.estado_reserva === 'CONFIRMADA' ? C.successBg : C.warningBg,
                    borderColor: r.estado_reserva === 'CONFIRMADA' ? C.success + '40' : C.warning + '40',
                  }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: r.estado_reserva === 'CONFIRMADA' ? C.success : C.warning }}>
                      {r.estado_reserva}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Quick actions */}
          {esCliente && (
            <View style={s.actionsGrid}>
              {[
                { icon: '', t: 'Buscar vuelo', fn: () => router.push('/reservar' as any) },
                { icon: '', t: 'Check-in', fn: () => router.push('/reservar/checkin' as any) },
              ].map(a => (
                <TouchableOpacity key={a.t} style={s.actionCard} onPress={a.fn} activeOpacity={0.8}>
                  <Text style={{ fontSize: 28 }}>{a.icon}</Text>
                  <Text style={s.actionCardT}>{a.t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* STAFF: Account info */}
          {!esCliente && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Cuenta institucional</Text>
              {[['Email', usuario.email], ['Departamento', usuario.departamento ?? '—'], ['Rol', meta.label]].map(([l, v]) => (
                <View key={l} style={s.infoRow}>
                  <Text style={s.infoL}>{l}</Text>
                  <Text style={s.infoV}>{v}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Permissions (staff) */}
          {!esCliente && secciones.length > 0 && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>Módulos con acceso</Text>
                <View style={[s.countBadge, { backgroundColor: meta.color + '20' }]}>
                  <Text style={[s.countBadgeT, { color: meta.color }]}>{secciones.length}</Text>
                </View>
              </View>
              <View style={s.modulesGrid}>
                {secciones.map((n: number) => {
                  const mc = MOD_COLORS[n];
                  return (
                    <View key={n} style={[s.moduleChip, { backgroundColor: mc?.bg ?? C.bgElevated, borderColor: (mc?.color ?? C.border) + '40' }]}>
                      <Text style={{ fontSize: 13 }}>{mc?.icon ?? '📋'}</Text>
                      <Text style={[s.moduleChipT, { color: mc?.color ?? C.muted }]}>{SECCION_NOMBRE[n]}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Capabilities (staff) */}
          {!esCliente && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Permisos del rol</Text>
              {[
                ['Ver vuelos', perms.verVuelos],
                ['Gestionar check-in', perms.hacerCheckin],
                ['Ver pasajeros', perms.verPasajeros !== 'ninguno'],
                ['Historial médico', perms.verHistorialMedico],
                ['Ver tripulación', perms.verTripulacion],
                ['Ver seguridad', perms.verSeguridad],
                ['Información financiera', perms.verFinanzas],
                ['Ver salarios', perms.verSalarios],
                ['Gestionar empleados', perms.gestionarEmpleados],
              ].map(([label, ok]) => (
                <View key={label as string} style={s.capRow}>
                  <View style={[s.capDot, { backgroundColor: ok ? C.success : C.bgElevated, borderColor: ok ? C.success + '40' : C.border }]}>
                    {ok ? <Text style={{ fontSize: 8, color: C.white }}>✓</Text> : null}
                  </View>
                  <Text style={[s.capLabel, !ok && { color: C.light, textDecorationLine: 'line-through' }]}>{label as string}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Text style={s.logoutBtnT}>🚪  Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── Login ──
  loginScroll: { flexGrow: 1, padding: 20, paddingTop: 16 },
  loginHero: { alignItems: 'center', paddingVertical: 28, marginBottom: 8, overflow: 'hidden' },
  loginOrb1: { position: 'absolute', top: -20, right: -20, width: 160, height: 160, borderRadius: 80, backgroundColor: C.electric, opacity: 0.08 },
  loginOrb2: { position: 'absolute', bottom: -10, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: C.cyan, opacity: 0.06 },
  loginAvatarWrap: { width: 90, height: 90, borderRadius: 26, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.borderE, marginBottom: 16, shadowColor: C.electric, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  loginBrand: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 },
  loginTitle: { fontSize: 30, fontWeight: '900', color: C.text, letterSpacing: -1 },
  loginSub: { fontSize: 13, color: C.muted, marginTop: 6, textAlign: 'center', lineHeight: 19 },
  loginCard: { backgroundColor: C.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: C.muted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 7 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgElevated, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: C.text },
  loginBtn: { backgroundColor: C.electric, paddingVertical: 15, borderRadius: 12, alignItems: 'center', shadowColor: C.electric, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  loginBtnT: { color: C.white, fontWeight: '900', fontSize: 14, letterSpacing: 1.5 },
  demoBox: { backgroundColor: C.bgCard, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border },
  demoTitle: { fontSize: 10, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 12 },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  demoChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bgElevated, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1 },
  demoChipUser: { fontSize: 13, fontWeight: '800' },
  demoChipRol: { fontSize: 10, color: C.muted },

  // ── Profile ──
  profileHero: { backgroundColor: C.navyL, alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: C.border },
  profileOrb1: { position: 'absolute', top: -30, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: C.electric, opacity: 0.07 },
  profileOrb2: { position: 'absolute', bottom: -20, left: -10, width: 130, height: 130, borderRadius: 65, backgroundColor: C.cyan, opacity: 0.05 },
  profileAvatar: { width: 90, height: 90, borderRadius: 24, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 },
  profileName: { fontSize: 24, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  rolBadge: { borderRadius: 99, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, marginTop: 8 },
  rolBadgeT: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  profileDept: { fontSize: 12, color: C.muted, marginTop: 6 },
  profileEmail: { fontSize: 11, color: C.light, marginTop: 4 },

  // ── Cards ──
  card: { backgroundColor: C.bgCard, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 12, fontWeight: '800', color: C.text, textTransform: 'uppercase', letterSpacing: 1, flex: 1 },
  countBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  countBadgeT: { fontSize: 12, fontWeight: '800' },
  emptyCard: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyCardT: { fontSize: 14, color: C.muted },
  emptyBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  emptyBtnT: { fontSize: 13, fontWeight: '700' },
  reservaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.borderL },
  reservaCodigo: { fontSize: 14, fontWeight: '800', color: C.electric },
  reservaInfo: { fontSize: 11, color: C.muted, marginTop: 2 },
  estadoChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
  actionsGrid: { flexDirection: 'row', gap: 10 },
  actionCard: { flex: 1, backgroundColor: C.bgCard, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.borderE },
  actionCardT: { fontSize: 13, fontWeight: '700', color: C.textSub },
  infoRow: { flexDirection: 'row', paddingVertical: 9, borderTopWidth: 1, borderTopColor: C.borderL },
  infoL: { fontSize: 12, color: C.muted, flex: 0.4 },
  infoV: { fontSize: 12, fontWeight: '600', color: C.textSub, flex: 0.6 },
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 },
  moduleChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, borderWidth: 1 },
  moduleChipT: { fontSize: 10, fontWeight: '700' },
  capRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.borderL },
  capDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  capLabel: { fontSize: 13, color: C.textSub, fontWeight: '500' },
  logoutBtn: { backgroundColor: C.dangerBg, paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: C.danger + '40' },
  logoutBtnT: { color: C.danger, fontWeight: '800', fontSize: 14 },
});
