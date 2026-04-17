import React from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/theme';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backT}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Notificaciones</Text>
          {unreadCount > 0 && <Text style={s.headerSub}>{unreadCount} sin leer</Text>}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={s.markAll}>Marcar todas</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 80 }} />}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}></Text>
            <Text style={s.emptyT}>Sin notificaciones</Text>
            <Text style={s.emptySub}>Las alertas de tus vuelos y reservas aparecerán aquí</Text>
          </View>
        }
        renderItem={({ item: n }) => {
          const isUnread = !n.read;
          const timeAgo = (() => {
            const diff = (Date.now() - n.timestamp) / 60000;
            if (diff < 1) return 'ahora';
            if (diff < 60) return `hace ${Math.floor(diff)} min`;
            if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`;
            return `hace ${Math.floor(diff / 1440)}d`;
          })();
          return (
            <TouchableOpacity
              style={[s.card, isUnread && s.cardUnread, { borderLeftColor: n.color }]}
              onPress={() => {
                markRead(n.id);
                if (n.actionRoute) router.push(n.actionRoute as any);
              }}
              onLongPress={() => remove(n.id)}
              activeOpacity={0.82}
            >
              {isUnread && <View style={[s.unreadDot, { backgroundColor: n.color }]} />}
              <View style={[s.iconWrap, { backgroundColor: n.color + '20' }]}>
                <Text style={{ fontSize: 22 }}>{n.icon}</Text>
              </View>
              <View style={s.content}>
                <View style={s.contentTop}>
                  <Text style={[s.title, isUnread && s.titleBold]} numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text style={s.time}>{timeAgo}</Text>
                </View>
                <Text style={s.body} numberOfLines={2}>{n.body}</Text>
                {n.actionRoute && (
                  <Text style={[s.action, { color: n.color }]}>Toca para abrir →</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.navyL, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  back: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backT: { fontSize: 22, color: C.text, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.text, textAlign: 'center' },
  headerSub: { fontSize: 11, color: C.warning, textAlign: 'center', marginTop: 1, fontWeight: '700' },
  markAll: { fontSize: 12, color: C.electric, fontWeight: '700', textAlign: 'right' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyT: { fontSize: 18, fontWeight: '800', color: C.textSub, marginBottom: 6 },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center', paddingHorizontal: 30, lineHeight: 20 },
  card: { backgroundColor: C.bgCard, borderRadius: 16, marginBottom: 10, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, position: 'relative' },
  cardUnread: { borderColor: C.borderE, backgroundColor: C.bgElevated },
  unreadDot: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  content: { flex: 1, gap: 4 },
  contentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 13, fontWeight: '600', color: C.textSub, flex: 1 },
  titleBold: { fontWeight: '800', color: C.text },
  time: { fontSize: 10, color: C.light, marginLeft: 8 },
  body: { fontSize: 12, color: C.muted, lineHeight: 17 },
  action: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
