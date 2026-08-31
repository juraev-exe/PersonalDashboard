// ============================================
// LifeOS — Notifications Service
// ============================================
// Reminders are scheduled *locally* against the Notification API and shown via
// the service worker when one is registered (Android and installed PWAs refuse
// `new Notification()` and require the SW path).
//
// This is deliberately not server-driven Web Push: that needs VAPID keys and a
// backend to hold subscriptions, neither of which this app has. The trade-off
// is that reminders only fire while LifeOS is open in a tab or installed window.

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
}

/**
 * Ask the browser for notification permission.
 * Must be called from a user gesture or browsers will auto-deny.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return 'unsupported';
  if (Notification.permission !== 'default') {
    return Notification.permission as NotificationPermissionState;
  }
  try {
    return (await Notification.requestPermission()) as NotificationPermissionState;
  } catch {
    return 'denied';
  }
}

/**
 * Show a notification, preferring the service worker registration so it also
 * works in installed/standalone windows.
 */
export async function showNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<boolean> {
  if (getPermission() !== 'granted') return false;

  const withDefaults: NotificationOptions = {
    icon: '/icons/pwa/icon-192.png',
    badge: '/icons/pwa/icon-192.png',
    ...options,
  };

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, withDefaults);
        return true;
      }
    } catch {
      // Fall through to the constructor path below.
    }
  }

  try {
    new Notification(title, withDefaults);
    return true;
  } catch {
    return false;
  }
}
