import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { C } from '@/constants/theme';
import { useSesion, PERMISOS_POR_ROL } from '@/context/session';
import { useNotifications } from '@/hooks/useNotifications';

function TabIcon({ emoji, focused, badge }: { emoji: string; focused: boolean; badge?: number }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 2 }}>
      <View style={{ position: 'relative' }}>
        <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
        {badge && badge > 0 ? (
          <View style={{
            position: 'absolute', top: -3, right: -7,
            backgroundColor: C.danger, borderRadius: 99,
            minWidth: 14, height: 14, alignItems: 'center',
            justifyContent: 'center', paddingHorizontal: 2,
          }}>
            <Text style={{ fontSize: 8, color: '#fff', fontWeight: '800' }}>
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { usuario, esCliente } = useSesion();
  const { unreadCount }        = useNotifications();
  const rol      = usuario?.rol ?? 'CLIENTE';
  const permisos = PERMISOS_POR_ROL[rol];

  const showOps      = !esCliente && permisos.modulosOperativos.some((n: number) => [1,2,3,4,5,6,7,8,9].includes(n));
  const showServ     = !esCliente && permisos.modulosOperativos.some((n: number) => [10,11,12,13,14,15,16,18,19,20,27].includes(n));
  const showSistemas = !esCliente && permisos.modulosOperativos.some((n: number) => [21,22,23,24,25,26,28,29].includes(n));

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   C.electric,
        tabBarInactiveTintColor: C.light,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.navyL,
          borderTopColor:  C.border,
          borderTopWidth:  1,
          paddingBottom:   Platform.OS === 'ios' ? 22 : 6,
          paddingTop:      6,
          height:          Platform.OS === 'ios' ? 84 : 64,
          elevation:       20,
          shadowColor:     '#000',
          shadowOffset:    { width: 0, height: -4 },
          shadowOpacity:   0.6,
          shadowRadius:    16,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
      }}
    >
      {/* Dashboard — role-aware home */}
      <Tabs.Screen name="dashboard"
        options={{
          title: esCliente ? 'Inicio' : 'Dashboard',
          tabBarIcon: ({ focused }) =>
            <TabIcon emoji={esCliente ? '🏠' : '📊'} focused={focused} />,
        }}
      />

      {/* Flights board (public) / Ops panel (staff) */}
      <Tabs.Screen name="index"
        options={{
          title: esCliente ? 'Vuelos' : 'Panel',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✈️" focused={focused} />,
        }}
      />

      {/* Staff-only tabs */}
      <Tabs.Screen name="operaciones"
        options={{
          title: 'Operaciones',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛬" focused={focused} />,
          href: showOps ? undefined : null,
        }}
      />
      <Tabs.Screen name="servicios"
        options={{
          title: 'Servicios',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛍️" focused={focused} />,
          href: showServ ? undefined : null,
        }}
      />
      <Tabs.Screen name="sistemas"
        options={{
          title: 'Sistemas',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
          href: showSistemas ? undefined : null,
        }}
      />

      {/* Profile — shows notification badge */}
      <Tabs.Screen name="perfil"
        options={{
          title: esCliente ? 'Mi Cuenta' : 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji={usuario?.avatar ?? '👤'}
              focused={focused}
              badge={esCliente ? unreadCount : undefined}
            />
          ),
        }}
      />

      {/* Admin-only */}
      <Tabs.Screen name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔐" focused={focused} />,
          href: rol === 'ADMIN' ? undefined : null,
        }}
      />
    </Tabs>
  );
}
