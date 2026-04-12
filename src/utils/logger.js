const logs = [];
const maxLogs = 300;

export const logDebug = (message, data) => {
  const entry = {
    ts: new Date().toISOString(),
    message,
    data: data === undefined ? null : data,
  };

  logs.push(entry);
  if (logs.length > maxLogs) {
    logs.shift();
  }

  if (typeof window !== 'undefined') {
    window.__appLogs = logs;
  }

  try {
    // Keep console noise low in production but still emit message
    if (data !== undefined) {
      // eslint-disable-next-line no-console
      console.log('[APP]', message, data);
    } else {
      // eslint-disable-next-line no-console
      console.log('[APP]', message);
    }
  } catch {
    // Ignore console failures
  }
};

export const getLogs = () => [...logs];

export const clearLogs = () => {
  logs.length = 0;
  if (typeof window !== 'undefined') {
    window.__appLogs = logs;
  }
};

// Register global listeners to capture uncaught errors in debug builds
export const registerGlobalErrorHandlers = () => {
  if (typeof window === 'undefined') return;

  if (window.__appErrorHandlersRegistered) return;
  window.__appErrorHandlersRegistered = true;

  window.addEventListener('error', (event) => {
    logDebug('Global error', { message: event.message, stack: event.error?.stack });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logDebug('Unhandled rejection', { reason: event.reason?.message || String(event.reason) });
  });
};
