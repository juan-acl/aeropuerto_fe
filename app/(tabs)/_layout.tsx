import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { C } from '@/constants/theme';
import { useSesion, PERMISOS_POR_ROL } from '@/context/session';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 2 }}>
      <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.45 }}>
        {emoji}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { usuario, esCliente } = useSesion();
  const rol = usuario?.rol ?? 'CLIENTE';
  const permisos = PERMISOS_POR_ROL[rol];

  const showOps      = !esCliente && permisos.modulosOperativos.some((n: number) => [1,2,3,4,5,6,7,8,9].includes(n));
  const showServ     = !esCliente && permisos.modulosOperativos.some((n: number) => [10,11,12,13,14,15,16,18,19,20,27].includes(n));
  const showSistemas = !esCliente && permisos.modulosOperativos.some((n: number) => [21,22,23,24,25,26,28,29].includes(n));

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.electric,
        tabBarInactiveTintColor: C.light,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.navyL,
          borderTopColor: C.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 22 : 6,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 84 : 64,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.6,
          shadowRadius: 16,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: esCliente ? 'Vuelos' : 'Panel',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✈️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="operaciones"
        options={{
          title: 'Operaciones',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛬" focused={focused} />,
          href: showOps ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="servicios"
        options={{
          title: 'Servicios',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛍️" focused={focused} />,
          href: showServ ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="sistemas"
        options={{
          title: 'Sistemas',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
          href: showSistemas ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: esCliente ? 'Mi Cuenta' : 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={usuario?.avatar ?? '👤'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔐" focused={focused} />,
          href: rol === 'ADMIN' ? undefined : null,
        }}
      />
    </Tabs>
  );
}
