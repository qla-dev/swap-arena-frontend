class MockWebsocketClient {
  constructor() {
    this.listeners = new Map();
    this.reconnectTimeout = null;
    this.connected = false;
  }

  connect() {
    if (this.connected) {
      return;
    }
    this.connected = true;
    this.emit('connected');
  }

  disconnect() {
    if (!this.connected) {
      return;
    }
    this.connected = false;
    this.emit('disconnected');
    this.scheduleReconnect();
  }

  subscribe(event, listener) {
    const current = this.listeners.get(event) || new Set();
    current.add(listener);
    this.listeners.set(event, current);
    return () => {
      const next = this.listeners.get(event);
      if (next) {
        next.delete(listener);
      }
    };
  }

  sendMessage(payload) {
    if (!this.connected) {
      this.scheduleReconnect();
      return;
    }
    this.emit('message', payload);
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) {
      return;
    }
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 2500);
  }

  emit(event, payload) {
    const current = this.listeners.get(event);
    if (!current) {
      return;
    }
    current.forEach((listener) => listener(payload));
  }
}

const websocketClient = new MockWebsocketClient();

export default websocketClient;
