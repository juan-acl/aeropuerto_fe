/**
 * Notification System — In-app + push notification management
 * Handles: flight changes, booking confirmations, loyalty alerts, promotions
 */

export type NotificationType =
  | 'VUELO_RETRASADO' | 'VUELO_CANCELADO' | 'VUELO_EN_EMBARQUE' | 'VUELO_A_TIEMPO'
  | 'RESERVA_CONFIRMADA' | 'CHECKIN_DISPONIBLE' | 'CHECKIN_CIERRA_PRONTO'
  | 'PAGO_PROCESADO' | 'REEMBOLSO_APROBADO' | 'REEMBOLSO_RECHAZADO'
  | 'PUNTOS_GANADOS' | 'NIVEL_ALCANZADO' | 'PUNTOS_POR_VENCER'
  | 'PROMO_EXCLUSIVA' | 'UPGRADE_DISPONIBLE' | 'VUELO_ALTERNATIVO'
  | 'SISTEMA';

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  timestamp: number;
  read: boolean;
  actionRoute?: string;       // Expo Router route to open on tap
  actionParams?: Record<string, string>;
  icon: string;
  color: string;
  expiresAt?: number;         // Auto-dismiss after this timestamp
  data?: Record<string, unknown>;
}

// ─── Notification Factory ─────────────────────────────────────────────────────
export const NotificationFactory = {
  vueloRetrasado(vuelo: { numero_vuelo: string; minutos: number; nueva_hora: string }): Partial<Notification> {
    return {
      type: 'VUELO_RETRASADO',
      title: `⏱️ Retraso — ${vuelo.numero_vuelo}`,
      body: `Tu vuelo tiene un retraso de ${vuelo.minutos} minutos. Nueva salida: ${vuelo.nueva_hora}`,
      priority: 'HIGH',
      icon: '⏱️',
      color: '#D97706',
      actionRoute: '/historial',
    };
  },

  vuleloCancelado(vuelo: { numero_vuelo: string; destino: string }): Partial<Notification> {
    return {
      type: 'VUELO_CANCELADO',
      title: `❌ Vuelo cancelado — ${vuelo.numero_vuelo}`,
      body: `Tu vuelo a ${vuelo.destino} fue cancelado. Toca para ver alternativas y solicitar reembolso.`,
      priority: 'CRITICAL',
      icon: '❌',
      color: '#DC2626',
      actionRoute: '/cancelacion',
    };
  },

  reservaConfirmada(codigo: string, destino: string): Partial<Notification> {
    return {
      type: 'RESERVA_CONFIRMADA',
      title: '✅ ¡Reserva confirmada!',
      body: `Tu reserva ${codigo} a ${destino} está confirmada. ¡Buen viaje!`,
      priority: 'HIGH',
      icon: '✅',
      color: '#059669',
      actionRoute: '/historial',
    };
  },

  checkinDisponible(vuelo: string, cierra_en_horas: number): Partial<Notification> {
    return {
      type: 'CHECKIN_DISPONIBLE',
      title: '📱 Check-in disponible',
      body: `El check-in para ${vuelo} está abierto. Cierra en ${cierra_en_horas} horas.`,
      priority: 'NORMAL',
      icon: '📱',
      color: '#2563EB',
      actionRoute: '/reservar/checkin',
    };
  },

  puntosGanados(puntos: number, nivel?: string): Partial<Notification> {
    return {
      type: 'PUNTOS_GANADOS',
      title: `🏆 +${puntos.toLocaleString()} puntos ganados`,
      body: nivel
        ? `¡Felicidades! Alcanzaste el nivel ${nivel}. Nuevos beneficios desbloqueados.`
        : `Tus puntos se acreditaron. Canjéalos por upgrades y beneficios.`,
      priority: nivel ? 'HIGH' : 'NORMAL',
      icon: '🏆',
      color: '#D97706',
      actionRoute: '/lealtad',
    };
  },

  promoExclusiva(titulo: string, descuento: number, vence: string): Partial<Notification> {
    return {
      type: 'PROMO_EXCLUSIVA',
      title: `🎁 Oferta exclusiva — ${descuento}% OFF`,
      body: `${titulo}. Válida hasta el ${vence}. ¡No te la pierdas!`,
      priority: 'NORMAL',
      icon: '🎁',
      color: '#7C3AED',
      actionRoute: '/reservar',
    };
  },

  upgradeDisponible(vuelo: string, clase: string): Partial<Notification> {
    return {
      type: 'UPGRADE_DISPONIBLE',
      title: `⬆️ Upgrade disponible — ${vuelo}`,
      body: `Hay asientos en ${clase} disponibles para tu vuelo. Solicita el upgrade ahora.`,
      priority: 'HIGH',
      icon: '⬆️',
      color: '#7C3AED',
      actionRoute: '/historial',
    };
  },
};

// ─── Notification Store (in-memory, would use AsyncStorage in production) ─────
class NotificationStore {
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];

  private notify() {
    this.listeners.forEach(l => l([...this.notifications]));
  }

  add(partial: Partial<Notification>): Notification {
    const n: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: partial.type ?? 'SISTEMA',
      title: partial.title ?? 'Notificación',
      body: partial.body ?? '',
      priority: partial.priority ?? 'NORMAL',
      timestamp: Date.now(),
      read: false,
      icon: partial.icon ?? 'ℹ️',
      color: partial.color ?? '#6B7280',
      actionRoute: partial.actionRoute,
      actionParams: partial.actionParams,
      expiresAt: partial.expiresAt,
      data: partial.data,
    };
    this.notifications.unshift(n);
    this.notify();
    return n;
  }

  markRead(id: string) {
    const n = this.notifications.find(x => x.id === id);
    if (n) { n.read = true; this.notify(); }
  }

  markAllRead() {
    this.notifications.forEach(n => { n.read = true; });
    this.notify();
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(x => x.id !== id);
    this.notify();
  }

  clear() {
    this.notifications = [];
    this.notify();
  }

  getAll() { return [...this.notifications]; }
  getUnread() { return this.notifications.filter(n => !n.read); }
  getUnreadCount() { return this.notifications.filter(n => !n.read).length; }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Seed demo notifications for a user
  seedDemo(userId: number) {
    this.clear();
    [
      NotificationFactory.reservaConfirmada('RES-' + userId + '01', 'Miami'),
      NotificationFactory.checkinDisponible('AV450', 20),
      NotificationFactory.puntosGanados(450),
      NotificationFactory.promoExclusiva('Vuelo a Bogotá', 25, '30 Dic'),
      NotificationFactory.upgradeDisponible('AV450', 'Ejecutiva'),
    ].forEach(n => this.add(n));
  }
}

export const notificationStore = new NotificationStore();
