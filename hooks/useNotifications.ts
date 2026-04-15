import { useState, useEffect } from 'react';
import { notificationStore, Notification } from '@/src/modules/notifications/store';
import { useSesion } from '@/context/session';

export function useNotifications() {
  const { usuario } = useSesion();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsub = notificationStore.subscribe(setNotifications);
    setNotifications(notificationStore.getAll());
    // Seed demo notifications on first load
    if (usuario && notificationStore.getAll().length === 0) {
      notificationStore.seedDemo(usuario.id);
    }
    return unsub;
  }, [usuario]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markRead:    (id: string) => notificationStore.markRead(id),
    markAllRead: () => notificationStore.markAllRead(),
    remove:      (id: string) => notificationStore.remove(id),
    add:         (n: Partial<Notification>) => notificationStore.add(n),
  };
}
