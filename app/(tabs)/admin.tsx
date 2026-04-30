import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TextInput,
  TouchableOpacity, StyleSheet, Alert, FlatList, Modal,
  Platform, KeyboardAvoidingView, ActivityIndicator, Switch,
} from 'react-native';
import { C } from '@/constants/theme';
import { useSesion } from '@/context/session';
// admin uses its own auth — context available if needed
import { backendApi } from '@/services/backendApi';
import axiosInstance from '@/src/core/infrastructure/api/axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────
type Rol = 'SUPERADMIN' | 'JEFE_OPERACIONES' | 'AGENTE_OPERACIONES' | 'FINANZAS' | 'SEGURIDAD' | 'AUDITORIA';
type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO' | 'PENDIENTE';

interface UsuarioAdmin {
  id: number;
  nombre_usuario: string;
  nombre_completo: string;
  email: string;
  rol: Rol;
  estado: EstadoUsuario;
  intentos_fallidos: number;
  ultima_sesion: string | null;
  fecha_creacion: string;
  creado_por: string;
  departamento: string;
  requiere_cambio_pass: boolean;
  esSoloLectura?: boolean;
}

interface LogEntry {
  id: number;
  timestamp: string;
  usuario: string;
  accion: string;
  detalle: string;
  ip: string;
  exitoso: boolean;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const ROLES_DISPONIBLES: { value: Rol; label: string; nivel: number; desc: string; color: string }[] = [
  { value: 'SUPERADMIN',         label: 'Super Administrador',     nivel: 1, desc: 'Acceso total — todas las secciones', color: C.red },
  { value: 'JEFE_OPERACIONES',   label: 'Jefe de Operaciones',     nivel: 2, desc: 'Vuelos, tripulación, operaciones',   color: C.navy },
  { value: 'AGENTE_OPERACIONES', label: 'Agente Operaciones',      nivel: 3, desc: 'Consulta y registro operativo',      color: C.teal },
  { value: 'FINANZAS',           label: 'Analista Financiero',     nivel: 2, desc: 'Cuentas, presupuestos, nómina',      color: C.green },
  { value: 'SEGURIDAD',          label: 'Oficial de Seguridad',    nivel: 2, desc: 'Incidentes, prohibiciones, accesos', color: C.danger },
  { value: 'AUDITORIA',          label: 'Auditor Interno',         nivel: 2, desc: 'Logs, reportes, solo lectura total', color: C.purple },
];

const ROL_PERMISSIONS: Record<Rol, string[]> = {
  SUPERADMIN:         ['Usuarios', 'Nómina', 'Salarios', 'Cuentas bancarias', 'Presupuestos', 'Prohibiciones', 'Seg. IT', 'Alertas', 'Logs del sistema', 'Configuración'],
  JEFE_OPERACIONES:   ['Vuelos', 'Tripulación', 'Pasajeros', 'Operaciones', 'Prohibiciones', 'Alertas'],
  AGENTE_OPERACIONES: ['Vuelos (lectura)', 'Check-in', 'Pasajeros (lectura)'],
  FINANZAS:           ['Cuentas bancarias', 'Presupuestos', 'Nómina', 'Órdenes de compra'],
  SEGURIDAD:          ['Prohibiciones', 'Incidentes', 'Seg. aeroportuaria', 'Alertas'],
  AUDITORIA:          ['Logs del sistema', 'Reportes', 'Todo (solo lectura)'],
};

const INIT_USUARIOS: UsuarioAdmin[] = [];

const INIT_LOGS: LogEntry[] = [];

// ─── Auth ─────────────────────────────────────────────────────────────────────

const ROL_SECCIONES: Record<Rol, string[]> = {
  SUPERADMIN:         ['usuarios', 'roles', 'empleados', 'salarios', 'cuentas', 'presupuestos', 'prohibiciones', 'seginfo', 'alertas', 'logs'],
  JEFE_OPERACIONES:   ['empleados', 'prohibiciones', 'alertas'],
  AGENTE_OPERACIONES: ['alertas'],
  FINANZAS:           ['cuentas', 'presupuestos'],
  SEGURIDAD:          ['prohibiciones', 'seginfo', 'alertas'],
  AUDITORIA:          ['logs', 'alertas'],
};

const SECCIONES_META: Record<string, { icon: string; label: string; color: string; bg: string; desc: string }> = {
  usuarios:     { icon: '', label: 'Gestión de Usuarios',       color: C.navy,    bg: C.infoBg,    desc: 'Crear, editar y controlar accesos' },
  roles:        { icon: '⭐', label: 'Gestión de Roles',        color: C.electric,bg: C.successBg, desc: 'Definir perfiles de lectura o manejo de info' },
  empleados:    { icon: '👥', label: 'Nómina y Empleados',        color: C.teal,    bg: C.tealBg,    desc: 'Datos laborales del personal' },
  salarios:     { icon: '', label: 'Salarios Confidenciales',   color: C.green,   bg: C.greenBg,   desc: 'Remuneraciones por empleado' },
  cuentas:      { icon: '🏦', label: 'Cuentas Bancarias',         color: C.success, bg: C.successBg, desc: 'Saldos e información bancaria' },
  presupuestos: { icon: '', label: 'Presupuestos',              color: C.purple,  bg: C.purpleBg,  desc: 'Asignaciones y ejecución presupuestaria' },
  prohibiciones:{ icon: '🚫', label: 'Prohibiciones de Vuelo',    color: C.danger,  bg: C.dangerBg,  desc: 'Lista de restricción de embarque' },
  seginfo:      { icon: '', label: 'Seguridad Informática',     color: C.red,     bg: C.redBg,     desc: 'Incidentes y accesos indebidos' },
  alertas:      { icon: '', label: 'Alertas Técnicas',          color: C.warning, bg: C.warningBg, desc: 'Alertas sin atender del sistema' },
  logs:         { icon: '📋', label: 'Bitácora del Sistema',      color: C.gray,    bg: C.grayBg,    desc: 'Registro de actividad y auditoría' },
};

// ─── Helper components ────────────────────────────────────────────────────────
const ESTADO_CFG: Record<EstadoUsuario, { color: string; bg: string; icon: string }> = {
  ACTIVO:    { color: C.success, bg: C.successBg, icon: '' },
  INACTIVO:  { color: C.gray,    bg: C.grayBg,    icon: '⚫' },
  BLOQUEADO: { color: C.danger,  bg: C.dangerBg,  icon: '🔴' },
  PENDIENTE: { color: C.warning, bg: C.warningBg, icon: '' },
};

function EstadoBadge({ estado }: { estado: EstadoUsuario }) {
  const cfg = ESTADO_CFG[estado];
  return (
    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
      <Text style={{ fontSize: 10, fontWeight: '800', color: cfg.color }}>{cfg.icon} {estado}</Text>
    </View>
  );
}

function RolBadge({ rol }: { rol: Rol }) {
  const found = ROLES_DISPONIBLES.find(r => r.value === rol);
  return (
    <View style={{ backgroundColor: (found?.color ?? C.gray) + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, borderWidth: 1, borderColor: (found?.color ?? C.gray) + '40' }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: found?.color ?? C.gray }}>
        {found?.label ?? rol}
      </Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminTab() {
  const [EMPLEADOS, set_EMPLEADOS] = useState<any[]>([]);
  const [CUENTAS_BANCARIAS, set_CUENTAS_BANCARIAS] = useState<any[]>([]);
  const [PRESUPUESTOS_DATA, set_PRESUPUESTOS_DATA] = useState<any[]>([]);
  const [ORDENES_COMPRA, set_ORDENES_COMPRA] = useState<any[]>([]);
  const [PROHIBICIONES, set_PROHIBICIONES] = useState<any[]>([]);
  const [ALERTAS_DATA, set_ALERTAS_DATA] = useState<any[]>([]);
  const [INCIDENTES_SEG, set_INCIDENTES_SEG] = useState<any[]>([]);
  const [roles, setRoles]         = useState<any[]>([]);
  useEffect(() => {
      // ─── Migración DB Oracle ───
      axiosInstance.get('/AdminRoles').then((res: any) => setRoles(res.data)).catch(() => {});
      axiosInstance.get('/AdminUsuarios/ListarConsolidado').then((res: any) => {
         // Parsear los usuarios devueltos
         const parseados = res.data.map((u: any) => ({
             id: u.id, nombre_usuario: u.nombre_usuario, nombre_completo: u.nombre_completo,
             email: u.email, rol: u.rol, estado: u.estado, intentos_fallidos: 0,
             ultima_sesion: null, fecha_creacion: u.fecha_creacion, creado_por: 'Sistema',
             departamento: u.departamento, requiere_cambio_pass: false, rolId: u.rolId
         }));
         setUsuarios(parseados);
      }).catch(() => {});

      backendApi.empleados.listar().then((d: any) => set_EMPLEADOS(d)).catch(() => {});
      backendApi.cuentasBancarias.listar().then((d: any) => set_CUENTAS_BANCARIAS(d)).catch(() => {});
      backendApi.finanzas.presupuestos.listar().then((d: any) => set_PRESUPUESTOS_DATA(d)).catch(() => {});
      backendApi.vuelos.listar().then((d: any) => set_ORDENES_COMPRA(d)).catch(() => {});
      backendApi.vuelos.listar().then((d: any) => set_PROHIBICIONES(d)).catch(() => {});
      backendApi.mantenimiento.alertasTecnicas.listar().then((d: any) => set_ALERTAS_DATA(d)).catch(() => {});
      backendApi.vuelos.listar().then((d: any) => set_INCIDENTES_SEG(d)).catch(() => {});
      axiosInstance.get('/logsacceso').then((res: any) => {
         const logData = res.data.map((l: any, idx: number) => ({
            id: l.idLogAcceso || idx, timestamp: l.fechaAcceso || new Date().toISOString(),
            usuario: l.usuario || 'Sistema', accion: l.evento || 'INFO',
            detalle: l.detalles || '', ip: l.direccionIp || '0.0.0.0', exitoso: l.exito === 1
         }));
         setLogs(logData);
      }).catch(() => {});
  }, []);

  const { logout: globalLogout } = useSesion();
  // Auth state
  const [loggedIn, setLoggedIn]       = useState(false);
  const [userInput, setUserInput]     = useState('');
  const [passInput, setPassInput]     = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [sesion, setSesion]           = useState<UsuarioAdmin | null>(null);

  // Panel state
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);

  // Users CRUD state
  const [usuarios, setUsuarios]   = useState<UsuarioAdmin[]>([]);
  const [logs, setLogs]           = useState<LogEntry[]>(INIT_LOGS);
  const [usuarioModal, setUsuarioModal] = useState(false);
  const [editUsuario, setEditUsuario]   = useState<UsuarioAdmin | null>(null);
  const [detalleUsuario, setDetalleUsuario] = useState<UsuarioAdmin | null>(null);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoUsuario | 'TODOS'>('TODOS');

  // New user form
  const [form, setForm] = useState({
    nombre_usuario: '', nombre_completo: '', email: '',
    rol: '' as Rol | '', departamento: '', pass_temp: '',
  });
  const sf = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  // New role form
  const [rolModal, setRolModal] = useState(false);
  const [rolForm, setRolForm]   = useState({ nombreRol: '', descripcion: '', jerarquia: '3' });
  const [rolSaving, setRolSaving] = useState(false);

  const crearNuevoRol = async () => {
     if (!rolForm.nombreRol.trim() || !rolForm.descripcion.trim()) return Alert.alert('Inválido', 'Llena todos los campos');
     setRolSaving(true);
     try {
       const res: any = await axiosInstance.post('/AdminRoles', {
         NombreRol: rolForm.nombreRol, Descripcion: rolForm.descripcion, NivelJerarquico: parseInt(rolForm.jerarquia)
       });
       setRoles(prev => [...prev, res.data.rol]);
       setRolModal(false); setRolForm({nombreRol: '', descripcion: '', jerarquia: '3'});
       Alert.alert('Éxito', res.data.mensaje);
     } catch(e: any){ Alert.alert('Error Oracle', e.message); }
     setRolSaving(false);
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!userInput.trim() || !passInput.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa usuario y contraseña.'); return;
    }
    setAuthLoading(true);
    try {
      const res = await axiosInstance.post<any>('/Auth/login', { usuario: userInput, password: passInput });
      if (res.data && res.data.usuario) {
        const u = res.data.usuario;
        const loggedUser: UsuarioAdmin = {
           id: u.id,
           nombre_usuario: u.nombre,
           nombre_completo: u.nombre_completo || u.nombre, 
           email: u.email,
           rol: u.rol || 'SUPERADMIN',
           estado: 'ACTIVO',
           intentos_fallidos: 0,
           ultima_sesion: new Date().toISOString(),
           fecha_creacion: new Date().toISOString(),
           creado_por: 'Sistema',
           departamento: u.departamento || 'General',
           requiere_cambio_pass: false
        };
        setSesion(loggedUser);
        setLoggedIn(true);
        addLog('LOGIN', userInput, `Sesión iniciada correctamente`, '192.168.1.x', true);
      }
    } catch (e: any) {
      Alert.alert('Acceso denegado', 'Usuario o contraseña incorrectos.');
      addLog('LOGIN_FALLIDO', userInput || '(desconocido)', `Intento fallido de acceso`, '???', false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => {
        addLog('LOGOUT', sesion!.nombre_usuario, 'Sesión cerrada', '192.168.1.x', true);
        setLoggedIn(false); setSesion(null); setUserInput(''); setPassInput('');
        setSeccionActiva(null); setDetalleUsuario(null);
        globalLogout(); // also clear global session so other tabs reset
      }},
    ]);
  };

  const addLog = useCallback((accion: string, usuario: string, detalle: string, ip: string, exitoso: boolean) => {
    const now = new Date();
    const ts = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 8)}`;
    setLogs(prev => [{ id: Date.now(), timestamp: ts, usuario, accion, detalle, ip, exitoso }, ...prev]);
  }, []);

  // ── User CRUD ─────────────────────────────────────────────────────────────
  const abrirNuevoUsuario = () => {
    setEditUsuario(null);
    setForm({ nombre_usuario: '', nombre_completo: '', email: '', rol: '', departamento: '', pass_temp: '' });
    setUsuarioModal(true);
  };

  const abrirEditarUsuario = (u: UsuarioAdmin) => {
    setEditUsuario(u);
    setForm({ nombre_usuario: u.nombre_usuario, nombre_completo: u.nombre_completo, email: u.email, rol: u.rol, departamento: u.departamento, pass_temp: '' });
    setUsuarioModal(true);
  };

  const guardarUsuario = async () => {
    if (!form.nombre_usuario.trim() || !form.email.trim() || !form.rol) {
      Alert.alert('Campos requeridos', 'Usuario, email y rol son obligatorios.'); return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      Alert.alert('Email inválido', 'Ingresa un correo electrónico válido.'); return;
    }
    
    try {
        setAuthLoading(true);
        const res = await axiosInstance.post<{mensaje: string, usuario: any}>('/AdminUsuarios', {
            NombreUsuario: form.nombre_usuario,
            NombreCompleto: form.nombre_completo,
            Email: form.email,
            IdRolSistema: parseInt(form.rol as string),
            Password: form.pass_temp || '1234',
            Departamento: form.departamento
        });

        const numId = res.data.usuario.id;
        // Agregarlo a la lista visual de inmediato
        const nuevo: UsuarioAdmin = {
          id: numId, nombre_usuario: res.data.usuario.nombre_usuario,
          nombre_completo: form.nombre_completo.trim(), email: res.data.usuario.email,
          rol: form.rol as Rol, estado: 'ACTIVO', intentos_fallidos: 0,
          ultima_sesion: null, fecha_creacion: new Date().toISOString().split('T')[0],
          creado_por: sesion!.nombre_usuario, departamento: form.departamento,
          requiere_cambio_pass: true,
        };
        setUsuarios(prev => [...prev, nuevo]);
        addLog('USUARIO_CREADO', sesion!.nombre_usuario, `Creó usuario Oracle DB: ${nuevo.nombre_usuario}`, '192.168.1.x', true);
        Alert.alert('Exito DB', res.data.mensaje);
        setUsuarioModal(false);
    } catch(err: any) {
        Alert.alert('Error DB', err.message);
    } finally {
        setAuthLoading(false);
    }
  };

  const cambiarEstado = (u: UsuarioAdmin, nuevoEstado: EstadoUsuario) => {
    const labels: Record<EstadoUsuario, string> = { ACTIVO: 'activar', INACTIVO: 'desactivar', BLOQUEADO: 'bloquear', PENDIENTE: 'marcar como pendiente' };
    Alert.alert(`¿${labels[nuevoEstado]} usuario?`, `Esta acción cambiará el estado de "${u.nombre_usuario}" a ${nuevoEstado}.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => {
        setUsuarios(prev => prev.map(x => x.id === u.id
          ? { ...x, estado: nuevoEstado, intentos_fallidos: nuevoEstado === 'ACTIVO' ? 0 : x.intentos_fallidos }
          : x
        ));
        addLog('ESTADO_CAMBIADO', sesion!.nombre_usuario, `Cambió estado de ${u.nombre_usuario}: ${u.estado} → ${nuevoEstado}`, '192.168.1.x', true);
        setDetalleUsuario(prev => prev ? { ...prev, estado: nuevoEstado } : null);
      }},
    ]);
  };

  const resetearPassword = (u: UsuarioAdmin) => {
    Alert.alert('Resetear contraseña', `Se generará una contraseña temporal para "${u.nombre_usuario}" y se solicitará cambio en el próximo acceso.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Resetear', onPress: () => {
        setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, requiere_cambio_pass: true, intentos_fallidos: 0 } : x));
        addLog('PASS_RESET', sesion!.nombre_usuario, `Reseteó contraseña de: ${u.nombre_usuario}`, '192.168.1.x', true);
        Alert.alert(' Contraseña reseteada', 'El usuario deberá cambiar su contraseña en el próximo acceso.');
        setDetalleUsuario(prev => prev ? { ...prev, requiere_cambio_pass: true } : null);
      }},
    ]);
  };

  const eliminarUsuario = (u: UsuarioAdmin) => {
    if (u.id === sesion?.id) { Alert.alert('Acción no permitida', 'No puedes eliminar tu propia cuenta.'); return; }
    Alert.alert(' Eliminar usuario', `Esto eliminará permanentemente la cuenta de "${u.nombre_usuario}". Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        setUsuarios(prev => prev.filter(x => x.id !== u.id));
        addLog('USUARIO_ELIMINADO', sesion!.nombre_usuario, `Eliminó usuario: ${u.nombre_usuario}`, '192.168.1.x', true);
        setDetalleUsuario(null);
        Alert.alert('Eliminado', 'El usuario fue eliminado del sistema.');
      }},
    ]);
  };

  // ── Filtered usuarios ──────────────────────────────────────────────────────
  const usuariosFiltrados = useMemo(() =>
    usuarios.filter(u => {
      const matchQ = !busqueda || `${u.nombre_usuario} ${u.nombre_completo} ${u.email} ${u.departamento}`.toLowerCase().includes(busqueda.toLowerCase());
      const matchE = filtroEstado === 'TODOS' || u.estado === filtroEstado;
      return matchQ && matchE;
    }), [usuarios, busqueda, filtroEstado]);

  const stats = useMemo(() => ({
    total:    usuarios.length,
    activos:  usuarios.filter(u => u.estado === 'ACTIVO').length,
    bloqueados: usuarios.filter(u => u.estado === 'BLOQUEADO').length,
    pendientes: usuarios.filter(u => u.estado === 'PENDIENTE').length,
  }), [usuarios]);

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <SafeAreaView style={s.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={s.loginScroll} keyboardShouldPersistTaps="handled">
            <View style={s.loginTop}>
              <View style={s.lockCircle}><Text style={{ fontSize: 38 }}></Text></View>
              <Text style={s.loginBrand}>AEROPUERTO LA AURORA</Text>
              <Text style={s.loginHeading}>Panel Administrativo</Text>
              <Text style={s.loginSub}>Área restringida — solo personal autorizado</Text>
            </View>

            <View style={s.loginCard}>
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>USUARIO</Text>
                <View style={s.inputRow}>
                  <Text style={s.inputIcon}></Text>
                  <TextInput style={s.input} value={userInput} onChangeText={setUserInput}
                    placeholder="nombre.apellido" placeholderTextColor={C.placeholder}
                    autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
                </View>
              </View>

              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>CONTRASEÑA</Text>
                <View style={s.inputRow}>
                  <Text style={s.inputIcon}>🔑</Text>
                  <TextInput style={[s.input, { flex: 1 }]} value={passInput} onChangeText={setPassInput}
                    placeholder="••••••••" placeholderTextColor={C.placeholder}
                    secureTextEntry={!showPass} returnKeyType="done" onSubmitEditing={handleLogin} />
                  <TouchableOpacity onPress={() => setShowPass(p => !p)} style={{ padding: 8 }}>
                    <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={[s.loginBtn, authLoading && { opacity: 0.7 }]}
                onPress={handleLogin} activeOpacity={0.85} disabled={authLoading}>
                {authLoading
                  ? <ActivityIndicator color={C.white} />
                  : <Text style={s.loginBtnT}>INGRESAR →</Text>}
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Panel ─────────────────────────────────────────────────────────────────
  const secciones = ROL_SECCIONES[sesion!.rol as Rol] ?? (sesion?.esSoloLectura ? ['usuarios', 'roles'] : ROL_SECCIONES['SUPERADMIN']);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.panelHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.panelBrand}>AEROPUERTO LA AURORA</Text>
          <Text style={s.panelTitle}>Panel Administrativo</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <View style={[s.rolPill, { backgroundColor: (ROLES_DISPONIBLES.find(r => r.value === sesion!.rol)?.color ?? C.navy) + '30' }]}>
            <Text style={[s.rolPillT, { color: ROLES_DISPONIBLES.find(r => r.value === sesion!.rol)?.color ?? C.white }]}>
              {ROLES_DISPONIBLES.find(r => r.value === sesion!.rol)?.label ?? sesion!.rol}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={s.logoutT}>Cerrar sesión →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting */}
      <View style={s.greeting}>
        <Text style={{ fontSize: 20 }}>👋</Text>
        <View>
          <Text style={s.greetingName}>{sesion!.nombre_completo}</Text>
          <Text style={s.greetingMeta}>{sesion!.departamento} · {sesion!.email}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.panelBody} showsVerticalScrollIndicator={false}>
        <Text style={s.grupoLabel}>Secciones disponibles</Text>

        {secciones.map(key => {
          const meta = SECCIONES_META[key];
          if (!meta) return null;
          const badge = key === 'alertas' ? ALERTAS_DATA.filter((a: any) => !a.atendida).length
            : key === 'usuarios' ? stats.bloqueados + stats.pendientes
            : key === 'seginfo' ? INCIDENTES_SEG.filter((i: any) => i.estado !== 'RESUELTO').length
            : 0;
          return (
            <TouchableOpacity key={key} style={[s.secCard, { borderLeftColor: meta.color }]}
              onPress={() => setSeccionActiva(key)} activeOpacity={0.82}>
              <View style={[s.secIcon, { backgroundColor: meta.bg }]}>
                <Text style={{ fontSize: 24 }}>{meta.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.secTitle}>{meta.label}</Text>
                <Text style={s.secDesc}>{meta.desc}</Text>
              </View>
              {badge > 0 && (
                <View style={[s.alertBadge, { backgroundColor: meta.color }]}>
                  <Text style={s.alertBadgeT}>{badge}</Text>
                </View>
              )}
              <View style={[s.secArrow, { backgroundColor: meta.color + '15' }]}>
                <Text style={[s.secArrowT, { color: meta.color }]}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={s.avisoCaja}>
          <Text style={s.avisoIcono}>🔒</Text>
          <Text style={s.avisoTexto}>
            Tienes acceso a <Text style={{ fontWeight: '800' }}>{secciones.length}</Text> sección{secciones.length !== 1 ? 'es' : ''} según tu rol{' '}
            <Text style={{ fontWeight: '800' }}>{sesion!.rol}</Text>. Contacta al administrador para solicitar acceso adicional.
          </Text>
        </View>
      </ScrollView>

      {/* ── SECTION DETAIL MODAL ─────────────────────────────────────────── */}
      <Modal visible={seccionActiva !== null} animationType="slide" onRequestClose={() => setSeccionActiva(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
          {/* Modal header */}
          <View style={sd.header}>
            <TouchableOpacity style={sd.backBtn} onPress={() => { setSeccionActiva(null); setBusqueda(''); setDetalleUsuario(null); }} activeOpacity={0.75}>
              <Text style={sd.backT}>‹</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={sd.headerTitle}>{seccionActiva ? SECCIONES_META[seccionActiva]?.label : ''}</Text>
              <Text style={sd.headerSub}>{seccionActiva ? SECCIONES_META[seccionActiva]?.desc : ''}</Text>
            </View>
            {seccionActiva === 'usuarios' && !sesion?.esSoloLectura && (
              <TouchableOpacity style={sd.addBtn} onPress={() => { setForm({ nombre_usuario: '', nombre_completo: '', email: '', rol: '', pass_temp: '', departamento: 'General' }); setEditUsuario(null); setUsuarioModal(true); }} activeOpacity={0.85}>
                <Text style={sd.addBtnT}>+ Nuevo Usuario</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* USUARIOS section */}
          {seccionActiva === 'usuarios' && (
            <View style={{ flex: 1 }}>
              {/* Stats strip */}
              <View style={sd.statsStrip}>
                {[
                  { label: 'Total', val: stats.total,      color: C.navy    },
                  { label: 'Activos', val: stats.activos,  color: C.success  },
                  { label: 'Bloqueados', val: stats.bloqueados, color: C.danger },
                  { label: 'Pendientes', val: stats.pendientes, color: C.warning },
                ].map(st => (
                  <TouchableOpacity key={st.label} style={sd.statItem}
                    onPress={() => setFiltroEstado(st.label === 'Total' ? 'TODOS' : st.label.toUpperCase().slice(0, -1) as EstadoUsuario)}>
                    <Text style={[sd.statVal, { color: st.color }]}>{st.val}</Text>
                    <Text style={sd.statLabel}>{st.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Search + filter */}
              <View style={sd.searchBar}>
                <Text style={{ fontSize: 16, color: C.light, marginRight: 8 }}></Text>
                <TextInput style={{ flex: 1, fontSize: 14, color: C.text }}
                  value={busqueda} onChangeText={setBusqueda}
                  placeholder="Buscar usuario, nombre, email..." placeholderTextColor={C.placeholder} />
              </View>

              {/* Estado filter chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={{ backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.borderL }}
                contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
                {(['TODOS', 'ACTIVO', 'INACTIVO', 'BLOQUEADO', 'PENDIENTE'] as const).map(e => (
                  <TouchableOpacity key={e}
                    style={[sd.chip, filtroEstado === e && sd.chipActive]}
                    onPress={() => setFiltroEstado(e)} activeOpacity={0.75}>
                    <Text style={[sd.chipT, filtroEstado === e && sd.chipTActive]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* List */}
              <FlatList
                data={usuariosFiltrados}
                keyExtractor={u => String(u.id)}
                contentContainerStyle={{ padding: 14, paddingBottom: 30, flexGrow: 1 }}
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', paddingVertical: 50 }}>
                    <Text style={{ fontSize: 36, marginBottom: 10 }}></Text>
                    <Text style={{ color: C.muted, fontSize: 14 }}>Sin usuarios que coincidan</Text>
                  </View>
                }
                renderItem={({ item: u }) => (
                  <TouchableOpacity style={[sd.userCard, u.estado === 'BLOQUEADO' && sd.userCardBlocked]}
                    onPress={() => setDetalleUsuario(u)} activeOpacity={0.82}>
                    <View style={[sd.userAvatar, { backgroundColor: (ROLES_DISPONIBLES.find(r => r.value === u.rol)?.color ?? C.electric) + '20' }]}>
                      <Text style={{ fontSize: 20 }}>{u.estado === 'BLOQUEADO' ? '🔒' : u.estado === 'PENDIENTE' ? '' : ''}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={sd.userName}>{u.nombre_usuario}</Text>
                        {u.requiere_cambio_pass && <View style={sd.changePill}><Text style={sd.changePillT}>⚡ Cambio req.</Text></View>}
                      </View>
                      <Text style={sd.userFullName}>{u.nombre_completo}</Text>
                      <Text style={sd.userMeta}>{u.departamento} · {u.email}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <EstadoBadge estado={u.estado} />
                      <RolBadge rol={u.rol} />
                    </View>
                  </TouchableOpacity>
                )}
              />

              {/* User detail sheet */}
              <Modal visible={detalleUsuario !== null} animationType="slide" transparent
                onRequestClose={() => setDetalleUsuario(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                  <View style={sd.sheet}>
                    <View style={sd.sheetHandle} />
                    {detalleUsuario && (() => {
                      const u = detalleUsuario;
                      const rolCfg = ROLES_DISPONIBLES.find(r => r.value === u.rol);
                      const permisos = ROL_PERMISSIONS[u.rol] ?? [];
                      return (
                        <ScrollView showsVerticalScrollIndicator={false}>
                          {/* Profile header */}
                          <View style={[sd.sheetHero, { backgroundColor: rolCfg?.color ?? C.navy }]}>
                            <TouchableOpacity style={sd.sheetClose} onPress={() => setDetalleUsuario(null)}>
                              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }}>✕</Text>
                            </TouchableOpacity>
                            <View style={sd.sheetAvatarBig}>
                              <Text style={{ fontSize: 36 }}>{u.estado === 'BLOQUEADO' ? '🔒' : ''}</Text>
                            </View>
                            <Text style={sd.sheetHeroUser}>{u.nombre_usuario}</Text>
                            <Text style={sd.sheetHeroName}>{u.nombre_completo}</Text>
                            <EstadoBadge estado={u.estado} />
                          </View>

                          <View style={{ padding: 16, gap: 12 }}>
                            {/* Info */}
                            <View style={sd.sheetCard}>
                              <Text style={sd.sheetCardTitle}>Información de la cuenta</Text>
                              {[
                                ['Email', u.email],
                                ['Departamento', u.departamento],
                                ['Creado por', u.creado_por],
                                ['Fecha de creación', u.fecha_creacion],
                                ['Última sesión', u.ultima_sesion ?? 'Nunca'],
                                ['Intentos fallidos', String(u.intentos_fallidos)],
                                ['Cambio de contraseña', u.requiere_cambio_pass ? '⚡ Requerido' : ' No requerido'],
                              ].map(([l, v]) => (
                                <View key={l} style={sd.infoRow}>
                                  <Text style={sd.infoL}>{l}</Text>
                                  <Text style={sd.infoV}>{v}</Text>
                                </View>
                              ))}
                            </View>

                            {/* Rol y permisos */}
                            <View style={sd.sheetCard}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <Text style={sd.sheetCardTitle}>Rol asignado</Text>
                              </View>
                              <View style={[sd.rolBox, { borderColor: (rolCfg?.color ?? C.border) + '40', backgroundColor: (rolCfg?.color ?? C.bg) + '0C' }]}>
                                <Text style={[sd.rolBoxTitle, { color: rolCfg?.color }]}>{rolCfg?.label}</Text>
                                <Text style={sd.rolBoxDesc}>{rolCfg?.desc}</Text>
                                <Text style={sd.rolBoxNivel}>Nivel jerárquico: {rolCfg?.nivel}</Text>
                              </View>
                              <Text style={[sd.sheetCardTitle, { marginTop: 12, marginBottom: 8 }]}>Permisos activos</Text>
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {permisos.map(p => (
                                  <View key={p} style={[sd.permTag, { backgroundColor: rolCfg?.color + '15', borderColor: rolCfg?.color + '30' }]}>
                                    <Text style={[sd.permTagT, { color: rolCfg?.color }]}>✓ {p}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>

                            {/* Actions — only for superadmin or authorized editors */}
                            {!sesion?.esSoloLectura && (
                              <View style={sd.sheetCard}>
                                <Text style={sd.sheetCardTitle}>Acciones administrativas</Text>
                                <View style={{ gap: 8, marginTop: 8 }}>
                                  <TouchableOpacity style={sd.actionBtn} onPress={() => abrirEditarUsuario(u)} activeOpacity={0.8}>
                                    <Text style={sd.actionIcon}>✏️</Text>
                                    <View>
                                      <Text style={sd.actionTitle}>Editar usuario</Text>
                                      <Text style={sd.actionSub}>Modificar nombre, email, rol o departamento</Text>
                                    </View>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={sd.actionBtn} onPress={() => resetearPassword(u)} activeOpacity={0.8}>
                                    <Text style={sd.actionIcon}>🔑</Text>
                                    <View>
                                      <Text style={sd.actionTitle}>Resetear contraseña</Text>
                                      <Text style={sd.actionSub}>El usuario deberá crear una nueva en su próximo acceso</Text>
                                    </View>
                                  </TouchableOpacity>
                                  {u.estado !== 'ACTIVO' && (
                                    <TouchableOpacity style={[sd.actionBtn, { borderColor: C.successL }]} onPress={() => cambiarEstado(u, 'ACTIVO')} activeOpacity={0.8}>
                                      <Text style={sd.actionIcon}></Text>
                                      <View><Text style={[sd.actionTitle, { color: C.success }]}>Activar cuenta</Text><Text style={sd.actionSub}>Restaurar acceso al sistema</Text></View>
                                    </TouchableOpacity>
                                  )}
                                  {u.estado === 'ACTIVO' && u.id !== sesion?.id && (
                                    <TouchableOpacity style={[sd.actionBtn, { borderColor: C.warningL }]} onPress={() => cambiarEstado(u, 'INACTIVO')} activeOpacity={0.8}>
                                      <Text style={sd.actionIcon}>⏸️</Text>
                                      <View><Text style={[sd.actionTitle, { color: C.warning }]}>Desactivar cuenta</Text><Text style={sd.actionSub}>Sin eliminar el historial</Text></View>
                                    </TouchableOpacity>
                                  )}
                                  {u.estado !== 'BLOQUEADO' && u.id !== sesion?.id && (
                                    <TouchableOpacity style={[sd.actionBtn, { borderColor: C.dangerL }]} onPress={() => cambiarEstado(u, 'BLOQUEADO')} activeOpacity={0.8}>
                                      <Text style={sd.actionIcon}>🔒</Text>
                                      <View><Text style={[sd.actionTitle, { color: C.danger }]}>Bloquear cuenta</Text><Text style={sd.actionSub}>Acceso suspendido de inmediato</Text></View>
                                    </TouchableOpacity>
                                  )}
                                  {u.id !== sesion?.id && (
                                    <TouchableOpacity style={[sd.actionBtn, { borderColor: C.dangerL, backgroundColor: C.dangerBg }]} onPress={() => eliminarUsuario(u)} activeOpacity={0.8}>
                                      <Text style={sd.actionIcon}>🗑️</Text>
                                      <View><Text style={[sd.actionTitle, { color: C.danger }]}>Eliminar usuario</Text><Text style={sd.actionSub}>Acción permanente e irreversible</Text></View>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            )}
                            <View style={{ height: 20 }} />
                          </View>
                        </ScrollView>
                      );
                    })()}
                  </View>
                </View>
              </Modal>
            </View>
          )}

          {/* ROLES section */}
          {seccionActiva === 'roles' && (
            <View style={{ flex: 1 }}>
               <View style={sd.header}>
                  <TouchableOpacity style={sd.backBtn} onPress={() => setSeccionActiva(null)} activeOpacity={0.75}><Text style={sd.backT}>‹</Text></TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={sd.headerTitle}>Gestión de Roles</Text>
                  </View>
                  {!sesion?.esSoloLectura && (
                    <TouchableOpacity style={sd.addBtn} onPress={() => setRolModal(true)} activeOpacity={0.85}><Text style={sd.addBtnT}>+ Nuevo Rol</Text></TouchableOpacity>
                  )}
               </View>
               <FlatList data={roles} keyExtractor={r => String(r.idRolSistema)} contentContainerStyle={{ padding: 14 }} renderItem={({ item: r }) => (
                  <View style={sd.card}>
                    <Text style={sd.cardTitle}>{r.nombreRol}</Text>
                    <Text style={sd.cardSub}>{r.descripcion} · Nivel: {r.nivelJerarquico}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 8}}>
                       {r.nivelJerarquico <= 2 ? (
                         <View style={{backgroundColor: C.dangerBg, padding:4, borderRadius: 4}}><Text style={{fontSize: 10, color: C.danger, fontWeight: '800'}}>Manejo de Información Sensible</Text></View>
                       ) : (
                         <View style={{backgroundColor: C.infoBg, padding:4, borderRadius: 4}}><Text style={{fontSize: 10, color: C.info, fontWeight: '800'}}>Solo Lectura (Vistas)</Text></View>
                       )}
                    </View>
                  </View>
                )} />

                {/* MODAL CREAR ROL */}
                <Modal visible={rolModal} animationType="slide" transparent onRequestClose={() => setRolModal(false)}>
                  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                     <View style={[sd.card, { backgroundColor: C.bgCard, padding: 20 }]}>
                         <Text style={{ fontSize: 18, color: C.electric, fontWeight: '800', marginBottom: 15 }}>Crea un Perfil de Acceso</Text>
                         <Text style={s.fieldLabel}>Nombre Rol (Ej: LECTURA_FINANZAS)</Text>
                         <View style={s.inputRow}><TextInput style={s.input} value={rolForm.nombreRol} onChangeText={t => setRolForm(f=>({...f, nombreRol: t.toUpperCase()}))} autoCapitalize="characters" /></View>
                         
                         <Text style={[s.fieldLabel, { marginTop: 15 }]}>Descripción</Text>
                         <View style={s.inputRow}><TextInput style={s.input} value={rolForm.descripcion} onChangeText={t => setRolForm(f=>({...f, descripcion: t}))} /></View>

                         <Text style={[s.fieldLabel, { marginTop: 15 }]}>Permisos sobre la Información</Text>
                         <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                             <TouchableOpacity onPress={()=>setRolForm(f=>({...f, jerarquia: '3'}))} style={[sd.permTag, rolForm.jerarquia === '3' ? {backgroundColor: C.electric} : {backgroundColor: C.bgElevated}]}>
                                <Text style={{color: rolForm.jerarquia === '3' ? C.white : C.text, fontWeight: '800'}}>Solo Vistas (Lectura)</Text>
                             </TouchableOpacity>
                             <TouchableOpacity onPress={()=>setRolForm(f=>({...f, jerarquia: '1'}))} style={[sd.permTag, rolForm.jerarquia === '1' ? {backgroundColor: C.danger} : {backgroundColor: C.bgElevated}]}>
                                <Text style={{color: rolForm.jerarquia === '1' ? C.white : C.text, fontWeight: '800'}}>Manejar / Editar Info</Text>
                             </TouchableOpacity>
                         </View>

                         <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 25, gap: 10 }}>
                             <TouchableOpacity onPress={() => setRolModal(false)}><Text style={{ color: C.muted, fontWeight: '700', padding: 10 }}>Cancelar</Text></TouchableOpacity>
                             <TouchableOpacity onPress={crearNuevoRol} disabled={rolSaving} style={{ backgroundColor: C.electric, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}>
                                <Text style={{ color: C.white, fontWeight: '800' }}>{rolSaving ? '...' : 'Generar en Oracle'}</Text>
                             </TouchableOpacity>
                         </View>
                     </View>
                  </View>
                </Modal>
            </View>
          )}

          {/* LOGS section */}
          {seccionActiva === 'logs' && (
            <FlatList
              data={logs}
              keyExtractor={l => String(l.id)}
              contentContainerStyle={{ padding: 14, paddingBottom: 30, flexGrow: 1 }}
              renderItem={({ item: l }) => (
                <View style={[sd.logRow, !l.exitoso && { borderLeftColor: C.danger, borderLeftWidth: 3 }]}>
                  <Text style={[sd.logIcon]}>{l.exitoso ? '' : '❌'}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={sd.logAccion}>{l.accion}</Text>
                      <Text style={[sd.logUser, { color: l.exitoso ? C.navy : C.danger }]}>{l.usuario}</Text>
                    </View>
                    <Text style={sd.logDetalle}>{l.detalle}</Text>
                    <Text style={sd.logMeta}>{l.timestamp} · IP: {l.ip}</Text>
                  </View>
                </View>
              )}
            />
          )}

          {/* EMPLEADOS */}
          {seccionActiva === 'empleados' && (
            <FlatList data={EMPLEADOS} keyExtractor={e => String(e.id)}
              contentContainerStyle={{ padding: 14, paddingBottom: 30, flexGrow: 1 }}
              renderItem={({ item: e }) => (
                <View style={sd.card}>
                  <View style={[sd.cardAvatar, { backgroundColor: C.tealBg }]}><Text style={{ fontSize: 20 }}></Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={sd.cardTitle}>{e.nombres} {e.apellidos}</Text>
                    <Text style={sd.cardSub}>{e.cargo} · {e.departamento}</Text>
                    <Text style={sd.cardMeta}>📧 {e.email} · 📞 {e.telefono}</Text>
                    <Text style={sd.cardMeta}>Desde {e.fecha_contratacion}</Text>
                  </View>
                  <View style={[sd.tag, { backgroundColor: e.activo ? C.successBg : C.dangerBg }]}>
                    <Text style={[sd.tagT, { color: e.activo ? C.success : C.danger }]}>{e.tipo_contrato}</Text>
                  </View>
                </View>
              )} />
          )}

          {/* SALARIOS */}
          {seccionActiva === 'salarios' && (
            <>
              <View style={sd.secBanner}><Text style={sd.secBannerT}> Información salarial — CONFIDENCIAL · Solo SUPERADMIN</Text></View>
              <FlatList data={EMPLEADOS} keyExtractor={e => String(e.id)}
                contentContainerStyle={{ padding: 14, paddingBottom: 30, flexGrow: 1 }}
                renderItem={({ item: e }) => (
                  <View style={sd.card}>
                    <View style={{ flex: 1 }}>
                      <Text style={sd.cardTitle}>{e.nombres} {e.apellidos}</Text>
                      <Text style={sd.cardSub}>{e.cargo} · {e.departamento}</Text>
                      <Text style={[sd.cardMeta, { color: C.muted }]}>{e.tipo_contrato}</Text>
                    </View>
                    <Text style={[sd.salario]}>Q {e.salario_base?.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</Text>
                  </View>
                )}
                ListFooterComponent={
                  <View style={sd.totalRow}>
                    <Text style={sd.totalL}>Nómina mensual total</Text>
                    <Text style={sd.totalV}>Q {EMPLEADOS.reduce((s, e) => s + (e.salario_base ?? 0), 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</Text>
                  </View>
                }
              />
            </>
          )}

          {/* CUENTAS */}
          {seccionActiva === 'cuentas' && (
            <>
              <View style={sd.secBanner}><Text style={sd.secBannerT}>🏦 Información bancaria institucional — CONFIDENCIAL</Text></View>
              <FlatList data={CUENTAS_BANCARIAS} keyExtractor={c => String(c.id_cuenta)}
                contentContainerStyle={{ padding: 14, paddingBottom: 30, flexGrow: 1 }}
                renderItem={({ item: c }) => (
                  <View style={sd.card}>
                    <View style={[sd.cardAvatar, { backgroundColor: C.greenBg }]}><Text style={{ fontSize: 20 }}>🏦</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={sd.cardTitle}>{c.banco}</Text>
                      <Text style={sd.cardSub}>{c.tipo_cuenta} · {c.moneda}</Text>
                      <Text style={[sd.cardMeta, { fontFamily: 'monospace' }]}>{c.numero_cuenta}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={[sd.salario, { color: C.success, fontSize: 15 }]}>{c.moneda} {c.saldo_actual?.toLocaleString()}</Text>
                      <View style={[sd.tag, { backgroundColor: C.successBg }]}><Text style={[sd.tagT, { color: C.success }]}>{c.estado}</Text></View>
                    </View>
                  </View>
                )} />
            </>
          )}

          {/* PRESUPUESTOS */}
          {seccionActiva === 'presupuestos' && (
            <FlatList data={PRESUPUESTOS_DATA} keyExtractor={p => String(p.id)}
              contentContainerStyle={{ padding: 14, paddingBottom: 30, flexGrow: 1 }}
              renderItem={({ item: p }) => {
                const pct = p.monto_asignado > 0 ? (p.monto_ejecutado / p.monto_asignado) * 100 : 0;
                const color = pct >= 95 ? C.danger : pct >= 80 ? C.warning : C.success;
                return (
                  <View style={[sd.card, { flexDirection: 'column' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View style={{ flex: 1 }}><Text style={sd.cardTitle}>{p.concepto}</Text><Text style={sd.cardSub}>{p.departamento}</Text></View>
                      <Text style={[sd.salario, { color, fontSize: 18 }]}>{pct.toFixed(0)}%</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: C.bgElevated, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                      <View style={{ height: 8, width: `${Math.min(pct, 100)}%` as any, backgroundColor: color, borderRadius: 4 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={sd.cardMeta}>Asignado: Q {p.monto_asignado?.toLocaleString()}</Text>
                      <Text style={[sd.cardMeta, { color }]}>Ejecutado: Q {p.monto_ejecutado?.toLocaleString()}</Text>
                    </View>
                  </View>
                );
              }} />
          )}

          {/* PROHIBICIONES */}
          {seccionActiva === 'prohibiciones' && (
            <>
              <View style={sd.secBanner}><Text style={sd.secBannerT}>🚫 Lista de restricción de embarque — CONFIDENCIAL</Text></View>
              <FlatList data={PROHIBICIONES} keyExtractor={p => String(p.id_prohibicion)}
                contentContainerStyle={{ padding: 14, paddingBottom: 30, flexGrow: 1 }}
                ListEmptyComponent={<View style={{ alignItems: 'center', padding: 50 }}><Text style={{ fontSize: 36 }}></Text><Text style={{ color: C.muted, marginTop: 10 }}>Sin prohibiciones activas</Text></View>}
                renderItem={({ item: p }) => (
                  <View style={[sd.card, { borderLeftWidth: 3, borderLeftColor: p.activa ? C.danger : C.gray }]}>
                    <View style={[sd.cardAvatar, { backgroundColor: C.dangerBg }]}><Text style={{ fontSize: 18 }}>🚫</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={sd.cardTitle}>Pasajero ID #{p.id_pasajero}</Text>
                      <Text style={sd.cardSub}>{p.motivo}</Text>
                      <Text style={sd.cardMeta}>{p.fecha_inicio} → {p.fecha_fin}</Text>
                    </View>
                    <View style={[sd.tag, { backgroundColor: p.activa ? C.dangerBg : C.grayBg }]}>
                      <Text style={[sd.tagT, { color: p.activa ? C.danger : C.gray }]}>{p.activa ? 'ACTIVA' : 'INACTIVA'}</Text>
                    </View>
                  </View>
                )} />
            </>
          )}

          {/* SEGURIDAD IT */}
          {seccionActiva === 'seginfo' && (
            <>
              <View style={[sd.secBanner, { borderColor: C.dangerL, backgroundColor: C.dangerBg }]}>
                <Text style={[sd.secBannerT, { color: C.danger }]}> Incidentes de Seguridad IT — Solo SUPERADMIN / SEGURIDAD</Text>
              </View>
              <FlatList data={INCIDENTES_SEG} keyExtractor={i => String(i.id_incidente_seguridad_info)}
                contentContainerStyle={{ padding: 14, paddingBottom: 30, flexGrow: 1 }}
                renderItem={({ item: i }) => (
                  <View style={[sd.card, { borderLeftWidth: 3, borderLeftColor: i.nivel_gravedad === 'ALTO' ? C.danger : C.warning }]}>
                    <View style={[sd.cardAvatar, { backgroundColor: i.nivel_gravedad === 'ALTO' ? C.dangerBg : C.warningBg }]}><Text style={{ fontSize: 18 }}>🔒</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={sd.cardTitle}>{i.tipo_incidente}</Text>
                      <Text style={sd.cardSub}>{i.descripcion}</Text>
                      <Text style={sd.cardMeta}>{i.fecha_deteccion}</Text>
                    </View>
                    <View style={[sd.tag, { backgroundColor: i.estado === 'RESUELTO' ? C.successBg : C.warningBg }]}>
                      <Text style={[sd.tagT, { color: i.estado === 'RESUELTO' ? C.success : C.warning }]}>{i.estado}</Text>
                    </View>
                  </View>
                )} />
            </>
          )}

          {/* ALERTAS */}
          {seccionActiva === 'alertas' && (
            <FlatList data={ALERTAS_DATA as any[]} keyExtractor={(a: any) => String(a.id_alerta ?? a.id)}
              contentContainerStyle={{ padding: 14, paddingBottom: 30, flexGrow: 1 }}
              renderItem={({ item: a }: any) => (
                <View style={[sd.card, { opacity: a.atendida ? 0.55 : 1 }]}>
                  <View style={[sd.cardAvatar, { backgroundColor: !a.atendida ? C.warningBg : C.grayBg }]}><Text style={{ fontSize: 18 }}></Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={sd.cardTitle}>{a.tipo_alerta ?? a.descripcion ?? 'Alerta técnica'}</Text>
                    <Text style={sd.cardSub}>{a.descripcion ?? a.matricula_avion ?? '—'}</Text>
                    <Text style={sd.cardMeta}>{a.fecha_alerta ?? a.fecha ?? '—'}</Text>
                  </View>
                  <View style={[sd.tag, { backgroundColor: !a.atendida ? C.warningBg : C.successBg }]}>
                    <Text style={[sd.tagT, { color: !a.atendida ? C.warning : C.success }]}>{!a.atendida ? 'PENDIENTE' : 'ATENDIDA'}</Text>
                  </View>
                </View>
              )} />
          )}
        </SafeAreaView>
      </Modal>

      {/* ── NEW/EDIT USER MODAL ──────────────────────────────────────────────── */}
      <Modal visible={usuarioModal} animationType="slide" transparent onRequestClose={() => setUsuarioModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' } as any}
            activeOpacity={1} onPress={() => setUsuarioModal(false)} />
          <View style={fm.sheet}>
            <View style={fm.handle} />
            <View style={fm.header}>
              <Text style={fm.title}>{editUsuario ? 'Editar usuario' : 'Crear nuevo usuario'}</Text>
              <TouchableOpacity onPress={() => setUsuarioModal(false)} style={fm.closeBtn}>
                <Text style={{ color: C.muted, fontSize: 16, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={fm.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Sección: Cuenta */}
              <View style={fm.section}><Text style={fm.sectionT}>🏷️ DATOS DE LA CUENTA</Text></View>
              <View style={fm.field}>
                <Text style={fm.label}>Nombre de usuario {!editUsuario && <Text style={{ color: C.danger }}>*</Text>}</Text>
                <TextInput style={[fm.input, editUsuario && { backgroundColor: C.grayBg, color: C.muted }]}
                  value={form.nombre_usuario} onChangeText={sf('nombre_usuario')}
                  placeholder="ej: j.perez" placeholderTextColor={C.placeholder}
                  autoCapitalize="none" editable={!editUsuario} />
                {!editUsuario && <Text style={fm.hint}>Solo letras, números y puntos. No se puede cambiar después.</Text>}
              </View>
              <View style={fm.field}>
                <Text style={fm.label}>Nombre completo <Text style={{ color: C.danger }}>*</Text></Text>
                <TextInput style={fm.input} value={form.nombre_completo} onChangeText={sf('nombre_completo')}
                  placeholder="ej: Juan Pérez García" placeholderTextColor={C.placeholder} />
              </View>
              <View style={fm.field}>
                <Text style={fm.label}>Email institucional <Text style={{ color: C.danger }}>*</Text></Text>
                <TextInput style={fm.input} value={form.email} onChangeText={sf('email')}
                  placeholder="ej: j.perez@aurora.aero" placeholderTextColor={C.placeholder}
                  keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={fm.field}>
                <Text style={fm.label}>Departamento</Text>
                <TextInput style={fm.input} value={form.departamento} onChangeText={sf('departamento')}
                  placeholder="ej: Operaciones, Finanzas, TI..." placeholderTextColor={C.placeholder} />
              </View>

              {/* Sección: Rol */}
              <View style={fm.section}><Text style={fm.sectionT}>🎖️ ROL Y PERMISOS</Text></View>
              <Text style={[fm.label, { marginBottom: 8 }]}>Rol del usuario <Text style={{ color: C.danger }}>*</Text></Text>
              {ROLES_DISPONIBLES.map(r => (
                <TouchableOpacity key={r.value}
                  style={[fm.rolOption, form.rol === r.value && { borderColor: r.color, backgroundColor: r.color + '0D' }]}
                  onPress={() => setForm(f => ({ ...f, rol: r.value }))} activeOpacity={0.75}>
                  <View style={{ flex: 1 }}>
                    <Text style={[fm.rolTitle, form.rol === r.value && { color: r.color }]}>{r.label}</Text>
                    <Text style={fm.rolDesc}>{r.desc}</Text>
                    <Text style={[fm.rolNivel, { color: r.color + 'CC' }]}>Nivel {r.nivel}</Text>
                  </View>
                  <View style={[fm.rolCheck, form.rol === r.value && { backgroundColor: r.color, borderColor: r.color }]}>
                    {form.rol === r.value && <Text style={{ color: C.white, fontSize: 12, fontWeight: '800' }}>✓</Text>}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Contraseña temporal (solo nuevo usuario) */}
              {!editUsuario && (
                <>
                  <View style={fm.section}><Text style={fm.sectionT}>🔑 CONTRASEÑA TEMPORAL</Text></View>
                  <View style={fm.field}>
                    <Text style={fm.label}>Contraseña temporal <Text style={{ color: C.danger }}>*</Text></Text>
                    <TextInput style={fm.input} value={form.pass_temp} onChangeText={sf('pass_temp')}
                      placeholder="Mín. 6 caracteres" placeholderTextColor={C.placeholder} secureTextEntry />
                    <Text style={fm.hint}>El usuario deberá cambiarla en su primer acceso al sistema.</Text>
                  </View>
                </>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>
            <View style={fm.footer}>
              <TouchableOpacity style={fm.cancelBtn} onPress={() => setUsuarioModal(false)} activeOpacity={0.75}>
                <Text style={fm.cancelT}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={fm.saveBtn} onPress={guardarUsuario} activeOpacity={0.85}>
                <Text style={fm.saveT}>{editUsuario ? 'Actualizar' : 'Crear usuario'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loginScroll: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 40 },
  loginTop: { alignItems: 'center', marginBottom: 32 },
  lockCircle: { width: 90, height: 90, borderRadius: 26, backgroundColor: C.navyL, alignItems: 'center', justifyContent: 'center', marginBottom: 18, elevation: 8, shadowColor: C.navy, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14 },
  loginBrand: { fontSize: 9, fontWeight: '800', color: C.light, letterSpacing: 3.5, textTransform: 'uppercase', marginBottom: 8 },
  loginHeading: { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  loginSub: { fontSize: 13, color: C.muted, marginTop: 6, textAlign: 'center' },
  loginCard: { backgroundColor: C.bgCard, borderRadius: 22, padding: 24, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 1, shadowRadius: 18 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 13, paddingHorizontal: 12, backgroundColor: C.bgElevated },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: C.text },
  loginBtn: { backgroundColor: C.navyL, paddingVertical: 15, borderRadius: 13, alignItems: 'center', marginTop: 6, elevation: 3, shadowColor: C.navy, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8 },
  loginBtnT: { color: C.white, fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
  demoBox: { marginTop: 20, backgroundColor: C.bgElevated, borderRadius: 13, padding: 14, borderWidth: 1.5, borderColor: C.border },
  demoTitle: { fontSize: 11, fontWeight: '700', color: C.light, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', marginBottom: 10 },
  demoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.borderL },
  demoLeft: { flex: 1 },
  demoUser: { fontSize: 14, fontWeight: '800', color: C.navy },
  demoPass: { fontSize: 11, color: C.muted, marginTop: 1 },
  demoRolPill: { backgroundColor: C.navy + '12', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  demoRolT: { fontSize: 10, fontWeight: '700', color: C.navy },
  panelHeader: { backgroundColor: C.navyL, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' },
  panelBrand: { fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  panelTitle: { fontSize: 18, fontWeight: '800', color: C.white, marginTop: 2 },
  rolPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  rolPillT: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  logoutT: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 },
  greeting: { backgroundColor: C.bgCard, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.borderL },
  greetingName: { fontSize: 15, fontWeight: '800', color: C.text },
  greetingMeta: { fontSize: 11, color: C.muted, marginTop: 2 },
  panelBody: { padding: 16, paddingBottom: 40 },
  grupoLabel: { fontSize: 10, fontWeight: '800', color: C.light, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
  secCard: { backgroundColor: C.bgCard, borderRadius: 16, marginBottom: 10, borderLeftWidth: 4, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6 },
  secIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  secTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  secDesc: { fontSize: 12, color: C.muted, marginTop: 3 },
  alertBadge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  alertBadgeT: { fontSize: 11, fontWeight: '800', color: C.white },
  secArrow: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  secArrowT: { fontSize: 22, fontWeight: '300', marginTop: -2 },
  avisoCaja: { flexDirection: 'row', gap: 10, backgroundColor: C.warningBg, borderRadius: 13, padding: 14, borderWidth: 1, borderColor: C.warningL, marginTop: 8, alignItems: 'flex-start' },
  avisoIcono: { fontSize: 18 },
  avisoTexto: { flex: 1, fontSize: 12, color: C.warning, lineHeight: 18 },
});

const sd = StyleSheet.create({
  header: { backgroundColor: C.bgCard, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.borderL, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backT: { fontSize: 22, color: C.navy, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 11, color: C.muted, marginTop: 1 },
  addBtn: { backgroundColor: C.navyL, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnT: { fontSize: 13, fontWeight: '700', color: C.white },
  statsStrip: { flexDirection: 'row', backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.borderL, paddingVertical: 14 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 10, color: C.muted, marginTop: 2, fontWeight: '600' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.borderL, paddingHorizontal: 16, paddingVertical: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: C.bgElevated, borderWidth: 1.5, borderColor: C.border },
  chipActive: { backgroundColor: C.navyL, borderColor: C.navy },
  chipT: { fontSize: 11, fontWeight: '600', color: C.muted },
  chipTActive: { color: C.white, fontWeight: '700' },
  userCard: { backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6 },
  userCardBlocked: { borderWidth: 1.5, borderColor: C.dangerL, backgroundColor: C.dangerBg + '30' },
  userAvatar: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userName: { fontSize: 15, fontWeight: '800', color: C.text },
  userFullName: { fontSize: 12, color: C.textSub, marginTop: 2, fontWeight: '500' },
  userMeta: { fontSize: 11, color: C.muted, marginTop: 2 },
  changePill: { backgroundColor: C.warningBg, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  changePillT: { fontSize: 9, fontWeight: '700', color: C.warning },
  sheet: { backgroundColor: C.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 1, shadowRadius: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  sheetHero: { borderRadius: 16, margin: 16, padding: 20, alignItems: 'center', gap: 8 },
  sheetClose: { alignSelf: 'flex-end', padding: 4 },
  sheetAvatarBig: { width: 72, height: 72, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  sheetHeroUser: { fontSize: 20, fontWeight: '900', color: C.white },
  sheetHeroName: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  sheetCard: { backgroundColor: C.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.borderL },
  sheetCardTitle: { fontSize: 12, fontWeight: '800', color: C.navy, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.borderL },
  infoL: { fontSize: 12, color: C.muted, flex: 0.45, fontWeight: '500' },
  infoV: { fontSize: 12, fontWeight: '600', color: C.textSub, flex: 0.55 },
  rolBox: { borderWidth: 1.5, borderRadius: 12, padding: 14 },
  rolBoxTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  rolBoxDesc: { fontSize: 12, color: C.muted, marginBottom: 4 },
  rolBoxNivel: { fontSize: 11, fontWeight: '600' },
  permTag: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  permTagT: { fontSize: 11, fontWeight: '600' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bgElevated },
  actionIcon: { fontSize: 22, flexShrink: 0 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  actionSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  logRow: { backgroundColor: C.bgCard, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', gap: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3 },
  logIcon: { fontSize: 18, flexShrink: 0 },
  logAccion: { fontSize: 12, fontWeight: '800', color: C.navy, backgroundColor: C.infoBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  logUser: { fontSize: 12, fontWeight: '700' },
  logDetalle: { fontSize: 12, color: C.textSub, marginTop: 3, lineHeight: 17 },
  logMeta: { fontSize: 10, color: C.light, marginTop: 3 },
  card: { backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4 },
  cardAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  cardSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  cardMeta: { fontSize: 11, color: C.light, marginTop: 2, fontWeight: '500' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  tagT: { fontSize: 10, fontWeight: '700' },
  salario: { fontSize: 18, fontWeight: '900', color: C.success },
  totalRow: { backgroundColor: C.navyL, borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalL: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  totalV: { fontSize: 17, fontWeight: '900', color: C.white },
  secBanner: { backgroundColor: C.warningBg, marginHorizontal: 16, marginTop: 16, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: C.warningL },
  secBannerT: { fontSize: 12, fontWeight: '600', color: C.warning, textAlign: 'center' },
});

const fm = StyleSheet.create({
  sheet: { backgroundColor: C.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 1, shadowRadius: 20 },
  handle: { width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.borderL },
  title: { flex: 1, fontSize: 17, fontWeight: '800', color: C.text },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingTop: 16 },
  section: { borderBottomWidth: 1.5, borderBottomColor: C.borderL, paddingBottom: 8, marginTop: 20, marginBottom: 12 },
  sectionT: { fontSize: 11, fontWeight: '800', color: C.navy, letterSpacing: 0.8 },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: C.text, backgroundColor: C.bgElevated },
  hint: { fontSize: 11, color: C.light, marginTop: 5 },
  rolOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 8, backgroundColor: C.bgElevated },
  rolTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  rolDesc: { fontSize: 11, color: C.muted, marginTop: 2 },
  rolNivel: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  rolCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: C.borderL },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', backgroundColor: C.bgElevated },
  cancelT: { color: C.muted, fontWeight: '700', fontSize: 15 },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: C.navyL, alignItems: 'center' },
  saveT: { color: C.white, fontWeight: '800', fontSize: 15 },
});


