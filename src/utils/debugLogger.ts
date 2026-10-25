import { Platform } from 'react-native';

const BACKEND_URL = 'http://192.168.0.179:5000/api/debug-log';

export function sendRemoteLog(level: string, message: string, data?: any) {
  try {
    const payload = {
      level,
      message,
      data: data ? (typeof data === 'object' ? JSON.stringify(data) : String(data)) : undefined,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    };

    fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {}
}

// Immediately log that debugLogger was loaded
sendRemoteLog('INFO', '🚀 [STARTUP] debugLogger module loaded');

// Global error handlers
if ((globalThis as any).ErrorUtils) {
  const previousHandler = (globalThis as any).ErrorUtils.getGlobalHandler();
  (globalThis as any).ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    sendRemoteLog('FATAL', `❌ [ErrorUtils] isFatal=${isFatal}: ${error?.message || String(error)}`, {
      stack: error?.stack,
    });
    if (previousHandler) previousHandler(error, isFatal);
  });
}

// Hook console
const origLog = console.log;
const origWarn = console.warn;
const origError = console.error;

console.log = (...args: any[]) => {
  origLog(...args);
  sendRemoteLog('LOG', args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
};

console.warn = (...args: any[]) => {
  origWarn(...args);
  sendRemoteLog('WARN', args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
};

console.error = (...args: any[]) => {
  origError(...args);
  sendRemoteLog('ERROR', args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
};
